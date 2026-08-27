from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    health_check,
    location_autocomplete,
    route_preview,
    TripViewSet,
)

router = DefaultRouter()
router.register(r'trips', TripViewSet, basename='trip')

urlpatterns = [
    path('health/', health_check, name='api-health'),
    path('locations/autocomplete/', location_autocomplete, name='location-autocomplete'),
    path('routes/preview/', route_preview, name='route-preview'),
    path('', include(router.urls)),
]
