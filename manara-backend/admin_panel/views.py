import csv
from django.db import transaction
from django.db.models import Count, Avg
from django.utils import timezone
from django.http import HttpResponse

from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response

from accounts.models import User
from accounts.permissions import IsAdminRole
from profiles.models import Company, GraduateSkill
from jobs.models import Job, Application, ApplicationStatusHistory
from matching.models import MatchingResult
from notifications.services import create_notification
from .serializers import (
    UserManagementSerializer,
    CompanyVerificationSerializer,
    JobAdminSerializer,
)
from .reports_generator import (
    generate_pdf_report,
    generate_excel_report,
    generate_csv_report,
)


# ============================================================
# FR-04 + FR-20: إدارة المستخدمين
# ============================================================
class UserListView(generics.ListAPIView):
    """قائمة جميع المستخدمين مع فلترة حسب الدور والحالة (FR-04, FR-20)."""

    serializer_class = UserManagementSerializer
    permission_classes = [IsAdminRole]

    def get_queryset(self):
        qs = User.objects.all().order_by("-created_at")
        role = self.request.query_params.get("role")
        is_active = self.request.query_params.get("is_active")
        search = self.request.query_params.get("search")
        if role:
            qs = qs.filter(role=role.upper())
        if is_active is not None:
            qs = qs.filter(is_active=is_active.lower() == "true")
        if search:
            from django.db.models import Q
            qs = qs.filter(Q(name__icontains=search) | Q(email__icontains=search))
        return qs


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """تفاصيل مستخدم + تعديل (تفعيل/تعطيل) + حذف (FR-04, FR-20)."""

    serializer_class = UserManagementSerializer
    permission_classes = [IsAdminRole]
    queryset = User.objects.all()

    @transaction.atomic
    def perform_destroy(self, instance):
        # 1. تنظيف ارتباطات الخريج في حال كان المستخدم خريجاً
        if hasattr(instance, "graduate_profile") and instance.graduate_profile:
            prof = instance.graduate_profile
            apps = Application.objects.filter(profile=prof)
            ApplicationStatusHistory.objects.filter(application__in=apps).delete()
            apps.delete()
            MatchingResult.objects.filter(graduate=prof).delete()
            prof.delete()

        # 2. تنظيف ارتباطات الشركة في حال كان المستخدم شركة
        if hasattr(instance, "company_profile") and instance.company_profile:
            comp = instance.company_profile
            jobs = Job.objects.filter(company=comp)
            apps = Application.objects.filter(job__in=jobs)
            ApplicationStatusHistory.objects.filter(application__in=apps).delete()
            apps.delete()
            MatchingResult.objects.filter(job__in=jobs).delete()
            jobs.delete()
            comp.delete()

        # 3. فك الارتباط بسجلات الحالات التي غيرها هذا المستخدم
        ApplicationStatusHistory.objects.filter(changed_by=instance).update(changed_by=None)

        # 4. حذف الإشعارات والتوكن
        instance.notifications.all().delete()
        if hasattr(instance, "auth_token"):
            instance.auth_token.delete()

        # 5. حذف حساب المستخدم نهائياً
        instance.delete()


# ============================================================
# FR-23: اعتماد الشركات + إشعار COMPANY_VERIFIED (ناقص #4 و#7)
# ============================================================
class CompanyListAdminView(generics.ListAPIView):
    """قائمة الشركات مع فلترة حسب حالة التحقق (FR-23)."""

    serializer_class = CompanyVerificationSerializer
    permission_classes = [IsAdminRole]

    def get_queryset(self):
        qs = Company.objects.select_related("user", "verified_by").all().order_by("-id")
        status_filter = self.request.query_params.get("status")
        if status_filter:
            qs = qs.filter(verification_status=status_filter.upper())
        return qs


class CompanyVerifyView(APIView):
    """
    اعتماد أو رفض شركة من قِبل الأدمن مع إرسال إشعار COMPANY_VERIFIED تلقائياً.
    يحل ناقص #4 (FR-23) وناقص #7 (COMPANY_VERIFIED notification).
    """

    permission_classes = [IsAdminRole]
    ALLOWED_STATUSES = ("APPROVED", "REJECTED")

    def post(self, request, pk):
        return self.patch(request, pk)

    def patch(self, request, pk):
        company = Company.objects.filter(pk=pk).select_related("user").first()
        if not company:
            return Response(
                {"error": "الشركة غير موجودة."},
                status=status.HTTP_404_NOT_FOUND,
            )

        new_status = (request.data.get("verification_status") or request.data.get("status") or "").upper()
        if new_status not in self.ALLOWED_STATUSES:
            return Response(
                {
                    "error": f"الحالة غير صالحة. القيم المسموحة: {', '.join(self.ALLOWED_STATUSES)}"
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if new_status == "APPROVED":
            missing_fields = []
            if not company.commercial_reg or not str(company.commercial_reg).strip():
                missing_fields.append("السجل التجاري")
            if missing_fields:
                return Response(
                    {
                        "error": f"لا يمكن اعتماد الشركة قبل اكتمال البيانات: {', '.join(missing_fields)}."
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

        reason = (request.data.get("rejection_reason") or request.data.get("reason") or "").strip()

        company.verification_status = new_status
        company.verified_by = request.user
        company.verified_at = timezone.now()
        if new_status == "REJECTED" and reason:
            company.rejection_reason = reason
        elif new_status == "APPROVED":
            company.rejection_reason = ""

        company.save(
            update_fields=["verification_status", "verified_by", "verified_at", "rejection_reason"]
        )

        if new_status == "APPROVED":
            label = "مُعتمدة"
            extra = "يمكنك الآن نشر الوظائف على المنصة."
        else:
            label = "مرفوضة"
            extra = f"سبب الرفض: {reason}. يرجى استيفاء الملاحظات وإعادة تقديم طلب الاعتماد والوثائق السليمة." if reason else "للاستفسار أو الاعتراض يرجى التواصل مع إدارة المنصة."

        # إشعار COMPANY_VERIFIED — متوافق مع المخطط الرسمي
        create_notification(
            user=company.user,
            notif_type="COMPANY_VERIFIED",
            title="تحديث حالة التحقق من حساب شركتك",
            message=(
                f'تم تحديث حالة حساب شركتك "{company.company_name}" إلى: {label}. {extra}'
            ),
        )

        return Response(
            {
                "message": f"تم تحديث حالة الشركة إلى {label} بنجاح.",
                "verification_status": company.verification_status,
                "rejection_reason": company.rejection_reason,
            },
            status=status.HTTP_200_OK,
        )


# ============================================================
# FR-20: إدارة الوظائف لمدير النظام
# ============================================================
class JobAdminListView(generics.ListAPIView):
    """قائمة كافة الوظائف في المنصة للأدمن مع فلترة وبحث (FR-20)."""

    serializer_class = JobAdminSerializer
    permission_classes = [IsAdminRole]

    def get_queryset(self):
        qs = Job.objects.select_related("company").all().order_by("-created_at")
        status_filter = self.request.query_params.get("status")
        company_id = self.request.query_params.get("company_id")
        search = self.request.query_params.get("search")
        if status_filter:
            qs = qs.filter(status=status_filter.upper())
        if company_id:
            qs = qs.filter(company_id=company_id)
        if search:
            qs = qs.filter(title__icontains=search)
        return qs


class JobAdminDetailView(generics.RetrieveUpdateDestroyAPIView):
    """تفاصيل وظيفة، تعديل حالتها (إغلاق وظيفة مخالفة)، أو حذفها من قِبل الأدمن (FR-20)."""

    serializer_class = JobAdminSerializer
    permission_classes = [IsAdminRole]
    queryset = Job.objects.all()


# ============================================================
# FR-19 + FR-20: لوحة تحكم الأدمن — إحصائيات عامة
# ============================================================
class DashboardStatsView(APIView):
    """إحصائيات النظام الشاملة لصفحة لوحة التحكم (FR-19, FR-20)."""

    permission_classes = [IsAdminRole]

    def get(self, request):
        stats = {
            "users": {
                "total": User.objects.count(),
                "graduates": User.objects.filter(role="GRADUATE").count(),
                "companies": User.objects.filter(role="COMPANY").count(),
                "admins": User.objects.filter(role="ADMIN").count(),
                "active": User.objects.filter(is_active=True).count(),
                "inactive": User.objects.filter(is_active=False).count(),
            },
            "companies_verification": {
                "pending": Company.objects.filter(
                    verification_status="PENDING"
                ).count(),
                "approved": Company.objects.filter(
                    verification_status="APPROVED"
                ).count(),
                "rejected": Company.objects.filter(
                    verification_status="REJECTED"
                ).count(),
            },
            "jobs": {
                "total": Job.objects.count(),
                "open": Job.objects.filter(status="OPEN").count(),
                "closed": Job.objects.filter(status="CLOSED").count(),
                "draft": Job.objects.filter(status="DRAFT").count(),
            },
            "applications": {
                "total": Application.objects.count(),
                "submitted": Application.objects.filter(status="SUBMITTED").count(),
                "under_review": Application.objects.filter(
                    status="UNDER_REVIEW"
                ).count(),
                "accepted": Application.objects.filter(status="ACCEPTED").count(),
                "rejected": Application.objects.filter(status="REJECTED").count(),
                "withdrawn": Application.objects.filter(status="WITHDRAWN").count(),
            },
            "matching": {
                "average_score": MatchingResult.objects.aggregate(
                    avg=Avg("final_score")
                )["avg"],
                "total_results": MatchingResult.objects.count(),
            },
        }
        return Response(stats, status=status.HTTP_200_OK)


from rest_framework.renderers import JSONRenderer, BrowsableAPIRenderer, BaseRenderer


class CSVRenderer(BaseRenderer):
    """
    مفسّر تنسيق CSV لتصدير التقارير (FR-21).
    مطلوب لتمكين تفاوض التنسيقات في DRF (Format Negotiation) عند تمرير ?format=csv لمنع 404.
    """
    media_type = 'text/csv'
    format = 'csv'

    def render(self, data, accepted_media_type=None, renderer_context=None):
        if isinstance(data, (bytes, bytearray)):
            return data
        return str(data).encode('utf-8-sig')


class PDFRenderer(BaseRenderer):
    """مفسّر تنسيق PDF لتصدير تقارير النظام المعتمدة (FR-21)."""
    media_type = 'application/pdf'
    format = 'pdf'

    def render(self, data, accepted_media_type=None, renderer_context=None):
        return data


class ExcelRenderer(BaseRenderer):
    """مفسّر تنسيق Excel (.xlsx) لتصدير تقارير النظام المعتمدة (FR-21)."""
    media_type = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    format = 'excel'

    def render(self, data, accepted_media_type=None, renderer_context=None):
        return data


class XLSXRenderer(BaseRenderer):
    """مفسّر تنسيق XLSX لتصدير تقارير النظام (FR-21)."""
    media_type = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    format = 'xlsx'

    def render(self, data, accepted_media_type=None, renderer_context=None):
        return data


# ============================================================
# FR-21: التقارير
# ============================================================
class ReportsView(APIView):
    """
    تقارير تفصيلية عن عمليات النظام (FR-21).
    المعامل: ?type=jobs | skills | match_scores | companies
    التصدير: &format=pdf أو &format=excel أو &format=csv
    """

    permission_classes = [IsAdminRole]
    renderer_classes = [
        JSONRenderer,
        BrowsableAPIRenderer,
        CSVRenderer,
        PDFRenderer,
        ExcelRenderer,
        XLSXRenderer,
    ]

    def get(self, request):
        report_type = request.query_params.get("type", "jobs")

        if report_type == "jobs":
            data = list(
                Job.objects.select_related("company")
                .annotate(application_count=Count("applications"))
                .order_by("-application_count")[:25]
                .values("id", "title", "company__company_name", "application_count", "status", "created_at")
            )

        elif report_type == "skills":
            data = list(
                GraduateSkill.objects.values("skill__name", "skill__category")
                .annotate(count=Count("id"))
                .order_by("-count")[:20]
            )

        elif report_type == "match_scores":
            scores = list(MatchingResult.objects.values_list("final_score", flat=True))
            total = len(scores)
            data = {
                "total": total,
                "excellent": sum(1 for s in scores if s >= 0.8),
                "good": sum(1 for s in scores if 0.6 <= s < 0.8),
                "average": sum(1 for s in scores if 0.4 <= s < 0.6),
                "poor": sum(1 for s in scores if s < 0.4),
                "avg_score": round(sum(scores) / total, 4) if total else 0,
            }

        elif report_type == "companies":
            data = list(
                Company.objects.annotate(job_count=Count("jobs"))
                .order_by("-job_count")[:20]
                .values(
                    "id", "company_name", "industry", "verification_status", "job_count"
                )
            )

        else:
            return Response(
                {
                    "error": "نوع التقرير غير صالح. القيم المسموحة: jobs, skills, match_scores, companies"
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # دعم تصدير واستخراج التقارير بصيغ متعددة: PDF أو Excel أو CSV (FR-21)
        export_param = (
            request.query_params.get("format", "") or request.query_params.get("export", "")
        ).lower()

        if export_param == "pdf":
            pdf_bytes = generate_pdf_report(report_type, data)
            response = HttpResponse(pdf_bytes, content_type="application/pdf")
            response["Content-Disposition"] = f'attachment; filename="manarah_report_{report_type}.pdf"'
            return response

        elif export_param in ["excel", "xlsx"]:
            excel_bytes = generate_excel_report(report_type, data)
            response = HttpResponse(
                excel_bytes,
                content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            )
            response["Content-Disposition"] = f'attachment; filename="manarah_report_{report_type}.xlsx"'
            return response

        elif export_param == "csv":
            csv_content = generate_csv_report(report_type, data)
            response = HttpResponse(csv_content, content_type="text/csv; charset=utf-8-sig")
            response["Content-Disposition"] = f'attachment; filename="manarah_report_{report_type}.csv"'
            return response

        is_empty = False
        if isinstance(data, list) and len(data) == 0:
            is_empty = True
        elif isinstance(data, dict) and data.get("total", 0) == 0:
            is_empty = True

        response_payload = {"type": report_type, "data": data}
        if is_empty:
            response_payload["message"] = "عدم وجود نتائج"

        return Response(response_payload, status=status.HTTP_200_OK)

