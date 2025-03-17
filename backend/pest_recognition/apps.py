from django.apps import AppConfig
import os
import sys
from django.conf import settings

class PestRecognitionConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'pest_recognition'
    
    def ready(self):
        # Add YOLOv5 repo to path if exists
        yolov5_path = os.path.join(settings.BASE_DIR, 'ml_models', 'yolov5')
        if os.path.exists(yolov5_path) and yolov5_path not in sys.path:
            sys.path.append(yolov5_path)
