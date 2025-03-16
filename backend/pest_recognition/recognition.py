import numpy as np
import os
# import tensorflow as tf
from tensorflow.python.keras.models import load_model
from skimage import io
from skimage.transform import resize

from skimage import img_as_ubyte
from django.conf import settings
import torch
import tempfile
from pathlib import Path

class PlantDiseaseRecognizer:
    """Helper class for loading the model and making predictions"""
    def __init__(self):
        self.model = None
        self.categories = [
            'Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot',
            'Corn_(maize)___Common_rust_',
            'Corn_(maize)___healthy',
            'Peach___Bacterial_spot',
            'Peach___healthy'
        ]
        self.img_size = 28
        self.yolo_model = None
        self.load_model()
    
    def load_model(self):
        """Load the trained model from .pt file (YOLOv5)"""
        try:
            # Load YOLOv5 model
            model_path = os.path.join(settings.BASE_DIR, 'best.pt')
            self.yolo_model = torch.hub.load('ultralytics/yolov5', 'custom', path=model_path)
            print("YOLOv5 model loaded successfully from:", model_path)
            
            # For backwards compatibility, still load the old model if needed
            old_model_path = os.path.join(settings.BASE_DIR, 'plant_disease_model.h5')
            if os.path.exists(old_model_path):
                self.model = load_model(old_model_path)
                print("Legacy model also loaded successfully from:", old_model_path)
        except Exception as e:
            print(f"Error loading model: {e}")
            self.yolo_model = None
            self.model = None
    
    def preprocess_image(self, image_path):
        """Preprocess the image to match model input requirements
        based on the preprocessing in the training code"""
        try:
            # Read image using skimage as in the training code
            img_array = io.imread(image_path)
            # Convert color channels to match training preprocessing
            img_array = img_array[:, :, ::-1]
            # Resize to 28x28 as in the training code
            new_array = resize(img_array, (self.img_size, self.img_size))
            new_array = img_as_ubyte(new_array)
            
            # Normalize to match training preprocessing
            new_array = new_array.astype('float32')
            new_array = new_array / 255.0
            
            # Reshape for the model (batch, width, height, channels)
            processed_img = new_array.reshape(-1, self.img_size, self.img_size, 3)
            
            return processed_img
        except Exception as e:
            print(f"Error preprocessing image: {e}")
            return None
    
    def predict(self, image_path):
        """Make prediction on the given image using YOLOv5"""
        if self.yolo_model is None:
            return None, None
        
        try:
            # Make prediction using YOLOv5
            results = self.yolo_model(image_path)
            
            # Extract prediction results
            detections = results.pandas().xyxy[0]  # Results in pandas DataFrame format
            
            if len(detections) > 0:
                # Get the detection with highest confidence
                best_detection = detections.sort_values('confidence', ascending=False).iloc[0]
                predicted_class = best_detection['name']  # Class name
                confidence = float(best_detection['confidence'])
                
                return predicted_class, confidence
            else:
                # If no detection, try using the legacy model as fallback
                if self.model is not None:
                    processed_img = self.preprocess_image(image_path)
                    if processed_img is not None:
                        predictions = self.model.predict(processed_img)[0]
                        predicted_class_index = np.argmax(predictions)
                        confidence = float(predictions[predicted_class_index])
                        predicted_class = self.categories[predicted_class_index]
                        return predicted_class, confidence
                
                return "healthy", 0.0  # Default to healthy if no pest detected
                
        except Exception as e:
            print(f"Error during prediction: {e}")
            return None, None


# Create a singleton instance
recognizer = PlantDiseaseRecognizer()


def get_treatment_recommendation(disease_name):
    """Return treatment recommendation based on detected disease"""
    treatments = {
        'Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot': 
            "Apply fungicides containing pyraclostrobin, azoxystrobin, trifloxystrobin, or picoxystrobin. Rotate crops and remove crop debris.",
        
        'Corn_(maize)___Common_rust_': 
            "Apply fungicides with active ingredients like azoxystrobin, pyraclostrobin, or trifloxystrobin. Plant resistant corn varieties.",
        
        'Corn_(maize)___healthy': 
            "No treatment needed. Continue regular maintenance and monitoring.",
        
        'Peach___Bacterial_spot': 
            "Apply copper-based bactericides in early spring. Prune infected branches and ensure good air circulation.",
        
        'Peach___healthy': 
            "No treatment needed. Continue regular maintenance and monitoring."
    }
    
    return treatments.get(disease_name, "Consult with a plant pathologist for specific recommendations.")
