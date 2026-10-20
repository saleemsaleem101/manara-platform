from django.test import TestCase
from django.utils import timezone
from accounts.models import User
from profiles.models import Company, GraduateProfile
from jobs.models import Job, Application
from jobs.serializers import JobSerializer
from notifications.models import Notification


class JobSerializerTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='company@example.com',
            name='Tech Corp',
            role='COMPANY',
            password='password123'
        )
        self.company = Company.objects.create(
            user=self.user,
            company_name='Tech Corp',
            registration_number='12345',
            description='Tech company',
            verification_status='APPROVED'
        )
        self.job = Job.objects.create(
            company=self.company,
            title='Python Developer',
            description='Backend developer needed',
            requirements='Django, Postgres',
            specialization_required='Computer Science',
            qualification_required='BACHELOR',
            minimum_experience_years=1.0,
            skills_weight=0.4,
            specialization_weight=0.3,
            experience_weight=0.15,
            qualification_weight=0.15,
            minimum_match_score=0.5,
            status='OPEN',
            closing_date=timezone.now() + timezone.timedelta(days=30)
        )

    def test_valid_weights(self):
        data = {
            'skills_weight': 0.25,
            'specialization_weight': 0.25,
            'experience_weight': 0.25,
            'qualification_weight': 0.25,
        }
        serializer = JobSerializer(instance=self.job, data=data, partial=True)
        self.assertTrue(serializer.is_valid(), serializer.errors)

    def test_invalid_negative_weight(self):
        data = {
            'skills_weight': -0.1,
            'specialization_weight': 0.5,
            'experience_weight': 0.3,
            'qualification_weight': 0.3,
        }
        serializer = JobSerializer(instance=self.job, data=data, partial=True)
        self.assertFalse(serializer.is_valid())
        self.assertIn('skills_weight', serializer.errors)

    def test_invalid_weight_greater_than_one(self):
        data = {
            'skills_weight': 1.2,
            'specialization_weight': -0.2,
            'experience_weight': 0.0,
            'qualification_weight': 0.0,
        }
        serializer = JobSerializer(instance=self.job, data=data, partial=True)
        self.assertFalse(serializer.is_valid())

    def test_invalid_weight_sum(self):
        data = {
            'skills_weight': 0.5,
            'specialization_weight': 0.5,
            'experience_weight': 0.5,
            'qualification_weight': 0.5,
        }
        serializer = JobSerializer(instance=self.job, data=data, partial=True)
        self.assertFalse(serializer.is_valid())
        self.assertIn('weights', serializer.errors)

    def test_status_update_allowed(self):
        data = {'status': 'CLOSED'}
        serializer = JobSerializer(instance=self.job, data=data, partial=True)
        self.assertTrue(serializer.is_valid(), serializer.errors)
        updated_job = serializer.save()
        self.assertEqual(updated_job.status, 'CLOSED')

    def test_invalid_status(self):
        data = {'status': 'INVALID_STATUS'}
        serializer = JobSerializer(instance=self.job, data=data, partial=True)
        self.assertFalse(serializer.is_valid())
        self.assertIn('status', serializer.errors)


class ApplicationThresholdTestCase(TestCase):
    def setUp(self):
        self.company_user = User.objects.create_user(
            email='company2@example.com',
            name='Innovate Corp',
            role='COMPANY',
            password='password123'
        )
        self.company = Company.objects.create(
            user=self.company_user,
            company_name='Innovate Corp',
            registration_number='98765',
            description='Software solutions',
            verification_status='APPROVED'
        )
        self.job = Job.objects.create(
            company=self.company,
            title='AI Engineer',
            description='AI Engineer needed',
            requirements='Python, Machine Learning',
            specialization_required='Artificial Intelligence',
            qualification_required='DOCTORATE',
            minimum_experience_years=5.0,
            skills_weight=0.4,
            specialization_weight=0.3,
            experience_weight=0.15,
            qualification_weight=0.15,
            minimum_match_score=0.8,  # حد أدنى مرتفع جداً
            status='OPEN',
            closing_date=timezone.now() + timezone.timedelta(days=30)
        )
        self.grad_user = User.objects.create_user(
            email='grad@example.com',
            name='Ali Ahmed',
            role='GRADUATE',
            password='password123'
        )
        self.grad_profile = GraduateProfile.objects.create(
            user=self.grad_user,
            specialization='History',  # غير مطابق
            qualification_level='DIPLOMA',  # 1 / 4
            years_of_experience=0.0
        )

    def test_below_threshold_application_submitted_for_company_decision(self):
        """اختبار تقديم طلب بمطابقة أقل من الحد الأدنى ووصوله للشركة للبت فيه (مخطط النشاط 3-2)."""
        from rest_framework.test import APIClient
        client = APIClient()
        client.force_authenticate(user=self.grad_user)

        response = client.post('/api/jobs/apply/', {'job': self.job.id})
        self.assertEqual(response.status_code, 201)

        app = Application.objects.get(job=self.job, profile=self.grad_profile)
        # حالة الطلب تظل SUBMITTED لتمكين الشركة من اتخاذ القرار
        self.assertEqual(app.status, 'SUBMITTED')

        # يجب أن يتم إشعار الشركة بالطلب ودرجة التوافق
        comp_notif = Notification.objects.filter(user=self.company_user, type='NEW_APPLICATION').first()
        self.assertIsNotNone(comp_notif)
        self.assertIn('أقل من الحد الأدنى', comp_notif.message)

    def test_above_threshold_application_notifies_both_company_and_graduate(self):
        """اختبار إشعار كل من الشركة والخريج عند نجاح التقديم (FR-22 ومخطط النشاط والتسلسل)."""
        # نعدّل ملف الخريج ليطابق متطلبات الوظيفة ويحقق الحد الأدنى
        self.grad_profile.specialization = 'Artificial Intelligence'
        self.grad_profile.qualification_level = 'DOCTORATE'
        self.grad_profile.years_of_experience = 5.0
        self.grad_profile.save()

        from rest_framework.test import APIClient
        client = APIClient()
        client.force_authenticate(user=self.grad_user)

        response = client.post('/api/jobs/apply/', {'job': self.job.id})
        self.assertEqual(response.status_code, 201)

        app = Application.objects.get(job=self.job, profile=self.grad_profile)
        self.assertEqual(app.status, 'SUBMITTED')

        # التحقق من وصول إشعار للشركة (FR-22)
        company_notif = Notification.objects.filter(user=self.company_user, type='NEW_APPLICATION').first()
        self.assertIsNotNone(company_notif)
        self.assertEqual(company_notif.related_application_id, app.id)

        # التحقق من وصول إشعار للخريج أيضاً (FR-22)
        grad_notif = Notification.objects.filter(user=self.grad_user, type='STATUS_UPDATE').first()
        self.assertIsNotNone(grad_notif)
        self.assertIn('تم تقديم طلبك بنجاح', grad_notif.title)
        self.assertEqual(grad_notif.related_application_id, app.id)


class JobSkillFeaturesTestCase(TestCase):
    def setUp(self):
        from rest_framework.test import APIClient
        from profiles.models import Skill
        self.client = APIClient()

        self.company_user = User.objects.create_user(
            email='jobskill_comp@example.com',
            name='Skill Tester Corp',
            role='COMPANY',
            password='password123'
        )
        self.company = Company.objects.create(
            user=self.company_user,
            company_name='Skill Tester Corp',
            verification_status='APPROVED'
        )
        self.job = Job.objects.create(
            company=self.company,
            title='Mobile Developer',
            description='Flutter developer',
            requirements='Flutter, Dart',
            specialization_required='Computer Science',
            qualification_required='BACHELOR',
            status='OPEN',
            closing_date=timezone.now() + timezone.timedelta(days=20)
        )
        self.skill_flutter = Skill.objects.create(name='Flutter', category='TECHNICAL')
        self.skill_dart = Skill.objects.create(name='Dart', category='TECHNICAL')

    def test_add_skill_to_job_via_endpoint(self):
        self.client.force_authenticate(user=self.company_user)
        resp = self.client.post(f'/api/jobs/{self.job.id}/skills/', {
            'skill': self.skill_flutter.id,
            'required_level': 'ADVANCED',
            'weight': 1.5
        })
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(self.job.required_skills.count(), 1)
        js = self.job.required_skills.first()
        self.assertEqual(js.skill, self.skill_flutter)
        self.assertEqual(js.weight, 1.5)

    def test_nested_skills_creation_in_job_serializer(self):
        data = {
            'title': 'Frontend Engineer',
            'description': 'React engineer',
            'requirements': 'React',
            'specialization_required': 'Software Engineering',
            'qualification_required': 'BACHELOR',
            'closing_date': timezone.now() + timezone.timedelta(days=10),
            'skills': [
                {'skill': self.skill_flutter.id, 'required_level': 'INTERMEDIATE', 'weight': 1.0},
                {'skill': self.skill_dart.id, 'required_level': 'EXPERT', 'weight': 2.0}
            ]
        }
        serializer = JobSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)
        job = serializer.save(company=self.company)
        self.assertEqual(job.required_skills.count(), 2)


class ApplicationWithdrawModelTestCase(TestCase):
    """اختبار دالة withdraw() في صنف Application (FR-13 + Class Diagram)."""

    def setUp(self):
        self.company_user = User.objects.create_user(
            email='wd_comp@example.com', name='WD Corp',
            role='COMPANY', password='StrongPass123!'
        )
        self.company = Company.objects.create(
            user=self.company_user, company_name='WD Corp',
            verification_status='APPROVED'
        )
        self.grad_user = User.objects.create_user(
            email='wd_grad@example.com', name='WD Grad',
            role='GRADUATE', password='StrongPass123!'
        )
        self.profile = GraduateProfile.objects.create(user=self.grad_user)
        self.job = Job.objects.create(
            company=self.company, title='Test Job', description='d',
            requirements='r', specialization_required='CS',
            qualification_required='BACHELOR', status='OPEN',
            closing_date=timezone.now() + timezone.timedelta(days=30)
        )

    def test_withdraw_changes_status(self):
        app = Application.objects.create(job=self.job, profile=self.profile)
        app.withdraw()
        self.assertEqual(app.status, 'WITHDRAWN')

    def test_withdraw_already_withdrawn_raises(self):
        from django.core.exceptions import ValidationError
        app = Application.objects.create(job=self.job, profile=self.profile, status='WITHDRAWN')
        with self.assertRaises(ValidationError):
            app.withdraw()

    def test_withdraw_accepted_raises(self):
        from django.core.exceptions import ValidationError
        app = Application.objects.create(job=self.job, profile=self.profile, status='ACCEPTED')
        with self.assertRaises(ValidationError):
            app.withdraw()


class DraftJobLeakTestCase(TestCase):
    """وظيفة DRAFT لا تظهر لغير المالك عبر API."""

    def setUp(self):
        from rest_framework.test import APIClient
        self.client = APIClient()
        self.company_user = User.objects.create_user(
            email='draft_comp@example.com', name='Draft Corp',
            role='COMPANY', password='StrongPass123!'
        )
        self.company = Company.objects.create(
            user=self.company_user, company_name='Draft Corp',
            verification_status='APPROVED'
        )
        self.draft_job = Job.objects.create(
            company=self.company, title='Secret Draft', description='d',
            requirements='r', specialization_required='CS',
            qualification_required='BACHELOR', status='DRAFT',
            closing_date=timezone.now() + timezone.timedelta(days=30)
        )
        self.grad_user = User.objects.create_user(
            email='draft_grad@example.com', name='Grad',
            role='GRADUATE', password='StrongPass123!'
        )
        GraduateProfile.objects.create(user=self.grad_user)

    def test_graduate_cannot_see_draft_job(self):
        self.client.force_authenticate(user=self.grad_user)
        resp = self.client.get(f'/api/jobs/{self.draft_job.id}/')
        self.assertEqual(resp.status_code, 404)

    def test_owner_can_see_draft_job(self):
        self.client.force_authenticate(user=self.company_user)
        resp = self.client.get(f'/api/jobs/{self.draft_job.id}/')
        self.assertEqual(resp.status_code, 200)


class ModelWeightValidationTestCase(TestCase):
    """validators الأوزان على مستوى الموديل."""

    def test_job_clean_rejects_invalid_weight_sum(self):
        from django.core.exceptions import ValidationError
        company_user = User.objects.create_user(
            email='wv_comp@example.com', name='WV',
            role='COMPANY', password='StrongPass123!'
        )
        company = Company.objects.create(
            user=company_user, company_name='WV',
            verification_status='APPROVED'
        )
        job = Job(
            company=company, title='Bad Weights', description='d',
            requirements='r', specialization_required='CS',
            qualification_required='BACHELOR',
            skills_weight=0.5, specialization_weight=0.5,
            experience_weight=0.5, qualification_weight=0.5,
            closing_date=timezone.now() + timezone.timedelta(days=10)
        )
        with self.assertRaises(ValidationError):
            job.clean()

    def test_job_and_application_class_diagram_methods(self):
        """اختبار دوال الأصناف في مخطط UML (Class Diagram) لـ Job و Application."""
        company_user = User.objects.create_user(
            email='cd_comp@example.com', name='CD Comp',
            role='COMPANY', password='StrongPass123!'
        )
        company = Company.objects.create(
            user=company_user, company_name='CD Comp',
            verification_status='APPROVED'
        )
        job = Job.objects.create(
            company=company, title='DevOps Engineer', description='CI/CD',
            requirements='Linux', specialization_required='CS',
            qualification_required='BACHELOR',
            status='OPEN',
            closing_date=timezone.now() + timezone.timedelta(days=10)
        )

        # openJob / closeJob
        job.close_job()
        self.assertEqual(job.status, 'CLOSED')
        job.open_job()
        self.assertEqual(job.status, 'OPEN')

        # setMatchingWeights
        job.set_matching_weights(0.5, 0.2, 0.2, 0.1, min_score=0.6)
        self.assertEqual(job.skills_weight, 0.5)
        self.assertEqual(job.minimum_match_score, 0.6)

        # Application methods
        grad_user = User.objects.create_user(
            email='cd_grad@example.com', name='CD Grad',
            role='GRADUATE', password='StrongPass123!'
        )
        grad_profile = GraduateProfile.objects.create(user=grad_user)
        app = Application.objects.create(job=job, profile=grad_profile)
        app.update_status('UNDER_REVIEW')
        self.assertEqual(app.status, 'UNDER_REVIEW')


class JobsNewFeaturesTestCase(TestCase):
    """اختبار الميزات والضوابط الجديدة للوظائف والتقديمات."""

    def setUp(self):
        from rest_framework.test import APIClient
        from profiles.models import Major, Skill
        from jobs.models import JobSkill
        self.client = APIClient()

        self.company_user = User.objects.create_user(
            email='features_comp@example.com', name='Features Corp',
            role='COMPANY', password='password123'
        )
        self.company = Company.objects.create(
            user=self.company_user, company_name='Features Corp',
            verification_status='APPROVED'
        )

        self.grad_user = User.objects.create_user(
            email='features_grad@example.com', name='Features Grad',
            role='GRADUATE', password='password123'
        )
        self.grad_profile = GraduateProfile.objects.create(user=self.grad_user)

        self.major = Major.objects.create(major_name='Information Systems', college='IT')

        self.job1 = Job.objects.create(
            company=self.company,
            title='Backend Python Engineer',
            description='Backend role',
            requirements='Django',
            major=self.major,
            location='Sanaa',
            job_type='FULL_TIME',
            deadline=timezone.now().date() + timezone.timedelta(days=20),
            status='OPEN',
            closing_date=timezone.now() + timezone.timedelta(days=20),
            minimum_match_score=0.0
        )

        self.job2 = Job.objects.create(
            company=self.company,
            title='Remote Frontend Developer',
            description='Frontend role',
            requirements='React',
            location='Aden',
            job_type='REMOTE',
            status='OPEN',
            closing_date=timezone.now() + timezone.timedelta(days=20),
            minimum_match_score=0.0
        )

    def test_cannot_update_withdrawn_application(self):
        """التحقق من منع الشركة من تعديل حالة طلب مسحوب (FR-13 & FR-14)."""
        app = Application.objects.create(
            job=self.job1,
            profile=self.grad_profile,
            status='WITHDRAWN'
        )
        self.client.force_authenticate(user=self.company_user)
        resp = self.client.patch(f'/api/jobs/applications/{app.id}/status/', {
            'status': 'ACCEPTED'
        })
        self.assertEqual(resp.status_code, 400)
        self.assertIn('لا يمكن تعديل حالة طلب تم سحبه', resp.data['error'])

    def test_duplicate_application_returns_400(self):
        """التحقق من أن التقديم المكرر يعيد 400 وليس خطأ 500 في السيرفر."""
        self.client.force_authenticate(user=self.grad_user)
        # التقديم الأول
        resp1 = self.client.post('/api/jobs/apply/', {
            'job': self.job1.id
        })
        self.assertEqual(resp1.status_code, 201)

        # محاولة التقديم مرة أخرى
        resp2 = self.client.post('/api/jobs/apply/', {
            'job': self.job1.id
        })
        self.assertEqual(resp2.status_code, 400)
        self.assertIn('لقد قمت بالتقديم على هذه الوظيفة', str(resp2.data))



    def test_job_filtering_by_major_location_and_type(self):
        """التحقق من فلاتر الوظائف: التخصص، الموقع، ونوع الدوام."""
        self.client.force_authenticate(user=self.grad_user)

        # فلترة حسب التخصص
        resp_major = self.client.get(f'/api/jobs/?major_id={self.major.id}')
        self.assertEqual(resp_major.status_code, 200)
        results = resp_major.data.get('results', resp_major.data)
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['id'], self.job1.id)

        # فلترة حسب الموقع
        resp_loc = self.client.get('/api/jobs/?location=Aden')
        self.assertEqual(resp_loc.status_code, 200)
        results = resp_loc.data.get('results', resp_loc.data)
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['id'], self.job2.id)

        # فلترة حسب نوع الوظيفة
        resp_type = self.client.get('/api/jobs/?job_type=REMOTE')
        self.assertEqual(resp_type.status_code, 200)
        results = resp_type.data.get('results', resp_type.data)
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['id'], self.job2.id)

    def test_job_skill_is_required_field(self):
        """التحقق من حقل is_required في مهارات الوظيفة job_skills."""
        from profiles.models import Skill
        from jobs.models import JobSkill

        skill = Skill.objects.create(name='Django REST', category='TECHNICAL')
        job_skill = JobSkill.objects.create(
            job=self.job1,
            skill=skill,
            weight=1.5,
            is_required=True
        )
        self.assertTrue(job_skill.is_required)
        self.assertEqual(job_skill.weight, 1.5)

    def test_expired_jobs_excluded_from_listing(self):
        """استبعاد الوظائف التي انقضى موعدها (deadline أو closing_date) من القائمة العامة."""
        now = timezone.now()
        # وظيفة انتهى موعدها
        expired_job = Job.objects.create(
            company=self.company,
            title='Old Expired DevOps',
            description='Expired position',
            requirements='Linux',
            specialization_required='Computer Science',
            qualification_required='BACHELOR',
            minimum_experience_years=1.0,
            skills_weight=0.4, specialization_weight=0.3,
            experience_weight=0.15, qualification_weight=0.15,
            status='OPEN',
            closing_date=now - timezone.timedelta(days=2)
        )
        self.client.force_authenticate(user=self.grad_user)
        resp = self.client.get('/api/jobs/')
        self.assertEqual(resp.status_code, 200)
        results = resp.data.get('results', resp.data)
        result_ids = [j['id'] for j in results]
        self.assertNotIn(expired_job.id, result_ids)


from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient
from rest_framework import status
from profiles.models import Skill, GraduateSkill, Major
from jobs.models import ApplicationStatusHistory
from matching.models import MatchingResult
from matching.services import MatchingService
from admin_panel.models import Administrator


class GraduationDocRequirementsTestCase(TestCase):
    """
    اختبارات معتمدة للتحقق من مطابقة متطلبات وثيقة مشروع التخرج:
    - FR-29: سجل تغيير حالة طلب التوظيف (ApplicationStatusHistory).
    - جدول وبيانات وميثودز مدير النظام (Administrator table 'administrators').
    - نموذج نتائج المطابقة (MATCH_RESULTS) والربط المباشر مع الوظائف والخريجين.
    - FR-27: التحقق الصارم من نوع وحجم الملفات المرفوعة.
    - الفصل الثاني (11.2.2 و 12.2.2): معادلة Jaccard Similarity والمطابقة الموزونة.
    """

    def setUp(self):
        self.client = APIClient()

        # مدير النظام
        self.admin_user = User.objects.create_superuser(
            email='admin@manara.com',
            name='System Administrator',
            password='AdminPassword123!',
            role='ADMIN'
        )

        # شركة
        self.company_user = User.objects.create_user(
            email='tech@corp.com',
            name='Tech Corp',
            role='COMPANY',
            password='Password123!'
        )
        self.company = Company.objects.create(
            user=self.company_user,
            company_name='Tech Corp',
            commercial_reg='CR123456',
            verification_status='APPROVED'
        )

        # خريج
        self.grad_user = User.objects.create_user(
            email='grad@manara.com',
            name='Ali Hassan',
            role='GRADUATE',
            password='Password123!'
        )
        self.profile = GraduateProfile.objects.create(
            user=self.grad_user,
            first_name='Ali',
            last_name='Hassan',
            specialization='Computer Science',
            qualification_level='BACHELOR',
            years_of_experience=2.0
        )

        # مهارات
        self.skill_python = Skill.objects.create(name='Python', category='TECHNICAL')
        self.skill_django = Skill.objects.create(name='Django', category='TECHNICAL')
        GraduateSkill.objects.create(profile=self.profile, skill=self.skill_python, proficiency_level='ADVANCED')
        GraduateSkill.objects.create(profile=self.profile, skill=self.skill_django, proficiency_level='INTERMEDIATE')

        # وظيفة
        self.job = Job.objects.create(
            company=self.company,
            title='Software Engineer',
            description='Django and Python developer',
            requirements='Python, Django',
            specialization_required='Computer Science',
            qualification_required='BACHELOR',
            minimum_experience_years=2.0,
            skills_weight=0.4,
            specialization_weight=0.3,
            experience_weight=0.15,
            qualification_weight=0.15,
            minimum_match_score=0.5
        )

    def test_administrator_model_and_table(self):
        """التحقق من نموذج مدير النظام Administrator بنمط الوكيل Proxy ومناهجه وفق Class Diagram."""
        admin_rec = Administrator.objects.filter(id=self.admin_user.id).first()
        self.assertIsNotNone(admin_rec, "يجب الوصول لمدير النظام عبر كائن Administrator")
        self.assertEqual(admin_rec.admin_id, admin_rec.id)
        self.assertTrue(Administrator._meta.proxy)

        # استدعاء مناهج مخطط الأصناف Class Diagram
        users = admin_rec.manageUsers()
        self.assertGreaterEqual(users.count(), 3)
        jobs = admin_rec.manageJobs()
        self.assertEqual(jobs.count(), 1)
        reports = admin_rec.generateReports()
        self.assertIn('total_users', reports)
        self.assertIn('total_jobs', reports)

    def test_application_status_history_fr29(self):
        """التحقق من متطلب FR-29 والنشاط 8-3: تسجيل تغير حالة الطلب مع المستخدم والتاريخ."""
        app = Application.objects.create(job=self.job, profile=self.profile)
        initial_history = ApplicationStatusHistory.objects.filter(application=app)
        self.assertEqual(initial_history.count(), 1)
        self.assertEqual(initial_history.first().new_status, 'SUBMITTED')

        # تحديث الحالة إلى UNDER_REVIEW بواسطة ممثل الشركة
        app.update_status('UNDER_REVIEW', changed_by=self.company_user)
        self.assertEqual(app.status, 'UNDER_REVIEW')

        # تحديث الحالة إلى ACCEPTED
        app.update_status('ACCEPTED', changed_by=self.company_user)
        self.assertEqual(app.status, 'ACCEPTED')

        history_records = list(app.status_history.order_by('changed_at'))
        self.assertEqual(len(history_records), 3)
        self.assertEqual(history_records[1].previous_status, 'SUBMITTED')
        self.assertEqual(history_records[1].new_status, 'UNDER_REVIEW')
        self.assertEqual(history_records[1].changed_by, self.company_user)
        self.assertEqual(history_records[2].new_status, 'ACCEPTED')

    def test_application_history_api_endpoint(self):
        """التحقق من نقطة النهاية API لسجل الحالات /api/jobs/applications/<id>/history/."""
        app = Application.objects.create(job=self.job, profile=self.profile)
        app.update_status('UNDER_REVIEW', changed_by=self.company_user)

        # الخريج يطلب السجل لطلبه
        self.client.force_authenticate(user=self.grad_user)
        resp = self.client.get(f'/api/jobs/applications/{app.id}/history/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        records = resp.data.get('results', resp.data) if isinstance(resp.data, dict) else resp.data
        self.assertEqual(len(records), 2)

    def test_matching_results_erd_table_and_fks(self):
        """التحقق من جدول match_results والعلاقات المباشرة مع Job و GraduateProfile."""
        app = Application.objects.create(job=self.job, profile=self.profile)
        result = MatchingService.compare_profiles(app)

        self.assertEqual(MatchingResult._meta.db_table, 'match_results')
        self.assertEqual(result.job, self.job)
        self.assertEqual(result.graduate, self.profile)
        self.assertEqual(result.score, result.final_score)
        self.assertEqual(result.skill_score, result.skills_score)
        self.assertEqual(result.major_score, result.specialization_score)
        self.assertTrue(result.is_eligible())

        # اختبار المطابقة المباشرة دون طلب مسبق (Direct matching)
        direct_result = MatchingService.calculate_graduate_job_match(self.profile, self.job)
        self.assertIsNotNone(direct_result.id)
        self.assertEqual(direct_result.job, self.job)
        self.assertEqual(direct_result.graduate, self.profile)

    def test_strict_file_validation_fr27(self):
        """التحقق من متطلب FR-27: رفض الملفات التي لا تطابق النوع أو الحجم المسموح."""
        self.client.force_authenticate(user=self.grad_user)

        # 1. إرسال ملف بصيغة غير مدعومة (exe أو txt كصورة)
        fake_exe = SimpleUploadedFile("malicious.exe", b"MZ\x90\x00\x03\x00\x00\x00", content_type="application/x-msdownload")
        resp_invalid_ext = self.client.post('/api/profiles/upload/image/', {'image': fake_exe}, format='multipart')
        self.assertEqual(resp_invalid_ext.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("نوع الملف غير مدعوم", resp_invalid_ext.data.get('error', ''))

        # 2. إرسال ملف بحجم يتجاوز 5 MB
        large_bytes = b"0" * (6 * 1024 * 1024)
        large_file = SimpleUploadedFile("large_pic.png", large_bytes, content_type="image/png")
        resp_too_large = self.client.post('/api/profiles/upload/image/', {'image': large_file}, format='multipart')
        self.assertEqual(resp_too_large.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("يتجاوز الحد المسموح", resp_too_large.data.get('error', ''))

        # 3. إرسال صورة PNG صالحة
        valid_png_bytes = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01" + (b"\x00" * 50)
        valid_file = SimpleUploadedFile("avatar.png", valid_png_bytes, content_type="image/png")
        resp_valid = self.client.post('/api/profiles/upload/image/', {'image': valid_file, 'type': 'profile'}, format='multipart')
        self.assertEqual(resp_valid.status_code, status.HTTP_201_CREATED)
        self.assertIn("image_url", resp_valid.data)

    def test_chapter2_equations_jaccard_and_weighted_matching(self):
        """
        التحقق الصارم من معادلات الفصل الثاني:
        11.2.2: Jaccard Similarity J(A, B) = |A ∩ B| / |A ∪ B|
        12.2.2: Final Score = ws*Ss + wm*Sm + we*Se + wq*Sq
        """
        set_a = {'Python', 'Django', 'PostgreSQL'}
        set_b = {'Python', 'Django', 'Docker', 'Redis'}
        jaccard = MatchingService.jaccard_similarity(set_a, set_b)
        self.assertEqual(jaccard, 0.4)

        ws, wm, we, wq = 0.4, 0.3, 0.15, 0.15
        self.assertAlmostEqual(ws + wm + we + wq, 1.0)

        ss = 0.8
        sm = 1.0
        se = 0.5
        sq = 1.0
        expected_score = (ws * ss) + (wm * sm) + (we * se) + (wq * sq)
        calculated = MatchingService.calculate_score(ss, sm, se, sq, self.job)
        self.assertEqual(calculated, round(expected_score, 4))

    def test_password_reset_flow_fr25(self):
        """التحقق من دورة استعادة كلمة المرور عند نسيانها (FR-25)."""
        from django.core import mail
        from django.core.signing import TimestampSigner

        self.grad_user.verify_email()

        # 1. طلب رمز الاستعادة
        req_resp = self.client.post('/api/auth/password-reset-request/', {
            'email': self.grad_user.email
        })
        self.assertEqual(req_resp.status_code, status.HTTP_200_OK)
        self.assertNotIn('reset_token', req_resp.data)
        self.assertEqual(len(mail.outbox), 1)

        signer = TimestampSigner(salt="password-reset-salt")
        reset_token = signer.sign(f"{self.grad_user.id}:{self.grad_user.email}")

        # 2. تأكيد كلمة المرور الجديدة
        new_pwd = 'NewStrongPassword2026!'
        confirm_resp = self.client.post('/api/auth/password-reset-confirm/', {
            'token': reset_token,
            'new_password': new_pwd
        })
        self.assertEqual(confirm_resp.status_code, status.HTTP_200_OK)

        # 3. محاولة تسجيل الدخول بكلمة المرور الجديدة
        login_resp = self.client.post('/api/auth/login/', {
            'email': self.grad_user.email,
            'password': new_pwd
        })
        self.assertEqual(login_resp.status_code, status.HTTP_200_OK)
        self.assertIn('token', login_resp.data)

    def test_job_search_and_skill_filtering_fr30(self):
        """التحقق من البحث وتصفية الوظائف بالمهارات والكلمات المفتاحية (FR-30)."""
        self.client.force_authenticate(user=self.grad_user)
        self.job.add_required_skill(self.skill_python, required_level='ADVANCED')

        resp_search = self.client.get('/api/jobs/?search=Python')
        self.assertEqual(resp_search.status_code, status.HTTP_200_OK)
        results = resp_search.data.get('results', resp_search.data)
        self.assertGreaterEqual(len(results), 1)

        resp_skill = self.client.get('/api/jobs/?skill=Python')
        self.assertEqual(resp_skill.status_code, status.HTTP_200_OK)
        results_skill = resp_skill.data.get('results', resp_skill.data)
        self.assertGreaterEqual(len(results_skill), 1)

    def test_withdraw_application_via_post_and_patch_fr13(self):
        """التحقق من سحب الطلب عبر POST و PATCH لدعم الفرونت إند والباك إند (FR-13)."""
        app = Application.objects.create(job=self.job, profile=self.profile)
        self.client.force_authenticate(user=self.grad_user)

        resp = self.client.post(f'/api/jobs/applications/{app.id}/withdraw/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        app.refresh_from_db()
        self.assertEqual(app.status, 'WITHDRAWN')

    def test_company_verification_post_and_status_param_fr23(self):
        """التحقق من اعتماد الشركة عبر POST ومعامل status لدعم الفرونت إند (FR-23)."""
        new_comp_user = User.objects.create_user(email='newcorp@corp.com', name='New Corp', role='COMPANY', password='pwd')
        new_comp = Company.objects.create(
            user=new_comp_user,
            company_name='New Corp',
            commercial_reg='CR-999',
            description='Full description of new corp',
            verification_status='PENDING'
        )

        self.client.force_authenticate(user=self.admin_user)
        resp = self.client.post(f'/api/admin-panel/companies/{new_comp.id}/verify/', {
            'status': 'APPROVED'
        })
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        new_comp.refresh_from_db()
        self.assertEqual(new_comp.verification_status, 'APPROVED')

    def test_direct_job_matching_and_candidates_ranking_fr15_17(self):
        """التحقق من مسارات حساب المطابقة الفورية وترتيب المرشحين (FR-15, FR-16, FR-17)."""
        self.client.force_authenticate(user=self.grad_user)
        match_resp = self.client.get(f'/api/matching/job/{self.job.id}/')
        self.assertEqual(match_resp.status_code, status.HTTP_200_OK)
        self.assertIn('final_score', match_resp.data)
        self.assertIn('is_eligible', match_resp.data)

        Application.objects.create(job=self.job, profile=self.profile)
        self.client.force_authenticate(user=self.company_user)
        rank_resp = self.client.get(f'/api/matching/job/{self.job.id}/candidates/')
        self.assertEqual(rank_resp.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(rank_resp.data), 1)

    def test_fr30_job_ordering_api(self):
        """FR-30: التحقق من ترتيب نتائج الوظائف عبر معاملات ordering."""
        self.client.force_authenticate(user=self.grad_user)
        resp_desc = self.client.get('/api/jobs/?ordering=-created_at')
        self.assertEqual(resp_desc.status_code, status.HTTP_200_OK)

        resp_sal = self.client.get('/api/jobs/?ordering=-salary_max')
        self.assertEqual(resp_sal.status_code, status.HTTP_200_OK)

    def test_nfr03_response_time_benchmark(self):
        """NFR-03: التحقق من استجابة النظام في زمن قياسي أقل بكثير من 3.0 ثوانٍ."""
        import time
        self.client.force_authenticate(user=self.grad_user)

        # 1. قياس زمن استرجاع الشواغر والبحث
        t0 = time.time()
        resp_jobs = self.client.get('/api/jobs/?search=مهندس')
        t1 = time.time()
        self.assertEqual(resp_jobs.status_code, status.HTTP_200_OK)
        self.assertLess(t1 - t0, 3.0, "زمن استرجاع الوظائف تجاوز معيار NFR-03 (3.0 ثوانٍ)")

        # 2. قياس زمن حساب المطابقة الذكية
        t0 = time.time()
        resp_match = self.client.get(f'/api/matching/job/{self.job.id}/')
        t1 = time.time()
        self.assertEqual(resp_match.status_code, status.HTTP_200_OK)
        self.assertLess(t1 - t0, 3.0, "زمن حساب خوارزمية المطابقة تجاوز معيار NFR-03 (3.0 ثوانٍ)")

    def test_nfr04_one_hundred_concurrent_requests_scalability(self):
        """NFR-04: محاكاة واختبار معالجة 100 طلب متزامن بنجاح 100% دون أعطال خادم."""
        from concurrent.futures import ThreadPoolExecutor
        from rest_framework.test import APIClient
        from django.db import connection

        def make_request(req_id):
            client = APIClient()
            client.force_authenticate(user=self.grad_user)
            try:
                res = client.get('/api/jobs/')
                return res.status_code
            finally:
                connection.close()

        # محاكاة 100 طلب عبر مسبح خيوط متزامنة (ThreadPool)
        with ThreadPoolExecutor(max_workers=10) as executor:
            status_codes = list(executor.map(make_request, range(100)))

        self.assertEqual(len(status_codes), 100)
        self.assertTrue(all(code == 200 for code in status_codes), "أحد الطلبات المئة فشل تحت ضغط الاستعلامات المتزامنة")



