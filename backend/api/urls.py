from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import health_check, TripViewSet

router = DefaultRouter()
router.register(r'trips', TripViewSet, basename='trip')

urlpatterns = [
    path('health/', health_check, name='api-health'),
    path('', include(router.urls)),
]
