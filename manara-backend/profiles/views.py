import os
import re
import uuid
from urllib.parse import urlparse

from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.validators import URLValidator
from django.db import models
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django.urls import reverse

from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser

from .models import (
    Major,
    GraduateProfile,
    Qualification,
    Experience,
    Company,
    Skill,
    GraduateSkill,
    Project,
    VideoCV,
)
from .validators import validate_file, ALLOWED_VIDEO_TYPES


from .serializers import (
    MajorSerializer,
    QualificationSerializer,
    ExperienceSerializer,
    GraduateProfileSerializer,
    CompanyProfileSerializer,
    SkillSerializer,
    GraduateSkillSerializer,
    ProjectSerializer,
)
from accounts.permissions import IsGraduate, IsCompany


# ============================================================
# ملف الخريج (FR-05, FR-06, FR-07, FR-09)
# ============================================================
class GraduateProfileView(generics.RetrieveUpdateAPIView):
    """
    الخريج فقط يستطيع الاطلاع على ملفه وتعديله (NFR-02).
    تم تصحيح الخطأ: كانت الصلاحية IsAuthenticated تسمح لأي مستخدم بالوصول.
    """

    serializer_class = GraduateProfileSerializer
    permission_classes = [IsGraduate]

    def get_object(self):
        if self.request.method in ('PUT', 'PATCH', 'POST'):
            profile, _ = GraduateProfile.objects.get_or_create(user=self.request.user)
            return profile
        return get_object_or_404(GraduateProfile.objects.select_related("user"), user=self.request.user)


class GraduateProfileDetailView(generics.RetrieveAPIView):
    """
    استعراض الملف المهني الكامل لأي خريج (Use Case: View Graduate Profiles & Review Graduate Profile).
    متاح للشركات والأدمن لمراجعة مؤهلات ومهارات ومشاريع وفيديو المتقدمين مع احترام الخصوصية (FR-09).
    الخريج يرى ملفه فقط — لا يستطيع فتح ملف خريج آخر بالـ ID المباشر (NFR-02).
    """

    queryset = (
        GraduateProfile.objects.select_related("user")
        .prefetch_related(
            "skills__skill",
            "projects",
            "qualifications",
            "qualifications__major",
            "experiences",
        )
        .all()
    )
    serializer_class = GraduateProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        obj = super().get_object()
        user = self.request.user
        # المالك يرى ملفه دائماً | الشركات والأدمن يرون أي ملف
        if obj.user_id != user.id and user.role not in ('COMPANY', 'ADMIN'):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('لا تملك صلاحية الاطلاع على هذا الملف.')
        return obj


class GraduateProfileListView(generics.ListAPIView):
    """
    استعراض والبحث في ملفات الخريجين المتاحة للشركات المعتمدة ومدير النظام.
    (مخطط حالات الاستخدام: View Graduate Profiles وقصة المستخدم: US-07).
    يدعم البحث والتصفية حسب التخصص والمؤهل والجامعة والمهارات.
    """

    serializer_class = GraduateProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role not in ('COMPANY', 'ADMIN'):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('هذه العملية متاحة لحسابات الشركات المعتمدة ومدير النظام فقط.')

        if user.role == 'COMPANY':
            company = getattr(user, 'company_profile', None)
            if not company or company.verification_status != 'APPROVED':
                from rest_framework.exceptions import PermissionDenied
                raise PermissionDenied('لا يمكن استعراض ملفات الخريجين قبل اعتماد حساب الشركة من إدارة المنصة.')

        qs = (
            GraduateProfile.objects.select_related("user")
            .prefetch_related(
                "skills__skill",
                "projects",
                "qualifications",
                "qualifications__major",
                "experiences",
            )
            .filter(user__is_active=True)
            .order_by("-id")
        )

        specialization = self.request.query_params.get("specialization")
        qualification = self.request.query_params.get("qualification")
        university = self.request.query_params.get("university")
        skill_id = self.request.query_params.get("skill_id")
        search = self.request.query_params.get("search")

        if specialization:
            qs = qs.filter(specialization__icontains=specialization)
        if qualification:
            qs = qs.filter(qualification_level=qualification.upper())
        if university:
            qs = qs.filter(university__icontains=university)
        if skill_id:
            qs = qs.filter(skills__skill_id=skill_id)
        if search:
            qs = qs.filter(
                models.Q(user__name__icontains=search) |
                models.Q(specialization__icontains=search) |
                models.Q(bio__icontains=search)
            )

        return qs.distinct()


# ============================================================
# ملف الشركة
# ============================================================
class CompanyProfileView(generics.RetrieveUpdateAPIView):
    """
    الشركة فقط تستطيع الاطلاع على ملفها وتعديله (NFR-02).
    تم تصحيح الخطأ: كانت الصلاحية IsAuthenticated تسمح لأي مستخدم بالوصول.
    """

    serializer_class = CompanyProfileSerializer
    permission_classes = [IsCompany]

    def get_object(self):
        if self.request.method in ('PUT', 'PATCH', 'POST'):
            company, _ = Company.objects.get_or_create(
                user=self.request.user,
                defaults={'company_name': self.request.user.name or 'منشأة معتمدة'}
            )
            return company
        return get_object_or_404(Company.objects.select_related("user"), user=self.request.user)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', True)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        data = dict(serializer.data)
        data['message'] = "تم تحديث بيانات ملف المنشأة بنجاح."
        data['company'] = serializer.data
        return Response(data)


class SubmitCompanyVerificationView(APIView):
    """
    إرسال بيانات الشركة لطلب التحقق والاعتماد (+ submitForVerification() في مخطط الأصناف و FR-23).
    """

    permission_classes = [IsCompany]

    def post(self, request):
        company, _ = Company.objects.get_or_create(
            user=request.user,
            defaults={'company_name': request.user.name or 'منشأة معتمدة'}
        )
        if company.verification_status == "APPROVED":
            return Response(
                {"message": "حساب الشركة معتمد بالفعل ومؤهل لنشر الوظائف."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        commercial_reg = request.data.get('commercial_reg') or company.commercial_reg or getattr(company, 'registration_number', '')
        cr_doc = request.data.get('cr_document_url') or company.cr_document_url
        if commercial_reg:
            company.commercial_reg = commercial_reg
        if cr_doc:
            company.cr_document_url = cr_doc

        if not commercial_reg:
            return Response(
                {"error": "يجب توفير رقم السجل التجاري قبل تقديم طلب التحقق."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        company.verification_status = "PENDING"
        update_fields = ["verification_status"]
        if commercial_reg:
            update_fields.append("commercial_reg")
        if cr_doc:
            update_fields.append("cr_document_url")
        company.save(update_fields=list(set(update_fields)))

        return Response(
            {
                "message": "تم إرسال بيانات الشركة للتحقق والاعتماد بنجاح.",
                "verification_status": company.verification_status,
                "commercial_reg": company.commercial_reg,
                "cr_document_url": company.cr_document_url,
            },
            status=status.HTTP_200_OK,
        )


# ============================================================
# قائمة التخصصات العامة (majors في ERD الجديد)
# ============================================================
class MajorListCreateView(generics.ListCreateAPIView):
    """عرض قائمة التخصصات الأكاديمية (للجميع) أو إضافة تخصص جديد (لمدير النظام فقط)."""
    queryset = Major.objects.all()
    serializer_class = MajorSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            from accounts.permissions import IsAdminRole
            return [IsAdminRole()]
        return [permissions.AllowAny()]


# ============================================================
# قائمة المهارات العامة
# ============================================================
class SkillListView(generics.ListCreateAPIView):
    """قائمة المهارات المتاحة — للقراءة للجميع، والإضافة لمدير النظام فقط (NFR-02)."""
    queryset = Skill.objects.all().order_by('id')
    serializer_class = SkillSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            from accounts.permissions import IsAdminRole
            return [IsAdminRole()]
        return [permissions.AllowAny()]


# ============================================================
# إدارة مهارات الخريج (FR-06)
# ============================================================
class GraduateSkillListCreateView(generics.ListCreateAPIView):
    """عرض مهارات الخريج أو إضافة مهارة جديدة لملفه."""

    serializer_class = GraduateSkillSerializer
    permission_classes = [IsGraduate]

    def get_queryset(self):
        return GraduateSkill.objects.filter(profile__user=self.request.user).select_related("skill").order_by('id')

    def perform_create(self, serializer):
        profile, _ = GraduateProfile.objects.get_or_create(user=self.request.user)
        serializer.save(profile=profile)
        from matching.services import MatchingService
        MatchingService.recalculate_for_profile(profile)


class GraduateSkillDetailView(generics.RetrieveUpdateDestroyAPIView):
    """استعراض، تعديل مستوى الإتقان (+ updateLevel في مخطط الأصناف)، أو حذف مهارة من ملف الخريج."""

    serializer_class = GraduateSkillSerializer
    permission_classes = [IsGraduate]

    def get_queryset(self):
        if self.request.method in ("PUT", "PATCH", "POST"):
            profile, _ = GraduateProfile.objects.get_or_create(user=self.request.user)
            return GraduateSkill.objects.filter(profile=profile)
        profile = get_object_or_404(GraduateProfile, user=self.request.user)
        return GraduateSkill.objects.filter(profile=profile)

    def perform_update(self, serializer):
        gs = serializer.save()
        from matching.services import MatchingService
        MatchingService.recalculate_for_profile(gs.profile)

    def perform_destroy(self, instance):
        profile = instance.profile
        instance.delete()
        from matching.services import MatchingService
        MatchingService.recalculate_for_profile(profile)


# ============================================================
# إدارة مشاريع الخريج (FR-07) — ناقص #8
# ============================================================
class ProjectListCreateView(generics.ListCreateAPIView):
    """عرض مشاريع الخريج أو إضافة مشروع جديد."""

    serializer_class = ProjectSerializer
    permission_classes = [IsGraduate]

    def get_queryset(self):
        if self.request.method in ("POST",):
            profile, _ = GraduateProfile.objects.get_or_create(user=self.request.user)
            return Project.objects.filter(profile=profile).order_by("-created_at")
        profile = get_object_or_404(GraduateProfile, user=self.request.user)
        return Project.objects.filter(profile=profile).order_by("-created_at")

    def perform_create(self, serializer):
        profile, _ = GraduateProfile.objects.get_or_create(user=self.request.user)
        serializer.save(profile=profile)


class ProjectDetailView(generics.RetrieveUpdateDestroyAPIView):
    """تعديل أو حذف مشروع — يتحقق أن المشروع ينتمي للخريج الحالي."""

    serializer_class = ProjectSerializer
    permission_classes = [IsGraduate]

    def get_queryset(self):
        if self.request.method in ("PUT", "PATCH", "POST"):
            profile, _ = GraduateProfile.objects.get_or_create(user=self.request.user)
            return Project.objects.filter(profile=profile)
        profile = get_object_or_404(GraduateProfile, user=self.request.user)
        return Project.objects.filter(profile=profile)


# ============================================================
# إدارة مؤهلات الخريج (qualifications في ERD الجديد)
# ============================================================
class QualificationListCreateView(generics.ListCreateAPIView):
    """عرض مؤهلات الخريج أو إضافة مؤهل جديد لملفه."""
    serializer_class = QualificationSerializer
    permission_classes = [IsGraduate]

    def get_queryset(self):
        if self.request.method in ("POST",):
            profile, _ = GraduateProfile.objects.get_or_create(user=self.request.user)
            return Qualification.objects.filter(graduate=profile).select_related('major')
        profile = get_object_or_404(GraduateProfile, user=self.request.user)
        return Qualification.objects.filter(graduate=profile).select_related('major')

    def perform_create(self, serializer):
        profile, _ = GraduateProfile.objects.get_or_create(user=self.request.user)
        serializer.save(graduate=profile)
        from matching.services import MatchingService
        MatchingService.recalculate_for_profile(profile)


class QualificationDetailView(generics.RetrieveUpdateDestroyAPIView):
    """استعراض أو تعديل أو حذف مؤهل أكاديمي للخريج."""
    serializer_class = QualificationSerializer
    permission_classes = [IsGraduate]

    def get_queryset(self):
        if self.request.method in ("PUT", "PATCH", "POST"):
            profile, _ = GraduateProfile.objects.get_or_create(user=self.request.user)
            return Qualification.objects.filter(graduate=profile)
        profile = get_object_or_404(GraduateProfile, user=self.request.user)
        return Qualification.objects.filter(graduate=profile)

    def perform_update(self, serializer):
        q = serializer.save()
        from matching.services import MatchingService
        MatchingService.recalculate_for_profile(q.graduate)

    def perform_destroy(self, instance):
        profile = instance.graduate
        instance.delete()
        from matching.services import MatchingService
        MatchingService.recalculate_for_profile(profile)


# ============================================================
# إدارة الخبرات العملية للخريج (experiences في ERD الجديد)
# ============================================================
class ExperienceListCreateView(generics.ListCreateAPIView):
    """عرض خبرات الخريج أو إضافة خبرة عملية جديدة."""
    serializer_class = ExperienceSerializer
    permission_classes = [IsGraduate]

    def get_queryset(self):
        if self.request.method in ("POST",):
            profile, _ = GraduateProfile.objects.get_or_create(user=self.request.user)
            return Experience.objects.filter(graduate=profile).order_by('-start_date')
        profile = get_object_or_404(GraduateProfile, user=self.request.user)
        return Experience.objects.filter(graduate=profile).order_by('-start_date')

    def perform_create(self, serializer):
        profile, _ = GraduateProfile.objects.get_or_create(user=self.request.user)
        serializer.save(graduate=profile)
        from matching.services import MatchingService
        MatchingService.recalculate_for_profile(profile)


class ExperienceDetailView(generics.RetrieveUpdateDestroyAPIView):
    """استعراض أو تعديل أو حذف خبرة عملية للخريج."""
    serializer_class = ExperienceSerializer
    permission_classes = [IsGraduate]

    def get_queryset(self):
        if self.request.method in ("PUT", "PATCH", "POST"):
            profile, _ = GraduateProfile.objects.get_or_create(user=self.request.user)
            return Experience.objects.filter(graduate=profile)
        profile = get_object_or_404(GraduateProfile, user=self.request.user)
        return Experience.objects.filter(graduate=profile)

    def perform_update(self, serializer):
        exp = serializer.save()
        from matching.services import MatchingService
        MatchingService.recalculate_for_profile(exp.graduate)

    def perform_destroy(self, instance):
        profile = instance.graduate
        instance.delete()
        from matching.services import MatchingService
        MatchingService.recalculate_for_profile(profile)


# ============================================================
# رفع وبث الفيديو التعريفي (FR-08, P82, Class Diagram)
# ============================================================
class VideoUploadView(APIView):
    """
    يتيح للخريج رفع فيديو تعريفي (Video CV) مع تخزينه مباشرة
    كمستند عبر نظام الملفات والتخزين المحلي كـ FileField (الفقرة 82) دون أي خدمة سحابية خارجية.
    الحد الأقصى للحجم: 50 MB.
    الأنواع المقبولة: MP4, AVI, MOV, MKV, WebM.
    """

    permission_classes = [IsGraduate]
    parser_classes = [MultiPartParser, FormParser]
    throttle_scope = "video_upload"

    MAX_SIZE_MB = 50
    ALLOWED_CONTENT_TYPES = ALLOWED_VIDEO_TYPES

    def post(self, request):
        video_file = request.FILES.get("video")
        if not video_file:
            return Response(
                {"error": 'لم يتم إرسال ملف. أرسل الملف بالمفتاح "video".'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # التحقق من صحة الملف باستخدام وحدة التحقق المستقلة (FR-27 ومخطط الأصناف الشكل 3-10)
        is_valid, error_msg = validate_file(
            video_file,
            max_size_mb=self.MAX_SIZE_MB,
            allowed_content_types=self.ALLOWED_CONTENT_TYPES,
        )
        if not is_valid:
            return Response(
                {"error": error_msg},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # التحقق من مدة الفيديو
        duration_seconds = request.data.get("duration_seconds", 0)
        try:
            duration_seconds = int(duration_seconds)
        except (ValueError, TypeError):
            duration_seconds = 0
        if duration_seconds > 180:
            return Response(
                {"error": "الحد الأقصى المسموح به لمدة الفيديو التعريفي هو 3 دقائق (180 ثانية)."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        file_bytes = video_file.read()
        video_file.seek(0)
        profile, _ = GraduateProfile.objects.get_or_create(user=request.user)

        # حفظ محتوى الفيديو مباشرة عبر FileField في نموذج VideoCV (P82 + VideoCV model)
        video_cv, _ = VideoCV.objects.get_or_create(graduate=profile)
        video_cv.upload(
            video_file=video_file,
            file_name=video_file.name,
            content_type=video_file.content_type,
            duration_seconds=duration_seconds,
        )

        stream_url = request.build_absolute_uri(
            reverse("graduate-video-stream", kwargs={"graduate_id": profile.id})
        )
        video_cv.file_url = stream_url
        video_cv.save(update_fields=["file_url"])

        profile.video_url = stream_url
        profile.video_cv_url = stream_url
        if duration_seconds > 0:
            profile.video_duration_seconds = duration_seconds
            profile.save(update_fields=["video_cv_url", "video_duration_seconds"])
        else:
            profile.save(update_fields=["video_cv_url"])

        return Response(
            {
                "message": "تم رفع وتخزين الفيديو التعريفي كملف (FileField) بنجاح.",
                "video_url": stream_url,
                "video_cv_url": stream_url,
                "duration_seconds": profile.video_duration_seconds,
                "file_size": getattr(video_file, 'size', len(file_bytes)),
            },
            status=status.HTTP_201_CREATED,
        )


class VideoStreamView(APIView):
    """
    بث وتحميل محتوى الفيديو التعريفي المخزن عبر FileField (الفقرة 82).
    يتحقق من مستويات الخصوصية وصلاحيات الوصول (FR-09).
    """

    permission_classes = [permissions.AllowAny]

    def get(self, request, graduate_id):
        profile = GraduateProfile.objects.filter(pk=graduate_id).first()
        if not profile:
            return Response(
                {"error": "الملف المهني غير موجود."}, status=status.HTTP_404_NOT_FOUND
            )

        video_cv = getattr(profile, "video_cv_record", None)
        if not video_cv or not video_cv.video_file:
            return Response(
                {"error": "لا يوجد فيديو تعريفي لهذا الملف."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # فحص الخصوصية مع دعم مصادقة التوكن الممرر في الرابط للوسائط HTML5 video (FR-09)
        visibility = video_cv.privacy_level or profile.video_visibility
        user = request.user
        if not user.is_authenticated:
            token_key = request.query_params.get('token')
            if token_key:
                from rest_framework.authtoken.models import Token
                token_obj = Token.objects.filter(key=token_key).select_related('user').first()
                if token_obj and token_obj.user.is_active:
                    user = token_obj.user

        can_view = False
        if user.is_authenticated:
            if user.id == profile.user_id or getattr(user, "role", "") == "ADMIN":
                can_view = True
            elif visibility == "PUBLIC":
                can_view = True
            elif visibility == "COMPANIES_ONLY" and getattr(user, "role", "") == "COMPANY":
                can_view = True
        elif visibility == "PUBLIC":
            can_view = True

        if not can_view:
            return Response(
                {"error": "غير مصرح لك بمشاهدة هذا الفيديو وفق إعدادات الخصوصية."},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            with video_cv.video_file.open("rb") as f:
                data = f.read()
        except Exception:
            return Response(
                {"error": "تعذر قراءة ملف الفيديو."},
                status=status.HTTP_404_NOT_FOUND,
            )
        file_size = len(data)
        range_header = request.META.get('HTTP_RANGE', '').strip()

        # دعم ترويسات التجزئة Range Requests (RFC 7233) لمشغلات HTML5 video (Code 206)
        if range_header.startswith('bytes='):
            range_val = range_header[6:].strip()
            parts = range_val.split('-')
            try:
                start = int(parts[0]) if parts[0] else 0
                end = int(parts[1]) if len(parts) > 1 and parts[1] else file_size - 1
            except ValueError:
                start = 0
                end = file_size - 1

            if start >= file_size or start > end:
                resp = HttpResponse(status=416)
                resp['Content-Range'] = f'bytes */{file_size}'
                return resp

            end = min(end, file_size - 1)
            chunk_length = end - start + 1
            chunk_data = data[start:end + 1]

            response = HttpResponse(
                chunk_data,
                status=206,
                content_type=video_cv.content_type or "video/mp4",
            )
            response["Content-Range"] = f"bytes {start}-{end}/{file_size}"
            response["Accept-Ranges"] = "bytes"
            response["Content-Length"] = str(chunk_length)
            response["Content-Disposition"] = f'inline; filename="{video_cv.file_name or "intro_video.mp4"}"'
            return response

        response = HttpResponse(
            data,
            status=200,
            content_type=video_cv.content_type or "video/mp4",
        )
        response["Accept-Ranges"] = "bytes"
        response["Content-Disposition"] = f'inline; filename="{video_cv.file_name or "intro_video.mp4"}"'
        response["Content-Length"] = str(file_size)
        return response


# ============================================================
# رفع ملف السيرة الذاتية (FR-05: CV File Upload)
# ============================================================
class CVUploadView(APIView):
    """
    رفع وتحديث ملف السيرة الذاتية بصيغة PDF/DOCX (FR-05).
    الحد الأقصى للحجم: 10 MB.
    """

    permission_classes = [IsGraduate]
    parser_classes = [MultiPartParser, FormParser]

    ALLOWED_CONTENT_TYPES = {
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/octet-stream",
    }
    MAX_SIZE_MB = 10

    def post(self, request):
        cv_file = request.FILES.get("cv") or request.FILES.get("cv_file")
        if not cv_file:
            return Response(
                {"error": 'لم يتم إرسال ملف. يرجى إرسال الملف بالمفتاح "cv" أو "cv_file".'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        from .validators import validate_file, ALLOWED_DOCUMENT_TYPES
        is_valid, err = validate_file(
            cv_file,
            max_size_mb=self.MAX_SIZE_MB,
            allowed_content_types=ALLOWED_DOCUMENT_TYPES
        )
        if not is_valid:
            return Response(
                {"error": err},
                status=status.HTTP_400_BAD_REQUEST,
            )

        from django.core.files.storage import default_storage
        profile, _ = GraduateProfile.objects.get_or_create(user=request.user)

        # حذف الملف القديم لتجنب تراكم الملفات المهجورة
        if profile.cv_file and '/media/' in profile.cv_file:
            old_rel = profile.cv_file.split('/media/', 1)[-1]
            if default_storage.exists(old_rel):
                try:
                    default_storage.delete(old_rel)
                except Exception:
                    pass

        ext = os.path.splitext(cv_file.name)[1].lower()
        clean_name = f"cvs/cv_{profile.id}_{uuid.uuid4().hex[:8]}{ext}"
        saved_path = default_storage.save(clean_name, cv_file)
        file_url = default_storage.url(saved_path)

        profile.cv_file = file_url
        profile.save(update_fields=["cv_file"])

        return Response(
            {
                "message": "تم رفع ملف السيرة الذاتية بنجاح.",
                "cv_file": file_url,
            },
            status=status.HTTP_200_OK,
        )


# ============================================================
# رفع الصور والتحقق الصارم من الحجم والنوع (FR-27: Strict File Validation)
# ============================================================
class ImageUploadView(APIView):
    """
    رفع صور الملف الشخصي، شعار الشركة، أو صور المشاريع مع التحقق الصارم من النوع والحجم (FR-27).
    الحد الأقصى للحجم: 5 MB.
    الصيغ المدعومة: PNG, JPG, JPEG, WEBP.
    """
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    MAX_SIZE_MB = 5
    ALLOWED_EXTENSIONS = ('.png', '.jpg', '.jpeg', '.webp', '.gif')
    ALLOWED_CONTENT_TYPES = {
        'image/png',
        'image/jpeg',
        'image/jpg',
        'image/webp',
        'image/gif',
    }

    def post(self, request):
        image_file = (
            request.FILES.get('image')
            or request.FILES.get('file')
            or request.FILES.get('logo')
            or request.FILES.get('profile_image')
        )
        if not image_file:
            return Response(
                {"error": 'لم يتم إرسال ملف الصورة. يرجى إرسال الملف باسم "image".'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        name_lower = image_file.name.lower()
        if not any(name_lower.endswith(ext) for ext in self.ALLOWED_EXTENSIONS):
            return Response(
                {"error": "نوع الملف غير مدعوم. الصيغ المدعومة للصور هي: PNG, JPG, JPEG, WEBP, GIF."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if image_file.content_type not in self.ALLOWED_CONTENT_TYPES:
            return Response(
                {"error": f"نوع محتوى الملف ({image_file.content_type}) غير صالح."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        max_bytes = self.MAX_SIZE_MB * 1024 * 1024
        if image_file.size > max_bytes:
            return Response(
                {"error": f"حجم الصورة ({image_file.size // (1024 * 1024)} MB) يتجاوز الحد المسموح ({self.MAX_SIZE_MB} MB)."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # التحقق الصارم من تواقيع الصور الرقمية (Magic Bytes) بدون تجاوز (FR-27 / NFR-01)
        file_bytes = image_file.read()
        image_file.seek(0)

        is_valid_magic = (
            file_bytes.startswith(b'\xff\xd8\xff')  # JPEG
            or file_bytes.startswith(b'\x89PNG\r\n\x1a\n')  # PNG
            or (file_bytes.startswith(b'RIFF') and b'WEBP' in file_bytes[:16])  # WebP
            or file_bytes.startswith(b'GIF87a') or file_bytes.startswith(b'GIF89a')  # GIF
        )

        if not is_valid_magic:
            return Response(
                {"error": "محتوى وتوقيع الملف لا يطابق صورة صالحة (PNG, JPG, WEBP, GIF)."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        upload_type = request.data.get('type', 'general')
        user_role = getattr(request.user, 'role', '')

        # تقييد نوع الرفع بحسب الدور
        if upload_type == 'logo' and user_role != 'COMPANY':
            return Response(
                {"error": "رفع شعار المنشأة متاح لحسابات الشركات فقط."},
                status=status.HTTP_403_FORBIDDEN,
            )
        if upload_type == 'profile' and user_role not in ('GRADUATE', 'ADMIN'):
            return Response(
                {"error": "رفع الصورة الشخصية متاح لحسابات الخريجين فقط."},
                status=status.HTTP_403_FORBIDDEN,
            )

        from django.core.files.storage import default_storage
        ext = os.path.splitext(image_file.name)[1].lower()

        if upload_type == 'logo' and hasattr(request.user, 'company_profile'):
            old_logo = getattr(request.user.company_profile, 'logo_url', '')
            if old_logo and '/media/' in old_logo:
                old_rel = old_logo.split('/media/', 1)[-1]
                if default_storage.exists(old_rel):
                    try:
                        default_storage.delete(old_rel)
                    except Exception:
                        pass
            clean_name = f"logos/logo_{request.user.id}_{uuid.uuid4().hex[:8]}{ext}"
            saved_path = default_storage.save(clean_name, image_file)
            file_url = default_storage.url(saved_path)
            request.user.company_profile.logo_url = file_url
            request.user.company_profile.logo = file_url
            request.user.company_profile.save(update_fields=['logo_url'])
        elif upload_type == 'profile' and hasattr(request.user, 'graduate_profile'):
            old_img = getattr(request.user.graduate_profile, 'profile_image', '')
            if old_img and '/media/' in old_img:
                old_rel = old_img.split('/media/', 1)[-1]
                if default_storage.exists(old_rel):
                    try:
                        default_storage.delete(old_rel)
                    except Exception:
                        pass
            clean_name = f"profiles/img_{request.user.id}_{uuid.uuid4().hex[:8]}{ext}"
            saved_path = default_storage.save(clean_name, image_file)
            file_url = default_storage.url(saved_path)
            request.user.graduate_profile.profile_image = file_url
            request.user.graduate_profile.save(update_fields=['profile_image'])
        elif upload_type in ['project', 'projects']:
            clean_name = f"projects/proj_{request.user.id}_{uuid.uuid4().hex[:8]}{ext}"
            saved_path = default_storage.save(clean_name, image_file)
            file_url = default_storage.url(saved_path)
        else:
            clean_name = f"uploads/{upload_type}_{request.user.id}_{uuid.uuid4().hex[:8]}{ext}"
            saved_path = default_storage.save(clean_name, image_file)
            file_url = default_storage.url(saved_path)

        return Response(
            {
                "message": "تم رفع الصورة بنجاح والتحقق من صلاحيتها.",
                "image_url": file_url,
                "file_size": len(file_bytes),
            },
            status=status.HTTP_201_CREATED,
        )




class UploadCRDocumentView(APIView):
    """
    رفع وتوثيق مستند السجل التجاري للشركات (FR-23).
    يشترط إرفاق ملف حقيقي تم التحقق من سلامته أو رابط صالح صراحة، دون أي قيم وهمية.
    """
    permission_classes = [IsCompany]

    def post(self, request):
        if request.user.role != 'COMPANY':
            return Response(
                {'error': 'رفع وثائق السجل التجاري متاح حصرياً لحسابات الشركات.'},
                status=status.HTTP_403_FORBIDDEN
            )

        from django.core.files.storage import default_storage
        from .validators import validate_file, ALLOWED_DOCUMENT_TYPES, ALLOWED_IMAGE_TYPES

        company, _ = Company.objects.get_or_create(
            user=request.user,
            defaults={'company_name': request.user.name or 'منشأة معتمدة'}
        )
        uploaded_file = (
            request.FILES.get('cr_document')
            or request.FILES.get('document')
            or request.FILES.get('file')
        )
        if uploaded_file:
            allowed_types = ALLOWED_DOCUMENT_TYPES | ALLOWED_IMAGE_TYPES
            is_valid, err = validate_file(
                uploaded_file,
                max_size_mb=10,
                allowed_content_types=allowed_types
            )
            if not is_valid:
                return Response({'error': err}, status=status.HTTP_400_BAD_REQUEST)

            ext = os.path.splitext(uploaded_file.name)[1].lower()
            clean_name = f"cr_docs/cr_{company.id}_{uuid.uuid4().hex[:8]}{ext}"
            saved_path = default_storage.save(clean_name, uploaded_file)
            doc_url = default_storage.url(saved_path)
        else:
            raw_url = str(request.data.get('cr_document_url') or '').strip()
            if not raw_url:
                return Response(
                    {'error': 'يرجى إرفاق ملف وثيقة السجل التجاري الرسمي (PDF أو صورة) أو تقديم رابط المستند.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            if len(raw_url) > 500:
                return Response(
                    {'error': 'طول رابط مستند السجل التجاري يتجاوز الحد المسموح به (500 حرف).'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            lower_url = raw_url.lower()
            if lower_url.startswith(('javascript:', 'data:', 'vbscript:')):
                return Response(
                    {'error': 'البروتوكولات غير الآمنة (javascript:, data:) مرفوضة تماماً.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            if raw_url.startswith(('http://', 'https://')):
                validator = URLValidator(schemes=['http', 'https'])
                try:
                    validator(raw_url)
                except ValidationError:
                    return Response(
                        {'error': 'رابط وثيقة السجل التجاري غير صالح.'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            elif not raw_url.startswith(('/', 'media/')):
                return Response(
                    {'error': 'رابط المستند يجب أن يكون مساراً محلياً صحيحاً أو رابط ويب صالحاً (http/https).'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            doc_url = raw_url

        company.cr_document_url = doc_url
        if company.verification_status != 'APPROVED':
            company.verification_status = 'PENDING'
            company.save(update_fields=['cr_document_url', 'verification_status'])
        else:
            company.save(update_fields=['cr_document_url'])

        return Response({'message': 'تم استلام وثيقة السجل التجاري بنجاح ✓', 'cr_document_url': doc_url})


class GraduateVideoSettingsView(APIView):
    """
    تحديث إعدادات وبيانات الفيديو التعريفي ومستوى الرؤية (Screen 07, FR-08, FR-09).
    يدعم PATCH لتحديث الحقول ويرفض الروابط الخارجية لحماية المنصة.
    """
    permission_classes = [IsGraduate]

    def patch(self, request):
        profile, _ = GraduateProfile.objects.get_or_create(user=request.user)
        video_cv_url = request.data.get('video_cv_url') or request.data.get('video_url')
        video_duration_seconds = request.data.get('video_duration_seconds')
        video_visibility = request.data.get('video_visibility')

        update_fields = []
        if video_cv_url:
            clean_url = str(video_cv_url).strip()
            parsed = urlparse(clean_url)
            request_host = request.get_host().split(':')[0]
            url_host = parsed.netloc.split(':')[0] if parsed.netloc else ''

            if parsed.scheme and parsed.scheme.lower() not in ('http', 'https'):
                return Response(
                    {'error': 'مخطط الرابط غير مدعوم. يجب استخدام http أو https.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            if parsed.netloc and url_host != request_host:
                return Response(
                    {'error': 'الروابط الخارجية غير مسموح بها. يجب أن يكون مسار الفيديو مسار بث داخلي من المنصة (stream/<id>).'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            if parsed.query or parsed.fragment:
                return Response(
                    {'error': 'لا يُسمح بمعاملات query أو fragment في رابط الفيديو.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # التحقق الصارم من أن كامل المسار يطابق نمط stream/<id>
            path_part = parsed.path.rstrip('/')
            if not re.fullmatch(r'(?:.*/)?stream/\d+', path_part):
                return Response(
                    {'error': 'مسار الفيديو غير صالح. يجب أن يكون مسار بث داخلي ينتهي بـ stream/<id> (أرقام فقط للـ ID).'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            profile.video_cv_url = clean_url
            update_fields.append('video_cv_url')
            # إجبار إعادة التحقق video_verified=False دائماً عند تعيين أو تغيير رابط الفيديو
            profile.video_verified = False
            update_fields.append('video_verified')

        if video_duration_seconds is not None:
            try:
                profile.video_duration_seconds = max(0, int(video_duration_seconds))
                update_fields.append('video_duration_seconds')
            except (ValueError, TypeError):
                pass

        if video_visibility is not None:
            valid_visibilities = [c[0] for c in GraduateProfile.VISIBILITY_CHOICES]
            if video_visibility not in valid_visibilities:
                return Response(
                    {'error': f'مستوى الرؤية غير صالح. الخيارات المتاحة: {", ".join(valid_visibilities)}'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            profile.video_visibility = video_visibility
            update_fields.append('video_visibility')

        if update_fields:
            profile.save(update_fields=list(set(update_fields)))

        return Response({
            'message': 'تم تحديث إعدادات الفيديو التعريفي بنجاح.',
            'video_cv_url': profile.video_cv_url,
            'video_duration_seconds': profile.video_duration_seconds,
            'video_visibility': profile.video_visibility,
            'video_verified': profile.video_verified,
        }, status=status.HTTP_200_OK)

    def post(self, request):
        return self.patch(request)
