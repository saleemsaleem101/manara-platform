from django.contrib import admin
from .models import (
    GraduateProfile,
    Company,
    Skill,
    Project,
    VideoCV,
    Qualification,
    Experience,
)


@admin.register(GraduateProfile)
class GraduateProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'specialization', 'university', 'graduation_year', 'years_of_experience')
    search_fields = ('user__name', 'user__email', 'specialization', 'university')


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ('company_name', 'user', 'commercial_reg', 'industry', 'verification_status')
    list_filter = ('verification_status', 'industry')
    search_fields = ('company_name', 'commercial_reg', 'user__email')


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ('name', 'category')
    list_filter = ('category',)
    search_fields = ('name',)


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('title', 'profile')
    search_fields = ('title', 'profile__user__name')


@admin.register(VideoCV)
class VideoCVAdmin(admin.ModelAdmin):
    list_display = ('graduate', 'file_name', 'content_type', 'duration_seconds', 'uploaded_at')
    search_fields = ('graduate__user__name', 'file_name')


@admin.register(Qualification)
class QualificationAdmin(admin.ModelAdmin):
    list_display = ('graduate', 'degree', 'major', 'university', 'graduation_year')
    list_filter = ('degree',)
    search_fields = ('graduate__user__name', 'university')


@admin.register(Experience)
class ExperienceAdmin(admin.ModelAdmin):
    list_display = ('graduate', 'job_title', 'company_name', 'start_date', 'end_date')
    search_fields = ('graduate__user__name', 'job_title', 'company_name')
