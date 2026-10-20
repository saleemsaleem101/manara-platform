from django.db import models
from accounts.models import User
from jobs.models import Job
from django.db.models.signals import post_save
from django.dispatch import receiver


class Administrator(User):
    """
    نموذج مدير النظام بنمط الوكيل (Proxy Model) المتوافق مع مخطط الأصناف (الشكل 3-10).
    يرث مباشرة من نموذج User(role=ADMIN) دون جدول إضافي أو إشارات غير ضرورية.
    """

    class Meta:
        proxy = True
        verbose_name = 'مدير النظام'
        verbose_name_plural = 'مدراء النظام'

    @property
    def admin_id(self):
        return self.id

    def manageUsers(self):
        return User.objects.all()

    def manageJobs(self):
        return Job.objects.all()

    def generateReports(self):
        return {
            'total_users': User.objects.count(),
            'total_jobs': Job.objects.count(),
        }

    def __str__(self):
        return f"Administrator: {self.name}"

