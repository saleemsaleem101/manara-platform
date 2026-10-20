from django.db import models
from jobs.models import Application

class MatchingResult(models.Model):
    """
    نموذج نتيجة المطابقة الذكية (MATCH_RESULTS في مخطط ERD الشكل 3-10 و Class Diagram)
    Score = ws*Ss + wm*Sm + we*Se + wq*Sq
    """
    application = models.OneToOneField(
        Application,
        on_delete=models.SET_NULL,
        related_name='matching_result',
        null=True,
        blank=True
    )
    job = models.ForeignKey(
        'jobs.Job',
        on_delete=models.SET_NULL,
        related_name='matching_results',
        null=True,
        blank=True
    )
    graduate = models.ForeignKey(
        'profiles.GraduateProfile',
        on_delete=models.SET_NULL,
        related_name='matching_results',
        null=True,
        blank=True
    )
    skills_score = models.FloatField(default=0.0)
    specialization_score = models.FloatField(default=0.0)
    experience_score = models.FloatField(default=0.0)
    qualification_score = models.FloatField(default=0.0)
    final_score = models.FloatField(default=0.0)
    calculated_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'match_results'
        ordering = ['-final_score', '-calculated_at']
        constraints = [
            models.UniqueConstraint(
                fields=['job', 'graduate'],
                condition=models.Q(application__isnull=True),
                name='unique_direct_job_graduate_match'
            )
        ]

    def save(self, *args, **kwargs):
        # المزامنة التلقائية مع حقول الوظيفة والخريج من الطلب إذا كان موجوداً
        if self.application:
            if not self.job_id and hasattr(self.application, 'job_id'):
                self.job_id = self.application.job_id
            if not self.graduate_id and hasattr(self.application, 'profile_id'):
                self.graduate_id = self.application.profile_id
        super().save(*args, **kwargs)

    # --- خصائص متوافقة 100% مع مخطط ERD ومخطط الأصناف (Class Diagram) ---
    @property
    def result_id(self):
        return self.id

    @property
    def score(self):
        return self.final_score

    @score.setter
    def score(self, value):
        self.final_score = value

    @property
    def skill_score(self):
        return self.skills_score

    @skill_score.setter
    def skill_score(self, value):
        self.skills_score = value

    @property
    def major_score(self):
        return self.specialization_score

    @major_score.setter
    def major_score(self, value):
        self.specialization_score = value

    @property
    def exp_score(self):
        return self.experience_score

    @exp_score.setter
    def exp_score(self, value):
        self.experience_score = value

    @property
    def match_date(self):
        return self.calculated_at

    @property
    def total_score(self):
        return self.final_score

    # --- دوال مخطط الأصناف (Class Diagram Methods) ---
    def get_final_score(self):
        """إعادة الدرجة النهائية للمطابقة (+ getFinalScore في مخطط الأصناف)."""
        return self.final_score

    def getFinalScore(self):
        return self.get_final_score()

    def get_score_breakdown(self):
        """إعادة تفصيل درجات المعايير الأربعة (+ getScoreBreakdown في مخطط الأصناف)."""
        return {
            'skills_score': self.skills_score,
            'specialization_score': self.specialization_score,
            'experience_score': self.experience_score,
            'qualification_score': self.qualification_score,
            'final_score': self.final_score,
            'skill_score': self.skills_score,
            'major_score': self.specialization_score,
            'exp_score': self.experience_score,
            'score': self.final_score,
        }

    def getScoreBreakdown(self):
        return self.get_score_breakdown()

    def is_eligible(self, threshold=None):
        """التحقق من تجاوز الحد الأدنى لدرجة التوافق (+ isEligible في مخطط الأصناف و FR-18)."""
        if threshold is None:
            threshold = getattr(self.job, 'min_score', 0.0) if self.job else 0.0
        return self.final_score >= (threshold or 0.0)

    def isEligible(self, threshold=None):
        return self.is_eligible(threshold)

    @classmethod
    def calculate_match(cls, graduate, job):
        """حساب المطابقة المباشرة بين خريج ووظيفة (+ calculateMatch في مخطط الأصناف)."""
        from .services import MatchingService
        return MatchingService.calculate_graduate_job_match(graduate, job)

    @classmethod
    def calculateMatch(cls, graduate, job):
        return cls.calculate_match(graduate, job)

    def __str__(self):
        app_info = f"App #{self.application_id}" if self.application_id else f"Job #{self.job_id} & Grad #{self.graduate_id}"
        return f"Match for {app_info}: {self.final_score * 100:.1f}%"