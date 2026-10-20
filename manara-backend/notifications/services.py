from .models import Notification

def create_notification(user, notif_type, title, message, related_app_id=None):
    return Notification.objects.create(
        user=user,
        type=notif_type,
        title=title,
        message=message,
        related_application_id=related_app_id
    )