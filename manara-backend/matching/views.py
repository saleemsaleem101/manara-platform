from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import NotFound, PermissionDenied
from .models import MatchingResult
from .serializers import MatchingResultSerializer
from .services import MatchingService
from jobs.models import Job, Application
from profiles.models import GraduateProfile


class ApplicationMatchResultView(generics.RetrieveAPIView):
    serializer_class = MatchingResultSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = "application_id"

    def get_queryset(self):
        user = self.request.user
        if getattr(user, 'role', '') == 'ADMIN':
            return MatchingResult.objects.all()
        # السماح للشركة صاحبة الوظيفة أو الخريج صاحب الطلب برؤية النتيجة
        return MatchingResult.objects.filter(
            application__profile__user=user
        ) | MatchingResult.objects.filter(
            application__job__company__user=user
        )


class JobMatchCalculationView(APIView):
    """
    حساب درجة التوافق الفورية بين الخريج ووظيفة معينة (FR-15, FR-16 & Class Diagram: calculateMatch).
    تتيح للخريج معرفة تفاصيل نقاط قوته وتوافقه مع الوظيفة قبل التقديم عليها.
    GET: حساب نقي (Pure Calculation) في الذاكرة دون تعديل قاعدة البيانات.
    POST: حفظ أو تحديث نتيجة المطابقة صراحة في جدول MATCH_RESULTS.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, job_id):
        job = Job.objects.filter(pk=job_id).first()
        if not job:
            raise NotFound("الوظيفة غير موجودة.")

        profile = getattr(request.user, "graduate_profile", None)
        if not profile:
            return Response(
                {"error": "يجب تسجيل الدخول كخريج لحساب نسبة التطابق مع الوظيفة."},
                status=status.HTTP_403_FORBIDDEN,
            )

        # حساب نقي (Pure Calculation) دون حفظ أو تعديل في قاعدة البيانات
        scores = MatchingService.calculate_match_scores(profile, job)
        final_score = scores['final_score']
        min_score = job.minimum_match_score or 0.5
        is_eligible = final_score >= min_score

        data = {
            "job": job.id,
            "graduate": profile.id,
            "skills_score": scores["skills_score"],
            "specialization_score": scores["specialization_score"],
            "experience_score": scores["experience_score"],
            "qualification_score": scores["qualification_score"],
            "final_score": final_score,
            "is_eligible": is_eligible,
            "minimum_match_score": min_score,
        }
        return Response(data, status=status.HTTP_200_OK)

    def post(self, request, job_id):
        job = Job.objects.filter(pk=job_id).first()
        if not job:
            raise NotFound("الوظيفة غير موجودة.")

        profile = getattr(request.user, "graduate_profile", None)
        if not profile:
            return Response(
                {"error": "يجب تسجيل الدخول كخريج لحفظ نتيجة التطابق."},
                status=status.HTTP_403_FORBIDDEN,
            )

        match_result = MatchingService.calculate_graduate_job_match(profile, job)
        serializer = MatchingResultSerializer(match_result)
        data = serializer.data
        data["is_eligible"] = match_result.is_eligible()
        data["minimum_match_score"] = job.minimum_match_score
        return Response(data, status=status.HTTP_201_CREATED)


class JobCandidateRankView(APIView):
    """
    ترتيب المرشحين المتقدمين للوظيفة وفق درجة التوافق (FR-17 & Class Diagram: rankCandidates).
    متاحة للشركة المالكة للوظيفة ومدير النظام.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, job_id):
        job = Job.objects.filter(pk=job_id).first()
        if not job:
            raise NotFound("الوظيفة غير موجودة.")

        is_owner = (
            hasattr(request.user, "company_profile")
            and job.company_id == request.user.company_profile.id
        )
        is_admin = request.user.role == "ADMIN"
        if not (is_owner or is_admin):
            raise PermissionDenied("لا تملك صلاحية استعراض مرشحي هذه الوظيفة.")

        ranked_apps = MatchingService.rank_candidates(job)
        from jobs.serializers import ApplicationSerializer
        serializer = ApplicationSerializer(ranked_apps, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
