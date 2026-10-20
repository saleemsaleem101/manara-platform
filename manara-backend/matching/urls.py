from django.urls import path
from .views import (
    ApplicationMatchResultView,
    JobMatchCalculationView,
    JobCandidateRankView,
)

urlpatterns = [
    path('application/<int:application_id>/', ApplicationMatchResultView.as_view(), name='application-match'),
    path('job/<int:job_id>/', JobMatchCalculationView.as_view(), name='job-match-calculate'),
    path('job/<int:job_id>/candidates/', JobCandidateRankView.as_view(), name='job-candidates-rank'),
]