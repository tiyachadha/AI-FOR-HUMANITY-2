from ultralytics import YOLO
import numpy as np
import os
from django.conf import settings

MODEL_PATH = os.path.join(settings.BASE_DIR, 'ml_models', 'best.pt')

def inference(image):
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"Model file not found at {MODEL_PATH}")

    # Load model and get class mapper
    model = YOLO(MODEL_PATH)
    class_mapper = model.names

    results = model(image, conf=0.4)
    
    infer = np.zeros(image.shape, dtype=np.uint8)
    detected_classes = []  # Detected class names
    
    for r in results:
        infer = r.plot()
        # Get class names using the mapper
        detected_classes = [class_mapper[int(idx)] for idx in r.boxes.cls.tolist()]
    
    return infer, class_mapper, detected_classes
