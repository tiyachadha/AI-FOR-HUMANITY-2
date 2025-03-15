from rest_framework import serializers
from crop_prediction.models import CropRecommendation
from pest_recognition.models import PlantDiseaseDetection

class CropRecommendationSerializer(serializers.ModelSerializer):
    class Meta:
        model = CropRecommendation
        fields = '__all__'
        read_only_fields = ['predicted_crop', 'recommended_fertilizer', 'user']



class PlantDiseaseDetectionSerializer(serializers.ModelSerializer):
    """Serializer for plant disease detection results"""
    image_url = serializers.SerializerMethodField()
    username = serializers.SerializerMethodField()
    
    class Meta:
        model = PlantDiseaseDetection
        fields = [
            'id', 'image_url', 'detected_disease', 'confidence', 
            'treatment', 'created_at', 'username'
        ]
        read_only_fields = ['detected_disease', 'confidence', 'treatment']
    
    def get_image_url(self, obj):
        request = self.context.get('request')
        if request and obj.image:
            return request.build_absolute_uri(obj.image.url)
        return None
    
    def get_username(self, obj):
        return obj.user.username