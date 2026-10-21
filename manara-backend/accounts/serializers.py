from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from django.contrib.auth.password_validation import validate_password as django_validate_password
from django.db import transaction
from .models import User
from profiles.models import GraduateProfile, Company


class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    سيريالايزر إنشاء الحسابات (الخريجين والشركات - US-01 / MNRA-12 / Screen 08).
    """
    email = serializers.EmailField(
        validators=[
            UniqueValidator(
                queryset=User.objects.all(),
                message='هذا الحساب مسجل بالفعل.'
            )
        ]
    )
    password = serializers.CharField(write_only=True)
    phone = serializers.CharField(required=False, allow_blank=True, default='')

    # حقول إضافية لتسجيل حساب المنشأة / الشركة (Screen 08)
    company_name = serializers.CharField(required=False, allow_blank=True, default='', write_only=True)
    commercial_reg = serializers.CharField(required=False, allow_blank=True, default='', write_only=True)
    industry = serializers.CharField(required=False, allow_blank=True, default='', write_only=True)
    location = serializers.CharField(required=False, allow_blank=True, default='', write_only=True)
    description = serializers.CharField(required=False, allow_blank=True, default='', write_only=True)
    cr_document_url = serializers.URLField(required=False, allow_null=True, allow_blank=True, default=None, write_only=True)

    class Meta:
        model = User
        fields = (
            'id', 'name', 'email', 'phone', 'role', 'password',
            'company_name', 'commercial_reg', 'industry', 'location',
            'description', 'cr_document_url'
        )

    def validate_role(self, value):
        if value not in ['GRADUATE', 'COMPANY']:
            raise serializers.ValidationError('التسجيل متاح لحسابات الخريجين والشركات فقط.')
        return value

    def validate_password(self, value):
        django_validate_password(value)
        return value

    def validate(self, attrs):
        role = attrs.get('role', 'GRADUATE')
        name = attrs.get('name', '').strip()
        if role == 'GRADUATE' and name:
            parts = [p for p in name.split() if p]
            if len(parts) < 4:
                raise serializers.ValidationError({'name': 'يجب إدخال الاسم الرباعي كاملاً.'})
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        company_name = validated_data.pop('company_name', '').strip()
        commercial_reg = validated_data.pop('commercial_reg', '').strip()
        industry = validated_data.pop('industry', '').strip()
        location = validated_data.pop('location', '').strip()
        description = validated_data.pop('description', '').strip()
        cr_document_url = validated_data.pop('cr_document_url', None)

        role = validated_data.get('role', 'GRADUATE')
        user = User.objects.create_user(
            email=validated_data['email'],
            name=validated_data['name'],
            role=role,
            password=validated_data['password'],
            phone=validated_data.get('phone', '')
        )

        if role == 'GRADUATE':
            # توليد الملف المهني الأساسي للخريج فورياً
            first_name = user.name.split(' ')[0] if user.name else ''
            last_name = user.name.split(' ', 1)[1] if ' ' in user.name else ''
            GraduateProfile.objects.get_or_create(
                user=user,
                defaults={
                    'first_name': first_name,
                    'last_name': last_name,
                    'phone': user.phone or '',
                }
            )
        elif role == 'COMPANY':
            # توليد ملف المنشأة والاعتماد التجاري للشركة فورياً (Screen 08)
            c_name = company_name or user.name
            Company.objects.get_or_create(
                user=user,
                defaults={
                    'company_name': c_name,
                    'commercial_reg': commercial_reg,
                    'industry': industry,
                    'location': location,
                    'description': description,
                    'cr_document_url': cr_document_url or '',
                    'verification_status': 'PENDING',
                }
            )

        return user


class UserSerializer(serializers.ModelSerializer):
    """
    سيريالايزر استعراض بيانات المستخدم (Sprint 1).
    """
    class Meta:
        model = User
        fields = ('id', 'name', 'email', 'phone', 'role', 'is_active', 'email_verified', 'created_at')
        read_only_fields = ('role', 'is_active', 'email_verified', 'created_at')
