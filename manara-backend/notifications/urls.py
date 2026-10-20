from django.urls import path
from .views import (
    NotificationListView,
    MarkNotificationAsReadView,
    MarkAllNotificationsAsReadView,
    UnreadNotificationCountView,
)

urlpatterns = [
    path('', NotificationListView.as_view(), name='notification-list'),
    path('<int:pk>/read/', MarkNotificationAsReadView.as_view(), name='notification-read'),
    path('mark-all-read/', MarkAllNotificationsAsReadView.as_view(), name='notification-mark-all-read'),
    path('unread-count/', UnreadNotificationCountView.as_view(), name='notification-unread-count'),
]