from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework.authtoken.models import Token
from accounts.models import User
from profiles.models import GraduateProfile


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
