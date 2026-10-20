from rest_framework import serializers
from .models import (
    Skill,
    Major,
    GraduateProfile,
    Qualification,
    Experience,
    GraduateSkill,
    Project,
    Company,
)


class MajorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Major
        fields = '__all__'


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = '__all__'


class GraduateSkillSerializer(serializers.ModelSerializer):
    skill_name = serializers.ReadOnlyField(source='skill.name')
    skill_category = serializers.ReadOnlyField(source='skill.category')
    skill_category_display = serializers.CharField(source='skill.get_category_display', read_only=True)
    proficiency_level_display = serializers.CharField(source='get_proficiency_level_display', read_only=True)
    proficiency_level_int = serializers.SerializerMethodField()

    class Meta:
        model = GraduateSkill
        fields = (
            'id', 'skill', 'skill_name', 'skill_category', 'skill_category_display',
            'proficiency_level', 'proficiency_level_display', 'proficiency_level_int'
        )

    def get_proficiency_level_int(self, obj):
        """إرجاع مستوى الإتقان كرقم صحيح (1-4) لمطابقة مخطط ERD (الشكل 3-5)."""
        mapping = {'BEGINNER': 1, 'INTERMEDIATE': 2, 'ADVANCED': 3, 'EXPERT': 4}
        return mapping.get(obj.proficiency_level, 2)

    def to_internal_value(self, data):
        """قبول مستوى الإتقان كرقم صحيح (1-4) أو كنص لمطابقة كل من الـ ERD والـ API، ودعم skill_id أيضاً."""
        if hasattr(data, 'copy'):
            data = data.copy()
        else:
            data = dict(data)
        if 'skill_id' in data and 'skill' not in data:
            data['skill'] = data['skill_id']
        level = data.get('proficiency_level')
        int_to_str = {
            1: 'BEGINNER', 2: 'INTERMEDIATE', 3: 'ADVANCED', 4: 'EXPERT',
            '1': 'BEGINNER', '2': 'INTERMEDIATE', '3': 'ADVANCED', '4': 'EXPERT'
        }
        if level in int_to_str:
            data['proficiency_level'] = int_to_str[level]
        return super().to_internal_value(data)



class QualificationSerializer(serializers.ModelSerializer):
    major_name = serializers.ReadOnlyField(source='major.major_name')

    class Meta:
        model = Qualification
        fields = ('id', 'degree', 'major', 'major_name', 'university', 'graduation_year', 'gpa')
        read_only_fields = ('graduate',)


class ExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Experience
        fields = ('id', 'job_title', 'company_name', 'start_date', 'end_date', 'description')
        read_only_fields = ('graduate',)


class ProjectSerializer(serializers.ModelSerializer):
    technologies = serializers.CharField(required=False, allow_blank=True, default='')

    class Meta:
        model = Project
        fields = '__all__'
        read_only_fields = ('profile',)


class GraduateProfileSerializer(serializers.ModelSerializer):
    """
    سيريالايزر الملف المهني للخريج المتوافق مع مخطط ERD الجديد.
    يشمل تطبيق FR-09: فلترة رؤية الفيديو حسب video_visibility.
    """
    skills         = GraduateSkillSerializer(many=True, read_only=True)
    projects       = ProjectSerializer(many=True, read_only=True)
    qualifications = QualificationSerializer(many=True, read_only=True)
    experiences    = ExperienceSerializer(many=True, read_only=True)
    user_name      = serializers.ReadOnlyField(source='user.name')
    user_email     = serializers.ReadOnlyField(source='user.email')
    user_phone     = serializers.ReadOnlyField(source='user.phone')
    email          = serializers.ReadOnlyField(source='user.email')
    name           = serializers.ReadOnlyField(source='user.name')

    class Meta:
        model = GraduateProfile
        fields = (
            'id', 'user_name', 'user_email', 'user_phone', 'email', 'name',
            'first_name', 'last_name', 'birth_date', 'gender', 'city',
            'specialization', 'university', 'graduation_year', 'gpa',
            'qualification_level', 'years_of_experience',
            'bio', 'github_url', 'linkedin_url', 'cv_file', 'profile_image',
            'video_url', 'video_cv_url', 'video_duration_seconds', 'video_visibility',
            'skills', 'projects', 'qualifications', 'experiences',
        )
        read_only_fields = ('user', 'video_url', 'video_cv_url', 'video_duration_seconds')

    def to_internal_value(self, data):
        if hasattr(data, 'copy'):
            data = data.copy()
        else:
            data = dict(data)
        if 'major' in data and 'specialization' not in data:
            data['specialization'] = data['major']
        if 'graduationYear' in data and 'graduation_year' not in data:
            data['graduation_year'] = data['graduationYear']
        if 'experienceYears' in data and 'years_of_experience' not in data:
            data['years_of_experience'] = data['experienceYears']
        if 'experience_years' in data and 'years_of_experience' not in data:
            data['years_of_experience'] = data['experience_years']
        name_val = data.get('full_name') or data.get('name')
        if name_val:
            parts = str(name_val).strip().split(' ', 1)
            data['first_name'] = parts[0]
            data['last_name'] = parts[1] if len(parts) > 1 else ''
        return super().to_internal_value(data)

    def update(self, instance, validated_data):
        request = self.context.get('request')
        name_val = self.initial_data.get('full_name') or self.initial_data.get('name')
        phone_val = self.initial_data.get('phone')
        user = getattr(instance, 'user', None) or (request.user if request else None)
        if user and (name_val or phone_val is not None):
            update_fields = []
            if name_val and user.name != str(name_val).strip():
                user.name = str(name_val).strip()
                update_fields.append('name')
            if phone_val is not None and user.phone != str(phone_val).strip():
                user.phone = str(phone_val).strip()
                update_fields.append('phone')
            if update_fields:
                user.save(update_fields=update_fields)
        return super().update(instance, validated_data)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request')
        visibility = instance.video_visibility

        can_view = False
        if request and hasattr(request, 'user') and request.user.is_authenticated:
            if instance.user_id == request.user.id or getattr(request.user, 'role', '') == 'ADMIN':
                can_view = True
            elif visibility == 'PUBLIC':
                can_view = True
            elif visibility == 'COMPANIES_ONLY' and getattr(request.user, 'role', '') == 'COMPANY':
                can_view = True
        elif visibility == 'PUBLIC':
            can_view = True

        if not can_view:
            data['video_url'] = None
            data['video_cv_url'] = None

        if instance.user:
            data['full_name'] = instance.user.name
            data['name'] = instance.user.name
            data['phone'] = instance.user.phone or instance.phone or ''
            data['email_verified'] = getattr(instance.user, 'email_verified', False)
        data['major'] = instance.specialization
        data['experience_years'] = instance.years_of_experience
        data['experienceYears'] = instance.years_of_experience
        data['graduationYear'] = instance.graduation_year

        return data


class CompanyProfileSerializer(serializers.ModelSerializer):
    user_name  = serializers.ReadOnlyField(source='user.name')
    user_email = serializers.ReadOnlyField(source='user.email')
    user_phone = serializers.ReadOnlyField(source='user.phone')

    registration_number = serializers.CharField(source='commercial_reg', required=False, allow_blank=True)
    sector = serializers.CharField(source='industry', required=False, allow_blank=True)
    address = serializers.CharField(source='location', required=False, allow_blank=True)
    logo = serializers.URLField(source='logo_url', required=False, allow_null=True)

    class Meta:
        model = Company
        fields = (
            'id', 'user_name', 'user_email', 'user_phone',
            'company_name', 'registration_number', 'commercial_reg',
            'industry', 'sector', 'company_size',
            'location', 'address', 'website', 'logo_url', 'logo',
            'description', 'cr_document_url', 'verification_status', 'verified_at',
        )
        read_only_fields = ('user', 'verification_status', 'verified_by', 'verified_at')

    def to_internal_value(self, data):
        if hasattr(data, 'copy'):
            data = data.copy()
        else:
            data = dict(data)
        if 'registration_number' in data and 'commercial_reg' not in data:
            data['commercial_reg'] = data['registration_number']
        if 'sector' in data and 'industry' not in data:
            data['industry'] = data['sector']
        if 'address' in data and 'location' not in data:
            data['location'] = data['address']
        if 'logo' in data and 'logo_url' not in data:
            data['logo_url'] = data['logo']
        return super().to_internal_value(data)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['registration_number'] = instance.commercial_reg
        data['sector'] = instance.industry
        data['address'] = instance.location
        data['logo'] = instance.logo_url
        if instance.user:
            data['name'] = instance.user.name
            data['email'] = instance.user.email
            data['phone'] = instance.user.phone or ''
            data['user_name'] = instance.user.name
            data['user_email'] = instance.user.email
            data['user_phone'] = instance.user.phone or ''
        return data

    def update(self, instance, validated_data):
        user_phone = self.initial_data.get('user_phone') or self.initial_data.get('phone')
        if user_phone is not None and instance.user:
            instance.user.phone = user_phone
            instance.user.save(update_fields=['phone'])
        return super().update(instance, validated_data)

