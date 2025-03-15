from django.db import models
from users.models import User

# Create your models here.
class CropRecommendation(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='crop_recommendations')
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
        return f"{self.user.username} - {self.predicted_crop}"