from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import viewsets, status
from django.utils import timezone
from trips.models import Trip
from trips.serializers import TripListSerializer, TripDetailSerializer


@api_view(['GET'])
def health_check(request):
    """
    System health check endpoint for uptime monitors and readiness probes.
    """
    return Response({
        "status": "healthy",
        "service": "Spotter HOS & ELD Planning API",
        "version": "1.0.0",
        "timestamp": timezone.now().isoformat(),
        "database": "connected"
    }, status=status.HTTP_200_OK)


class TripViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Read-only viewset for retrieving saved trips and ELD logs.
    """
    queryset = Trip.objects.prefetch_related('stops', 'duty_periods', 'daily_logs').all()

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return TripDetailSerializer
        return TripListSerializer
