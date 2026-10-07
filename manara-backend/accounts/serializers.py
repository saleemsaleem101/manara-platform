from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from django.contrib.auth.password_validation import validate_password as django_validate_password
from .models import User
from profiles.models import GraduateProfile


class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    سيريالايزر إنشاء حساب الخريج (Sprint 1 - US-01 / MNRA-12 / MNRA-46).
    يقبل حسابات الخريجين فقط (GRADUATE).
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

    class Meta:
        model = User
        fields = ('id', 'name', 'email', 'phone', 'role', 'password')

    def validate_role(self, value):
        if value != 'GRADUATE':
            raise serializers.ValidationError('التسجيل متاح لحسابات الخريجين فقط في سبرنت 1.')
        return value

    def validate_password(self, value):
        django_validate_password(value)
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            name=validated_data['name'],
            role='GRADUATE',
            password=validated_data['password'],
            phone=validated_data.get('phone', '')
        )
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
        return user


class UserSerializer(serializers.ModelSerializer):
    """
    سيريالايزر استعراض بيانات المستخدم (Sprint 1).
    """
    class Meta:
        model = User
        fields = ('id', 'name', 'email', 'phone', 'role', 'is_active', 'email_verified', 'created_at')
        read_only_fields = ('role', 'is_active', 'email_verified', 'created_at')
