from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Notification
from .serializers import NotificationSerializer


class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Notification.objects.filter(user=self.request.user).order_by("-created_at")
        if self.request.query_params.get("unread") == "true":
            qs = qs.filter(is_read=False)
        return qs


class MarkNotificationAsReadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        notification = get_object_or_404(Notification, pk=pk, user=request.user)
        notification.is_read = True
        notification.save(update_fields=["is_read"])
        return Response(
            {"message": "تم تحديد الإشعار كمقروء بنجاح."}, status=status.HTTP_200_OK
        )


class MarkAllNotificationsAsReadView(APIView):
    """تحديد جميع إشعارات المستخدم الحالي كمقروءة بنقرة واحدة (FR-22)."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        count = Notification.objects.filter(user=request.user, is_read=False).update(
            is_read=True
        )
        return Response(
            {
                "message": f"تم تحديد {count} إشعار كمقروء بنجاح.",
                "updated_count": count,
            },
            status=status.HTTP_200_OK,
        )


class UnreadNotificationCountView(APIView):
    """جلب عدد الإشعارات غير المقروءة لعرض شارة العداد في الواجهة (FR-22)."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        count = Notification.objects.filter(user=request.user, is_read=False).count()
        return Response({"count": count, "unread_count": count}, status=status.HTTP_200_OK)
