from django.urls import path
from .views import (
    UserListView,
    UserDetailView,
    CompanyListAdminView,
    CompanyVerifyView,
    JobAdminListView,
    JobAdminDetailView,
    DashboardStatsView,
    ReportsView,
)

urlpatterns = [
    path('users/', UserListView.as_view(), name='admin-users'),
    path(
        'users/<int:pk>/',
        UserDetailView.as_view(),
        name='admin-user-detail',
    ),
    path('companies/', CompanyListAdminView.as_view(), name='admin-companies'),
    path(
        'companies/<int:pk>/verify/',
        CompanyVerifyView.as_view(),
        name='admin-company-verify',
    ),
    path('jobs/', JobAdminListView.as_view(), name='admin-jobs'),
    path(
        'jobs/<int:pk>/',
        JobAdminDetailView.as_view(),
        name='admin-job-detail',
    ),
    path('dashboard/', DashboardStatsView.as_view(), name='admin-dashboard'),
    path('reports/', ReportsView.as_view(), name='admin-reports'),
]
