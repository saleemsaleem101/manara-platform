from django.test import TestCase
from django.utils import timezone
from accounts.models import User
from profiles.models import Company, GraduateProfile, Skill, GraduateSkill
from jobs.models import Job, JobSkill, Application
from matching.services import calculate_application_match


class MatchingAlgorithmTestCase(TestCase):
    def setUp(self):
        # المستخدمون
        self.company_user = User.objects.create_user(
            email='match_company@example.com',
            name='Matching Solutions',
            role='COMPANY',
            password='password123'
        )
        self.company = Company.objects.create(
            user=self.company_user,
            company_name='Matching Solutions',
            registration_number='MATCH123',
            verification_status='APPROVED'
        )
        self.grad_user = User.objects.create_user(
            email='match_grad@example.com',
            name='Sami Al-Mutahar',
            role='GRADUATE',
            password='password123'
        )
        self.profile = GraduateProfile.objects.create(
            user=self.grad_user,
            specialization='Computer Science',
            qualification_level='BACHELOR',
            years_of_experience=2.0
        )

        # المهارات
        self.skill_python = Skill.objects.create(name='Python', category='TECHNICAL')
        self.skill_django = Skill.objects.create(name='Django', category='TECHNICAL')
        self.skill_docker = Skill.objects.create(name='Docker', category='TECHNICAL')

        # مهارات الخريج: Python و Django
        GraduateSkill.objects.create(profile=self.profile, skill=self.skill_python, proficiency_level='ADVANCED')
        GraduateSkill.objects.create(profile=self.profile, skill=self.skill_django, proficiency_level='INTERMEDIATE')

        # وظيفة تطلب: Python (وزن 1.5) و Docker (وزن 1.0)
        self.job = Job.objects.create(
            company=self.company,
            title='Backend Python Engineer',
            description='We need Python and Docker developer',
            requirements='Python, Docker',
            specialization_required='Computer Science',
            qualification_required='BACHELOR',
            minimum_experience_years=2.0,
            skills_weight=0.4,
            specialization_weight=0.3,
            experience_weight=0.15,
            qualification_weight=0.15,
            minimum_match_score=0.5,
            closing_date=timezone.now() + timezone.timedelta(days=30)
        )
        JobSkill.objects.create(job=self.job, skill=self.skill_python, required_level='ADVANCED', weight=1.5)
        JobSkill.objects.create(job=self.job, skill=self.skill_docker, required_level='INTERMEDIATE', weight=1.0)

    def test_weighted_jaccard_skills_score(self):
        """حساب معامل Jaccard الموزون (P132) مع المهارات الإلزامية ومستويات الإتقان."""
        app = Application.objects.create(job=self.job, profile=self.profile)
        result = calculate_application_match(app)

        # المطلوب: Python (1.5, ADVANCED, required) + Docker (1.0, INTERMEDIATE, required) = 2.5
        # الخريج لديه: Python (ADVANCED) + Django (INTERMEDIATE, مهارة إضافية = وزن 0.0 دون عقوبة)
        # التقاطع: 1.5 * 1.0 = 1.5
        # الاتحاد (متطلبات الوظيفة فقط): 2.5
        # Jaccard الأساسي: 1.5 / 2.5 = 0.6
        # نسبة استيفاء المهارات الإلزامية: 1 من 2 = 0.5
        # الدرجة النهائية للمهارات: 0.6 * 0.5 = 0.3
        expected_skills = round((1.5 / 2.5) * 0.5, 4)
        self.assertAlmostEqual(result.skills_score, expected_skills, places=3)

        # باقي المعايير: تخصص=1.0، خبرة=1.0، مؤهل=1.0
        self.assertEqual(result.specialization_score, 1.0)
        self.assertEqual(result.experience_score, 1.0)
        self.assertEqual(result.qualification_score, 1.0)

        # النتيجة الإجمالية الموزونة
        expected_final = round(
            (expected_skills * 0.4) +
            (1.0 * 0.3) +
            (1.0 * 0.15) +
            (1.0 * 0.15),
            4
        )
        self.assertAlmostEqual(result.final_score, expected_final, places=3)

    def test_proficiency_level_scaling(self):
        """اختبار معامل تطابق المستوى: level_factor = min(grad_level / req_level, 1.0)."""
        # نعدّل مستوى الخريج في بايثون إلى BEGINNER (1) بينما الوظيفة تطلب EXPERT (4)
        grad_python = GraduateSkill.objects.get(profile=self.profile, skill=self.skill_python)
        grad_python.proficiency_level = 'BEGINNER'
        grad_python.save()

        # نحذف المهارة الإضافية ونجعل الوظيفة تطلب بايثون فقط بدون مهارات أخرى
        GraduateSkill.objects.filter(profile=self.profile, skill=self.skill_django).delete()
        self.job.required_skills.filter(skill=self.skill_docker).delete()
        req_python = self.job.required_skills.get(skill=self.skill_python)
        req_python.required_level = 'EXPERT'
        req_python.weight = 1.0
        req_python.save()

        app = Application.objects.create(job=self.job, profile=self.profile)
        result = calculate_application_match(app)

        # level_factor = 1 / 4 = 0.25
        # Intersection = 1.0 * 0.25 = 0.25
        # Union = 1.0
        # skills_score = 0.25
        self.assertAlmostEqual(result.skills_score, 0.25, places=3)

    def test_full_match_scores_100_percent(self):
        """خريج يطابق جميع المتطلبات تماماً يحصل على 1.0."""
        GraduateSkill.objects.filter(profile=self.profile, skill=self.skill_django).delete()
        GraduateSkill.objects.create(profile=self.profile, skill=self.skill_docker, proficiency_level='EXPERT')

        app = Application.objects.create(job=self.job, profile=self.profile)
        result = calculate_application_match(app)

        self.assertEqual(result.skills_score, 1.0)
        self.assertEqual(result.specialization_score, 1.0)
        self.assertEqual(result.experience_score, 1.0)
        self.assertEqual(result.qualification_score, 1.0)
        self.assertEqual(result.final_score, 1.0)

    def test_empty_specialization_yields_zero(self):
        """تخصص فارغ → specialization_score = 0.0 لا 1.0."""
        self.profile.specialization = ''
        self.profile.save()

        app = Application.objects.create(job=self.job, profile=self.profile)
        result = calculate_application_match(app)
        self.assertEqual(result.specialization_score, 0.0)

    def test_null_qualification_defaults_to_bachelor(self):
        """مؤهل None → يستخدم BACHELOR (=2) كافتراضي."""
        self.profile.qualification_level = None
        self.profile.save()

        app = Application.objects.create(job=self.job, profile=self.profile)
        result = calculate_application_match(app)
        # BACHELOR(2) / BACHELOR(2) = 1.0
        self.assertEqual(result.qualification_score, 1.0)

    def test_no_required_skills_yields_full_score(self):
        """وظيفة بلا مهارات مطلوبة → skills_score = 1.0."""
        self.job.required_skills.all().delete()

        app = Application.objects.create(job=self.job, profile=self.profile)
        result = calculate_application_match(app)
        self.assertEqual(result.skills_score, 1.0)


class MatchingServiceTestCase(TestCase):
    """اختبار دوال صنف MatchingService ونماذج الـ Class Diagram و ERD (الفصل الثالث)."""

    def setUp(self):
        from matching.services import MatchingService
        self.service = MatchingService

        self.company_user = User.objects.create_user(
            email='ms_comp@example.com', name='MS Corp',
            role='COMPANY', password='password123'
        )
        self.company = Company.objects.create(
            user=self.company_user, company_name='MS Corp',
            verification_status='APPROVED'
        )
        self.grad_user = User.objects.create_user(
            email='ms_grad@example.com', name='MS Grad',
            role='GRADUATE', password='password123'
        )
        self.profile = GraduateProfile.objects.create(user=self.grad_user)

        self.job = Job.objects.create(
            company=self.company,
            title='AI Engineer',
            description='Python & ML',
            requirements='Python',
            skills_weight=0.4,
            specialization_weight=0.3,
            experience_weight=0.15,
            qualification_weight=0.15,
            minimum_match_score=0.5
        )

    def test_jaccard_similarity(self):
        """اختبار دالة معامل Jaccard في MatchingService."""
        # مجموعتان متطابقتان -> 1.0
        self.assertEqual(self.service.jaccard_similarity({'a', 'b'}, {'a', 'b'}), 1.0)
        # مجموعتان متباعدتان -> 0.0
        self.assertEqual(self.service.jaccard_similarity({'a', 'b'}, {'c', 'd'}), 0.0)
        # تشابه جزئي: تقاطع=1، اتحاد=3 -> 1/3
        self.assertAlmostEqual(self.service.jaccardSimilarity({'a', 'b'}, {'b', 'c'}), 1 / 3, places=3)
        # مجموعتان فارغتان -> 1.0
        self.assertEqual(self.service.jaccard_similarity(set(), set()), 1.0)

    def test_calculate_score(self):
        """اختبار دالة حساب الدرجة الموزونة calculate_score."""
        score = self.service.calculate_score(1.0, 1.0, 1.0, 1.0, self.job)
        self.assertEqual(score, 1.0)

        score_half = self.service.calculateScore(0.5, 0.5, 0.5, 0.5, self.job)
        self.assertEqual(score_half, 0.5)

    def test_rank_candidates(self):
        """اختبار دالة ترتيب المرشحين rank_candidates وفق درجة التوافق."""
        grad2_user = User.objects.create_user(
            email='ms_grad2@example.com', name='MS Grad 2',
            role='GRADUATE', password='password123'
        )
        profile2 = GraduateProfile.objects.create(user=grad2_user)

        app1 = Application.objects.create(job=self.job, profile=self.profile)
        app2 = Application.objects.create(job=self.job, profile=profile2)

        # محاكاة درجات مختلفة
        from matching.models import MatchingResult
        MatchingResult.objects.create(
            application=app1, skills_score=0.5, specialization_score=0.5,
            experience_score=0.5, qualification_score=0.5, final_score=0.5
        )
        MatchingResult.objects.create(
            application=app2, skills_score=0.9, specialization_score=0.9,
            experience_score=0.9, qualification_score=0.9, final_score=0.9
        )

        ranked = list(self.service.rankCandidates(self.job))
        self.assertEqual(len(ranked), 2)
        # يجب أن يكون صاحب الدرجة الأعلى (app2) أولاً
        self.assertEqual(ranked[0].id, app2.id)
        self.assertEqual(ranked[1].id, app1.id)

    def test_proficiency_level_int_and_serializer(self):
        """اختبار دعم مستويات الإتقان كأرقام (1-4) في ERD ومطابقة السيريالايزر."""
        from profiles.serializers import GraduateSkillSerializer
        skill = Skill.objects.create(name='NumPy', category='TECHNICAL')

        # إرسال مستوى الإتقان كرقم 3 (ADVANCED)
        serializer = GraduateSkillSerializer(data={
            'skill': skill.id,
            'proficiency_level': 3
        })
        self.assertTrue(serializer.is_valid(), serializer.errors)
        self.assertEqual(serializer.validated_data['proficiency_level'], 'ADVANCED')
        saved_skill = serializer.save(profile=self.profile)

        # استرجاع البيانات والتحقق من وجود الحقل الرقمي proficiency_level_int
        out_serializer = GraduateSkillSerializer(instance=saved_skill)
        self.assertEqual(out_serializer.data['proficiency_level_int'], 3)
        self.assertEqual(out_serializer.data['proficiency_level'], 'ADVANCED')

    def test_class_diagram_model_methods_and_erd_aliases(self):
        """اختبار دوال كائنات مخطط الأصناف (الشكل 3-4) والخواص التوافقية لـ ERD."""
        # 1. Job ERD aliases
        self.assertEqual(self.job.weight_skills, 0.4)
        self.assertEqual(self.job.weight_major, 0.3)
        self.assertEqual(self.job.weight_experience, 0.15)
        self.assertEqual(self.job.weight_qualification, 0.15)
        self.assertEqual(self.job.min_match_score, 0.5)
        self.assertEqual(self.job.posted_at, self.job.created_at)

        # set_weights method
        self.job.set_weights(0.25, 0.25, 0.25, 0.25, min_score=0.6)
        self.assertEqual(self.job.weight_skills, 0.25)
        self.assertEqual(self.job.min_match_score, 0.6)

        # 2. Company methods
        self.assertTrue(self.company.is_verified)
        new_job = self.company.post_job(
            title='Backend Go Dev',
            description='Golang expert',
            requirements='Go',
            skills_weight=0.4, specialization_weight=0.3,
            experience_weight=0.15, qualification_weight=0.15
        )
        self.assertEqual(new_job.company, self.company)
        self.assertEqual(new_job.status, 'OPEN')

        # define_requirements
        skill = Skill.objects.create(name='Golang', category='TECHNICAL')
        reqs = self.company.define_requirements(new_job, [{'skill': skill, 'weight': 2.0, 'is_required': True}])
        self.assertEqual(len(reqs), 1)
        self.assertEqual(reqs[0].skill, skill)

        # review_applications
        apps = self.company.review_applications(new_job)
        self.assertEqual(apps.count(), 0)

        # 3. GraduateProfile methods
        self.profile.manage_profile(city='Sanaa')
        self.assertEqual(self.profile.city, 'Sanaa')

        app = self.profile.apply_for_job(new_job)
        self.assertIsNotNone(app.id)
        self.assertIsNotNone(app.match_score)

        tracked = self.profile.track_status(app.id)
        self.assertEqual(tracked.status, 'SUBMITTED')

        # 4. Notification send method
        from notifications.models import Notification
        notif = Notification.send(
            user=self.grad_user,
            message='تم استلام طلبك بنجاح',
            title='تأكيد التقديم',
            notif_type='NEW_APPLICATION'
        )
        self.assertIsNotNone(notif.id)
        self.assertEqual(notif.type, 'NEW_APPLICATION')

        # 5. User register classmethod
        new_user = User.register(
            email='registered_user@example.com',
            name='Registered Name',
            role='GRADUATE',
            password='Password123!',
            phone='777123456'
        )
        self.assertEqual(new_user.phone, '777123456')
        self.assertTrue(new_user.check_password('Password123!'))

    def test_experience_calculation_from_experiences_table(self):
        """اختبار حساب سنوات الخبرة ديناميكياً من جدول experiences العلائقي."""
        from profiles.models import Experience
        from datetime import date, timedelta

        # تصفير حقل الخبرة اليدوي
        self.profile.years_of_experience = 0.0
        self.profile.save()

        # إضافة خبرة سابقة مدتها سنتان (730 يوم)
        start = date.today() - timedelta(days=730)
        Experience.objects.create(
            graduate=self.profile,
            job_title='Software Developer',
            company_name='Previous Tech',
            start_date=start,
            end_date=date.today(),
            description='Full-stack development'
        )

        app = Application.objects.create(job=self.job, profile=self.profile)
        result = calculate_application_match(app)

        # الوظيفة تطلب 2.0 سنوات، والخريج لديه سنتان مسجلة في جدول experiences
        self.assertGreaterEqual(result.experience_score, 0.95)

    def test_major_matching_via_qualifications(self):
        """اختبار مطابقة التخصص عبر جدول المؤهلات الأكاديمية qualifications المرتبط بـ Major."""
        from profiles.models import Major, Qualification

        # تخصص جديد
        cyber_major = Major.objects.create(major_name='Cybersecurity', college='IT')
        job_cyber = Job.objects.create(
            company=self.company,
            title='Security Analyst',
            description='Cybersecurity analyst',
            major=cyber_major,
            qualification_required='BACHELOR',
            minimum_experience_years=1.0,
            skills_weight=0.4, specialization_weight=0.3,
            experience_weight=0.15, qualification_weight=0.15
        )

        # الخريج ليس لديه تخصص مكتوب في specialization_required ولكن لديه مؤهل أكاديمي بهذا التخصص
        self.profile.specialization = ''
        self.profile.save()
        Qualification.objects.create(
            graduate=self.profile,
            degree='BACHELOR',
            major=cyber_major,
            university='UST',
            graduation_year=2024
        )

        app = Application.objects.create(job=job_cyber, profile=self.profile)
        result = calculate_application_match(app)

        self.assertEqual(result.specialization_score, 1.0)


