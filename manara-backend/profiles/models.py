from django.db import models

from django.conf import settings

from django.core.validators import MinValueValidator, MaxValueValidator, RegexValidator
from django.core.exceptions import ValidationError

gpa_validator = RegexValidator(
    regex=r'^(?:(?:\d{1,3}(?:\.\d{1,2})?%?|\d(?:\.\d{1,2})?/(?:4|5))(?:\s*[\(\[].*?[\)\]])?)?$',
    message='يرجى إدخال معدل تراكمي صحيح (مثال: 3.5 أو 88%% أو 4.2/5).'
)

years_validator = RegexValidator(
    regex=r'^(?:\d+(?:\.\d+)?(?:\s*سنوات|\s*سنة)?|حديث التخرج|حديث تخرج|بدون خبرة|لا يوجد|صفر|أقل من سنة|سنة|سنتين|\d+\s*-\s*\d+\s*سنوات?)?$',
    message='يرجى إدخال عدد سنوات خبرة صحيح أو عبارة مقبولة (مثال: 2 أو حديث التخرج).'
)

from decimal import Decimal

class Major(models.Model):

    """نموذج التخصصات الأكاديمية (majors في مخطط ERD الجديد)."""

    major_name = models.CharField(max_length=100, unique=True)

    college = models.CharField(max_length=100, blank=True, default='')

    class Meta:

        ordering = ['id']

    def __str__(self) -> str:

        return str(self.major_name)

class Skill(models.Model):

    CATEGORY_CHOICES = (

        ('TECHNICAL', 'Technical'),

        ('SOFT', 'Soft'),

    )

    name = models.CharField(max_length=100, unique=True)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='TECHNICAL')

    class Meta:
        ordering = ['id']

    def update_details(self, name=None, category=None):

        """تحديث بيانات المهارة (+ updateDetails في مخطط الأصناف)."""

        if name:

            self.name = name

        if category:

            self.category = category

        self.save()

    @property

    def skill_id(self):

        """مطابقة اسم الحقل skill_id في ERD ومخطط الأصناف."""

        return self.id

    @property

    def skill_name(self):

        """مطابقة اسم الحقل skill_name في ERD ومخطط الأصناف."""

        return self.name

    @property

    def skill_category(self):

        """مطابقة اسم الحقل skill_category في ERD ومخطط الأصناف."""

        return self.category

    def __str__(self) -> str:

        return str(self.name)

class GraduateProfile(models.Model):
    class Meta:
        db_table = 'graduate_profiles'

    QUALIFICATION_CHOICES = (

        ('DIPLOMA', 'Diploma'),

        ('BACHELOR', 'Bachelor'),

        ('MASTER', 'Master'),

        ('DOCTORATE', 'Doctorate'),

    )

    VISIBILITY_CHOICES = (

        ('PRIVATE', 'Private'),

        ('COMPANIES_ONLY', 'Companies Only'),

        ('PUBLIC', 'Public'),

    )

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='graduate_profile')

    

    # حقول جديدة وفق ERD الجديد

    first_name = models.CharField(max_length=50, blank=True, default='')

    last_name = models.CharField(max_length=50, blank=True, default='')

    birth_date = models.DateField(null=True, blank=True)

    gender = models.CharField(max_length=10, blank=True, default='')

    city = models.CharField(max_length=50, blank=True, default='')
    phone = models.CharField(max_length=30, blank=True, default='')
    gpa = models.CharField(max_length=50, blank=True, default='', validators=[gpa_validator])
    cv_file_url = models.CharField(max_length=255, blank=True, default='')
    video_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True)

    cv_file = models.CharField(max_length=255, blank=True, null=True)

    video_cv_url = models.URLField(blank=True, null=True)

    linkedin_url = models.URLField(blank=True, null=True)

    profile_image = models.CharField(max_length=255, blank=True, null=True)

    # الحقول السابقة مع التوافق التام

    specialization = models.CharField(max_length=150, blank=True, default='')

    qualification_level = models.CharField(max_length=20, choices=QUALIFICATION_CHOICES, default='BACHELOR', blank=True, null=True)

    university = models.CharField(max_length=150, blank=True, default='')

    graduation_year = models.IntegerField(null=True, blank=True)

    years_of_experience = models.CharField(max_length=50, blank=True, default='0', validators=[years_validator])

    bio = models.TextField(blank=True, null=True)

    github_url = models.URLField(blank=True, null=True)

    video_duration_seconds = models.IntegerField(default=0)

    video_visibility = models.CharField(max_length=20, choices=VISIBILITY_CHOICES, default='COMPANIES_ONLY')

    @property

    def video_url(self):

        return self.video_cv_url

    @video_url.setter

    def video_url(self, value):

        self.video_cv_url = value

    @property

    def graduate_id(self):

        """مطابقة اسم الحقل graduate_id في ERD ومخطط الأصناف."""

        return self.id

    @property

    def github_link(self):

        """مطابقة اسم الحقل github_link في ERD ومخطط الأصناف."""

        return self.github_url

    @github_link.setter

    def github_link(self, value):

        self.github_url = value

    @property
    def numeric_gpa(self):
        """تحويل gpa إلى قيمة رقمية لضمان دقة العمليات الحسابية."""
        if not self.gpa:
            return None
        try:
            import re
            m = re.findall(r'\d+\.?\d*', str(self.gpa))
            return float(m[0]) if m else None
        except Exception:
            return None

    @property
    def numeric_years_of_experience(self):
        """تحويل نص سنوات الخبرة إلى قيمة عددية مع دعم العبارات العربية (حديث التخرج -> 0)."""
        val_str = str(self.years_of_experience or '').strip()
        arabic_map = {
            'حديث التخرج': 0.0,
            'حديث تخرج': 0.0,
            'بدون خبرة': 0.0,
            'لا يوجد': 0.0,
            'صفر': 0.0,
            'أقل من سنة': 0.5,
            'سنة': 1.0,
            'سنتين': 2.0,
        }
        for k, v in arabic_map.items():
            if k in val_str:
                return v
        try:
            import re
            m = re.findall(r'\d+\.?\d*', val_str)
            return float(m[0]) if m else 0.0
        except Exception:
            return 0.0

    def clean(self):
        super().clean()
        if self.gpa:
            num_gpa = self.numeric_gpa
            if num_gpa is not None:
                if '%' in str(self.gpa) or num_gpa > 5.0:
                    if num_gpa < 0 or num_gpa > 100:
                        raise ValidationError({'gpa': 'المعدل كنسبة مئوية يجب أن يكون بين 0 و 100.'})
                else:
                    if num_gpa < 0 or num_gpa > 5.0:
                        raise ValidationError({'gpa': 'المعدل التراكمي يجب ألا يتجاوز 5.0 وألا يقل عن 0.'})
        if self.years_of_experience:
            num_exp = self.numeric_years_of_experience
            if num_exp is not None and (num_exp < 0 or num_exp > 50):
                raise ValidationError({'years_of_experience': 'سنوات الخبرة يجب أن تكون بين 0 و 50 سنة.'})

    ALLOWED_UPDATE_FIELDS = (
        'first_name', 'last_name', 'birth_date', 'gender', 'city',
        'phone', 'gpa', 'specialization', 'qualification_level',
        'university', 'graduation_year', 'years_of_experience',
        'bio', 'github_url', 'linkedin_url', 'cv_file', 'cv_file_url',
        'profile_image', 'video_cv_url', 'video_duration_seconds', 'video_visibility',
    )

    def update_profile(self, **kwargs):
        """
        تحديث بيانات الملف المهني (+ updateProfile في مخطط الأصناف).
        مقيد بقائمة بيضاء تمنع تعديل الحقول الحساسة (id, user, is_verified, video_verified).
        """
        updated = []
        for key, value in kwargs.items():
            if key in self.ALLOWED_UPDATE_FIELDS and hasattr(self, key):
                setattr(self, key, value)
                updated.append(key)
        if updated:
            self.save(update_fields=list(set(updated)))

    def add_skill(self, skill, proficiency_level='INTERMEDIATE'):

        """إضافة مهارة إلى الملف المهني (+ addSkill في مخطط الأصناف)."""

        return GraduateSkill.objects.update_or_create(

            profile=self, skill=skill,

            defaults={'proficiency_level': proficiency_level}

        )[0]

    def upload_intro_video(self, url, duration_seconds=0):

        """

        تحديث مسار بث الفيديو التعريفي (+ uploadIntroVideo في مخطط الأصناف و FR-08).

        وفقاً للفقرة 82 (P82): الرابط المعتمد هو مسار البث الداخلي الناتج عن حفظ الفيديو في VideoCV

        (بصيغة: /api/profiles/graduate/video/stream/<id>/) لمنع أي روابط خارجية.

        """

        self.video_url = url

        self.video_cv_url = url

        if duration_seconds:

            self.video_duration_seconds = duration_seconds

        self.save(update_fields=['video_cv_url', 'video_duration_seconds'])

    def set_video_visibility(self, visibility):

        """تحديد مستوى ظهور الفيديو التعريفي (+ setVideoVisibility في مخطط الأصناف و FR-09)."""

        if visibility not in dict(self.VISIBILITY_CHOICES):

            from django.core.exceptions import ValidationError

            raise ValidationError(f'مستوى الرؤية غير صالح: {visibility}')

        self.video_visibility = visibility

        self.save(update_fields=['video_visibility'])

        video_record = getattr(self, 'video_cv_record', None)

        if video_record:

            video_record.privacy_level = visibility

            video_record.save(update_fields=['privacy_level'])

    def manage_profile(self, **kwargs):

        """إدارة وتحديث الملف المهني (+ manageProfile في مخطط الأصناف الشكل 3-4)."""

        return self.update_profile(**kwargs)

    def apply_for_job(self, job):

        """التقديم على وظيفة (+ applyForJob في مخطط الأصناف الشكل 3-4 و FR-13) مع المعاملة الذرية وفحص الصلاحية."""

        from jobs.models import Application

        from django.db import transaction

        from django.core.exceptions import ValidationError

        from matching.services import MatchingService

        from django.utils import timezone

        if job.status != 'OPEN':

            raise ValidationError('هذه الوظيفة غير متاحة للتقديم حالياً.')

        deadline = job.deadline

        if deadline:

            if hasattr(deadline, 'date') and callable(deadline.date):

                deadline = deadline.date()

            if deadline < timezone.now().date():

                raise ValidationError('انتهى موعد التقديم على هذه الوظيفة.')

        with transaction.atomic():

            if Application.objects.filter(job=job, profile=self).exists():

                raise ValidationError('لقد قمت بالتقديم على هذه الوظيفة مسبقاً.')

            app = Application.objects.create(job=job, profile=self)

            MatchingService.compare_profiles(app)

            return app

    def search_jobs(self, query='', **filters):

        """البحث عن الوظائف المتاحة (+ searchJobs في مخطط الأصناف الشكل 3-4 و FR-12)."""

        from jobs.models import Job

        from django.utils import timezone

        from django.db.models import Q

        now = timezone.now()

        today = now.date()

        qs = Job.objects.filter(

            status='OPEN'

        ).filter(

            Q(deadline__isnull=True) | Q(deadline__gte=today)

        )

        if query:

            qs = qs.filter(Q(title__icontains=query) | Q(description__icontains=query) | Q(requirements__icontains=query))

        if 'specialization' in filters and filters['specialization']:

            qs = qs.filter(required_major__icontains=filters['specialization'])

        if 'location' in filters and filters['location']:

            qs = qs.filter(location__icontains=filters['location'])

        if 'job_type' in filters and filters['job_type']:

            qs = qs.filter(job_type=filters['job_type'].upper())

        if 'major_id' in filters and filters['major_id']:

            qs = qs.filter(major_id=filters['major_id'])

        return qs

    def searchJobs(self, query='', **filters):

        return self.search_jobs(query, **filters)

    def applyForJob(self, job):

        return self.apply_for_job(job)

    def manageProfile(self, **kwargs):

        return self.manage_profile(**kwargs)

    def track_status(self, application_id=None):

        """متابعة حالة طلبات التقديم (+ trackStatus في مخطط الأصناف الشكل 3-4 و FR-13)."""

        if application_id:

            return self.applications.filter(id=application_id).first()

        return self.applications.all()

    def trackStatus(self, application_id=None):

        return self.track_status(application_id)

    def upload(self, url, duration_seconds=0):

        """مرادف دالة رفع الفيديو في كائن VideoCV (+ upload في مخطط الأصناف)."""

        return self.upload_intro_video(url, duration_seconds)

    def set_privacy(self, visibility):

        """مرادف دالة تحديد خصوصية الفيديو في كائن VideoCV (+ setPrivacy في مخطط الأصناف)."""

        return self.set_video_visibility(visibility)

    def __str__(self):

        return f"{self.user.name} - Profile"

class VideoCV(models.Model):
    """
    نموذج الفيديو التعريفي (VideoCV في مخطط الأصناف الشكل 3-4).
    تخزين وسائط الفيديو عبر FileField وفق الفقرة 82 ومخطط الأصناف،
    محدد بسقف 50 ميجابايت كحد أقصى (FR-27).
    """

    MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024  # 50MB per FR-27

    graduate = models.OneToOneField(GraduateProfile, on_delete=models.CASCADE, related_name='video_cv_record')
    video_file = models.FileField(upload_to='videos/%Y/%m/', null=True, blank=True)

    file_name = models.CharField(max_length=255, blank=True, default='')

    file_url = models.CharField(max_length=500, blank=True, default='')

    content_type = models.CharField(max_length=50, blank=True, default='video/mp4')

    file_size = models.BigIntegerField(default=0)

    duration_seconds = models.IntegerField(default=0)

    privacy_level = models.CharField(

        max_length=20,

        choices=GraduateProfile.VISIBILITY_CHOICES,

        default='COMPANIES_ONLY'

    )

    uploaded_at = models.DateTimeField(auto_now_add=True)

    def upload(self, video_file=None, data=None, file_name='video_cv.mp4', content_type='video/mp4', duration_seconds=0):

        """رفع وتخزين ملف الفيديو التعريفي عبر FileField (+ upload في مخطط الأصناف و P82)."""

        if video_file is not None:
            self.video_file = video_file
            self.file_name = file_name or getattr(video_file, 'name', 'video_cv.mp4')
            self.content_type = content_type or getattr(video_file, 'content_type', 'video/mp4')
            self.file_size = getattr(video_file, 'size', 0)
        elif data is not None:
            from django.core.files.base import ContentFile
            fname = file_name or 'video_cv.mp4'
            self.video_file.save(fname, ContentFile(data), save=False)
            self.file_name = fname
            self.content_type = content_type
            self.file_size = len(data)

        if duration_seconds:

            self.duration_seconds = duration_seconds

        self.save()

    def set_privacy(self, privacy_level):

        """تحديد مستوى خصوصية الفيديو (+ setPrivacy في مخطط الأصناف و FR-09)."""

        if privacy_level not in dict(GraduateProfile.VISIBILITY_CHOICES):

            from django.core.exceptions import ValidationError

            raise ValidationError(f'مستوى الخصوصية غير صالح: {privacy_level}')

        self.privacy_level = privacy_level

        self.save(update_fields=['privacy_level'])

        # مزامنة مع الملف المهني للخريج

        self.graduate.video_visibility = privacy_level

        self.graduate.save(update_fields=['video_visibility'])

    def setPrivacy(self, privacy_level):

        return self.set_privacy(privacy_level)

    def validate_file(self, file):

        """التحقق من صحة ملف الفيديو (+ validateFile في مخطط الأصناف الشكل 3-10)."""

        from .validators import validate_file

        return validate_file(file, max_size_mb=50)

    def validateFile(self, file):

        return self.validate_file(file)

    @property

    def video_id(self):

        """مطابقة اسم الحقل video_id في ERD ومخطط الأصناف."""

        return self.id

    @property

    def duration(self):

        """مطابقة اسم الحقل duration في ERD ومخطط الأصناف."""

        return self.duration_seconds

    @duration.setter

    def duration(self, value):

        self.duration_seconds = value

    @property

    def upload_date(self):

        """مطابقة اسم الحقل upload_date في ERD ومخطط الأصناف."""

        return self.uploaded_at

    def __str__(self):

        return f"VideoCV for {self.graduate.user.name}"

class Qualification(models.Model):

    """المؤهلات الأكاديمية للخريج (qualifications في ERD الجديد)."""

    DEGREE_CHOICES = (

        ('DIPLOMA', 'Diploma'),

        ('BACHELOR', 'Bachelor'),

        ('MASTER', 'Master'),

        ('DOCTORATE', 'Doctorate'),

    )

    graduate = models.ForeignKey(GraduateProfile, on_delete=models.CASCADE, related_name='qualifications')

    degree = models.CharField(max_length=50, choices=DEGREE_CHOICES, default='BACHELOR')

    major = models.ForeignKey(Major, on_delete=models.SET_NULL, null=True, blank=True, related_name='qualifications')

    university = models.CharField(max_length=100)

    graduation_year = models.IntegerField()

    gpa = models.DecimalField(

        max_digits=4, decimal_places=2, null=True, blank=True,

        validators=[MinValueValidator(Decimal('0.0')), MaxValueValidator(Decimal('5.0'))]

    )

    class Meta:

        ordering = ['-graduation_year', 'id']

    def __str__(self):

        return f"{self.graduate.user.name} - {self.degree} ({self.university})"

class Experience(models.Model):

    """الخبرات العملية السابقة للخريج (experiences في ERD الجديد)."""

    graduate = models.ForeignKey(GraduateProfile, on_delete=models.CASCADE, related_name='experiences')

    job_title = models.CharField(max_length=100)

    company_name = models.CharField(max_length=100)

    start_date = models.DateField()

    end_date = models.DateField(null=True, blank=True)

    description = models.TextField(blank=True, default='')

    class Meta:

        ordering = ['-start_date', 'id']

    def clean(self):

        if self.start_date and self.end_date and self.end_date < self.start_date:

            from django.core.exceptions import ValidationError

            raise ValidationError('تاريخ انتهاء الخبرة لا يمكن أن يكون قبل تاريخ البدء.')

    def save(self, *args, **kwargs):

        self.clean()

        super().save(*args, **kwargs)

    def __str__(self):

        return f"{self.job_title} at {self.company_name}"

class GraduateSkill(models.Model):

    LEVEL_CHOICES = (

        ('BEGINNER', 'Beginner'),

        ('INTERMEDIATE', 'Intermediate'),

        ('ADVANCED', 'Advanced'),

        ('EXPERT', 'Expert'),

    )

    profile = models.ForeignKey(GraduateProfile, on_delete=models.CASCADE, related_name='skills')

    skill = models.ForeignKey(Skill, on_delete=models.CASCADE)

    proficiency_level = models.CharField(max_length=20, choices=LEVEL_CHOICES, default='INTERMEDIATE')

    class Meta:
        unique_together = ('profile', 'skill')
        ordering = ['id']

    def update_level(self, level):

        """تحديث مستوى إتقان المهارة (+ updateLevel في مخطط الأصناف)."""

        if level not in dict(self.LEVEL_CHOICES):

            from django.core.exceptions import ValidationError

            raise ValidationError(f'مستوى غير صالح: {level}')

        self.proficiency_level = level

        self.save(update_fields=['proficiency_level'])

    @property

    def graduate_id(self):

        """مطابقة اسم الحقل graduate_id في ERD ومخطط الأصناف."""

        return self.profile_id

    @property

    def graduate(self):

        return self.profile

class Project(models.Model):
    class Meta:
        db_table = 'graduate_projects'

    profile = models.ForeignKey(GraduateProfile, on_delete=models.CASCADE, related_name='projects')

    title = models.CharField(max_length=200)

    description = models.TextField()

    technologies = models.CharField(max_length=255)

    project_url = models.URLField(blank=True, null=True)

    github_url = models.URLField(blank=True, null=True)

    image_url = models.URLField(blank=True, null=True)

    is_graduation_project = models.BooleanField(default=False)

    project_date = models.DateField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def update_details(self, title=None, description=None, technologies=None, project_url=None, github_url=None, image_url=None):

        """تحديث بيانات المشروع (+ updateDetails في مخطط الأصناف)."""

        if title: self.title = title

        if description: self.description = description

        if technologies: self.technologies = technologies

        if project_url: self.project_url = project_url

        if github_url: self.github_url = github_url

        if image_url: self.image_url = image_url

        self.save()

    def add_technology(self, tech_name):

        """إضافة تقنية للمشروع (+ addTechnology في مخطط الأصناف)."""

        techs = [t.strip() for t in (self.technologies or '').split(',') if t.strip()]

        if tech_name not in techs:

            techs.append(tech_name)

            self.technologies = ', '.join(techs)

            self.save(update_fields=['technologies'])

    @property

    def github_link(self):

        """مطابقة اسم الحقل githubLink في مخطط الأصناف (الشكل 3-4)."""

        return self.github_url

    @github_link.setter

    def github_link(self, value):

        self.github_url = value

    @property

    def project_id(self):

        """مطابقة اسم الحقل project_id في ERD ومخطط الأصناف."""

        return self.id

    @property

    def graduate(self):

        return self.profile

    @graduate.setter

    def graduate(self, value):

        self.profile = value

    def __str__(self) -> str:

        return str(self.title)

class CompanyManager(models.Manager):
    """مدير نموذج المنشأة مع دعم استيعاب أسماء الحقول البديلة عند الإنشاء فقط."""
    def create(self, **kwargs):
        if 'registration_number' in kwargs and 'commercial_reg' not in kwargs:
            kwargs['commercial_reg'] = kwargs.pop('registration_number')
        if 'sector' in kwargs and 'industry' not in kwargs:
            kwargs['industry'] = kwargs.pop('sector')
        if 'address' in kwargs and 'location' not in kwargs:
            kwargs['location'] = kwargs.pop('address')
        if 'logo' in kwargs and 'logo_url' not in kwargs:
            kwargs['logo_url'] = kwargs.pop('logo')
        return super().create(**kwargs)

class Company(models.Model):
    class Meta:
        db_table = 'companies'

    STATUS_CHOICES = (

        ('PENDING', 'Pending'),

        ('APPROVED', 'Approved'),

        ('REJECTED', 'Rejected'),

    )

    user = models.OneToOneField(

        settings.AUTH_USER_MODEL,

        on_delete=models.CASCADE,

        related_name='company_profile'

    )

    company_name = models.CharField(max_length=200)

    # حقول مطابقة لمخطط ERD الرسمي (الشكل 3-10)

    commercial_reg = models.CharField(max_length=50, blank=True, default='')

    industry = models.CharField(max_length=150, blank=True, default='')

    location = models.CharField(max_length=150, blank=True, default='')

    website = models.URLField(blank=True, null=True)

    logo_url = models.URLField(blank=True, null=True)

    description = models.TextField(blank=True, default='')

    company_size = models.CharField(max_length=30, blank=True, default='')
    cr_document_url = models.URLField(blank=True, null=True, verbose_name='رابط وثيقة السجل التجاري المرفقة')

    verification_status = models.CharField(

        max_length=20, choices=STATUS_CHOICES, default='PENDING'

    )

    verified_by = models.ForeignKey(

        settings.AUTH_USER_MODEL,

        on_delete=models.SET_NULL,

        null=True,

        blank=True,

        related_name='verified_companies'

    )

    verified_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True, default='', verbose_name='سبب الرفض والملاحظات التوجيهية')

    objects = CompanyManager()

    def __init__(self, *args, **kwargs):
        reg = kwargs.pop('registration_number', None)
        if reg and 'commercial_reg' not in kwargs:
            kwargs['commercial_reg'] = reg
        sec = kwargs.pop('sector', None)
        if sec and 'industry' not in kwargs:
            kwargs['industry'] = sec
        addr = kwargs.pop('address', None)
        if addr and 'location' not in kwargs:
            kwargs['location'] = addr
        super().__init__(*args, **kwargs)

    # خواص التوافق العكسي الذكية (Smart Properties) لضمان التوافق التام مع الـ APIs والفرونت إند

    @property

    def registration_number(self):

        return self.commercial_reg

    @registration_number.setter

    def registration_number(self, value):

        self.commercial_reg = value or ''

    @property

    def sector(self):

        return self.industry

    @sector.setter

    def sector(self, value):

        self.industry = value or ''

    @property

    def address(self):

        return self.location

    @address.setter

    def address(self, value):

        self.location = value or ''

    @property

    def logo(self):

        return self.logo_url

    @logo.setter

    def logo(self, value):

        self.logo_url = value

    @property

    def is_verified(self):

        """مطابقة خاصية isVerified في مخطط الأصناف (الشكل 3-4)."""

        return self.verification_status == 'APPROVED'

    @property

    def company_id(self):

        """مطابقة اسم الحقل company_id في ERD ومخطط الأصناف."""

        return self.id

    ALLOWED_UPDATE_FIELDS = (
        'company_name', 'commercial_reg', 'industry', 'location',
        'website', 'bio', 'description', 'contact_email', 'phone',
        'logo_url', 'cr_document_url', 'established_year', 'company_size',
    )

    def update_company_profile(self, **kwargs):
        """
        تحديث بيانات الشركة (+ updateCompanyProfile في مخطط الأصناف).
        مقيد بقائمة بيضاء صارمة تستثني حقول التحقق الحساسة (verification_status, verified_by, id, user).
        """
        translated = _translate_company_kwargs(kwargs)
        updated = []
        for key, value in translated.items():
            if key in self.ALLOWED_UPDATE_FIELDS and hasattr(self, key):
                setattr(self, key, value)
                updated.append(key)
        if updated:
            self.save(update_fields=list(set(updated)))

    def updateCompanyProfile(self, **kwargs):

        return self.update_company_profile(**kwargs)

    def submit_for_verification(self, commercial_reg=None):

        """إرسال بيانات الشركة للتحقق والاعتماد (+ submitForVerification / submitVerification في مخطط الأصناف و FR-23)."""

        if commercial_reg:

            self.commercial_reg = commercial_reg

        reg = self.commercial_reg

        if not reg or not self.description:

            from django.core.exceptions import ValidationError

            raise ValidationError('يجب إكمال بيانات السجل التجاري ووصف الشركة قبل تقديم طلب التحقق.')

        self.verification_status = 'PENDING'

        self.save(update_fields=['commercial_reg', 'verification_status'])

    def submitForVerification(self, commercial_reg=None):

        return self.submit_for_verification(commercial_reg)

    def submitVerification(self, commercial_reg=None):

        return self.submit_for_verification(commercial_reg)

    def publish_job(self, job):

        """نشر وظيفة جديدة (+ publishJob في مخطط الأصناف)."""

        if self.verification_status != 'APPROVED':

            from django.core.exceptions import ValidationError

            raise ValidationError('لا يمكن نشر الوظائف قبل اعتماد حساب الشركة من الإدارة.')

        job.company = self

        job.status = 'OPEN'

        job.save()

        return job

    def publishJob(self, job):

        return self.publish_job(job)

    def post_job(self, title, description, **kwargs):

        """نشر وظيفة جديدة (+ postJob في مخطط الأصناف الشكل 3-4 و FR-10)."""

        from jobs.models import Job

        job = Job(title=title, description=description, **kwargs)

        return self.publish_job(job)

    def postJob(self, title, description, **kwargs):

        return self.post_job(title, description, **kwargs)

    def define_requirements(self, job, skills_data):

        """تحديد متطلبات الوظيفة من مهارات (+ defineRequirements في مخطط الأصناف الشكل 3-4 و FR-11)."""

        from jobs.models import JobSkill

        created = []

        for item in skills_data:

            skill = item.get('skill')

            weight = float(item.get('weight', 1.0))

            is_req = item.get('is_required', True)

            req_lvl = item.get('required_level', 'INTERMEDIATE')

            js, _ = JobSkill.objects.update_or_create(

                job=job, skill=skill,

                defaults={'weight': weight, 'is_required': is_req, 'required_level': req_lvl}

            )

            created.append(js)

        return created

    def defineRequirements(self, job, skills_data):

        return self.define_requirements(job, skills_data)

    def review_applications(self, job=None):

        """مراجعة طلبات التوظيف المقدمة (+ reviewApplications في مخطط الأصناف الشكل 3-4 و FR-14)."""

        from jobs.models import Application

        qs = Application.objects.filter(job__company=self)

        if job:

            qs = qs.filter(job=job)

        return qs.select_related('profile', 'matching_result')

    def reviewApplications(self, job=None):

        return self.review_applications(job)

    def __str__(self) -> str:

        return str(self.company_name)

