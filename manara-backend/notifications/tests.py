from django.test import TestCase
from rest_framework.test import APIClient
from accounts.models import User
from notifications.models import Notification
from notifications.services import create_notification


class NotificationFeaturesTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='notif_test@example.com',
            name='Notification User',
            role='GRADUATE',
            password='password123'
        )
        self.client.force_authenticate(user=self.user)

        # إنشاء 3 إشعارات غير مقروءة
        create_notification(self.user, 'SYSTEM', 'Welcome', 'Welcome to Manara')
        create_notification(self.user, 'STATUS_UPDATE', 'Update', 'Your application is updated')
        create_notification(self.user, 'STATUS_UPDATE', 'Update 2', 'Another update')

    def test_unread_count(self):
        resp = self.client.get('/api/notifications/unread-count/')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data['unread_count'], 3)

    def test_mark_all_as_read(self):
        resp = self.client.post('/api/notifications/mark-all-read/')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data['updated_count'], 3)

        # التحقق من أن عدد غير المقروء أصبح 0
        count_resp = self.client.get('/api/notifications/unread-count/')
        self.assertEqual(count_resp.data['unread_count'], 0)

    def test_unread_filter_in_list(self):
        # نقرأ أول إشعار
        n = Notification.objects.filter(user=self.user).first()
        n.is_read = True
        n.save()
        # الآن لدينا 2 غير مقروء و 1 مقروء
        resp = self.client.get('/api/notifications/?unread=true')
        self.assertEqual(resp.status_code, 200)
        results = resp.data.get('results', resp.data)
        self.assertEqual(len(results), 2)

