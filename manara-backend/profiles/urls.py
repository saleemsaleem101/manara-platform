from django.urls import path
from .views import (
    UploadCRDocumentView,
    GraduateProfileView,
    GraduateProfileDetailView,
    GraduateProfileListView,
    CompanyProfileView,
    SubmitCompanyVerificationView,
    MajorListCreateView,
    SkillListView,
    GraduateSkillListCreateView,
    GraduateSkillDetailView,
    QualificationListCreateView,
    QualificationDetailView,
    ExperienceListCreateView,
    ExperienceDetailView,
    ProjectListCreateView,
    ProjectDetailView,
    VideoUploadView,
    VideoStreamView,
    CVUploadView,
    ImageUploadView,
    GraduateVideoSettingsView,
)

urlpatterns = [
    path('company/upload-cr/', UploadCRDocumentView.as_view(), name='company-upload-cr'),
    # رفع الملفات مع التحقق الصارم (FR-27)
    path('upload/image/', ImageUploadView.as_view(), name='upload-image'),

    # ملفات المستخدمين
    path('graduate/me/', GraduateProfileView.as_view(), name='graduate-profile-me'),
    path('graduates/', GraduateProfileListView.as_view(), name='graduate-profile-list'),
    path('graduates/<int:pk>/', GraduateProfileDetailView.as_view(), name='graduate-profile-detail'),
    path('company/me/', CompanyProfileView.as_view(), name='company-profile-me'),
    path('company/submit-verification/', SubmitCompanyVerificationView.as_view(), name='company-submit-verification'),

    # التخصصات الأكاديمية (majors في ERD الجديد)
    path('majors/', MajorListCreateView.as_view(), name='majors-list-create'),

    # قائمة المهارات العامة
    path('skills/', SkillListView.as_view(), name='skills-list'),

    # إدارة مهارات الخريج (FR-06, Class Diagram)
    path('graduate/skills/', GraduateSkillListCreateView.as_view(), name='graduate-skills'),
    path('graduate/skills/<int:pk>/', GraduateSkillDetailView.as_view(), name='graduate-skill-detail'),

    # إدارة مؤهلات الخريج (qualifications في ERD الجديد)
    path('graduate/qualifications/', QualificationListCreateView.as_view(), name='graduate-qualifications'),
    path('graduate/qualifications/<int:pk>/', QualificationDetailView.as_view(), name='graduate-qualification-detail'),

    # إدارة خبرات الخريج (experiences في ERD الجديد)
    path('graduate/experiences/', ExperienceListCreateView.as_view(), name='graduate-experiences'),
    path('graduate/experiences/<int:pk>/', ExperienceDetailView.as_view(), name='graduate-experience-detail'),

    # إدارة مشاريع الخريج (FR-07)
    path('graduate/projects/', ProjectListCreateView.as_view(), name='graduate-projects'),
    path('graduate/projects/<int:pk>/', ProjectDetailView.as_view(), name='graduate-project-detail'),

    # رفع وبث فيديو تعريفي وإعدادات الخصوصية (FR-08, FR-09, P82)
    path('graduate/video/', GraduateVideoSettingsView.as_view(), name='graduate-video-settings'),
    path('graduate/video/upload/', VideoUploadView.as_view(), name='graduate-video-upload'),
    path('graduate/video/stream/<int:graduate_id>/', VideoStreamView.as_view(), name='graduate-video-stream'),

    # رفع ملف السيرة الذاتية (FR-05)
    path('graduate/cv/upload/', CVUploadView.as_view(), name='graduate-cv-upload'),
]
