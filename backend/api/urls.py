from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CropPredictionView, PestRecognitionView,PredictionHistoryViewSet

router = DefaultRouter()
router.register(r'prediction-history', PredictionHistoryViewSet, basename='prediction-history')

urlpatterns = [
    path('predict-crop/', CropPredictionView.as_view(), name='predict_crop'),
    path('detect-pest/', PestRecognitionView.as_view(), name='detect_pest'),
    path('', include(router.urls)),
]