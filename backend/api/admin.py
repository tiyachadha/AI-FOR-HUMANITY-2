from django.contrib import admin
from .models import CropRecommendation,PredictionHistory, PlantDiseaseDetection

@admin.register(CropRecommendation)
class CropRecommendationAdmin(admin.ModelAdmin):
    list_display = ('user', 'predicted_crop', 'recommended_fertilizer', 'created_at')

@admin.register(PredictionHistory)
class PredictionHistoryAdmin(admin.ModelAdmin):
    list_display = ('user', 'crop', 'fertilizer', 'prediction_date')
    list_filter = ('crop', 'fertilizer', 'prediction_date')
    search_fields = ('user__username', 'crop', 'fertilizer')
    date_hierarchy = 'prediction_date'
    readonly_fields = ('prediction_date',)
    
    def get_soil_params(self, obj):
        return obj.soil_params
    get_soil_params.short_description = 'Soil Parameters'
    
    fieldsets = (
        (None, {
            'fields': ('user', 'crop', 'fertilizer', 'prediction_date')
        }),
        ('Soil Parameters', {
            'fields': ('soil_params_json',),
            'classes': ('collapse',)
        }),
    )


@admin.register(PlantDiseaseDetection)
class PlantDiseaseDetectionAdmin(admin.ModelAdmin):
    list_display = ('user', 'get_diseases', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('user__username', 'detected_classes')
    readonly_fields = ('created_at',)
    
    def get_diseases(self, obj):
        if obj.detected_classes and len(obj.detected_classes) > 0:
            return ', '.join(obj.detected_classes)
        return 'No diseases detected'
    get_diseases.short_description = 'Detected Diseases'
    
    fieldsets = (
        (None, {
            'fields': ('user', 'created_at')
        }),
        ('Detection Results', {
            'fields': ('detected_classes', 'image', 'result_image'),
        }),
    )