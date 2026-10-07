"""
صلاحيات سبرنت 1 (الخريج فقط - MNRA-54, MNRA-65).
"""
from rest_framework import permissions


class IsGraduate(permissions.BasePermission):
    """يسمح فقط للمستخدم صاحب دور خريج (GRADUATE)."""
    message = 'هذه العملية متاحة للخريجين فقط.'

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and getattr(request.user, 'role', '') == 'GRADUATE'
        )
