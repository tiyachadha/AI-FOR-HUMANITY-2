from django.contrib import admin
from .models import CropRecommendation

@admin.register(CropRecommendation)
class CropRecommendationAdmin(admin.ModelAdmin):
    list_display = ('user', 'predicted_crop', 'recommended_fertilizer', 'created_at')

