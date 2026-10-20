from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient
from accounts.models import User
from profiles.models import Company
from jobs.models import Job


class AdminPanelTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_user(
            email='admin@example.com',
            name='System Admin',
            role='ADMIN',
            password='password123'
        )
        self.company_user = User.objects.create_user(
            email='comp_admin_test@example.com',
            name='Test Company',
            role='COMPANY',
            password='password123'
        )
        self.company = Company.objects.create(
            user=self.company_user,
            company_name='Test Company',
            registration_number='REG-100',
            description='Test Company Description',
            verification_status='PENDING'
        )
        self.job = Job.objects.create(
            company=self.company,
            title='Web Developer',
            description='Django fullstack',
            requirements='Django, React',
            specialization_required='Computer Science',
            qualification_required='BACHELOR',
            status='OPEN',
            closing_date=timezone.now() + timezone.timedelta(days=15)
        )
        self.client.force_authenticate(user=self.admin)

    def test_company_verification(self):
        resp = self.client.patch(f'/api/admin-panel/companies/{self.company.id}/verify/', {
            'verification_status': 'APPROVED'
        })
        self.assertEqual(resp.status_code, 200)
        self.company.refresh_from_db()
        self.assertEqual(self.company.verification_status, 'APPROVED')
        self.assertEqual(self.company.verified_by, self.admin)

    def test_company_verification_incomplete_rejected(self):
        """اختبار منع اعتماد شركة غير مكتملة البيانات (UC-08)."""
        incomplete_user = User.objects.create_user(
            email='incomplete@example.com',
            name='Incomplete Comp',
            role='COMPANY',
            password='password123'
        )
        incomplete_comp = Company.objects.create(
            user=incomplete_user,
            company_name='Incomplete Inc',
            registration_number='',
            description='',
            verification_status='PENDING'
        )
        resp = self.client.patch(f'/api/admin-panel/companies/{incomplete_comp.id}/verify/', {
            'verification_status': 'APPROVED'
        })
        self.assertEqual(resp.status_code, 400)
        self.assertIn('لا يمكن اعتماد الشركة قبل اكتمال البيانات', resp.data['error'])

    def test_admin_jobs_list(self):
        resp = self.client.get('/api/admin-panel/jobs/')
        self.assertEqual(resp.status_code, 200)
        results = resp.data.get('results', resp.data)
        self.assertGreaterEqual(len(results), 1)
        self.assertEqual(results[0]['title'], 'Web Developer')

    def test_admin_job_close_and_delete(self):
        # إغلاق الوظيفة من قِبل الأدمن
        resp = self.client.patch(f'/api/admin-panel/jobs/{self.job.id}/', {
            'status': 'CLOSED'
        })
        self.assertEqual(resp.status_code, 200)
        self.job.refresh_from_db()
        self.assertEqual(self.job.status, 'CLOSED')

        # حذف الوظيفة
        del_resp = self.client.delete(f'/api/admin-panel/jobs/{self.job.id}/')
        self.assertEqual(del_resp.status_code, 204)
        self.assertFalse(Job.objects.filter(id=self.job.id).exists())

    def test_admin_dashboard_and_reports(self):
        dash_resp = self.client.get('/api/admin-panel/dashboard/')
        self.assertEqual(dash_resp.status_code, 200)
        self.assertIn('users', dash_resp.data)
        self.assertIn('jobs', dash_resp.data)

        rep_resp = self.client.get('/api/admin-panel/reports/?type=jobs')
        self.assertEqual(rep_resp.status_code, 200)
        self.assertEqual(rep_resp.data['type'], 'jobs')

    def test_admin_reports_csv_export(self):
        """اختبار تصدير التقارير كملف CSV (FR-21)."""
        resp = self.client.get('/api/admin-panel/reports/?type=jobs&format=csv')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp['Content-Type'], 'text/csv; charset=utf-8-sig')
        self.assertIn('attachment; filename="report_jobs.csv"', resp['Content-Disposition'])
        content = resp.content.decode('utf-8-sig')
        self.assertIn('Job Title', content)
        self.assertIn('Web Developer', content)

        # فحص المعامل export=csv أيضاً
        resp2 = self.client.get('/api/admin-panel/reports/?type=jobs&export=csv')
        self.assertEqual(resp2.status_code, 200)
        self.assertEqual(resp2['Content-Type'], 'text/csv; charset=utf-8-sig')

