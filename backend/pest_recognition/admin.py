from django.contrib import admin
from .models import PlantDiseaseDetection

@admin.register(PlantDiseaseDetection)
class PlantDiseaseDetectionAdmin(admin.ModelAdmin):
    list_display = ['user', 'detected_disease', 'confidence', 'created_at']
    list_filter = ['detected_disease', 'created_at']
    search_fields = ['user__username', 'detected_disease']
    readonly_fields = ['detected_disease', 'confidence', 'treatment', 'created_at']
