from typing import Any, cast
from django.db import transaction
from rest_framework import serializers
from profiles.models import Skill
from .models import Job, JobSkill, Application


class JobSkillSerializer(serializers.ModelSerializer):
    skill_name = serializers.ReadOnlyField(source='skill.name')
    skill_category = serializers.ReadOnlyField(source='skill.category')

    class Meta:
        model = JobSkill
        fields = ('id', 'job', 'skill', 'skill_name', 'skill_category', 'is_required', 'required_level', 'weight')
        read_only_fields = ('job',)

    def validate_weight(self, value):
        if value < 0.01 or value > 10.0:
            raise serializers.ValidationError('قيمة الوزن يجب أن تكون بين 0.01 و 10.0')
        return value

    def to_internal_value(self, data):
        if hasattr(data, 'copy'):
            data = data.copy()
        else:
            data = dict(data)
        if 'min_proficiency' in data and 'required_level' not in data:
            data['required_level'] = data['min_proficiency']
        return super().to_internal_value(data)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['min_proficiency'] = instance.required_level
        return data


class FlexibleDateField(serializers.DateField):
    """حقل تاريخ مرن يقبل كلاً من date و datetime ويحول الأخير إلى date تلقائياً."""
    def to_internal_value(self, value):
        import datetime
        if isinstance(value, datetime.datetime):
            value = value.date()
        elif isinstance(value, str) and 'T' in value:
            value = value.split('T')[0]
        return super().to_internal_value(value)


class JobSerializer(serializers.ModelSerializer):
    company_name = serializers.ReadOnlyField(source='company.company_name')
    major_name = serializers.ReadOnlyField(source='major.major_name')
    requirements = serializers.CharField(required=False, allow_blank=True, default='')
    required_skills = JobSkillSerializer(many=True, read_only=True)
    skills = serializers.ListField(
        required=False,
        write_only=True,
        help_text="قائمة المهارات المطلوبة (أسماء أو معرفات كائنات)"
    )

    specialization_required = serializers.CharField(source='required_major', required=False, allow_blank=True, write_only=True)
    qualification_required = serializers.CharField(source='required_qualification', required=False, allow_blank=True, write_only=True)
    minimum_experience_years = serializers.DecimalField(source='required_exp', max_digits=4, decimal_places=1, required=False, write_only=True)
    closing_date = FlexibleDateField(source='deadline', required=False, allow_null=True, write_only=True)
    deadline = FlexibleDateField(required=False, allow_null=True)
    match_score = serializers.FloatField(read_only=True, required=False, allow_null=True)

    class Meta:
        model = Job
        fields = (
            'id', 'company', 'company_name', 'title', 'description',
            'requirements', 'major', 'major_name', 'location', 'job_type',
            'required_major', 'required_exp', 'required_qualification',
            'specialization_required', 'qualification_required',
            'minimum_experience_years', 'skills_weight', 'specialization_weight',
            'experience_weight', 'qualification_weight', 'minimum_match_score',
            'match_score', 'status', 'created_at', 'closing_date', 'deadline',
            'required_skills', 'skills'
        )
        read_only_fields = ('company', 'created_at')

    def to_internal_value(self, data):
        """دعم أسماء الحقول الواردة في مخطط ERD (الشكل 3-5)."""
        if hasattr(data, 'copy'):
            data = data.copy()
        else:
            data = dict(data)
        for date_key in ('closing_date', 'deadline'):
            if date_key in data:
                val = data[date_key]
                if hasattr(val, 'date') and callable(val.date):
                    data[date_key] = val.date()
        mapping = {
            'weight_skills': 'skills_weight',
            'weight_major': 'specialization_weight',
            'weight_experience': 'experience_weight',
            'weight_qualification': 'qualification_weight',
            'min_match_score': 'minimum_match_score',
            'required_experience': 'required_exp',
            'minimum_experience_years': 'required_exp',
            'specialization_required': 'required_major',
            'qualification_required': 'required_qualification',
            'closing_date': 'deadline',
            'major_id': 'major',
        }
        for erd_key, model_key in mapping.items():
            if erd_key in data and model_key not in data:
                data[model_key] = data[erd_key]

        # دعم المدخلات كنسبة مئوية (مثال: 60 تصبح 0.60)
        score_val = data.get('minimum_match_score')
        if score_val is not None:
            try:
                num = float(score_val)
                if num > 1.0:
                    data['minimum_match_score'] = round(num / 100.0, 4)
            except (ValueError, TypeError):
                pass

        for w_field in ('skills_weight', 'specialization_weight', 'experience_weight', 'qualification_weight'):
            w_val = data.get(w_field)
            if w_val is not None:
                try:
                    num = float(w_val)
                    if num > 1.0:
                        data[w_field] = round(num / 100.0, 4)
                except (ValueError, TypeError):
                    pass

        return super().to_internal_value(data)

    def to_representation(self, instance):
        """توفير أسماء الحقول التوافقية وفق ERD أيضاً."""
        data = super().to_representation(instance)
        data['weight_skills'] = instance.skills_weight
        data['weight_major'] = instance.specialization_weight
        data['weight_experience'] = instance.experience_weight
        data['weight_qualification'] = instance.qualification_weight
        data['min_match_score'] = instance.minimum_match_score
        data['required_experience'] = float(instance.required_exp) if instance.required_exp is not None else 0.0
        data['minimum_experience_years'] = float(instance.required_exp) if instance.required_exp is not None else 0.0
        data['specialization_required'] = instance.required_major
        data['qualification_required'] = instance.required_qualification
        data['closing_date'] = instance.deadline
        data['posted_date'] = instance.created_at
        app_count = getattr(instance, 'applicants_count', None)
        if app_count is None:
            # تجنب N+1 في القوائم واستخدم 0 أو القيمة المجهزة
            app_count = 0
        data['applicants_count'] = app_count
        data['applications_count'] = app_count
        data['match_score'] = getattr(instance, 'match_score', None)
        return data

    def validate(self, attrs):

        """
        يتحقق من أن كل وزن يقع بين 0 و 1 وأن مجموع أوزان المطابقة يساوي 1.0 بالضبط (FR-18: w ∈ [0, 1], ∑w = 1).
        كما يتحقق من صحة الحد الأدنى للتوافق minimum_match_score والحالة status.
        """
        WEIGHT_FIELDS = (
            'skills_weight',
            'specialization_weight',
            'experience_weight',
            'qualification_weight',
        )
        weights = {}
        for field in WEIGHT_FIELDS:
            if field in attrs:
                val = attrs[field]
            elif self.instance:
                val = getattr(self.instance, field)
            else:
                val = Job._meta.get_field(field).default

            if val is not None and (val < 0.0 or val > 1.0):
                raise serializers.ValidationError({
                    field: f'قيمة الوزن يجب أن تكون بين 0.0 و 1.0 (القيمة المدخلة: {val}).'
                })
            weights[field] = val

        total = sum(weights.values())
        if abs(total - 1.0) > 0.001:  # هامش خطأ صغير لدقة أرقام الفاصلة
            raise serializers.ValidationError({
                'weights': (
                    f'مجموع أوزان المطابقة يجب أن يساوي 1.0 تماماً. '
                    f'المجموع الحالي: {total:.3f} '
                    f'(مهارات={weights["skills_weight"]}, '
                    f'تخصص={weights["specialization_weight"]}, '
                    f'خبرة={weights["experience_weight"]}, '
                    f'مؤهل={weights["qualification_weight"]})'
                )
            })

        min_score = attrs.get('minimum_match_score')
        if min_score is not None and (min_score < 0.0 or min_score > 1.0):
            raise serializers.ValidationError({
                'minimum_match_score': f'الحد الأدنى لدرجة التوافق يجب أن يكون بين 0.0 و 1.0 (القيمة المدخلة: {min_score}).'
            })

        job_status = attrs.get('status')
        if job_status and job_status not in dict(Job.STATUS_CHOICES):
            raise serializers.ValidationError({
                'status': f'الحالة غير صالحة. القيم المسموحة: {", ".join(dict(Job.STATUS_CHOICES).keys())}'
            })

        return attrs

    def create(self, validated_data):
        skills_data = validated_data.pop('skills', None)
        with cast(Any, transaction.atomic()):  # type: ignore
            job = Job.objects.create(**validated_data)
            if skills_data:
                for item in skills_data:
                    if isinstance(item, str):
                        skill, _ = Skill.objects.get_or_create(name=item.strip())
                        JobSkill.objects.create(
                            job=job,
                            skill=skill,
                            is_required=True,
                            required_level='INTERMEDIATE',
                            weight=1.0
                        )
                    elif isinstance(item, dict):
                        skill_id = item.get('skill') or item.get('skill_id')
                        skill_name = item.get('name') or item.get('skill_name')
                        if not skill_id and skill_name:
                            skill, _ = Skill.objects.get_or_create(name=skill_name.strip())
                            skill_id = skill.id
                        if skill_id:
                            JobSkill.objects.create(
                                job=job,
                                skill_id=skill_id,
                                is_required=item.get('is_required', True),
                                required_level=item.get('required_level') or item.get('min_proficiency', 'INTERMEDIATE'),
                                weight=float(item.get('weight', 1.0))
                            )
        return job

    def update(self, instance, validated_data):
        skills_data = validated_data.pop('skills', None)
        with cast(Any, transaction.atomic()):  # type: ignore
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            instance.save()

            if skills_data is not None:
                instance.required_skills.all().delete()
                for item in skills_data:
                    if isinstance(item, str):
                        skill, _ = Skill.objects.get_or_create(name=item.strip())
                        JobSkill.objects.create(
                            job=instance,
                            skill=skill,
                            is_required=True,
                            required_level='INTERMEDIATE',
                            weight=1.0
                        )
                    elif isinstance(item, dict):
                        skill_id = item.get('skill') or item.get('skill_id')
                        skill_name = item.get('name') or item.get('skill_name')
                        if not skill_id and skill_name:
                            skill, _ = Skill.objects.get_or_create(name=skill_name.strip())
                            skill_id = skill.id
                        if skill_id:
                            JobSkill.objects.create(
                                job=instance,
                                skill_id=skill_id,
                                is_required=item.get('is_required', True),
                                required_level=item.get('required_level') or item.get('min_proficiency', 'INTERMEDIATE'),
                                weight=float(item.get('weight', 1.0))
                            )
        return instance


class ApplicationStatusHistorySerializer(serializers.ModelSerializer):
    changed_by_name = serializers.ReadOnlyField(source='changed_by.name')

    class Meta:
        from .models import ApplicationStatusHistory
        model = ApplicationStatusHistory
        fields = (
            'history_id', 'application', 'previous_status',
            'new_status', 'changed_at', 'changed_by', 'changed_by_name'
        )


class ApplicationSerializer(serializers.ModelSerializer):
    applicant_name           = serializers.ReadOnlyField(source='profile.user.name')
    applicant_email          = serializers.ReadOnlyField(source='profile.user.email')
    applicant_specialization = serializers.ReadOnlyField(source='profile.specialization')
    applicant_university     = serializers.ReadOnlyField(source='profile.university')
    applicant_qualification  = serializers.ReadOnlyField(source='profile.qualification_level')
    applicant_experience     = serializers.ReadOnlyField(source='profile.years_of_experience')
    applicant_city           = serializers.ReadOnlyField(source='profile.city')
    applicant_gpa            = serializers.ReadOnlyField(source='profile.gpa')
    applicant_graduation_year = serializers.ReadOnlyField(source='profile.graduation_year')
    has_video_cv             = serializers.SerializerMethodField()
    projects_count           = serializers.SerializerMethodField()
    job_title                = serializers.ReadOnlyField(source='job.title')
    company_name             = serializers.ReadOnlyField(source='job.company.company_name')
    matching_score           = serializers.SerializerMethodField()
    score_breakdown          = serializers.SerializerMethodField()
    has_graduation_project   = serializers.SerializerMethodField()
    graduation_project_title = serializers.SerializerMethodField()
    has_github               = serializers.SerializerMethodField()
    github_url               = serializers.SerializerMethodField()
    applicant_phone          = serializers.SerializerMethodField()
    company_email            = serializers.SerializerMethodField()
    company_phone            = serializers.SerializerMethodField()
    contact_unlocked         = serializers.SerializerMethodField()
    status_history           = ApplicationStatusHistorySerializer(many=True, read_only=True)

    class Meta:
        model = Application
        fields = (
            'id', 'job', 'job_title', 'company_name', 'company_email', 'company_phone',
            'profile', 'applicant_name', 'applicant_email', 'applicant_phone',
            'applicant_specialization', 'applicant_university',
            'applicant_qualification', 'applicant_experience',
            'applicant_city', 'applicant_gpa', 'applicant_graduation_year',
            'has_video_cv', 'projects_count', 'has_graduation_project',
            'graduation_project_title', 'has_github', 'github_url', 'contact_unlocked',
            'status', 'match_score', 'matching_score', 'score_breakdown', 'applied_at', 'updated_at',
            'status_history'
        )
        read_only_fields = ('profile', 'status', 'applied_at', 'updated_at', 'match_score', 'status_history')

    def to_internal_value(self, data):
        if hasattr(data, 'copy'):
            data = data.copy()
        else:
            data = dict(data)
        if 'job_id' in data and 'job' not in data:
            data['job'] = data['job_id']
        return super().to_internal_value(data)

    def to_representation(self, obj):
        data = super().to_representation(obj)
        request = self.context.get('request')
        user = getattr(request, 'user', None)
        is_admin = getattr(user, 'role', '') == 'ADMIN'
        is_owner_grad = hasattr(user, 'graduate_profile') and obj.profile_id == user.graduate_profile.id

        # التواصل المباشر (الواتساب والبريد المهني) يفتح فقط عند قبول الطلب للمقابلة المباشرة
        if obj.status == 'ACCEPTED' or is_admin:
            data['contact_unlocked'] = True
            data['applicant_email'] = obj.profile.user.email
            data['applicant_phone'] = obj.profile.phone or obj.profile.user.phone or ""
            try:
                data['company_email'] = obj.job.company.user.email
                data['company_phone'] = obj.job.company.user.phone or getattr(obj.job.company, 'phone', '') or ""
            except Exception:
                data['company_email'] = ""
                data['company_phone'] = ""
        else:
            data['contact_unlocked'] = False
            data['company_email'] = ""
            data['company_phone'] = ""
            if is_owner_grad:
                data['applicant_email'] = obj.profile.user.email
                data['applicant_phone'] = obj.profile.phone or obj.profile.user.phone or ""
            else:
                data['applicant_email'] = ""
                data['applicant_phone'] = ""
        return data

    def get_company_email(self, obj):
        if obj.status == 'ACCEPTED':
            try:
                return obj.job.company.user.email
            except Exception:
                return ""
        return ""

    def get_company_phone(self, obj):
        if obj.status == 'ACCEPTED':
            try:
                return obj.job.company.user.phone or getattr(obj.job.company, 'phone', '') or ""
            except Exception:
                return ""
        return ""

    def get_has_video_cv(self, obj):
        try:
            return bool(obj.profile.video_cv_url or getattr(obj.profile, 'video_verified', False) or hasattr(obj.profile, 'video_cv'))
        except Exception:
            return False

    def get_has_graduation_project(self, obj):
        try:
            return obj.profile.projects.filter(is_graduation_project=True).exists()
        except Exception:
            return False

    def get_graduation_project_title(self, obj):
        try:
            gp = obj.profile.projects.filter(is_graduation_project=True).first()
            return gp.title if gp else None
        except Exception:
            return None

    def get_has_github(self, obj):
        try:
            if obj.profile.github_url:
                return True
            return obj.profile.projects.filter(github_url__isnull=False).exclude(github_url='').exists()
        except Exception:
            return False

    def get_github_url(self, obj):
        try:
            if obj.profile.github_url:
                return obj.profile.github_url
            p = obj.profile.projects.filter(github_url__isnull=False).exclude(github_url='').first()
            return p.github_url if p else None
        except Exception:
            return None

    def get_contact_unlocked(self, obj):
        return obj.status == 'ACCEPTED'

    def get_applicant_phone(self, obj):
        if obj.status == 'ACCEPTED':
            return obj.profile.phone or obj.profile.user.phone or ""
        return ""

    def get_projects_count(self, obj):
        try:
            return obj.profile.projects.count()
        except Exception:
            return 0

    def get_matching_score(self, obj):
        """يعيد درجة التوافق من match_score أو MatchingResult."""
        if obj.match_score is not None:
            return obj.match_score
        try:
            return obj.matching_result.final_score
        except Exception:
            return None

    def get_score_breakdown(self, obj):
        """إعادة تفصيل درجات المعايير الأربعة (FR-16)."""
        try:
            mr = getattr(obj, 'matching_result', None)
            if mr:
                return mr.get_score_breakdown()
        except Exception:
            pass
        return None


class CandidateApplicationProfileSerializer(serializers.ModelSerializer):
    """سيريالايزر عرض ملف المرشح الكامل للشركة (Screen 21)."""
    application_id = serializers.IntegerField(source='id', read_only=True)
    graduate_id = serializers.IntegerField(source='profile.id', read_only=True)
    full_name = serializers.SerializerMethodField()
    email = serializers.CharField(source='profile.user.email', read_only=True)
    phone = serializers.SerializerMethodField()
    city = serializers.CharField(source='profile.city', read_only=True)
    university = serializers.CharField(source='profile.university', read_only=True)
    major = serializers.CharField(source='profile.specialization', read_only=True)
    graduation_year = serializers.IntegerField(source='profile.graduation_year', read_only=True)
    gpa = serializers.CharField(source='profile.gpa', read_only=True)
    experience_years = serializers.CharField(source='profile.years_of_experience', read_only=True)
    bio = serializers.CharField(source='profile.bio', read_only=True)
    github_url = serializers.CharField(source='profile.github_url', read_only=True)
    linkedin_url = serializers.CharField(source='profile.linkedin_url', read_only=True)
    cv_url = serializers.SerializerMethodField()
    video_cv_url = serializers.CharField(source='profile.video_cv_url', read_only=True)
    video_duration_seconds = serializers.IntegerField(source='profile.video_duration_seconds', read_only=True)
    video_visibility = serializers.CharField(source='profile.video_visibility', read_only=True)
    skills = serializers.SerializerMethodField()
    projects = serializers.SerializerMethodField()
    match_score = serializers.SerializerMethodField()
    score_breakdown = serializers.SerializerMethodField()
    status_history = ApplicationStatusHistorySerializer(many=True, read_only=True)

    class Meta:
        model = Application
        fields = (
            'id', 'application_id', 'graduate_id', 'full_name', 'email', 'phone',
            'city', 'university', 'major', 'graduation_year', 'gpa',
            'experience_years', 'bio', 'github_url', 'linkedin_url',
            'cv_url', 'video_cv_url', 'video_duration_seconds', 'video_visibility',
            'skills', 'projects', 'status', 'match_score', 'score_breakdown',
            'status_history', 'applied_at'
        )

    def to_representation(self, obj):
        data = super().to_representation(obj)
        request = self.context.get('request')
        user = getattr(request, 'user', None)
        is_admin = getattr(user, 'role', '') == 'ADMIN'
        is_owner_grad = hasattr(user, 'graduate_profile') and obj.profile_id == user.graduate_profile.id
        if not (obj.status == 'ACCEPTED' or is_admin or is_owner_grad):
            data['phone'] = ''
            data['email'] = ''
            data['contact_unlocked'] = False
        else:
            data['contact_unlocked'] = True
        return data

    def get_full_name(self, obj):
        return obj.profile.user.name or f"{obj.profile.first_name} {obj.profile.last_name}".strip() or "مرشح معتمد"

    def get_phone(self, obj):
        return obj.profile.phone or obj.profile.user.phone or ""

    def get_cv_url(self, obj):
        return obj.profile.cv_file_url or obj.profile.cv_file or None

    def get_skills(self, obj):
        skills_qs = obj.profile.skills.select_related('skill').all()
        return [
            {
                'id': gs.id,
                'skill_id': gs.skill_id,
                'name': gs.skill.name,
                'skill_name': gs.skill.name,
                'category': gs.skill.category,
                'proficiency_level': gs.proficiency_level,
            }
            for gs in skills_qs
        ]

    def get_projects(self, obj):
        from profiles.serializers import ProjectSerializer
        return ProjectSerializer(obj.profile.projects.all(), many=True).data

    def get_match_score(self, obj):
        if obj.match_score is not None:
            return obj.match_score
        try:
            return obj.matching_result.final_score
        except Exception:
            return 0.0

    def get_score_breakdown(self, obj):
        try:
            mr = getattr(obj, 'matching_result', None)
            if mr:
                return mr.get_score_breakdown()
        except Exception:
            pass
        return None
