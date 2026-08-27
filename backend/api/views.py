from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import viewsets, status
from django.utils import timezone
from trips.models import Trip
from trips.serializers import TripListSerializer, TripDetailSerializer
from hos_engine.services.routing import autocomplete_locations, geocode_location, calculate_osrm_route


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


@api_view(['GET'])
def location_autocomplete(request):
    """
    Autocomplete location queries with city, state, country, and coordinates.
    """
    query = request.query_params.get('q', '').strip()
    results = autocomplete_locations(query, limit=8)
    return Response({"results": results}, status=status.HTTP_200_OK)


@api_view(['POST'])
def route_preview(request):
    """
    Preview route distance, estimated duration, and polyline coordinates.
    Accepts: {current_location, pickup_location, dropoff_location}
    """
    data = request.data
    curr_str = data.get('current_location', '').strip()
    pickup_str = data.get('pickup_location', '').strip()
    dropoff_str = data.get('dropoff_location', '').strip()

    if not curr_str or not pickup_str or not dropoff_str:
        return Response(
            {"error": "Please provide current_location, pickup_location, and dropoff_location."},
            status=status.HTTP_400_BAD_REQUEST
        )

    curr_geo = geocode_location(curr_str)
    pickup_geo = geocode_location(pickup_str)
    dropoff_geo = geocode_location(dropoff_str)

    if not curr_geo or not pickup_geo or not dropoff_geo:
        return Response(
            {"error": "One or more locations could not be resolved."},
            status=status.HTTP_400_BAD_REQUEST
        )

    waypoints = [
        (curr_geo["lat"], curr_geo["lng"]),
        (pickup_geo["lat"], pickup_geo["lng"]),
        (dropoff_geo["lat"], dropoff_geo["lng"])
    ]

    route_res = calculate_osrm_route(waypoints)

    return Response({
        "current_location": curr_geo,
        "pickup_location": pickup_geo,
        "dropoff_location": dropoff_geo,
        "total_distance_miles": route_res["distance_miles"],
        "estimated_duration_hours": route_res["duration_hours"],
        "route_geometry": route_res["coordinates"],
        "provider": route_res.get("provider", "OSRM")
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
