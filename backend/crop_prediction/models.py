from django.db import models
from django.conf import settings

class CropRecommendation(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='prediction_crop_recommendations',
    )
    soil_type = models.CharField(max_length=100)
    nitrogen = models.FloatField()
    phosphorus = models.FloatField() 
    potassium = models.FloatField()
    temperature = models.FloatField()
    humidity = models.FloatField()
    ph = models.FloatField()
    rainfall = models.FloatField()
    predicted_crop = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.predicted_crop} for {self.user.username}"
