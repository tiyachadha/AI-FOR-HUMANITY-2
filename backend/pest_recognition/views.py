import os
import logging
import tempfile
from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from .recognition import recognizer, get_treatment_recommendation
from .models import PlantDiseaseDetection
from ..api.serializers import PlantDiseaseDetectionSerializer
import traceback

# Configure logging
logger = logging.getLogger(__name__)

class PlantDiseaseDetectionView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        logger.info(f"Received plant disease detection request from user: {request.user.username}")
        
        if 'image' not in request.FILES:
            logger.error("No image file found in request")
            return JsonResponse({'error': 'No image file found'}, status=400)

        image_file = request.FILES['image']
        
        # Create a temporary file to save the uploaded image
        with tempfile.NamedTemporaryFile(delete=False) as temp_file:
            for chunk in image_file.chunks():
                temp_file.write(chunk)
            temp_file_path = temp_file.name
        
        try:
            logger.info(f"Processing image: {image_file.name}")
            
            # Add more debugging info about the image
            try:
                img_size = os.path.getsize(temp_file_path)
                logger.debug(f"Image size: {img_size} bytes")
                
                # Try to get image dimensions
                import cv2
                img = cv2.imread(temp_file_path)
                if img is not None:
                    height, width = img.shape[:2]
                    logger.debug(f"Image dimensions: {width}x{height}")
                else:
                    logger.warning("Could not read image for dimension check")
            except Exception as img_debug_error:
                logger.error(f"Error getting image debug info: {img_debug_error}")
            
            disease_name, confidence = recognizer.predict(temp_file_path)
            logger.info(f"Prediction result: {disease_name}, confidence: {confidence}")
            
            if disease_name is None:
                disease_name = "Unknown"
            if confidence is None:
                confidence = 0.0
                
            # Handle "Apple Scab Leaf" detection specifically
            if disease_name == "Apple Scab Leaf":
                disease_name = "Apple___Apple_scab"
                logger.info(f"Mapped 'Apple Scab Leaf' to '{disease_name}'")
                
            treatment = get_treatment_recommendation(disease_name)
            logger.info(f"Got treatment recommendation of length: {len(treatment)}")
            
            # Skip database storage completely
            logger.info("Skipping database storage and returning result directly to user")
            
            # Prepare response data
            response_data = {
                'disease': disease_name if disease_name else "Unknown",
                'confidence': round(float(confidence) * 100, 2) if confidence is not None else 0,
                'treatment': treatment
            }
            
            logger.debug(f"Returning response: {response_data}")
            return JsonResponse(response_data)
            
        except Exception as e:
            tb = traceback.format_exc()
            logger.error(f"Error processing plant disease detection: {e}\n{tb}")
            return JsonResponse({'error': str(e)}, status=500)
        finally:
            # Clean up the temporary file
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path)
                logger.debug(f"Deleted temporary file: {temp_file_path}")
            else:
                logger.warning(f"Could not delete temporary file (not found): {temp_file_path}")

class PestDetectionHistoryView(APIView):
    """
    API endpoint to retrieve user's pest detection history
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """
        Return the pest detection history for the authenticated user
        """
        # Since we're not storing records anymore, just return an empty list
        return JsonResponse([])
