from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework.authtoken.models import Token
from accounts.models import User
from profiles.models import GraduateProfile


class AccountsSprint1TestCase(TestCase):
    """
    حزمة اختبارات التحقق الشاملة لـ Sprint 1 - إدارة الحسابات والمصادقة (US-01 / MNRA-12 / MNRA-14 / MNRA-15).
    مطابقة تماماً لحالات الاختبار المحددة في بطاقات Jira:
    - MNRA-49: TC-01 إلى TC-06 (إنشاء حساب خريج)
    - MNRA-56: TC-LOGIN-01 إلى TC-LOGIN-06 (تسجيل الدخول)
    - MNRA-61: TC-LOGOUT-01 إلى TC-LOGOUT-04 (تسجيل الخروج وحماية الجلسة)
    """

    def setUp(self):
        self.client = APIClient()

    # =========================================================================
    # MNRA-49: حالات اختبار إنشاء حساب الخريج (TC-01 إلى TC-06)
    # =========================================================================

    def test_tc_01_graduate_registration_success(self):
        """TC-01: إنشاء حساب خريج جديد ببيانات صحيحة والتأكد من إنشاء الحساب والملف المهني وتوليد OTP."""
        payload = {
            "name": "سليم شايف سليمان",
            "email": "salim_test@manara.edu.ye",
            "phone": "+967 770 000 001",
            "role": "GRADUATE",
            "password": "SecurePassword@2026",
        }
        response = self.client.post("/api/auth/register/", payload)
        self.assertEqual(response.status_code, 201)
        self.assertIn("token", response.data)
        self.assertIn("otp_code", response.data)
        self.assertTrue(User.objects.filter(email=payload["email"]).exists())
        user = User.objects.get(email=payload["email"])
        self.assertEqual(user.role, "GRADUATE")
        self.assertFalse(user.email_verified)
        self.assertTrue(GraduateProfile.objects.filter(user=user).exists())

    def test_tc_02_invalid_email_format_rejected(self):
        """TC-02: إدخال بريد إلكتروني بصيغة غير صحيحة ورفض التسجيل."""
        payload = {
            "name": "مستخدم تجريبي",
            "email": "invalid-email-format",
            "role": "GRADUATE",
            "password": "SecurePassword@2026",
        }
        response = self.client.post("/api/auth/register/", payload)
        self.assertEqual(response.status_code, 400)
        self.assertIn("email", response.data)

    def test_tc_03_duplicate_email_rejected(self):
        """TC-03: استخدام بريد إلكتروني مسجل مسبقاً ومنع تكرار الحساب برسالة توضيحية."""
        User.objects.create_user(
            email="existing@manara.edu.ye",
            name="Existing User",
            role="GRADUATE",
            password="SecurePassword@2026",
        )
        payload = {
            "name": "Second User",
            "email": "existing@manara.edu.ye",
            "role": "GRADUATE",
            "password": "SecurePassword@2026",
        }
        response = self.client.post("/api/auth/register/", payload)
        self.assertEqual(response.status_code, 400)
        self.assertIn("email", response.data)

    def test_tc_04_weak_or_short_password_rejected(self):
        """TC-04: إدخال كلمة مرور ضعيفة أو قصيرة ومنع التسجيل وفق معايير الأمان."""
        payload = {
            "name": "مستخدم كلمة قصيرة",
            "email": "short_pass@manara.edu.ye",
            "role": "GRADUATE",
            "password": "123",  # قصيرة جداً
        }
        response = self.client.post("/api/auth/register/", payload)
        self.assertEqual(response.status_code, 400)
        self.assertIn("password", response.data)

    def test_tc_05_missing_required_fields_rejected(self):
        """TC-05: ترك حقل إلزامي فارغاً (كالاسم أو البريد) ومنع الإرسال مع تحديد الحقل."""
        payload = {
            "name": "",
            "email": "empty_name@manara.edu.ye",
            "role": "GRADUATE",
            "password": "SecurePassword@2026",
        }
        response = self.client.post("/api/auth/register/", payload)
        self.assertEqual(response.status_code, 400)
        self.assertIn("name", response.data)

    def test_tc_06_account_role_validation(self):
        """TC-06: التحقق من نوع الحساب وضمان تسجيله بصلاحية خريج فقط ورفض أي صلاحية خارج سبرنت 1."""
        payload = {
            "name": "شركة غير مصرحة",
            "email": "company_attempt@manara.edu.ye",
            "role": "COMPANY",
            "password": "SecurePassword@2026",
        }
        response = self.client.post("/api/auth/register/", payload)
        self.assertEqual(response.status_code, 400)
        self.assertIn("role", response.data)

    # =========================================================================
    # MNRA-56: حالات اختبار تسجيل الدخول (TC-LOGIN-01 إلى TC-LOGIN-06)
    # =========================================================================

    def test_tc_login_01_login_success(self):
        """TC-LOGIN-01: تسجيل الدخول ببيانات اعتماد صحيحة وحساب مؤكد البريد والحصول على التوكن."""
        user = User.objects.create_user(
            email="verified_user@manara.edu.ye",
            name="مستخدم موثق",
            role="GRADUATE",
            password="SecurePassword@2026",
        )
        user.verify_email()

        response = self.client.post("/api/auth/login/", {
            "email": "verified_user@manara.edu.ye",
            "password": "SecurePassword@2026",
        })
        self.assertEqual(response.status_code, 200)
        self.assertIn("token", response.data)
        self.assertEqual(response.data["user"]["email"], "verified_user@manara.edu.ye")

    def test_tc_login_02_unregistered_email_rejected(self):
        """TC-LOGIN-02: محاولة تسجيل الدخول ببريد غير مسجل إطلاقاً ورفض الطلب."""
        response = self.client.post("/api/auth/login/", {
            "email": "not_found@manara.edu.ye",
            "password": "SecurePassword@2026",
        })
        self.assertEqual(response.status_code, 401)
        self.assertIn("error", response.data)

    def test_tc_login_03_incorrect_password_rejected(self):
        """TC-LOGIN-03: إدخال كلمة مرور خاطئة لحساب مسجل ورفض الطلب."""
        user = User.objects.create_user(
            email="valid_user@manara.edu.ye",
            name="مستخدم صحيح",
            role="GRADUATE",
            password="CorrectPassword@2026",
        )
        user.verify_email()

        response = self.client.post("/api/auth/login/", {
            "email": "valid_user@manara.edu.ye",
            "password": "WrongPassword@2026",
        })
        self.assertEqual(response.status_code, 401)
        self.assertIn("error", response.data)

    def test_tc_login_04_empty_credentials_rejected(self):
        """TC-LOGIN-04: ترك أحد حقلي الدخول فارغاً ورفض الطلب بـ 400 Bad Request."""
        response = self.client.post("/api/auth/login/", {
            "email": "",
            "password": "",
        })
        self.assertEqual(response.status_code, 400)
        self.assertIn("error", response.data)

    def test_tc_login_05_unverified_email_requires_verification(self):
        """TC-LOGIN-05: محاولة تسجيل الدخول بحساب لم يؤكد بريده الإلكتروني ومنعه بـ 403 مع طلب التفعيل."""
        User.objects.create_user(
            email="unverified_login@manara.edu.ye",
            name="مستخدم غير مفعل",
            role="GRADUATE",
            password="SecurePassword@2026",
        )
        response = self.client.post("/api/auth/login/", {
            "email": "unverified_login@manara.edu.ye",
            "password": "SecurePassword@2026",
        })
        self.assertEqual(response.status_code, 403)
        self.assertFalse(response.data.get("email_verified", True))

    def test_tc_login_06_verify_email_otp_and_login(self):
        """TC-LOGIN-06: تفعيل الحساب برمز OTP الرقمي الصحيح ثم الدخول بنجاح."""
        user = User.objects.create_user(
            email="otp_target@manara.edu.ye",
            name="مستهدف التفعيل",
            role="GRADUATE",
            password="SecurePassword@2026",
        )
        otp = user.get_verification_code()
        verify_res = self.client.post("/api/auth/verify-email/", {
            "email": "otp_target@manara.edu.ye",
            "code": otp,
        })
        self.assertEqual(verify_res.status_code, 200)
        self.assertTrue(verify_res.data["email_verified"])

        # تسجيل الدخول بعد التفعيل
        login_res = self.client.post("/api/auth/login/", {
            "email": "otp_target@manara.edu.ye",
            "password": "SecurePassword@2026",
        })
        self.assertEqual(login_res.status_code, 200)

    # =========================================================================
    # MNRA-61: حالات اختبار تسجيل الخروج (TC-LOGOUT-01 إلى TC-LOGOUT-04)
    # =========================================================================

    def test_tc_logout_01_and_02_logout_revokes_token(self):
        """TC-LOGOUT-01 & 02: ضغط تسجيل الخروج يحذف التوكن ويمنع الوصول للصفحات المحمية."""
        user = User.objects.create_user(
            email="logout_test@manara.edu.ye",
            name="مستخدم خروج",
            role="GRADUATE",
            password="SecurePassword@2026",
        )
        user.verify_email()
        token, _ = Token.objects.get_or_create(user=user)

        self.client.credentials(HTTP_AUTHORIZATION=f"Token {token.key}")
        # تسجيل الخروج
        logout_res = self.client.post("/api/auth/logout/")
        self.assertEqual(logout_res.status_code, 200)
        self.assertFalse(Token.objects.filter(user=user).exists())

        # محاولة طلب صفحة محمية بالتوكن القديم
        protected_res = self.client.get("/api/profiles/graduate/me/")
        self.assertEqual(protected_res.status_code, 401)

    def test_tc_logout_03_and_04_logout_unauthenticated_safe(self):
        """TC-LOGOUT-03 & 04: محاولة استدعاء تسجيل الخروج بدون جلسة أو توكن صالح لا تعطل النظام وتطلب المصادقة."""
        self.client.credentials()  # مسح أي ترويسة
        res = self.client.post("/api/auth/logout/")
        self.assertEqual(res.status_code, 401)
