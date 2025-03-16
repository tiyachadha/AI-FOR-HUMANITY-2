import pickle
import os
import numpy as np
from django.conf import settings

# Load the model (assuming you have saved your trained model as a pickle file)
MODEL_PATH = os.path.join(settings.BASE_DIR, 'ml_models', 'cropmodel2.pkl')
with open(MODEL_PATH, 'rb') as f:
    crop_model = pickle.load(f)

def predict_crop(n, p, k, ph, rainfall, humidity, temperature):
    """
    Predict crop based on soil and climate parameters
    """

    mapper = {
    1: 'rice', 2: 'maize', 3: 'chickpea', 4: 'kidneybeans', 5: 'pigeonpeas',
    6: 'mothbeans', 7: 'mungbean', 8: 'blackgram', 9: 'lentil', 10: 'pomegranate',
    11: 'banana', 12: 'mango', 13: 'grapes', 14: 'watermelon', 15: 'muskmelon',
    16: 'apple', 17: 'orange', 18: 'papaya', 19: 'coconut', 20: 'cotton',
    21: 'jute', 22: 'coffee'
    }

    # Create input array for prediction
    input_data = np.array([[n, p, k, ph, rainfall, humidity, temperature]])
    
    # Make prediction
    crop = crop_model.predict(input_data)[0]
    return mapper.get(crop, 'Unknown')



def recommend_fertilizer(n, p, k, crop):
    """
    Recommend fertilizer based on NPK values and predicted crop
    """
    # This is a simplified version - you would likely have more complex logic
    fertilizer_map = {
        'rice': {
            'low_n': 'Urea',
            'low_p': 'Single Superphosphate',
            'low_k': 'Muriate of Potash',
            'balanced': 'NPK 10-26-26'
        },
        'wheat': {
            'low_n': 'Ammonium Sulfate',
            'low_p': 'Diammonium Phosphate',
            'low_k': 'Sulfate of Potash',
            'balanced': 'NPK 12-32-16'
        },
        # Add more crops and fertilizer recommendations
    }
    
    # Default to a generic fertilizer if crop isn't in our map
    if crop not in fertilizer_map:
        return "General purpose NPK fertilizer recommended. Consult local agricultural extension for specific advice."
    
    # Check NPK levels and make recommendation
    if n < 30:
        return fertilizer_map[crop]['low_n']
    elif p < 30:
        return fertilizer_map[crop]['low_p']
    elif k < 30:
        return fertilizer_map[crop]['low_k']
    else:
        return fertilizer_map[crop]['balanced']