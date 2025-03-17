from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from api.models import CropRecommendation
from crop_prediction.prediction import predict_crop, recommend_fertilizer
from .serializers import CropRecommendationSerializer
from users.models import User
from .serializers import PlantDiseaseDetectionSerializer
from api.models import PredictionHistory
from api.serializers import PredictionHistorySerializer
import os
import json
from django.conf import settings
from pest_recognition.inference import inference
from django.core.files.base import ContentFile
import json

import cv2

# Import the inference and chatbot functions


from rest_framework.views import APIView
from django.conf import settings
import sys






# API endpoints for crop prediction
class CropPredictionView(generics.CreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = CropRecommendationSerializer
    
    def create(self, request, *args, **kwargs):
        # Get input parameters from request
        n = float(request.data.get('nitrogen', 0))
        p = float(request.data.get('phosphorus', 0))
        k = float(request.data.get('potassium', 0))
        ph = float(request.data.get('ph', 0))
        rainfall = float(request.data.get('rainfall', 0))
        humidity = float(request.data.get('humidity', 0))
        temperature = float(request.data.get('temperature', 0))
        
        # Make prediction
        crop = predict_crop(n, p, k, ph, rainfall, humidity, temperature)
        
        # Get fertilizer recommendation
        fertilizer = recommend_fertilizer(n, p, k, crop)

        soil_params = {
            'n': n,
            'p': p,
            'k': k,
            'ph': ph,
            'rainfall': rainfall,
            'humidity': humidity,
            'temperature': temperature
        }
        
        # Save to prediction history
        PredictionHistory.objects.create(
            user=request.user,
            crop=crop,
            fertilizer=fertilizer,
            soil_params_json=json.dumps(soil_params)
        )
        
        # Render result page
      
        # Create recommendation record
        user = User.objects.get(id=request.user.id)
        recommendation = CropRecommendation.objects.create(
            user=user,
            nitrogen=n,
            phosphorus=p,
            potassium=k,
            ph=ph,
            rainfall=rainfall,
            humidity=humidity,
            temperature=temperature,
            predicted_crop=crop,
            recommended_fertilizer=fertilizer
        )
        
        serializer = self.get_serializer(recommendation)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    








class PredictionHistoryViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = PredictionHistorySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return PredictionHistory.objects.filter(user=self.request.user).order_by('-prediction_date')
    








# api/views.py

class PlantDiseaseDetectionView(generics.CreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = PlantDiseaseDetectionSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        
        if serializer.is_valid():
            plant_detection = serializer.save(user=request.user)
            image_path = plant_detection.image.path
            
            img = cv2.imread(image_path)
            result_img, classes, detected_classes_indices = inference(img)
            detected_class_names = [
                classes[idx] if isinstance(idx, int) else idx
                for idx in detected_classes_indices
]            
            result_image_name = f"result_{os.path.basename(image_path)}"
            result_image_path = os.path.join(settings.MEDIA_ROOT, 'plant_disease_results', result_image_name)
            os.makedirs(os.path.dirname(result_image_path), exist_ok=True)
            
            success, buffer = cv2.imencode('.jpg', result_img)
            if success:
                plant_detection.result_image.save(
                    result_image_name,
                    ContentFile(buffer.tobytes()),
                    save=False
                )
                plant_detection.detected_classes = detected_class_names
                plant_detection.save()

            serializer = self.get_serializer(plant_detection)
            return Response(serializer.data, status=status.HTTP_201_CREATED)