from django.db import models, transaction
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError
from decimal import Decimal
from profiles.models import Company, GraduateProfile, Skill


JOB_FIELD_MAP = {
    'specialization_required': 'required_major',
    'minimum_experience_years': 'required_exp',
    'qualification_required': 'required_qualification',
    'closing_date': 'deadline',
    'posted_date': 'created_at',
    'weight_skills': 'skills_weight',
    'weight_major': 'specialization_weight',
    'weight_experience': 'experience_weight',
    'weight_qualification': 'qualification_weight',
    'min_score': 'minimum_match_score',
    'job_id': 'id',
}


def _translate_job_kwargs(kwargs):
    translated = {}
    for k, v in kwargs.items():
        parts = k.split('__', 1)
        base = parts[0]
        suffix = '__' + parts[1] if len(parts) > 1 else ''
        new_base = JOB_FIELD_MAP.get(base, base)
        if new_base == 'required_exp' and isinstance(v, (Decimal, float)):
            v = int(v)
        if new_base == 'deadline' and hasattr(v, 'date') and callable(v.date):
            v = v.date()
        translated[new_base + suffix] = v
    return translated


def _translate_q_arg(arg):
    from django.db.models import Q
    import copy
    if isinstance(arg, Q):
        new_children = []
        for child in arg.children:
            if isinstance(child, tuple):
                k, v = child
                parts = k.split('__', 1)
                base = parts[0]
                suffix = '__' + parts[1] if len(parts) > 1 else ''
                new_base = JOB_FIELD_MAP.get(base, base)
                if new_base == 'required_exp' and isinstance(v, (Decimal, float)):
                    v = int(v)
                if new_base == 'deadline' and hasattr(v, 'date') and callable(v.date):
                    v = v.date()
                new_children.append((new_base + suffix, v))
            elif isinstance(child, Q):
                new_children.append(_translate_q_arg(child))
            else:
                new_children.append(child)
        new_q = copy.copy(arg)
        new_q.children = new_children
        return new_q
    return arg


def _translate_job_ordering(fields):
    new_fields = []
    for f in fields:
        prefix = '-' if f.startswith('-') else ''
        base = f.lstrip('-')
        new_base = JOB_FIELD_MAP.get(base, base)
        new_fields.append(prefix + new_base)
    return new_fields


class JobQuerySet(models.QuerySet):
    def filter(self, *args, **kwargs):
        new_args = [_translate_q_arg(a) for a in args]
        return super().filter(*new_args, **_translate_job_kwargs(kwargs))

    def exclude(self, *args, **kwargs):
        new_args = [_translate_q_arg(a) for a in args]
        return super().exclude(*new_args, **_translate_job_kwargs(kwargs))

    def order_by(self, *field_names):
        return super().order_by(*_translate_job_ordering(field_names))

    def update(self, **kwargs):
        return super().update(**_translate_job_kwargs(kwargs))

    def values(self, *fields, **expressions):
        new_fields = [JOB_FIELD_MAP.get(f, f) for f in fields]
        return super().values(*new_fields, **_translate_job_kwargs(expressions))

    def values_list(self, *fields, **kwargs):
        new_fields = [JOB_FIELD_MAP.get(f, f) for f in fields]
        return super().values_list(*new_fields, **kwargs)


class JobManager(models.Manager.from_queryset(JobQuerySet)):
    def create(self, **kwargs):
        return super().create(**_translate_job_kwargs(kwargs))


class Job(models.Model):
    STATUS_CHOICES = (
        ('DRAFT', 'Draft'),
        ('OPEN', 'Open'),
        ('CLOSED', 'Closed'),
        ('HIDDEN', 'Hidden'),
    )
    QUALIFICATION_CHOICES = (
        ('DIPLOMA', 'Diploma'),
        ('BACHELOR', 'Bachelor'),
        ('MASTER', 'Master'),
        ('DOCTORATE', 'Doctorate'),
    )
    company = models.ForeignKey(Company, on_delete=models.PROTECT, related_name='jobs')
    title = models.CharField(max_length=200)
    description = models.TextField()
    requirements = models.TextField(blank=True, default='')

    # حقول مطابقة لمخطط ERD الرسمي 100% (الشكل 3-10)
    required_major = models.CharField(max_length=150, blank=True, default='')
    required_exp = models.IntegerField(default=0)
    required_qualification = models.CharField(max_length=50, blank=True, default='BACHELOR')

    # حقول تنظيمية محايدة
    major = models.ForeignKey('profiles.Major', on_delete=models.SET_NULL, null=True, blank=True, related_name='jobs')
    location = models.CharField(max_length=100, blank=True, default='')
    job_type = models.CharField(max_length=30, blank=True, default='FULL_TIME')
    deadline = models.DateField(null=True, blank=True)

    # أوزان المطابقة والحد الأدنى — وفق وثيقة المتطلبات الرسمية (الفقرة 593: ∑w = 1.0)
    skills_weight = models.FloatField(
        default=0.45, validators=[MinValueValidator(0.0), MaxValueValidator(1.0)]
    )
    specialization_weight = models.FloatField(
        default=0.25, validators=[MinValueValidator(0.0), MaxValueValidator(1.0)]
    )
    experience_weight = models.FloatField(
        default=0.20, validators=[MinValueValidator(0.0), MaxValueValidator(1.0)]
    )
    qualification_weight = models.FloatField(
        default=0.10, validators=[MinValueValidator(0.0), MaxValueValidator(1.0)]
    )
    minimum_match_score = models.FloatField(
        default=0.60, validators=[MinValueValidator(0.0), MaxValueValidator(1.0)]
    )

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='OPEN')
    created_at = models.DateTimeField(auto_now_add=True)

    objects = JobManager()

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **_translate_job_kwargs(kwargs))

    # خواص التوافق العكسي الذكية (Smart Properties) لضمان عدم كسر الفرونت إند والـ APIs
    @property
    def specialization_required(self):
        return self.required_major

    @specialization_required.setter
    def specialization_required(self, value):
        self.required_major = value or ''

    @property
    def minimum_experience_years(self):
        return Decimal(str(self.required_exp))

    @minimum_experience_years.setter
    def minimum_experience_years(self, value):
        try:
            self.required_exp = int(Decimal(str(value)))
        except (ValueError, TypeError, Exception):
            self.required_exp = 0

    @property
    def qualification_required(self):
        return self.required_qualification

    @qualification_required.setter
    def qualification_required(self, value):
        self.required_qualification = value or 'BACHELOR'

    @property
    def closing_date(self):
        return self.deadline

    @closing_date.setter
    def closing_date(self, value):
        if hasattr(value, 'date') and callable(value.date):
            value = value.date()
        self.deadline = value

    @property
    def job_id(self):
        return self.id

    # دوال مخطط الأصناف (Class Diagram: createJob / updateJob)
    @classmethod
    def createJob(cls, **kwargs):
        """إنشاء وظيفة جديدة (+ createJob في مخطط الأصناف الشكل 3-10)."""
        return cls.objects.create(**kwargs)

    @classmethod
    def create(cls, **kwargs):
        return cls.objects.create(**kwargs)

    def updateJob(self, **kwargs):
        """تحديث بيانات الوظيفة (+ updateJob في مخطط الأصناف الشكل 3-10)."""
        translated = _translate_job_kwargs(kwargs)
        for key, val in translated.items():
            setattr(self, key, val)
        self.clean()
        self.save()
        return self

    def update(self, **kwargs):
        return self.updateJob(**kwargs)

    def clean(self):
        """التحقق من أن مجموع الأوزان الأربعة = 1.0 (FR-18: ∑w = 1)."""
        total = (
            (self.skills_weight or 0) +
            (self.specialization_weight or 0) +
            (self.experience_weight or 0) +
            (self.qualification_weight or 0)
        )
        if abs(total - 1.0) > 0.001:
            raise ValidationError(
                f'مجموع أوزان المطابقة يجب أن يساوي 1.0 تماماً. المجموع الحالي: {total:.3f}'
            )

    def save(self, *args, **kwargs):
        self.clean()
        if self.major and not self.required_major:
            self.required_major = self.major.major_name
        super().save(*args, **kwargs)

    def open_job(self):
        """فتح الوظيفة لاستقبال طلبات التقديم (+ openJob في مخطط الأصناف)."""
        self.status = 'OPEN'
        self.save(update_fields=['status'])

    def close_job(self):
        """إغلاق الوظيفة (+ closeJob في مخطط الأصناف)."""
        self.status = 'CLOSED'
        self.save(update_fields=['status'])

    def add_required_skill(self, skill, required_level='INTERMEDIATE', weight=1.0, is_required=True):
        """إضافة مهارة مطلوبة للوظيفة (+ addRequiredSkill في مخطط الأصناف و FR-11)."""
        return JobSkill.objects.update_or_create(
            job=self, skill=skill,
            defaults={'required_level': required_level, 'weight': weight, 'is_required': is_required}
        )[0]

    def set_matching_weights(self, skills_w, spec_w, exp_w, qual_w, min_score=None):
        """تحديد أوزان المطابقة والتحقق منها (+ setMatchingWeights في مخطط الأصناف و FR-18)."""
        self.skills_weight = float(skills_w)
        self.specialization_weight = float(spec_w)
        self.experience_weight = float(exp_w)
        self.qualification_weight = float(qual_w)
        if min_score is not None:
            self.minimum_match_score = float(min_score)
        self.clean()
        self.save()
        return True

    def set_weights(self, ws, wm, we, wq, min_score=None):
        """مطابقة دالة مخطط الأصناف Class Diagram: setWeights."""
        return self.set_matching_weights(ws, wm, we, wq, min_score=min_score)

    # خواص التوافق المباشر مع أسماء حقول ERD (الشكل 3-10)
    @property
    def weight_skills(self):
        return self.skills_weight

    @weight_skills.setter
    def weight_skills(self, value):
        self.skills_weight = value

    @property
    def weight_major(self):
        return self.specialization_weight

    @weight_major.setter
    def weight_major(self, value):
        self.specialization_weight = value

    @property
    def weight_experience(self):
        return self.experience_weight

    @weight_experience.setter
    def weight_experience(self, value):
        self.experience_weight = value

    @property
    def weight_qualification(self):
        return self.qualification_weight

    @weight_qualification.setter
    def weight_qualification(self, value):
        self.qualification_weight = value

    @property
    def min_score(self):
        return self.minimum_match_score

    @min_score.setter
    def min_score(self, value):
        self.minimum_match_score = value

    @property
    def min_match_score(self):
        return self.minimum_match_score

    @min_match_score.setter
    def min_match_score(self, value):
        self.minimum_match_score = value

    @property
    def posted_date(self):
        return self.created_at

    @property
    def posted_at(self):
        return self.created_at

    def __str__(self):
        return f"{self.title} - {self.company.company_name}"


class JobSkill(models.Model):
    LEVEL_CHOICES = (
        ('BEGINNER', 'Beginner'),
        ('INTERMEDIATE', 'Intermediate'),
        ('ADVANCED', 'Advanced'),
        ('EXPERT', 'Expert'),
    )
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='required_skills')
    skill = models.ForeignKey(Skill, on_delete=models.PROTECT)
    is_required = models.BooleanField(default=True)
    required_level = models.CharField(max_length=20, choices=LEVEL_CHOICES, default='INTERMEDIATE')
    weight = models.FloatField(default=1.0, validators=[MinValueValidator(0.01), MaxValueValidator(10.0)])

    class Meta:
        unique_together = ('job', 'skill')

    def update_requirement(self, level=None, weight=None, is_required=None):
        """تحديث متطلب المهارة (+ updateRequirement في مخطط الأصناف)."""
        if level:
            if level not in dict(self.LEVEL_CHOICES):
                raise ValidationError(f'مستوى غير صالح: {level}')
            self.required_level = level
        if weight is not None:
            self.weight = weight
        if is_required is not None:
            self.is_required = is_required
        self.save()

    def __str__(self):
        return f"{self.job.title} -> {self.skill.name}"


class Application(models.Model):
    STATUS_CHOICES = (
        ('SUBMITTED', 'Submitted'),
        ('UNDER_REVIEW', 'Under Review'),
        ('ACCEPTED', 'Accepted'),
        ('REJECTED', 'Rejected'),
        ('WITHDRAWN', 'Withdrawn'),
    )
    job = models.ForeignKey(Job, on_delete=models.PROTECT, related_name='applications')
    profile = models.ForeignKey(GraduateProfile, on_delete=models.PROTECT, related_name='applications')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='SUBMITTED')
    match_score = models.FloatField(null=True, blank=True)
    applied_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('job', 'profile')

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        with transaction.atomic():
            super().save(*args, **kwargs)
            if is_new:
                # تسجيل الحالة الأولية في سجل التغيير تلقائياً وموحداً (FR-29)
                user = None
                if hasattr(self, 'profile') and hasattr(self.profile, 'user'):
                    user = self.profile.user
                ApplicationStatusHistory.objects.create(
                    application=self,
                    previous_status='NONE',
                    new_status=self.status or 'SUBMITTED',
                    changed_by=user
                )

    @property
    def apply_date(self):
        """مطابقة اسم الحقل apply_date في مخطط ERD (الشكل 3-10)."""
        return self.applied_at

    def submit(self, changed_by=None):
        """تقديم الطلب (+ submit في مخطط الأصناف)."""
        old_status = self.status
        self.status = 'SUBMITTED'
        self.save(update_fields=['status', 'updated_at'])
        if old_status != 'SUBMITTED':
            ApplicationStatusHistory.objects.create(
                application=self,
                previous_status=old_status,
                new_status='SUBMITTED',
                changed_by=changed_by
            )
        return self

    def update_status(self, new_status, changed_by=None):
        """
        تحديث حالة الطلب وتوثيق سجل التغيير (FR-14 + FR-29 + Class Diagram: updateStatus).
        يحفظ السجل التاريخي فوراً متضمناً الحالة السابقة والحالة الجديدة وتاريخ التحديث.
        """
        if self.status == 'WITHDRAWN':
            raise ValidationError('لا يمكن تعديل حالة طلب تم سحبه من قبل الخريج.')
        if new_status not in dict(self.STATUS_CHOICES):
            raise ValidationError(f'الحالة غير صالحة: {new_status}')

        old_status = self.status
        if old_status != new_status:
            self.status = new_status
            self.save(update_fields=['status', 'updated_at'])
            # حفظ سجل تغير الحالة تاريخياً (FR-29 + مخطط التسلسل 3-9 ومخطط النشاط 8-3)
            ApplicationStatusHistory.objects.create(
                application=self,
                previous_status=old_status,
                new_status=new_status,
                changed_by=changed_by
            )
        return self

    def withdraw(self, changed_by=None):
        """سحب الطلب (FR-13 + Class Diagram: withdraw(): void)."""
        if self.status == 'WITHDRAWN':
            raise ValidationError('تم سحب هذا الطلب مسبقاً.')
        if self.status in ('ACCEPTED', 'REJECTED'):
            raise ValidationError(
                f'لا يمكن سحب الطلب بعد أن أصبحت حالته "{self.status}".'
            )
        old_status = self.status
        self.status = 'WITHDRAWN'
        self.save(update_fields=['status', 'updated_at'])
        ApplicationStatusHistory.objects.create(
            application=self,
            previous_status=old_status,
            new_status='WITHDRAWN',
            changed_by=changed_by
        )
        return self

    def __str__(self):
        return f"App: {self.profile.user.name} -> {self.job.title}"


class ApplicationStatusHistory(models.Model):
    """
    سجل تغير حالة طلب التوظيف (FR-29 + مخطط التسلسل الشكل 3-9 ومخطط النشاط الشكل 8-3).
    يحتفظ بتاريخ الحالة السابقة والحالة الجديدة وتاريخ التحديث والمسؤول عن التغيير.
    """
    history_id = models.AutoField(primary_key=True)
    application = models.ForeignKey(
        Application,
        on_delete=models.PROTECT,
        related_name='status_history',
        db_column='application_id'
    )
    previous_status = models.CharField(max_length=20)
    new_status = models.CharField(max_length=20)
    changed_at = models.DateTimeField(auto_now_add=True)
    changed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='status_changes_made'
    )

    class Meta:
        db_table = 'application_status_history'
        ordering = ['-changed_at', '-history_id']
        verbose_name = 'سجل حالة الطلب'
        verbose_name_plural = 'سجلات حالات الطلبات'

    def __str__(self):
        return f"App #{self.application_id}: {self.previous_status} -> {self.new_status} at {self.changed_at}"
