from django.db import models
from django.conf import settings
import json

class CropRecommendation(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE,
        related_name='api_crop_recommendations'  # Added unique related_name
    )
    nitrogen = models.FloatField()
    phosphorus = models.FloatField()
    potassium = models.FloatField()
    ph = models.FloatField()
    rainfall = models.FloatField()
    humidity = models.FloatField()
    temperature = models.FloatField()
    predicted_crop = models.CharField(max_length=100)
    recommended_fertilizer = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.predicted_crop} for {self.user.username}"

class PredictionHistory(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    prediction_date = models.DateTimeField(auto_now_add=True)
    crop = models.CharField(max_length=100)
    fertilizer = models.CharField(max_length=100)
    soil_params_json = models.TextField()  # Store as JSON string
    
    def save(self, *args, **kwargs):
        # Ensure soil_params_json is a valid JSON string
        if isinstance(self.soil_params_json, dict):
            self.soil_params_json = json.dumps(self.soil_params_json)
        super().save(*args, **kwargs)
    
    @property
    def soil_params(self):
        return json.loads(self.soil_params_json)
    
    def __str__(self):
        return f"{self.crop} prediction for {self.user.username}"