from rest_framework import serializers
from .models import GraduateProfile


class GraduateProfileSerializer(serializers.ModelSerializer):
    """
    سيريالايزر استرجاع وتحديث الملف المهني الأساسي للخريج (Sprint 1).
    مطابق للواجهات 4 و 5.
    مهام: MNRA-64 (سليم), MNRA-67 (عبدالرحمن).
    """
    email = serializers.ReadOnlyField(source='user.email')
    email_verified = serializers.ReadOnlyField(source='user.email_verified')
    user_name = serializers.ReadOnlyField(source='user.name')
    full_name = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = GraduateProfile
        fields = [
            'id',
            'email',
            'email_verified',
            'user_name',
            'full_name',
            'first_name',
            'last_name',
            'phone',
            'city',
            'university',
            'specialization',
            'graduation_year',
            'gpa',
            'years_of_experience',
            'bio',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'email', 'email_verified', 'created_at', 'updated_at']

    def update(self, instance, validated_data):
        full_name = validated_data.pop('full_name', None)
        if full_name:
            instance.user.name = full_name
            instance.user.save(update_fields=['name'])
            parts = full_name.split(' ', 1)
            instance.first_name = parts[0]
            instance.last_name = parts[1] if len(parts) > 1 else ''

        phone = validated_data.get('phone')
        if phone:
            instance.user.phone = phone
            instance.user.save(update_fields=['phone'])

        return super().update(instance, validated_data)
