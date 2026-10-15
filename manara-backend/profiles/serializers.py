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
            data['full_name'] = str(name_val).strip()
        return super().to_internal_value(data)

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
