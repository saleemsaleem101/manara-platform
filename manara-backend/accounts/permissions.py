"""
صلاحيات الأدوار لمنصة منارة (يحقق NFR-02 ومخطط حالات الاستخدام).
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


class IsCompany(permissions.BasePermission):
    """يسمح فقط للمستخدم صاحب دور شركة (COMPANY)."""
    message = 'هذه العملية متاحة لحسابات الشركات فقط.'

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and getattr(request.user, 'role', '') == 'COMPANY'
        )


class IsAdminRole(permissions.BasePermission):
    """يسمح فقط لمدير النظام (ADMIN)."""
    message = 'هذه العملية متاحة لمدير النظام فقط.'

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and getattr(request.user, 'role', '') == 'ADMIN'
        )


class IsVerifiedCompany(permissions.BasePermission):
    """
    شركة معتمدة من الإدارة فقط (FR-23).
    يمنع الشركات غير المعتمدة من نشر الوظائف.
    """
    message = 'لا يمكن نشر الوظائف قبل اعتماد حساب الشركة من إدارة المنصة.'

    def has_permission(self, request, view):
        user = request.user
        if not (user and user.is_authenticated and getattr(user, 'role', '') == 'COMPANY'):
            return False
        company = getattr(user, 'company_profile', None)
        return company is not None and company.verification_status == 'APPROVED'


class IsJobOwner(permissions.BasePermission):
    """
    صاحب الوظيفة فقط يعدّلها أو يحذفها.
    يمنع شركة من التعديل على وظائف شركة أخرى.
    """
    message = 'لا تملك صلاحية التعديل على هذه الوظيفة.'

    def has_object_permission(self, request, view, obj):
        # القراءة مسموحة للجميع المسجّلين
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.company.user_id == request.user.id


class IsApplicationJobOwner(permissions.BasePermission):
    """الشركة صاحبة الوظيفة فقط تغيّر حالة الطلب (FR-14)."""
    message = 'لا تملك صلاحية تعديل حالة هذا الطلب.'

    def has_object_permission(self, request, view, obj):
        return obj.job.company.user_id == request.user.id

