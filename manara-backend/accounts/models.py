from typing import Optional, Any
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.db import models


class UserManager(BaseUserManager):
    def create_user(self, email: str, name: str, role: str = 'GRADUATE', password: Optional[str] = None, phone: str = '', **extra_fields: Any) -> 'User':
        if not email:
            raise ValueError('يجب توفير البريد الإلكتروني')
        email = self.normalize_email(email)
        user = self.model(email=email, name=name, role=role, phone=phone, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, email: str, name: str, password: Optional[str] = None, **extra_fields: Any) -> 'User':
        extra_fields.setdefault('role', 'ADMIN')
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('email_verified', True)
        return self.create_user(email=email, name=name, password=password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """
    نموذج المستخدم الموحد في المنصة (USERS في مخطط ERD).
    مخصص لسبرنت 1 لإنشاء الحسابات، تسجيل الدخول، والمصادقة.
    مهام: MNRA-45 (عبدالرزاق), MNRA-46, MNRA-51, MNRA-54, MNRA-57 (سليم).
    """
    class Meta:
        verbose_name = 'مستخدم'
        verbose_name_plural = 'المستخدمون'
        db_table = 'users'

    ROLE_CHOICES = (
        ('GRADUATE', 'خريج'),
        ('COMPANY', 'شركة'),
        ('ADMIN', 'مدير النظام'),
    )
    name = models.CharField(max_length=255, verbose_name='الاسم الكامل')
    email = models.EmailField(unique=True, verbose_name='البريد الإلكتروني')
    phone = models.CharField(max_length=20, blank=True, default='', verbose_name='رقم الهاتف')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='GRADUATE', verbose_name='نوع الحساب')
    email_verified = models.BooleanField(default=False, verbose_name='تم تأكيد البريد')
    is_active = models.BooleanField(default=True, verbose_name='نشط')
    is_staff = models.BooleanField(default=False, verbose_name='طاقم العمل')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='تاريخ الإنشاء')

    objects: UserManager = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']

    @property
    def user_type(self) -> str:
        return str(self.role)

    def get_verification_code(self) -> str:
        """
        توليد رمز التحقق الأكاديمي الرقمي (OTP) الخاص بالمستخدم (FR-26).
        مشتق بخوارزمية تشفير لضمان الموثوقية والأمان ومنع قبول رموز عشوائية.
        """
        import hashlib
        digest = hashlib.sha256(f"{self.email}_{self.id}_manarah_otp_salt".encode()).hexdigest()
        return f"{int(digest[:8], 16) % 900000 + 100000:06d}"

    def verify_email(self) -> None:
        self.email_verified = True
        self.save(update_fields=['email_verified'])

    @classmethod
    def register(cls, email, name, role='GRADUATE', password=None, phone=None):
        """دالة تسجيل المستخدم (+ register في مخطط الأصناف UML الشكل 3-4)."""
        user = cls.objects.create_user(
            email=email,
            name=name,
            role=role,
            password=password,
            phone=phone or ''
        )
        return user

    def __str__(self) -> str:
        return f"{self.name} ({self.email}) - {self.get_role_display()}"
