from django.db import models
from django.conf import settings

class PlantDiseaseDetection(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='plant_disease_detections',
    )
    image = models.ImageField(upload_to='plant_disease_images/')
    detected_disease = models.CharField(max_length=100)
    confidence = models.FloatField()
    treatment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.detected_disease} on {self.created_at.strftime('%Y-%m-%d')}"