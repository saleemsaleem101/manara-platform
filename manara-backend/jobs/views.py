"""
jobs/views.py
"""

from django.db import models, IntegrityError, transaction
from django.utils import timezone
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import generics, permissions, status, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError, NotFound, PermissionDenied

from .models import Job, Application, JobSkill
from .serializers import (
    JobSerializer,
    ApplicationSerializer,
    JobSkillSerializer,
    CandidateApplicationProfileSerializer,
)
from profiles.models import GraduateProfile
from matching.services import calculate_application_match
from notifications.services import create_notification
from accounts.permissions import (
    IsGraduate,
    IsCompany,
    IsVerifiedCompany,
    IsJobOwner,
    IsApplicationJobOwner,
)


# ============================================================
# عرض الوظائف + نشر وظيفة جديدة (FR-10, FR-12)
# ============================================================
class JobListCreateView(generics.ListCreateAPIView):
    serializer_class = JobSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = [
        "title", "description", "required_major",
        "requirements", "location", "job_type", "required_skills__skill__name"
    ]
    ordering_fields = ["created_at", "deadline", "title", "required_major"]
    ordering = ["-created_at"]

    def get_permissions(self):
        # القراءة: متاحة للجميع والزوار | النشر: شركة معتمدة فقط
        if self.request.method == "POST":
            return [IsVerifiedCompany()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        user = self.request.user
        if getattr(user, "role", "") == "COMPANY":
            qs = Job.objects.filter(company=user.company_profile)
        elif getattr(user, "role", "") == "ADMIN":
            qs = Job.objects.all()
        else:
            from django.utils import timezone
            today = timezone.now().date()
            qs = Job.objects.filter(status="OPEN").filter(
                models.Q(deadline__isnull=True) | models.Q(deadline__gte=today)
            )

        qs = (
            qs.select_related("company", "major")
            .prefetch_related("required_skills__skill")
            .annotate(applicants_count=models.Count("applications", distinct=True))
        )

        # فلترة اختيارية عبر باراميترات (FR-12, FR-30)
        specialization = self.request.query_params.get("specialization")
        qualification = self.request.query_params.get("qualification")
        location = self.request.query_params.get("location")
        job_type = self.request.query_params.get("job_type")
        major_id = self.request.query_params.get("major_id")
        skill = self.request.query_params.get("skill")
        skill_id = self.request.query_params.get("skill_id")
        experience = self.request.query_params.get("experience") or self.request.query_params.get("min_experience")

        if specialization:
            qs = qs.filter(required_major__icontains=specialization)
        if qualification:
            qs = qs.filter(required_qualification=qualification)
        if location:
            qs = qs.filter(location__icontains=location)
        if job_type:
            qs = qs.filter(job_type=job_type.upper())
        if major_id:
            qs = qs.filter(major_id=major_id)
        if skill:
            qs = qs.filter(required_skills__skill__name__icontains=skill).distinct()
        if skill_id:
            qs = qs.filter(required_skills__skill_id=skill_id).distinct()
        if experience and experience != "الكل":
            try:
                exp_int = int(experience)
                qs = qs.filter(required_exp__lte=exp_int)
            except (ValueError, TypeError):
                pass
        return qs

    def perform_create(self, serializer):
        # الشركة موجودة ومعتمدة (تحقق منها IsVerifiedCompany مسبقًا)
        company = self.request.user.company_profile
        serializer.save(company=company)


# ============================================================
# تفاصيل / تعديل / حذف وظيفة — للمالك فقط (FR-10)
# ============================================================
class JobDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = JobSerializer

    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated(), IsJobOwner()]

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and getattr(user, 'role', '') == 'ADMIN':
            return Job.objects.all()
        # المالك يرى جميع وظائفه | الباقون يرون OPEN فقط (منع تسريب DRAFT/CLOSED)
        if user.is_authenticated and hasattr(user, 'company_profile'):
            return Job.objects.filter(
                models.Q(company__user=user) | models.Q(status='OPEN')
            )
        return Job.objects.filter(status='OPEN')

    def perform_update(self, serializer):
        job = serializer.save()
        from matching.services import MatchingService
        MatchingService.recalculate_for_job(job)


# ============================================================
# إدارة مهارات الوظيفة المطلوبة (FR-11, Class Diagram: addRequiredSkill)
# ============================================================
class JobSkillListCreateView(generics.ListCreateAPIView):
    """
    استعراض المهارات المطلوبة لوظيفة معينة، أو إضافة مهارة جديدة بواسطة الشركة المالكة للوظيفة.
    يحقق المتطلب FR-11 ودالة addRequiredSkill في مخطط الأصناف ومخطط النشاط.
    """

    serializer_class = JobSkillSerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAuthenticated(), IsVerifiedCompany()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        job_id = self.kwargs["job_id"]
        return JobSkill.objects.filter(job_id=job_id).select_related("skill")

    def perform_create(self, serializer):
        job_id = self.kwargs["job_id"]
        job = Job.objects.filter(pk=job_id).first()
        if not job:
            raise NotFound("الوظيفة غير موجودة.")
        if job.company.user_id != self.request.user.id:
            raise ValidationError(
                {"detail": "لا تملك صلاحية إضافة مهارات لهذه الوظيفة."}
            )
        serializer.save(job=job)
        from matching.services import MatchingService
        MatchingService.recalculate_for_job(job)


class JobSkillDetailView(generics.RetrieveUpdateDestroyAPIView):
    """استعراض، تعديل المستوى والوزن، أو حذف مهارة من متطلبات الوظيفة للشركة المالكة."""

    serializer_class = JobSkillSerializer
    permission_classes = [permissions.IsAuthenticated, IsCompany]

    def get_queryset(self):
        job_id = self.kwargs["job_id"]
        return JobSkill.objects.filter(
            job_id=job_id, job__company__user=self.request.user
        )

    def perform_update(self, serializer):
        skill_req = serializer.save()
        from matching.services import MatchingService
        MatchingService.recalculate_for_job(skill_req.job)

    def perform_destroy(self, instance):
        job = instance.job
        instance.delete()
        from matching.services import MatchingService
        MatchingService.recalculate_for_job(job)


# ============================================================
# التقديم على وظيفة — للخريجين فقط (FR-13)
# ============================================================
class ApplyJobView(generics.CreateAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [IsGraduate]

    def perform_create(self, serializer):
        profile, _ = GraduateProfile.objects.get_or_create(user=self.request.user)
        job = serializer.validated_data.get("job")

        if job.status != "OPEN":
            raise ValidationError({"detail": "هذه الوظيفة غير متاحة للتقديم حاليًا."})

        closing_val = job.deadline or job.closing_date
        if closing_val:
            today = timezone.now().date()
            if hasattr(closing_val, 'date') and callable(closing_val.date):
                closing_val = closing_val.date()
            if closing_val < today:
                raise ValidationError({"detail": "انتهى موعد التقديم على هذه الوظيفة."})

        try:
            with transaction.atomic():
                if Application.objects.filter(job=job, profile=profile).exists():
                    raise ValidationError({"detail": "لقد قمت بالتقديم على هذه الوظيفة مسبقًا."})

                application = serializer.save(profile=profile)

                # حساب المطابقة فور التقديم
                result = calculate_application_match(application)

                # إشعار الخريج بنجاح التقديم ودرجة التوافق (FR-22 ومخطط النشاط 3-2 والتسلسل 3-3)
                create_notification(
                    user=self.request.user,
                    notif_type="STATUS_UPDATE",
                    title="تم تقديم طلبك بنجاح",
                    message=(
                        f'تم استلام طلب تقديمك على وظيفة "{job.title}" بنجاح، ودرجة التوافق '
                        f"المحسوبة هي {result.final_score * 100:.1f}%. حالة الطلب حالياً: قيد المراجعة."
                    ),
                    related_app_id=application.id,
                )

                # إشعار الشركة بطلب جديد ودرجة التوافق ليتم اتخاذ قرار القبول أو الرفض (عقدة قرار مخطط النشاط 3-2)
                meets_min = result.final_score >= job.minimum_match_score
                status_note = "مستوفٍ للحد الأدنى" if meets_min else "أقل من الحد الأدنى"
                create_notification(
                    user=job.company.user,
                    notif_type="NEW_APPLICATION",
                    title="طلب توظيف جديد",
                    message=(
                        f"تقدم الخريج {self.request.user.name} على وظيفة: {job.title} "
                        f"بنسبة توافق {result.final_score * 100:.1f}% ({status_note}). "
                        "يمكنك مراجعة الملف واتخاذ قرار القبول أو الرفض."
                    ),
                    related_app_id=application.id,
                )
        except IntegrityError:
            raise ValidationError({"detail": "لقد قمت بالتقديم على هذه الوظيفة مسبقًا."})


# ============================================================
# طلبات الخريج (FR-15)
# ============================================================
class MyApplicationsView(generics.ListAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [IsGraduate]

    def get_queryset(self):
        return (
            Application.objects.filter(profile__user=self.request.user)
            .select_related("job", "job__company")
            .order_by("-applied_at")
        )


# ============================================================
# طلبات وظيفة معينة — للشركة صاحبة الوظيفة (FR-14, FR-16)
# ============================================================
class JobApplicationsView(generics.ListAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [IsCompany]

    def get_queryset(self):
        job_id = self.kwargs["job_id"]
        job = Job.objects.filter(pk=job_id).first()
        if not job:
            raise NotFound("الوظيفة غير موجودة.")
        if job.company.user_id != self.request.user.id:
            raise NotFound("الوظيفة غير موجودة.")

        qs = Application.objects.filter(job=job).select_related(
            "profile", "profile__user", "matching_result"
        )

        status_param = self.request.query_params.get("status")
        if status_param:
            qs = qs.filter(status=status_param.upper())
        else:
            qs = qs.exclude(status="WITHDRAWN")

        min_score_only = self.request.query_params.get("min_score_only", "").lower() in ("true", "1")
        if min_score_only:
            qs = qs.filter(matching_result__final_score__gte=job.minimum_match_score)

        return qs.order_by(models.F('matching_result__final_score').desc(nulls_last=True), '-applied_at')


# ============================================================
# قبول / رفض الطلب — كان مفقودًا تمامًا (FR-14)
# ============================================================
class UpdateApplicationStatusView(APIView):
    permission_classes = [IsCompany, IsApplicationJobOwner]

    ALLOWED = ["UNDER_REVIEW", "ACCEPTED", "REJECTED"]

    def patch(self, request, pk):
        application = Application.objects.filter(pk=pk).first()
        if not application:
            return Response(
                {"error": "الطلب غير موجود."}, status=status.HTTP_404_NOT_FOUND
            )

        # فحص الملكية على مستوى الكائن
        self.check_object_permissions(request, application)

        new_status = request.data.get("status")
        if new_status not in self.ALLOWED:
            return Response(
                {
                    "error": f"الحالة غير صالحة. القيم المسموحة: {', '.join(self.ALLOWED)}"
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            application.update_status(new_status, changed_by=request.user)
        except DjangoValidationError as e:
            msg = e.message if hasattr(e, 'message') else (e.messages[0] if hasattr(e, 'messages') else str(e))
            return Response(
                {"error": msg},
                status=status.HTTP_400_BAD_REQUEST,
            )

        labels = {
            "UNDER_REVIEW": "قيد المراجعة",
            "ACCEPTED": "مقبول",
            "REJECTED": "مرفوض",
        }

        if new_status == "ACCEPTED":
            title = "🎉 تهانينا! تم قبول طلبك للتوظيف"
            message = (
                f'وافقت منشأة "{application.job.company.company_name}" على طلبك لشغل وظيفة "{application.job.title}". '
                f'تم فتح قنوات التواصل المباشر وتحديد موعد المقابلة.'
            )
        else:
            title = "تحديث حالة طلبك"
            message = (
                f'تم تحديث حالة طلبك على وظيفة "{application.job.title}" '
                f"إلى: {labels[new_status]}"
            )

        # إشعار الخريج بتحديث الحالة (FR-22)
        create_notification(
            user=application.profile.user,
            notif_type="STATUS_UPDATE",
            title=title,
            message=message,
            related_app_id=application.id,
        )

        # إرسال بريد إلكتروني رسمي للخريج عند القبول وتحديد موعد المقابلة المباشرة
        if new_status == "ACCEPTED":
            try:
                from django.core.mail import send_mail
                from django.conf import settings
                grad_email = application.profile.user.email
                if grad_email:
                    subject = f"منصة منارة: تم قبول طلبك لشغل شاغر «{application.job.title}»"
                    body = (
                        f"مرحباً {application.profile.user.name}،\n\n"
                        f"يسرنا إبلاغك بموافقة منشأة «{application.job.company.company_name}» على طلبك لشغل شاغر:\n"
                        f"«{application.job.title}»\n\n"
                        f"تم تفعيل بيانات التواصل المعتمدة وتحديد موعد المقابلة المباشرة على منصة منارة.\n"
                        f"يمكنك الآن التوجه إلى حسابك عبر الرابط التالي للتواصل المباشر عبر الواتساب أو البريد المهني:\n"
                        f"https://manarah-platform.vercel.app/applications\n\n"
                        f"مع تمنياتنا لك بالتوفيق والنجاح،\n"
                        f"فريق منصة منارة لربط الخريجين بسوق العمل"
                    )
                    send_mail(
                        subject,
                        body,
                        getattr(settings, "DEFAULT_FROM_EMAIL", "noreply@manarah.ye"),
                        [grad_email],
                        fail_silently=True,
                    )
            except Exception:
                pass

        return Response(
            {
                "message": "تم تحديث حالة الطلب بنجاح.",
                "status": application.status,
            },
            status=status.HTTP_200_OK,
        )


# ============================================================
# سحب الطلب — الخريج فقط (FR-13)
# ============================================================
class WithdrawApplicationView(APIView):
    """
    يتيح للخريج سحب طلبه (WITHDRAWN) قبل أن تبت فيه الشركة.
    يستخدم دالة withdraw() من صنف Application (FR-13 + Class Diagram).
    """

    permission_classes = [IsGraduate]

    def post(self, request, pk):
        return self.patch(request, pk)

    def patch(self, request, pk):
        # نتحقق أن الملف موجود
        profile = getattr(request.user, "graduate_profile", None)
        if not profile:
            return Response(
                {"error": "لا يوجد ملف خريج مرتبط بهذا الحساب."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # الطلب يجب أن ينتمي للخريج نفسه
        application = Application.objects.filter(pk=pk, profile=profile).first()
        if not application:
            return Response(
                {"error": "الطلب غير موجود أو لا تملك صلاحية سحبه."},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            application.withdraw(changed_by=request.user)
            # إشعار الشركة بسحب طلب التوظيف (FR-22)
            create_notification(
                user=application.job.company.user,
                notif_type="STATUS_UPDATE",
                title="سحب طلب توظيف",
                message=f"قام الخريج {request.user.name} بسحب طلبه على وظيفة: {application.job.title}.",
                related_app_id=application.id,
            )
        except DjangoValidationError as e:
            return Response(
                {"error": e.message if hasattr(e, 'message') else str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {
                "message": "تم سحب الطلب بنجاح.",
                "status": application.status,
            },
            status=status.HTTP_200_OK,
        )


# ============================================================
# استعراض سجل تغير حالة الطلب (FR-29)
# ============================================================
class ApplicationStatusHistoryView(generics.ListAPIView):
    """
    استعراض سجل تغير حالة الطلب (FR-29 + مخطط التسلسل 3-9 ومخطط النشاط 8-3).
    يسمح للخريج صاحب الطلب والشركة صاحبة الوظيفة والأدمن باستعراض السجل الكامل.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        from .serializers import ApplicationStatusHistorySerializer
        return ApplicationStatusHistorySerializer

    def get_queryset(self):
        from .models import ApplicationStatusHistory
        application_id = self.kwargs["pk"]
        app = Application.objects.filter(pk=application_id).first()
        if not app:
            raise NotFound("طلب التوظيف غير موجود.")

        user = self.request.user
        # التحقق من الصلاحيات: إما خريج الطلب، أو شركة الوظيفة، أو الأدمن
        is_owner_grad = hasattr(user, 'graduate_profile') and app.profile_id == user.graduate_profile.id
        is_owner_comp = hasattr(user, 'company_profile') and app.job.company_id == user.company_profile.id
        is_admin = user.role == 'ADMIN'

        if not (is_owner_grad or is_owner_comp or is_admin):
            raise PermissionDenied("لا تملك صلاحية الاطلاع على سجل هذا الطلب.")

        return ApplicationStatusHistory.objects.filter(application=app).order_by('-changed_at')


# ============================================================
# وظائف المنشأة الحالية مع عدد المتقدمين — للشركة (Screen 19)
# ============================================================
class CompanyJobsListView(generics.ListAPIView):
    serializer_class = JobSerializer
    permission_classes = [permissions.IsAuthenticated, IsCompany]

    def get_queryset(self):
        user = self.request.user
        company = getattr(user, 'company_profile', None)
        if not company:
            return Job.objects.none()
        qs = Job.objects.filter(company=company).order_by('-created_at')
        status_param = self.request.query_params.get('status')
        if status_param and status_param not in ('الكل', 'ALL'):
            qs = qs.filter(status=status_param.upper())
        return qs


# ============================================================
# ملف المرشح الكامل مع تفاصيل المطابقة — للشركة والأدمن (Screen 21)
# ============================================================
class CandidateApplicationProfileView(generics.RetrieveAPIView):
    serializer_class = CandidateApplicationProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Application.objects.select_related('profile', 'profile__user', 'job', 'job__company').all()

    def get_object(self):
        app = super().get_object()
        user = self.request.user
        is_owner_grad = hasattr(user, 'graduate_profile') and app.profile_id == user.graduate_profile.id
        is_owner_comp = hasattr(user, 'company_profile') and app.job.company_id == user.company_profile.id
        is_admin = getattr(user, 'role', '') == 'ADMIN'

        if not (is_owner_grad or is_owner_comp or is_admin):
            raise PermissionDenied("لا تملك صلاحية استعراض ملف هذا المرشح.")
        return app

