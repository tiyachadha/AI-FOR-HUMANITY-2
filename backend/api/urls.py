from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CropPredictionView,PredictionHistoryViewSet,PlantDiseaseDetectionView



router = DefaultRouter()
router.register(r'prediction-history', PredictionHistoryViewSet, basename='prediction-history')

urlpatterns = [
    path('predict-crop/', CropPredictionView.as_view(), name='predict_crop'),
    path('plant-disease/', PlantDiseaseDetectionView.as_view(), name='pest-recognition'),
    path('', include(router.urls)),
]

