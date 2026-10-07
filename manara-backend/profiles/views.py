from rest_framework import generics, permissions, status
from rest_framework.response import Response
from accounts.permissions import IsGraduate
from .models import GraduateProfile
from .serializers import GraduateProfileSerializer


class GraduateProfileView(generics.RetrieveUpdateAPIView):
    """
    استرجاع وتحديث الملف المهني الأساسي للخريج (Sprint 1 - US-01 / MNRA-16 / MNRA-21).
    محمي بـ IsAuthenticated و IsGraduate (MNRA-65, MNRA-73).
    """
    serializer_class = GraduateProfileSerializer
    permission_classes = [permissions.IsAuthenticated, IsGraduate]

    def get_object(self):
        first_name = self.request.user.name.split(' ')[0] if self.request.user.name else ''
        last_name = self.request.user.name.split(' ', 1)[1] if ' ' in self.request.user.name else ''
        profile, created = GraduateProfile.objects.get_or_create(
            user=self.request.user,
            defaults={
                'first_name': first_name,
                'last_name': last_name,
                'phone': self.request.user.phone or '',
            }
        )
        return profile

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', True)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response({
            "message": "تم حفظ وتحديث البيانات الأساسية بنجاح",
            "profile": serializer.data
        }, status=status.HTTP_200_OK)
