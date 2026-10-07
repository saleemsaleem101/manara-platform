from django.db import models
from django.conf import settings
from django.utils import timezone


class GraduateProfile(models.Model):
    """
    نموذج الملف المهني الأساسي للخريج (GRADUATE_PROFILES في مخطط ERD).
    مخصص لسبرنت 1 (الواجهات 4 و 5: استكمال وعرض البيانات الأساسية للخريج).
    مهام: MNRA-63 (عبدالرزاق), MNRA-64, MNRA-65, MNRA-73 (سليم).
    """
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='graduate_profile',
        verbose_name='المستخدم'
    )
    
    # 1. البيانات الشخصية ومعلومات الاتصال
    first_name = models.CharField(max_length=100, blank=True, default='', verbose_name='الاسم الأول')
    last_name = models.CharField(max_length=100, blank=True, default='', verbose_name='اللقب')
    phone = models.CharField(max_length=30, blank=True, default='', verbose_name='رقم الهاتف / واتساب')
    city = models.CharField(max_length=100, blank=True, default='اليمن - صنعاء', verbose_name='المدينة والإقامة الحالية')

    # 2. المؤهل الأكاديمي والجامعة
    university = models.CharField(max_length=150, blank=True, default='جامعة العلوم والتكنولوجيا', verbose_name='الجامعة')
    specialization = models.CharField(max_length=150, blank=True, default='هندسة البرمجيات', verbose_name='التخصص الأكاديمي')
    graduation_year = models.IntegerField(null=True, blank=True, default=2026, verbose_name='سنة التخرج')
    gpa = models.CharField(max_length=50, blank=True, default='92% (ممتاز مع مرتبة الشرف)', verbose_name='المعدل التراكمي')
    years_of_experience = models.CharField(max_length=50, blank=True, default='حديث التخرج (0 - 1 سنة)', verbose_name='سنوات الخبرة المهنية')

    # 3. النبذة التعريفية والهدف الوظيفي
    bio = models.TextField(
        blank=True,
        default='مهندس برمجيات خريج جامعة العلوم والتكنولوجيا لعام 2026 بمعدل ممتاز (92%). متخصص في بناء وتطوير تطبيقات الويب الحديثة وحلول الأعمال الرقمية، أمتلك شغفاً كبيراً بالابتكار البرمجي والعمل الجماعي ضمن بيئات تقنية رائدة تسعى لتمكين الشباب وإحداث أثر حقيقي في سوق العمل.\nأجيد تحليل متطلبات الأنظمة، هندسة قواعد البيانات، وتطوير الواجهات المعتمدة على أحدث المعايير البرمجية.',
        verbose_name='النبذة التعريفية والهدف الوظيفي'
    )

    created_at = models.DateTimeField(default=timezone.now, blank=True, null=True, verbose_name='تاريخ الإنشاء')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='تاريخ آخر تحديث')

    class Meta:
        db_table = 'graduate_profiles'
        verbose_name = 'الملف المهني للخريج'
        verbose_name_plural = 'ملفات الخريجين'

    @property
    def full_name(self) -> str:
        if self.first_name or self.last_name:
            return f"{self.first_name} {self.last_name}".strip()
        return self.user.name

    def update_profile(self, **kwargs) -> None:
        """تحديث بيانات الملف المهني الأساسي."""
        for key, value in kwargs.items():
            if hasattr(self, key):
                setattr(self, key, value)
        self.save()

    def __str__(self) -> str:
        return f"{self.full_name} ({self.user.email})"
