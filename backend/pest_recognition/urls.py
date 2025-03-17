from django.urls import path
from .views import PestRecognitionAPIView, PestDetectionHistoryView

urlpatterns = [
    path('api/detect/', PestRecognitionAPIView.as_view(), name='pest_detect'),
    path('api/history/', PestDetectionHistoryView.as_view(), name='pest_history'),
]
