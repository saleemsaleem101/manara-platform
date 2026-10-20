from django.urls import path
from .views import (
    JobListCreateView,
    JobDetailView,
    CompanyJobsListView,
    JobSkillListCreateView,
    JobSkillDetailView,
    ApplyJobView,
    MyApplicationsView,
    JobApplicationsView,
    CandidateApplicationProfileView,
    UpdateApplicationStatusView,
    WithdrawApplicationView,
    ApplicationStatusHistoryView,
)

urlpatterns = [
    path('', JobListCreateView.as_view(), name='job-list-create'),
    path('mine/', CompanyJobsListView.as_view(), name='company-jobs-mine'),
    path('<int:pk>/', JobDetailView.as_view(), name='job-detail'),

    # إدارة مهارات الوظيفة (FR-11, Class Diagram)
    path('<int:job_id>/skills/', JobSkillListCreateView.as_view(), name='job-skills'),
    path('<int:job_id>/skills/<int:pk>/', JobSkillDetailView.as_view(), name='job-skill-detail'),

    # التقديم ومتابعة الطلبات
    path('apply/', ApplyJobView.as_view(), name='job-apply'),
    path('my-applications/', MyApplicationsView.as_view(), name='my-applications'),

    # طلبات وظيفة معينة (للشركة)
    path('<int:job_id>/applications/', JobApplicationsView.as_view(), name='job-applications'),
    path('<int:job_id>/applicants/', JobApplicationsView.as_view(), name='job-applicants'),

    # استعراض ملف المرشح الكامل للطلب (للشركة والأدمن)
    path('applications/<int:pk>/', CandidateApplicationProfileView.as_view(), name='candidate-application-profile'),

    # قبول/رفض الطلب — للشركة (FR-14)
    path('applications/<int:pk>/status/', UpdateApplicationStatusView.as_view(), name='application-status'),

    # سحب الطلب — للخريج (FR-13)
    path('applications/<int:pk>/withdraw/', WithdrawApplicationView.as_view(), name='application-withdraw'),

    # استعراض سجل تغير حالة الطلب — (FR-29)
    path('applications/<int:pk>/history/', ApplicationStatusHistoryView.as_view(), name='application-history'),
]
