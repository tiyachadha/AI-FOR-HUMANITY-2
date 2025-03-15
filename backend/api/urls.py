from django.urls import path
from .views import CropPredictionView, PestRecognitionView

urlpatterns = [
    path('predict-crop/', CropPredictionView.as_view(), name='predict_crop'),
    path('detect-pest/', PestRecognitionView.as_view(), name='detect_pest'),
]