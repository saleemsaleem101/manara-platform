from django.contrib import admin
from .models import MatchingResult

@admin.register(MatchingResult)
class MatchingResultAdmin(admin.ModelAdmin):
    list_display = ('application', 'final_score', 'skills_score', 'specialization_score', 'calculated_at')
    list_filter = ('calculated_at',)
    search_fields = ('application__job__title', 'application__profile__user__name')