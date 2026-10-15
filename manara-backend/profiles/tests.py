from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework.authtoken.models import Token
from accounts.models import User
from profiles.models import GraduateProfile


class ProfilesSprint1TestCase(TestCase):
    """
    حزمة اختبارات التحقق الشاملة لـ Sprint 1 - الملف المهني الأساسي للخريج (MNRA-16 / MNRA-21).
    مطابقة تماماً لحالات الاختبار المحددة في بطاقات Jira:
    - MNRA-68: TC-PROFILE-01 إلى TC-PROFILE-06 (إنشاء وتعديل البيانات الأساسية للخريج)
    - MNRA-74: TC-VIEW-01 إلى TC-VIEW-06 (عرض واسترجاع الملف المهني الأساسي للخريج)
    """

    def setUp(self):
        self.client = APIClient()

        # خريج رئيسي أول
        self.user1 = User.objects.create_user(
            email="graduate_user1@manara.edu.ye",
            name="سليم شايف سليمان",
            phone="+967 770 000 001",
            role="GRADUATE",
            password="SecurePassword@2026",
            email_verified=True,
        )
        self.token1, _ = Token.objects.get_or_create(user=self.user1)
        self.profile1, _ = GraduateProfile.objects.get_or_create(
            user=self.user1,
            defaults={
                "first_name": "سليم",
                "last_name": "سليمان",
                "phone": "+967 770 000 001",
                "city": "اليمن - صنعاء",
                "university": "جامعة العلوم والتكنولوجيا",
                "specialization": "هندسة البرمجيات",
                "graduation_year": 2026,
                "gpa": "94% (امتياز مع مرتبة الشرف الأولى)",
                "years_of_experience": "حديث التخرج (0 - 1 سنة)",
                "bio": "مهندس برمجيات متخصص في بناء وتطوير الأنظمة السحابية.",
            }
        )

        # خريج ثانٍ لاختبار العزل والصلاحيات
        self.user2 = User.objects.create_user(
            email="graduate_user2@manara.edu.ye",
            name="جلال عبد الملك الصوفي",
            phone="+967 770 000 002",
            role="GRADUATE",
            password="SecurePassword@2026",
            email_verified=True,
        )
        self.token2, _ = Token.objects.get_or_create(user=self.user2)

    # =========================================================================
    # MNRA-68: حالات اختبار إنشاء وتعديل البيانات الأساسية (TC-PROFILE-01 إلى TC-PROFILE-06)
    # =========================================================================

    def test_tc_profile_01_save_initial_profile_data(self):
        """TC-PROFILE-01: حفظ واستكمال البيانات الأساسية الصحيحة لأول مرة وتأكيد الاستجابة بنجاح."""
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.token1.key}")
        payload = {
            "city": "صنعاء",
            "university": "جامعة العلوم والتكنولوجيا",
            "specialization": "هندسة البرمجيات",
            "graduation_year": 2026,
            "gpa": "95%",
            "years_of_experience": "1 سنة",
            "bio": "نبذة تعريفية جديدة ومكتملة للخريج.",
        }
        response = self.client.put("/api/profiles/graduate/me/", payload)
        self.assertEqual(response.status_code, 200)
        self.assertIn("profile", response.data)
        self.assertEqual(response.data["profile"]["city"], "صنعاء")
        self.assertEqual(response.data["profile"]["graduation_year"], 2026)

    def test_tc_profile_02_partial_update_allowed(self):
        """TC-PROFILE-02: تعديل جزء من البيانات الأساسية (Partial Update / PATCH) دون التأثير على باقي الحقول."""
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.token1.key}")
        response = self.client.patch("/api/profiles/graduate/me/", {
            "city": "عدن",
        })
        self.assertEqual(response.status_code, 200)
        self.profile1.refresh_from_db()
        self.assertEqual(self.profile1.city, "عدن")
        # التأكد من بقاء الحقول الأخرى كما هي
        self.assertEqual(self.profile1.university, "جامعة العلوم والتكنولوجيا")

    def test_tc_profile_03_modify_saved_data(self):
        """TC-PROFILE-03: تعديل بيانات محفوظة سابقاً وإظهار البيانات الجديدة فورياً."""
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.token1.key}")
        new_bio = "تم تحديث النبذة المهنية للمنافسة في سوق العمل."
        response = self.client.put("/api/profiles/graduate/me/", {
            "bio": new_bio,
            "gpa": "96%",
        })
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["profile"]["bio"], new_bio)
        self.assertEqual(response.data["profile"]["gpa"], "96%")

    def test_tc_profile_04_data_persistence_across_sessions(self):
        """TC-PROFILE-04: التأكد من ثبات واسترجاع البيانات بعد إعادة تسجيل الدخول مرة أخرى."""
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.token1.key}")
        self.client.patch("/api/profiles/graduate/me/", {"phone": "+967 779 999 999"})

        # استرجاع في جلسة جديدة
        get_res = self.client.get("/api/profiles/graduate/me/")
        self.assertEqual(get_res.status_code, 200)
        self.assertEqual(get_res.data["phone"], "+967 779 999 999")

    def test_tc_profile_05_isolation_between_graduates(self):
        """TC-PROFILE-05: منع الخريج من تعديل أو المساس بملف خريج آخر وعزل كل حساب تماماً عبر request.user."""
        # دخول بالخريج الثاني ومحاولة التعديل
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.token2.key}")
        self.client.put("/api/profiles/graduate/me/", {
            "city": "حضرموت",
            "bio": "ملف الخريج الثاني فقط",
        })

        # التأكد أن ملف الخريج الأول لم يتغير نهائياً
        self.profile1.refresh_from_db()
        self.assertNotEqual(self.profile1.city, "حضرموت")
        self.assertNotEqual(self.profile1.bio, "ملف الخريج الثاني فقط")

    def test_tc_profile_06_input_validation(self):
        """TC-PROFILE-06: التحقق من صحة المدخلات الرقمية لسنة التخرج ومنع القيم غير المنطقية."""
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.token1.key}")
        # إرسال نص في حقل رقمي لسنة التخرج
        response = self.client.put("/api/profiles/graduate/me/", {
            "graduation_year": "invalid-year",
        })
        self.assertEqual(response.status_code, 400)

    # =========================================================================
    # MNRA-74: حالات اختبار عرض الملف المهني الأساسي (TC-VIEW-01 إلى TC-VIEW-06)
    # =========================================================================

    def test_tc_view_01_view_profile_success(self):
        """TC-VIEW-01: فتح الملف بعد حفظ البيانات وعرض جميع الحقول الأساسية المحفوظة بصورة صحيحة."""
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.token1.key}")
        response = self.client.get("/api/profiles/graduate/me/")
        self.assertEqual(response.status_code, 200)
        data = response.data
        self.assertEqual(data["email"], "graduate_user1@manara.edu.ye")
        self.assertEqual(data["university"], "جامعة العلوم والتكنولوجيا")
        self.assertEqual(data["specialization"], "هندسة البرمجيات")
        self.assertEqual(data["graduation_year"], 2026)
        self.assertTrue(data["email_verified"])

    def test_tc_view_02_view_after_edit_shows_new_data(self):
        """TC-VIEW-02: تعديل البيانات ثم استرجاع العرض والتأكد من مطابقة البيانات الجديدة."""
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.token1.key}")
        self.client.patch("/api/profiles/graduate/me/", {"city": "الحديدة"})
        view_res = self.client.get("/api/profiles/graduate/me/")
        self.assertEqual(view_res.status_code, 200)
        self.assertEqual(view_res.data["city"], "الحديدة")

    def test_tc_view_03_auto_profile_creation_for_new_user(self):
        """TC-VIEW-03: عند تسجيل مستخدم جديد وفتح ملفه، يتم استرجاع ملفه المهني التلقائي دون تعطل."""
        new_user = User.objects.create_user(
            email="auto_prof@manara.edu.ye",
            name="محمد عبد الله",
            role="GRADUATE",
            password="SecurePassword@2026",
            email_verified=True,
        )
        token, _ = Token.objects.get_or_create(user=new_user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {token.key}")

        response = self.client.get("/api/profiles/graduate/me/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["email"], "auto_prof@manara.edu.ye")
        self.assertEqual(response.data["first_name"], "محمد")

    def test_tc_view_04_unauthenticated_view_blocked(self):
        """TC-VIEW-04: محاولة فتح الملف دون تسجيل الدخول ومنع الوصول بـ 401 Unauthorized."""
        self.client.credentials()  # مسح التوكن
        response = self.client.get("/api/profiles/graduate/me/")
        self.assertEqual(response.status_code, 401)

    def test_tc_view_05_non_graduate_role_blocked(self):
        """TC-VIEW-05: منع المستخدمين من الأدوار غير المصرحة (كحسابات الشركات مستقبلاً) من استدعاء ملف الخريج."""
        company_user = User.objects.create_user(
            email="company_role@manara.edu.ye",
            name="شركة المستقبل",
            role="COMPANY",
            password="SecurePassword@2026",
            email_verified=True,
        )
        company_token, _ = Token.objects.get_or_create(user=company_user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {company_token.key}")

        response = self.client.get("/api/profiles/graduate/me/")
        self.assertEqual(response.status_code, 403)

    def test_tc_view_06_error_handling_graceful(self):
        """TC-VIEW-06: التأكد من معالجة الأخطاء بأمان وعدم حدوث انهيار في الخادم عند الطلبات غير الصحيحة."""
        self.client.credentials(HTTP_AUTHORIZATION="Token invalid_token_xyz")
        response = self.client.get("/api/profiles/graduate/me/")
        self.assertEqual(response.status_code, 401)
