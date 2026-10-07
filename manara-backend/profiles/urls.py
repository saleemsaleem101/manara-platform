from django.urls import path
from .views import GraduateProfileView

urlpatterns = [
    path('graduate/me/', GraduateProfileView.as_view(), name='graduate-profile-me'),
]
