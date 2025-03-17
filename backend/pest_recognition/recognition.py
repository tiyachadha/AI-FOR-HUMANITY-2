import numpy as np
import os
import logging
# import tensorflow as tf
from tensorflow.python.keras.models import load_model
from skimage import io
from skimage.transform import resize
from skimage import img_as_ubyte
from django.conf import settings
import torch
import tempfile
from pathlib import Path
import cv2
import pandas as pd
import sys
import traceback

# Configure logger for this module
logger = logging.getLogger(__name__)

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
        logger.info("Initializing PlantDiseaseRecognizer with enhanced logging")
    
    def load_model(self):
        """Load the trained model from .pt file (YOLOv5) with additional error handling"""
        try:
            # Get model path
            model_path = os.path.join(settings.BASE_DIR, 'ml_models', 'best.pt')
            logger.info(f"Attempting to load model from: {model_path}")
            
            # First method: try using torch.hub with force_reload=True
            try:
                logger.info("Attempting to load model with torch.hub...")
                self.yolo_model = torch.hub.load('ultralytics/yolov5', 'yolov5x', path=model_path)
                logger.info("YOLOv5 model loaded successfully using torch.hub")
                return
            except Exception as e1:
                logger.error(f"Error loading with torch.hub: {e1}")
            
            # Second method: try direct loading with ultralytics
            try:
                print("Attempting to load model directly with ultralytics package...")
                from ultralytics import YOLO
                self.yolo_model = YOLO(model_path)
                print("YOLOv5 model loaded successfully using ultralytics.YOLO")
                return
            except Exception as e2:
                print(f"Error loading with ultralytics.YOLO: {e2}")
            
            # Third method: load with custom script approach
            try:
                # Add YOLOv5 repo to sys.path
                yolov5_path = os.path.join(settings.BASE_DIR, 'ml_models', 'yolov5')
                if os.path.exists(yolov5_path):
                    sys.path.insert(0, yolov5_path)
                    from models import load_model
                    self.yolo_model = load_model(model_path, device='cpu')
                    print("YOLOv5 model loaded successfully using local repo")
                    return
                else:
                    print(f"YOLOv5 repository not found at {yolov5_path}")
            except Exception as e3:
                print(f"Error loading with local repo approach: {e3}")
                
            # Fallback to legacy model if available
            old_model_path = os.path.join(settings.BASE_DIR, 'plant_disease_model.h5')
            if os.path.exists(old_model_path):
                self.model = load_model(old_model_path)
                print("Legacy model loaded successfully as fallback")
            else:
                print("No models could be loaded. Recognition will not be available.")
        except Exception as e:
            logger.error(f"Error in load_model: {e}", exc_info=True)
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
            logger.error("Model not loaded, cannot make prediction")
            return "Model Not Loaded", 0.0
        
        try:
            logger.info(f"Starting prediction on image: {image_path}")
            # Check which type of model we have loaded and use the appropriate prediction method
            if hasattr(self.yolo_model, 'predict'):
                logger.debug("Using predict() method for model inference")
                # Using ultralytics YOLO or torch hub
                try:
                    results = self.yolo_model(image_path)
                    logger.debug(f"Model prediction completed, result type: {type(results)}")
                    
                    # Log the raw results structure to understand what we're getting
                    if hasattr(results, '__len__'):
                        logger.debug(f"Results length: {len(results)}")
                    else:
                        logger.debug(f"Results does not have __len__, type: {type(results)}")
                    
                    # Extract prediction results based on the model type
                    if hasattr(results, 'pandas'):
                        logger.debug("Processing torch hub style results")
                        # torch hub style results
                        try:
                            detections = results.pandas().xyxy[0]  # Results in pandas DataFrame format
                            logger.debug(f"DataFrame detections shape: {detections.shape}")
                            if not detections.empty:
                                logger.debug(f"Detection columns: {detections.columns.tolist()}")
                                logger.debug(f"First detection: {detections.iloc[0].to_dict()}")
                        except Exception as df_error:
                            logger.error(f"Error processing pandas results: {df_error}", exc_info=True)
                            return "Error Processing Results", 0.0
                    else:
                        logger.debug("Processing ultralytics YOLO style results")
                        # ultralytics YOLO style results
                        try:
                            if hasattr(results[0], 'boxes') and hasattr(results[0].boxes, 'data'):
                                detections = results[0].boxes.data.cpu().numpy()
                                logger.debug(f"NumPy detections shape: {detections.shape}")
                                if len(detections) > 0:
                                    best_idx = np.argmax(detections[:, 4])  # Get index with highest confidence
                                    logger.debug(f"Best detection index: {best_idx}")
                                    class_idx = int(detections[best_idx, 5])
                                    logger.debug(f"Class index: {class_idx}")
                                    
                                    # Log the available class names
                                    if hasattr(results[0], 'names'):
                                        logger.debug(f"Available names: {results[0].names}")
                                    
                                    # Try to safely get the class name
                                    try:
                                        class_name = results[0].names[class_idx]
                                        logger.debug(f"Class name: {class_name}")
                                    except (KeyError, IndexError) as name_error:
                                        logger.error(f"Error getting class name: {name_error}")
                                        class_name = f"unknown_class_{class_idx}"
                                    
                                    confidence = float(detections[best_idx, 4])
                                    logger.info(f"Detection successful: {class_name} with confidence {confidence:.4f}")
                                    return class_name, confidence
                                else:
                                    logger.info("No detections found in results")
                            else:
                                logger.error("Results object doesn't have expected structure")
                            return "healthy", 0.0
                        except Exception as yolo_error:
                            logger.error(f"Error processing YOLO results: {yolo_error}", exc_info=True)
                            return "Error Processing YOLO Results", 0.0
                except Exception as predict_error:
                    logger.error(f"Error during model.predict call: {predict_error}", exc_info=True)
                    return "Error During Prediction", 0.0
            else:
                logger.debug("Using manual inference approach")
                # Direct loaded model approach
                try:
                    img = cv2.imread(image_path)
                    if img is None:
                        logger.error(f"Failed to read image at {image_path}")
                        return "Failed to Read Image", 0.0
                    
                    img = cv2.resize(img, (640, 640))
                    img = img[:, :, ::-1].transpose(2, 0, 1)  # BGR to RGB, to 3x416x416
                    img = np.ascontiguousarray(img)
                    img = torch.from_numpy(img).float()
                    img /= 255.0
                    if img.ndimension() == 3:
                        img = img.unsqueeze(0)
                    
                    # Inference
                    with torch.no_grad():
                        pred = self.yolo_model(img)[0]
                    
                    logger.debug(f"Manual prediction completed, shape: {pred.shape if hasattr(pred, 'shape') else 'unknown'}")
                    
                    # Process predictions
                    if len(pred):
                        # Get best detection
                        best_idx = torch.argmax(pred[:, 4])
                        cls = int(pred[best_idx, 5])
                        conf = float(pred[best_idx, 4])
                        class_name = self.categories[cls] if cls < len(self.categories) else f"class_{cls}"
                        logger.info(f"Manual detection: {class_name} with confidence {conf:.4f}")
                        return class_name, conf
                    else:
                        logger.info("No detections in manual prediction")
                    return "healthy", 0.0
                except Exception as manual_error:
                    logger.error(f"Error during manual inference: {manual_error}", exc_info=True)
                    return "Error During Manual Inference", 0.0
                
            # Additional logging for prediction results
            if isinstance(detections, pd.DataFrame) and len(detections) > 0:
                try:
                    best_detection = detections.sort_values('confidence', ascending=False).iloc[0]
                    predicted_class = best_detection['name']
                    confidence = float(best_detection['confidence'])
                    logger.info(f"DataFrame detection successful: {predicted_class} with confidence {confidence:.4f}")
                    return predicted_class, confidence
                except Exception as pandas_error:
                    logger.error(f"Error processing pandas DataFrame: {pandas_error}", exc_info=True)
                    return "Error Processing DataFrame", 0.0
            else:
                logger.info("No detection in DataFrame, trying legacy model")
                # If no detection, try using the legacy model as fallback
                if self.model is not None:
                    try:
                        processed_img = self.preprocess_image(image_path)
                        if processed_img is not None:
                            predictions = self.model.predict(processed_img)[0]
                            predicted_class_index = np.argmax(predictions)
                            confidence = float(predictions[predicted_class_index])
                            predicted_class = self.categories[predicted_class_index]
                            logger.info(f"Legacy model detection: {predicted_class} with confidence {confidence:.4f}")
                            return predicted_class, confidence
                        else:
                            logger.error("Image preprocessing failed")
                    except Exception as legacy_error:
                        logger.error(f"Error using legacy model: {legacy_error}", exc_info=True)
                        return "Error Using Legacy Model", 0.0
                
                logger.info("No detection found, defaulting to healthy")
                return "healthy", 0.0
                
        except Exception as e:
            tb = traceback.format_exc()
            logger.error(f"Unhandled error during prediction: {e}\n{tb}")
            return "Error", 0.0


# Create a singleton instance
recognizer = PlantDiseaseRecognizer()


def get_treatment_recommendation(disease_name):
    """Return treatment recommendation based on detected disease"""
    logger.debug(f"Getting treatment recommendation for: '{disease_name}'")
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
            "No treatment needed. Continue regular maintenance and monitoring.",
            
        'Apple___Apple_scab':
            "Apply fungicides with active ingredients like myclobutanil, captan, or mancozeb. Remove and destroy fallen leaves. Prune trees to improve air circulation.",
            
        'Apple Scab Leaf':
            "Apply fungicides with active ingredients like myclobutanil, captan, or mancozeb. Remove and destroy fallen leaves. Prune trees to improve air circulation.",
            
        'Apple___healthy':
            "No treatment needed. Continue regular maintenance and monitoring.",
            
        'Tomato___Early_blight':
            "Apply fungicides containing chlorothalonil or copper. Remove and destroy infected leaves. Ensure proper spacing between plants.",
            
        'Tomato___Late_blight':
            "Apply fungicides containing chlorothalonil, mancozeb, or copper. Remove and destroy infected plant material. Avoid overhead watering.",
            
        'Tomato___healthy':
            "No treatment needed. Continue regular maintenance and monitoring.",
            
        'healthy':
            "No treatment needed. Continue regular maintenance and monitoring.",
            
        'Error':
            "Could not determine disease. Please submit a clearer image for diagnosis.",
            
        'Error During Prediction':
            "Technical error during analysis. Please try again with a different image.",
    }
    
    # For unknown diseases, provide a generic response
    if disease_name not in treatments:
        logger.info(f"No specific treatment found for disease: '{disease_name}'")
        
    treatment = treatments.get(disease_name, "Consult with a plant pathologist for specific recommendations.")
    logger.debug(f"Returning treatment: '{treatment[:50]}...'")
    return treatment
