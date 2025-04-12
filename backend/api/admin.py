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
    list_display = ('id', 'user', 'created_at', 'get_detected_classes')
    list_filter = ('created_at', 'user')
    search_fields = ('user__username',)
    readonly_fields = ('detected_classes', 'created_at')
    
    def get_detected_classes(self, obj):
        if obj.detected_classes and isinstance(obj.detected_classes, list):
            return ", ".join(str(item) for item in obj.detected_classes)
        return "None"
    
    get_detected_classes.short_description = "Detected Diseases"