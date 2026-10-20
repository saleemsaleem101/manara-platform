from django.contrib import admin
from .models import Job, JobSkill, Application, ApplicationStatusHistory

@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ('title', 'company', 'status', 'required_qualification', 'minimum_match_score', 'deadline')
    list_filter = ('status', 'required_qualification')
    search_fields = ('title', 'company__company_name')

@admin.register(JobSkill)
class JobSkillAdmin(admin.ModelAdmin):
    list_display = ('job', 'skill', 'required_level', 'weight')

@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ('profile', 'job', 'status', 'applied_at')
    list_filter = ('status',)
    search_fields = ('profile__user__name', 'job__title')

@admin.register(ApplicationStatusHistory)
class ApplicationStatusHistoryAdmin(admin.ModelAdmin):
    list_display = ('history_id', 'application', 'previous_status', 'new_status', 'changed_at', 'changed_by')
    list_filter = ('new_status', 'previous_status')
    search_fields = ('application__job__title', 'application__profile__user__name')