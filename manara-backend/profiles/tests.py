from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework.authtoken.models import Token
from accounts.models import User
from profiles.models import GraduateProfile, Skill, GraduateSkill, Project


class ProfilesSprint1TestCase(TestCase):
    """
    اختبارات وحدة متكاملة لـ Sprint 1 - الملف المهني الأساسي للخريج (MNRA-16, MNRA-21).
    مهام: MNRA-63, MNRA-64, MNRA-65, MNRA-67, MNRA-68, MNRA-71, MNRA-73, MNRA-74.
    """
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='grad_prof@manara.edu.ye',
            name='جلال عبد الملك الصوفي',
            phone='+967 770 000 000',
            role='GRADUATE',
            password='SecurePassword@2026',
            email_verified=True
        )
        self.token, _ = Token.objects.get_or_create(user=self.user)
        self.profile, _ = GraduateProfile.objects.get_or_create(
            user=self.user,
            defaults={
                'first_name': 'جلال',
                'last_name': 'عبد الملك الصوفي',
                'phone': '+967 770 000 000',
                'city': 'اليمن - صنعاء',
                'university': 'جامعة العلوم والتكنولوجيا',
                'specialization': 'هندسة البرمجيات',
                'graduation_year': 2026,
                'gpa': '92% (ممتاز مع مرتبة الشرف)',
                'years_of_experience': 'حديث التخرج (0 - 1 سنة)',
                'bio': 'مهندس برمجيات متخصص في بناء وتطوير تطبيقات الويب الحديثة.',
            }
        )

    def test_unauthenticated_access_denied(self):
        """MNRA-54, MNRA-60: منع الوصول دون توكن صالح (401)."""
        response = self.client.get('/api/profiles/graduate/me/')
        self.assertEqual(response.status_code, 401)

    def test_get_graduate_profile_success(self):
        """MNRA-64, MNRA-71, MNRA-74: استرجاع البيانات الأساسية للخريج بنجاح."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')
        response = self.client.get('/api/profiles/graduate/me/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['email'], self.user.email)
        self.assertEqual(response.data['university'], 'جامعة العلوم والتكنولوجيا')
        self.assertEqual(response.data['specialization'], 'هندسة البرمجيات')
        self.assertEqual(response.data['graduation_year'], 2026)

    def test_update_graduate_profile_success(self):
        """MNRA-64, MNRA-67, MNRA-68: تعديل واستكمال البيانات الأساسية للخريج."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')
        update_payload = {
            'city': 'اليمن - عدن',
            'gpa': '95% (امتياز مع مرتبة الشرف الأولى)',
            'bio': 'نبذة تعريفية محدثة لاختبار سبرنت 1.',
        }
        response = self.client.put('/api/profiles/graduate/me/', update_payload)
        self.assertEqual(response.status_code, 200)
        self.profile.refresh_from_db()
        self.assertEqual(self.profile.city, 'اليمن - عدن')
        self.assertEqual(self.profile.gpa, '95% (امتياز مع مرتبة الشرف الأولى)')
        self.assertEqual(self.profile.bio, 'نبذة تعريفية محدثة لاختبار سبرنت 1.')


class ProfilePortfolioSkillsTestCase(TestCase):
    """
    اختبارات وحدة متكاملة لـ Screen 07 - محفظة المهارات والمشاريع والفيديو التعريفي (FR-06, FR-07, FR-08, FR-09).
    """
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='portfolio_test@manara.edu.ye',
            name='جلال الصوفي',
            role='GRADUATE',
            password='SecurePassword@2026',
            email_verified=True
        )
        self.token, _ = Token.objects.get_or_create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')
        self.skill_react = Skill.objects.create(name='React.js', category='TECHNICAL')
        self.skill_team = Skill.objects.create(name='العمل الجماعي', category='SOFT')

    def test_list_skills(self):
        """عرض المهارات المعتمدة (AllowAny)."""
        response = self.client.get('/api/profiles/skills/')
        self.assertEqual(response.status_code, 200)
        items = response.data.get('results', response.data) if isinstance(response.data, dict) else response.data
        self.assertGreaterEqual(len(items), 2)

    def test_add_and_list_graduate_skills(self):
        """إضافة مهارة لملف الخريج واستعراضها."""
        payload = {
            'skill': self.skill_react.id,
            'proficiency_level': 'ADVANCED'
        }
        res_add = self.client.post('/api/profiles/graduate/skills/', payload)
        self.assertEqual(res_add.status_code, 201)
        self.assertEqual(res_add.data['skill_name'], 'React.js')
        self.assertEqual(res_add.data['proficiency_level'], 'ADVANCED')

        # List
        res_list = self.client.get('/api/profiles/graduate/skills/')
        self.assertEqual(res_list.status_code, 200)
        items = res_list.data.get('results', res_list.data)
        self.assertEqual(len(items), 1)

    def test_create_and_list_projects(self):
        """إضافة مشروع برمجي إلى محفظة الخريج."""
        payload = {
            'title': 'منصة منارة الموحدة',
            'description': 'بوابة ذكية لربط الخريجين بسوق العمل اليمني.',
            'technologies': 'React.js, TypeScript, Django, PostgreSQL',
            'project_url': 'https://manarah.ye',
            'github_url': 'https://github.com/manarah/platform',
            'is_graduation_project': True
        }
        res_create = self.client.post('/api/profiles/graduate/projects/', payload)
        self.assertEqual(res_create.status_code, 201)
        self.assertEqual(res_create.data['title'], 'منصة منارة الموحدة')
        self.assertTrue(res_create.data['is_graduation_project'])

        # List
        res_list = self.client.get('/api/profiles/graduate/projects/')
        self.assertEqual(res_list.status_code, 200)
        items = res_list.data.get('results', res_list.data)
        self.assertEqual(len(items), 1)

    def test_video_cv_settings(self):
        """تحديث بيانات الفيديو التعريفي ومستوى الرؤية."""
        payload = {
            'video_cv_url': '/api/profiles/graduate/video/stream/1',
            'video_duration_seconds': 120,
            'video_visibility': 'COMPANIES_ONLY'
        }
        res = self.client.patch('/api/profiles/graduate/video/', payload)
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data['video_duration_seconds'], 120)
        self.assertEqual(res.data['video_visibility'], 'COMPANIES_ONLY')
        self.assertFalse(res.data['video_verified'])


class CompanyProfileTestCase(TestCase):
    """
    اختبارات وحدة متكاملة لـ Screen 08 - حسابات جهات العمل والاعتماد التجاري (FR-23 / NFR-02).
    """
    def setUp(self):
        self.client = APIClient()
        from profiles.models import Company

        # 1. مستخدم دور شركة
        self.company_user = User.objects.create_user(
            email='company@yementechnology.ye',
            name='شركة يمن تيك للحلول الرقمية',
            phone='+967 1 456789',
            role='COMPANY',
            password='SecurePassword@2026',
            email_verified=True
        )
        self.company_token, _ = Token.objects.get_or_create(user=self.company_user)
        self.company = Company.objects.create(
            user=self.company_user,
            company_name='شركة يمن تيك للحلول الرقمية',
            commercial_reg='CR-2026-984210',
            industry='تكنولوجيا المعلومات والبرمجيات',
            location='اليمن - صنعاء (حدة)',
            verification_status='PENDING'
        )

        # 2. مستخدم دور خريج للتحقق من أمن الصلاحيات (NFR-02)
        self.graduate_user = User.objects.create_user(
            email='grad@manara.edu.ye',
            name='خريج عادي',
            role='GRADUATE',
            password='SecurePassword@2026',
            email_verified=True
        )
        self.graduate_token, _ = Token.objects.get_or_create(user=self.graduate_user)

    def test_graduate_cannot_access_company_endpoints(self):
        """NFR-02: منع الخريج من الوصول أو التعديل على مسارات الشركات (403 Forbidden)."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.graduate_token.key}')
        res = self.client.get('/api/profiles/company/me/')
        self.assertEqual(res.status_code, 403)

    def test_company_retrieve_and_update_profile(self):
        """Screen 08 / FR-23: استرجاع وتحديث بيانات المنشأة بنجاح."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.company_token.key}')
        
        # استرجاع
        res = self.client.get('/api/profiles/company/me/')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data['company_name'], 'شركة يمن تيك للحلول الرقمية')
        self.assertEqual(res.data['commercial_reg'], 'CR-2026-984210')

        # تحديث
        update_res = self.client.put('/api/profiles/company/me/', {
            'company_name': 'شركة يمن تيك المحدودة',
            'website': 'https://yementechnology.ye',
            'description': 'شركة برمجية متخصصة في الأنظمة السحابية والذكاء الاصطناعي.',
            'company_size': '50 - 100 موظف'
        })
        self.assertEqual(update_res.status_code, 200)
        self.company.refresh_from_db()
        self.assertEqual(self.company.company_name, 'شركة يمن تيك المحدودة')
        self.assertEqual(self.company.website, 'https://yementechnology.ye')

    def test_company_submit_verification(self):
        """Screen 08 / FR-23: تقديم طلب توثيق السجل التجاري للاعتماد."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.company_token.key}')
        payload = {
            'commercial_reg': 'CR-2026-999999',
            'cr_document_url': 'https://docs.manarah.ye/cr_yementech_2026.pdf'
        }
        res = self.client.post('/api/profiles/company/submit-verification/', payload)
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data['verification_status'], 'PENDING')
        self.company.refresh_from_db()
        self.assertEqual(self.company.commercial_reg, 'CR-2026-999999')
        self.assertEqual(self.company.cr_document_url, 'https://docs.manarah.ye/cr_yementech_2026.pdf')

    def test_company_upload_cr_document(self):
        """Screen 08: رفع وتوثيق مستند السجل التجاري."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.company_token.key}')
        res = self.client.post('/api/profiles/company/upload-cr/', {
            'cr_document_url': 'https://storage.manarah.ye/cr_docs/scan_10mb.pdf'
        })
        self.assertEqual(res.status_code, 200)
        self.company.refresh_from_db()
        self.assertEqual(self.company.cr_document_url, 'https://storage.manarah.ye/cr_docs/scan_10mb.pdf')

    def test_company_upload_cr_document_rejects_empty_data(self):
        """FR-23: رفض رفع السجل التجاري في حال عدم تقديم ملف أو رابط صريح (منع الروابط الوهمية)."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.company_token.key}')
        res = self.client.post('/api/profiles/company/upload-cr/', {})
        self.assertEqual(res.status_code, 400)
        self.assertIn('error', res.data)

    def test_strict_file_validation_magic_bytes_fr27(self):
        """FR-27: فحص صارم للتوقيع الرقمي للملفات ورفض التجاوزات حتى للملفات الصغيرة."""
        import io
        from profiles.validators import validate_file, ALLOWED_VIDEO_TYPES, ALLOWED_IMAGE_TYPES, ALLOWED_DOCUMENT_TYPES

        # 1. ملف نصي صغير متنكر كفيديو (50 بايت) -> يجب أن يُرفض
        fake_video = io.BytesIO(b"This is just some arbitrary plain text content here!")
        setattr(fake_video, 'size', len(fake_video.getvalue()))
        setattr(fake_video, 'content_type', 'video/mp4')
        is_valid, err = validate_file(fake_video, allowed_content_types=ALLOWED_VIDEO_TYPES)
        self.assertFalse(is_valid)
        self.assertIn("لا يطابق صيغة فيديو صالحة", err)

        # 2. ملف MP4 حقيقي برأس ftyp -> يجب أن يُقبل
        real_mp4 = io.BytesIO(b"\x00\x00\x00\x18ftypmp42\x00\x00\x00\x00isommp42")
        setattr(real_mp4, 'size', len(real_mp4.getvalue()))
        setattr(real_mp4, 'content_type', 'video/mp4')
        is_valid, err = validate_file(real_mp4, allowed_content_types=ALLOWED_VIDEO_TYPES)
        self.assertTrue(is_valid)
        self.assertIsNone(err)

        # 3. ملف نصي متنكر كصورة PNG (30 بايت) -> يجب أن يُرفض
        fake_png = io.BytesIO(b"Fake image without PNG header")
        setattr(fake_png, 'size', len(fake_png.getvalue()))
        setattr(fake_png, 'content_type', 'image/png')
        is_valid, err = validate_file(fake_png, allowed_content_types=ALLOWED_IMAGE_TYPES)
        self.assertFalse(is_valid)
        self.assertIn("لا يطابق صيغة صورة صالحة", err)

        # 4. صورة PNG حقيقية -> يجب أن تُقبل
        real_png = io.BytesIO(b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01")
        setattr(real_png, 'size', len(real_png.getvalue()))
        setattr(real_png, 'content_type', 'image/png')
        is_valid, err = validate_file(real_png, allowed_content_types=ALLOWED_IMAGE_TYPES)
        self.assertTrue(is_valid)
        self.assertIsNone(err)

        # 5. ملف مستند PDF حقيقي -> يجب أن يُقبل
        real_pdf = io.BytesIO(b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n")
        setattr(real_pdf, 'size', len(real_pdf.getvalue()))
        setattr(real_pdf, 'content_type', 'application/pdf')
        is_valid, err = validate_file(real_pdf, allowed_content_types=ALLOWED_DOCUMENT_TYPES)
        self.assertTrue(is_valid)
        self.assertIsNone(err)

        # 6. ملف نصي متنكر كـ PDF -> يجب أن يُرفض
        fake_pdf = io.BytesIO(b"Hello world, I am not a PDF")
        setattr(fake_pdf, 'size', len(fake_pdf.getvalue()))
        setattr(fake_pdf, 'content_type', 'application/pdf')
        is_valid, err = validate_file(fake_pdf, allowed_content_types=ALLOWED_DOCUMENT_TYPES)
        self.assertFalse(is_valid)
        self.assertIn("لا يطابق صيغة مستند صالح", err)


