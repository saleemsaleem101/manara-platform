from rest_framework import serializers
from accounts.models import User
from profiles.models import Company


class UserManagementSerializer(serializers.ModelSerializer):
    company_name = serializers.SerializerMethodField()
    verification_status = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            'id', 'name', 'email', 'phone', 'role',
            'is_active', 'email_verified', 'created_at',
            'company_name', 'verification_status'
        )
        read_only_fields = ('name', 'email', 'role', 'created_at')

    def get_company_name(self, obj):
        if hasattr(obj, 'company_profile'):
            return obj.company_profile.company_name
        return None

    def get_verification_status(self, obj):
        if hasattr(obj, 'company_profile'):
            return obj.company_profile.verification_status
        return None


class CompanyVerificationSerializer(serializers.ModelSerializer):
    user_name  = serializers.ReadOnlyField(source='user.name')
    user_email = serializers.ReadOnlyField(source='user.email')
    user_phone = serializers.ReadOnlyField(source='user.phone')
    registration_number = serializers.CharField(source='commercial_reg', read_only=True)

    class Meta:
        model = Company
        fields = (
            'id', 'user_name', 'user_email', 'user_phone', 'company_name',
            'registration_number', 'commercial_reg', 'industry', 'location',
            'description', 'website', 'logo_url', 'cr_document_url',
            'verification_status', 'verified_by', 'verified_at',
        )
        read_only_fields = (
            'id', 'user_name', 'user_email', 'user_phone', 'company_name',
            'registration_number', 'commercial_reg', 'industry', 'location',
            'description', 'website', 'logo_url', 'cr_document_url',
            'verified_by', 'verified_at',
        )


class JobAdminSerializer(serializers.ModelSerializer):
    """سيريالايزر لإدارة الوظائف لمدير النظام مع إحصاء عدد المتقدمين والمهارات المطلوبة (FR-20)."""
    company_id = serializers.ReadOnlyField(source='company.id')
    company_name = serializers.ReadOnlyField(source='company.company_name')
    company_verified = serializers.SerializerMethodField()
    applications_count = serializers.IntegerField(source='applications.count', read_only=True)
    applicants_count = serializers.IntegerField(source='applications.count', read_only=True)
    specialization_required = serializers.CharField(source='required_major', required=False, write_only=True)
    qualification_required = serializers.CharField(source='required_qualification', required=False, write_only=True)
    minimum_experience_years = serializers.DecimalField(source='required_exp', max_digits=4, decimal_places=1, required=False, write_only=True)
    closing_date = serializers.DateField(source='deadline', required=False, allow_null=True, write_only=True)

    class Meta:
        from jobs.models import Job
        model = Job
        fields = (
            'id', 'company', 'company_id', 'company_name', 'company_verified',
            'title', 'description', 'requirements', 'required_major',
            'required_exp', 'required_qualification', 'specialization_required',
            'qualification_required', 'minimum_experience_years',
            'skills_weight', 'specialization_weight', 'experience_weight',
            'qualification_weight', 'minimum_match_score', 'status',
            'created_at', 'closing_date', 'deadline',
            'applications_count', 'applicants_count'
        )
        read_only_fields = ('company', 'created_at')

    def get_company_verified(self, obj):
        return bool(obj.company and obj.company.verification_status == 'APPROVED')
