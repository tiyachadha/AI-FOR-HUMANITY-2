from rest_framework import serializers
from .models import CropRecommendation
from .models import PredictionHistory
from .models import PlantDiseaseDetection

class CropRecommendationSerializer(serializers.ModelSerializer):
    class Meta:
        model = CropRecommendation
        fields = '__all__'
        read_only_fields = ['predicted_crop', 'recommended_fertilizer', 'user']




class PredictionHistorySerializer(serializers.ModelSerializer):
    soil_params = serializers.SerializerMethodField()
    
    class Meta:
        model = PredictionHistory
        fields = ['id', 'prediction_date', 'crop', 'fertilizer', 'soil_params']
    
    def get_soil_params(self, obj):
        return obj.soil_params
    

# api/serializers.py


class PlantDiseaseDetectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlantDiseaseDetection
        fields = ['id', 'image', 'detected_classes', 'result_image', 'created_at']
        read_only_fields = ['detected_classes', 'result_image', 'created_at']