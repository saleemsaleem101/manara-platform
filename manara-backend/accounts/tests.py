from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework.authtoken.models import Token
from accounts.models import User
from profiles.models import GraduateProfile


class AccountsSprint1TestCase(TestCase):
    """
    اختبارات وحدة متكاملة لـ Sprint 1 - إدارة الحسابات والمصادقة (US-01).
    مهام: MNRA-46, MNRA-49, MNRA-51, MNRA-56, MNRA-57, MNRA-60, MNRA-61.
    """
    def setUp(self):
        self.client = APIClient()

    def test_graduate_registration_success(self):
        """MNRA-46, MNRA-48: اختبار إنشاء حساب خريج جديد بنجاح."""
        response = self.client.post('/api/auth/register/', {
            'name': 'جلال الصوفي',
            'email': 'jalal_test@manara.edu.ye',
            'phone': '+967 770 000 000',
            'role': 'GRADUATE',
            'password': 'SecurePassword@2026'
        })
        self.assertEqual(response.status_code, 201)
        self.assertIn('token', response.data)
        user = User.objects.get(email='jalal_test@manara.edu.ye')
        self.assertEqual(user.role, 'GRADUATE')
        self.assertFalse(user.email_verified)
        self.assertTrue(GraduateProfile.objects.filter(user=user).exists())

    def test_reject_company_registration_in_sprint1(self):
        """MNRA-49: رفض تسجيل الشركات في سبرنت 1 (مخصص للخريجين فقط)."""
        response = self.client.post('/api/auth/register/', {
            'name': 'شركة تجريبية',
            'email': 'company_test@manara.edu.ye',
            'role': 'COMPANY',
            'password': 'SecurePassword@2026'
        })
        self.assertEqual(response.status_code, 400)

    def test_reject_duplicate_email(self):
        """MNRA-49: منع تسجيل بريد مكرر."""
        User.objects.create_user(
            email='dup@manara.edu.ye',
            name='First User',
            role='GRADUATE',
            password='SecurePassword@2026'
        )
        response = self.client.post('/api/auth/register/', {
            'name': 'Second User',
            'email': 'dup@manara.edu.ye',
            'role': 'GRADUATE',
            'password': 'SecurePassword@2026'
        })
        self.assertEqual(response.status_code, 400)

    def test_login_unverified_email_rejected(self):
        """MNRA-51, MNRA-56 (US-01 / FR-26): رفض الدخول قبل تأكيد البريد بـ 403."""
        User.objects.create_user(
            email='unverified@manara.edu.ye',
            name='Unverified User',
            role='GRADUATE',
            password='SecurePassword@2026',
            email_verified=False
        )
        response = self.client.post('/api/auth/login/', {
            'email': 'unverified@manara.edu.ye',
            'password': 'SecurePassword@2026'
        })
        self.assertEqual(response.status_code, 403)
        self.assertFalse(response.data.get('email_verified'))

    def test_verify_email_and_login_success(self):
        """FR-26: اختبار تأكيد البريد بالرمز الرقمي وتسجيل الدخول بعد التفعيل."""
        user = User.objects.create_user(
            email='verify_test@manara.edu.ye',
            name='Verify User',
            role='GRADUATE',
            password='SecurePassword@2026',
            email_verified=False
        )
        # تأكيد البريد عبر الرمز المشتق للمستخدم
        expected_code = user.get_verification_code()
        verify_resp = self.client.post('/api/auth/verify-email/', {
            'email': 'verify_test@manara.edu.ye',
            'code': expected_code
        })
        self.assertEqual(verify_resp.status_code, 200)
        user.refresh_from_db()
        self.assertTrue(user.email_verified)

        # تسجيل الدخول بنجاح بعد التأكيد
        login_resp = self.client.post('/api/auth/login/', {
            'email': 'verify_test@manara.edu.ye',
            'password': 'SecurePassword@2026'
        })
        self.assertEqual(login_resp.status_code, 200)
        self.assertIn('token', login_resp.data)

    def test_verify_email_rejects_invalid_code(self):
        """FR-26 / NFR-01: رفض تأكيد البريد عند إدخال رمز خاطئ."""
        User.objects.create_user(
            email='wrong_code@manara.edu.ye',
            name='Wrong Code User',
            role='GRADUATE',
            password='SecurePassword@2026',
            email_verified=False
        )
        verify_resp = self.client.post('/api/auth/verify-email/', {
            'email': 'wrong_code@manara.edu.ye',
            'code': '000000'
        })
        self.assertEqual(verify_resp.status_code, 400)

    def test_logout_and_token_revocation(self):
        """MNRA-57, MNRA-60, MNRA-61: تسجيل الخروج وإبطال التوكن وحماية المسارات."""
        user = User.objects.create_user(
            email='logout_test@manara.edu.ye',
            name='Logout User',
            role='GRADUATE',
            password='SecurePassword@2026',
            email_verified=True
        )
        token, _ = Token.objects.get_or_create(user=user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')

        # تسجيل الخروج
        logout_resp = self.client.post('/api/auth/logout/')
        self.assertEqual(logout_resp.status_code, 200)

        # التحقق من حذف التوكن
        self.assertFalse(Token.objects.filter(user=user).exists())
