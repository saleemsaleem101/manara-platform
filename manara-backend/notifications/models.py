from django.db import models  # type: ignore
from django.conf import settings  # type: ignore

class Notification(models.Model):
    TYPE_CHOICES = (
        ('NEW_APPLICATION', 'New Application'),
        ('STATUS_UPDATE', 'Status Update'),
        ('COMPANY_VERIFIED', 'Company Verified'),
        ('SYSTEM', 'System'),
    )
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    related_application = models.ForeignKey(
        'jobs.Application',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_column='related_application_id',
        related_name='notifications'
    )
    type = models.CharField(max_length=30, choices=TYPE_CHOICES)
    title = models.CharField(max_length=200)
    message = models.TextField()
    is_read: bool = models.BooleanField(default=False)  # type: ignore
    created_at = models.DateTimeField(auto_now_add=True)

    @property
    def notification_id(self):
        """مطابقة اسم الحقل notification_id في ERD ومخطط الأصناف."""
        return self.id

    def mark_as_read(self):
        """تحديد الإشعار كمقروء (+ markAsRead في مخطط الأصناف)."""
        self.is_read = True  # type: ignore
        self.save(update_fields=['is_read'])

    def get_type(self):
        """إعادة نوع الإشعار (+ getType في مخطط الأصناف)."""
        return self.type

    @classmethod
    def send(cls, user, message, title='إشعار جديد', notif_type='SYSTEM', related_app_id=None):
        """إرسال إشعار جديد (+ send في مخطط الأصناف الشكل 3-4 و FR-22)."""
        from notifications.services import create_notification
        return create_notification(
            user=user,
            notif_type=notif_type,
            title=title,
            message=message,
            related_app_id=related_app_id
        )

    def __str__(self):
        return f"{self.user.name} - {self.title}"