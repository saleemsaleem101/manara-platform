from django.contrib import admin
from .models import GraduateProfile


@admin.register(GraduateProfile)
class GraduateProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'specialization', 'university', 'graduation_year', 'years_of_experience')
    search_fields = ('user__name', 'user__email', 'specialization', 'university')
