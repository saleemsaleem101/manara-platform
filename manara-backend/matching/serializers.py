from rest_framework import serializers
from .models import MatchingResult

class MatchingResultSerializer(serializers.ModelSerializer):
    job_title = serializers.SerializerMethodField()
    applicant_name = serializers.SerializerMethodField()
    applicant_email = serializers.SerializerMethodField()
    applicant_phone = serializers.SerializerMethodField()
    applicant_specialization = serializers.SerializerMethodField()
    applicant_university = serializers.SerializerMethodField()
    applicant_qualification = serializers.SerializerMethodField()
    applicant_experience = serializers.SerializerMethodField()
    applicant_city = serializers.SerializerMethodField()
    applicant_gpa = serializers.SerializerMethodField()
    applicant_graduation_year = serializers.SerializerMethodField()
    bio = serializers.SerializerMethodField()
    video_cv_url = serializers.SerializerMethodField()
    video_visibility = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    skills = serializers.SerializerMethodField()
    projects = serializers.SerializerMethodField()
    match_score = serializers.SerializerMethodField()
    matching_score = serializers.SerializerMethodField()
    score_breakdown = serializers.SerializerMethodField()
    weights = serializers.SerializerMethodField()
    minimum_match_score = serializers.SerializerMethodField()
    is_eligible = serializers.SerializerMethodField()

    class Meta:
        model = MatchingResult
        fields = (
            'id', 'application', 'job', 'graduate', 'job_title', 'applicant_name',
            'applicant_email', 'applicant_phone', 'applicant_specialization',
            'applicant_university', 'applicant_qualification', 'applicant_experience',
            'applicant_city', 'applicant_gpa', 'applicant_graduation_year',
            'bio', 'video_cv_url', 'video_visibility', 'status', 'skills', 'projects',
            'skills_score', 'specialization_score', 'experience_score',
            'qualification_score', 'final_score', 'match_score', 'matching_score',
            'score_breakdown', 'weights', 'minimum_match_score', 'is_eligible',
            'calculated_at'
        )

    def _get_profile(self, obj):
        if obj.application and getattr(obj.application, 'profile', None):
            return obj.application.profile
        return obj.graduate

    def _get_job(self, obj):
        if obj.application and getattr(obj.application, 'job', None):
            return obj.application.job
        return obj.job

    def get_job_title(self, obj):
        job = self._get_job(obj)
        return job.title if job else None

    def get_applicant_name(self, obj):
        profile = self._get_profile(obj)
        if profile and getattr(profile, 'user', None):
            return profile.user.name
        return None

    def get_applicant_email(self, obj):
        profile = self._get_profile(obj)
        if profile and getattr(profile, 'user', None):
            return profile.user.email
        return None

    def get_applicant_phone(self, obj):
        profile = self._get_profile(obj)
        if profile:
            return profile.phone or (profile.user.phone if getattr(profile, 'user', None) else '')
        return ''

    def get_applicant_specialization(self, obj):
        profile = self._get_profile(obj)
        return profile.specialization if profile else ''

    def get_applicant_university(self, obj):
        profile = self._get_profile(obj)
        return profile.university if profile else ''

    def get_applicant_qualification(self, obj):
        profile = self._get_profile(obj)
        return profile.qualification_level if profile else ''

    def get_applicant_experience(self, obj):
        profile = self._get_profile(obj)
        return profile.years_of_experience if profile else '0'

    def get_applicant_city(self, obj):
        profile = self._get_profile(obj)
        return profile.city if profile else ''

    def get_applicant_gpa(self, obj):
        profile = self._get_profile(obj)
        return profile.gpa if profile else ''

    def get_applicant_graduation_year(self, obj):
        profile = self._get_profile(obj)
        return profile.graduation_year if profile else None

    def get_bio(self, obj):
        profile = self._get_profile(obj)
        return profile.bio if profile else ''

    def get_video_cv_url(self, obj):
        profile = self._get_profile(obj)
        return profile.video_cv_url if profile else None

    def get_video_visibility(self, obj):
        profile = self._get_profile(obj)
        return profile.video_visibility if profile else 'COMPANIES_ONLY'

    def get_status(self, obj):
        if obj.application:
            return obj.application.status
        return 'UNDER_REVIEW'

    def get_skills(self, obj):
        profile = self._get_profile(obj)
        if profile:
            return [
                {
                    'id': gs.id,
                    'name': gs.skill.name,
                    'category': gs.skill.category,
                    'proficiency_level': gs.proficiency_level,
                }
                for gs in profile.skills.select_related('skill').all()
            ]
        return []

    def get_projects(self, obj):
        profile = self._get_profile(obj)
        if profile:
            from profiles.serializers import ProjectSerializer
            return ProjectSerializer(profile.projects.all(), many=True).data
        return []

    def get_match_score(self, obj):
        return obj.final_score

    def get_matching_score(self, obj):
        return obj.final_score

    def get_score_breakdown(self, obj):
        return obj.get_score_breakdown()

    def get_weights(self, obj):
        job = self._get_job(obj)
        if job:
            return {
                'skills_weight': job.skills_weight,
                'specialization_weight': job.specialization_weight,
                'experience_weight': job.experience_weight,
                'qualification_weight': job.qualification_weight,
                'min_score': job.minimum_match_score,
            }
        return {
            'skills_weight': 0.45,
            'specialization_weight': 0.25,
            'experience_weight': 0.20,
            'qualification_weight': 0.10,
            'min_score': 0.60,
        }

    def get_minimum_match_score(self, obj):
        job = self._get_job(obj)
        return job.minimum_match_score if job else 0.60

    def get_is_eligible(self, obj):
        return obj.is_eligible()