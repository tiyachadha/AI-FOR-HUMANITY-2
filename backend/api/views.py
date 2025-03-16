from rest_framework import status, viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
import json
import os
import tempfile

from .models import CropRecommendation, PredictionHistory
from .serializers import CropRecommendationSerializer, PredictionHistorySerializer, PlantDiseaseDetectionSerializer
from pest_recognition.models import PlantDiseaseDetection
from pest_recognition.recognition import recognizer, get_treatment_recommendation

class CropPredictionView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        # Add user to request data
        data = request.data.copy()
        
        # Explicitly set the user ID in the data dictionary
        # Make sure we're using the right key - this should match your serializer's field name
        data['user'] = request.user.id
        
        print(f"Request data with user: {data}")  # Debug print
        
        serializer = CropRecommendationSerializer(data=data)
        if serializer.is_valid():
            try:
                # Pass the user explicitly to ensure it's set
                recommendation = serializer.save(user=request.user)
                
                # Save to prediction history
                PredictionHistory.objects.create(
                    user=request.user,
                    crop=recommendation.predicted_crop,
                    fertilizer=recommendation.recommended_fertilizer,
                    soil_params_json=json.dumps({
                        'nitrogen': recommendation.nitrogen,
                        'phosphorus': recommendation.phosphorus,
                        'potassium': recommendation.potassium,
                        'ph': recommendation.ph,
                        'rainfall': recommendation.rainfall,
                        'humidity': recommendation.humidity,
                        'temperature': recommendation.temperature,
                    })
                )
                
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            except Exception as e:
                return Response(
                    {"error": f"Failed to save recommendation: {str(e)}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        else:
            print(f"Serializer errors: {serializer.errors}")  # Debug print
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PestRecognitionView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)
    
    def post(self, request):
        if 'image' not in request.FILES:
            return Response({
                "error": "No image file provided"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        image_file = request.FILES['image']
        
        # Save image to temporary file for processing
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(image_file.name)[1]) as tmp:
            for chunk in image_file.chunks():
                tmp.write(chunk)
            tmp_path = tmp.name
        
        try:
            # Get prediction from the model
            disease_name, confidence = recognizer.predict(tmp_path)
            
            if disease_name is None:
                return Response({
                    "error": "Could not process image"
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            # Get treatment recommendation
            treatment = get_treatment_recommendation(disease_name)
            
            # Create database record
            detection = PlantDiseaseDetection.objects.create(
                user=request.user,
                image=image_file,
                detected_disease=disease_name,
                confidence=confidence,
                treatment=treatment
            )
            
            # Serialize and return the result
            serializer = PlantDiseaseDetectionSerializer(
                detection, 
                context={"request": request}
            )
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({
                "error": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        finally:
            # Clean up the temporary file
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)

class PredictionHistoryViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = PredictionHistorySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return PredictionHistory.objects.filter(user=self.request.user).order_by('-prediction_date')