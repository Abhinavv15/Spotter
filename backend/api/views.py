from datetime import datetime
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import viewsets, status
from django.utils import timezone
from django.db import transaction

from trips.models import Trip, Stop, DutyPeriod, DailyLog
from trips.serializers import TripListSerializer, TripDetailSerializer
from hos_engine.services.routing import autocomplete_locations, geocode_location, calculate_osrm_route
from hos_engine.scheduler import HOSScheduler
from hos_engine.stop_optimizer import StopOptimizer
from hos_engine.validator import HOSValidator


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


@api_view(['POST'])
def plan_trip(request):
    """
    Core HOS Trip Planning API.
    Calculates legal HOS schedule, optimizes stops, segments daily ELD logs,
    and returns full audit-ready logistics data.
    """
    data = request.data
    curr_str = data.get('current_location', '').strip()
    pickup_str = data.get('pickup_location', '').strip()
    dropoff_str = data.get('dropoff_location', '').strip()

    try:
        current_cycle_used = float(data.get('current_cycle_used', 0.0))
        if current_cycle_used < 0.0 or current_cycle_used > 70.0:
            return Response(
                {"error": "Current cycle used must be between 0.0 and 70.0 hours."},
                status=status.HTTP_400_BAD_REQUEST
            )
    except (ValueError, TypeError):
        return Response(
            {"error": "Current cycle used must be a valid number between 0.0 and 70.0 hours."},
            status=status.HTTP_400_BAD_REQUEST
        )

    if not curr_str or not pickup_str or not dropoff_str:
        return Response(
            {"error": "Please provide current_location, pickup_location, and dropoff_location."},
            status=status.HTTP_400_BAD_REQUEST
        )

    # 1. Geocode locations
    curr_geo = geocode_location(curr_str)
    pickup_geo = geocode_location(pickup_str)
    dropoff_geo = geocode_location(dropoff_str)

    if not curr_geo or not pickup_geo or not dropoff_geo:
        return Response(
            {"error": "One or more locations could not be resolved."},
            status=status.HTTP_400_BAD_REQUEST
        )

    # 2. Calculate complete route
    waypoints = [
        (curr_geo["lat"], curr_geo["lng"]),
        (pickup_geo["lat"], pickup_geo["lng"]),
        (dropoff_geo["lat"], dropoff_geo["lng"])
    ]
    route_res = calculate_osrm_route(waypoints)

    # 3. Parse departure time if provided
    dep_time_str = data.get('departure_time')
    dep_datetime = None
    if dep_time_str:
        try:
            dep_datetime = datetime.fromisoformat(dep_time_str.replace("Z", "+00:00"))
        except Exception:
            dep_datetime = None

    # 4. Run HOS Simulation Engine
    scheduler = HOSScheduler(
        current_location=curr_geo,
        pickup_location=pickup_geo,
        dropoff_location=dropoff_geo,
        total_distance_miles=route_res["distance_miles"],
        route_geometry=route_res["coordinates"],
        current_cycle_used=current_cycle_used,
        departure_time=dep_datetime
    )
    hos_result = scheduler.plan_schedule()
    hos_result = StopOptimizer.optimize_and_annotate(hos_result)
    validation = HOSValidator.validate_schedule(hos_result)

    # 5. Extract metadata with defaults
    driver_name = data.get('driver_name', 'John E. Doe') or 'John E. Doe'
    carrier_name = data.get('carrier_name', 'Apex Logistics Express LLC') or 'Apex Logistics Express LLC'
    carrier_addr = data.get('carrier_address', '100 Freight Way, Chicago, IL 60607') or '100 Freight Way, Chicago, IL 60607'
    home_term_addr = data.get('home_terminal_address', '100 Freight Way, Chicago, IL 60607') or '100 Freight Way, Chicago, IL 60607'
    truck_no = data.get('truck_number', 'TRK-7042') or 'TRK-7042'
    trailer_no = data.get('trailer_number', 'TRL-5309') or 'TRL-5309'
    co_driver = data.get('co_driver_name', '') or ''
    shipping_doc = data.get('shipping_doc_number', 'BOL-884920') or 'BOL-884920'
    commodity = data.get('commodity', 'General Freight / Electronics') or 'General Freight / Electronics'
    home_tz = data.get('home_terminal_tz', 'America/Chicago') or 'America/Chicago'

    # 6. Save Trip and related records in atomic transaction
    with transaction.atomic():
        trip = Trip.objects.create(
            current_location_name=curr_geo["name"],
            current_location_lat=curr_geo["lat"],
            current_location_lng=curr_geo["lng"],
            pickup_location_name=pickup_geo["name"],
            pickup_location_lat=pickup_geo["lat"],
            pickup_location_lng=pickup_geo["lng"],
            dropoff_location_name=dropoff_geo["name"],
            dropoff_location_lat=dropoff_geo["lat"],
            dropoff_location_lng=dropoff_geo["lng"],
            current_cycle_used=current_cycle_used,
            total_distance_miles=hos_result.total_distance_miles,
            total_duration_hours=hos_result.total_duration_hours,
            estimated_duration_hours=hos_result.total_duration_hours,
            driving_time_hours=hos_result.driving_time_hours,
            rest_time_hours=hos_result.rest_time_hours,
            total_trip_days=hos_result.total_trip_days,
            is_legal=hos_result.is_legal,
            hos_status_summary=hos_result.status_summary,
            route_geometry=route_res["coordinates"],
            driver_name=driver_name,
            carrier_name=carrier_name,
            carrier_address=carrier_addr,
            home_terminal_address=home_term_addr,
            truck_number=truck_no,
            trailer_number=trailer_no,
            co_driver_name=co_driver,
            shipping_doc_number=shipping_doc,
            commodity=commodity,
            departure_time=scheduler.departure_time,
            home_terminal_tz=home_tz
        )

        # Create Stop records
        for stop in hos_result.stops:
            Stop.objects.create(
                trip=trip,
                stop_sequence=stop.sequence,
                stop_type=stop.stop_type.value,
                location_name=stop.location_name,
                latitude=stop.latitude,
                longitude=stop.longitude,
                arrival_time=stop.arrival_time or timezone.now(),
                departure_time=stop.departure_time or timezone.now(),
                duration_minutes=stop.duration_minutes,
                distance_from_last_stop_miles=stop.distance_from_last_miles,
                odometer_miles=stop.odometer_miles,
                reason=stop.reason,
                hos_impact=stop.hos_impact,
                is_optimized=stop.is_optimized
            )

        # Create DailyLog records
        for day_report in hos_result.daily_logs:
            duty_segs_json = [
                {
                    "status": seg.status.value,
                    "start_hour": seg.start_hour,
                    "end_hour": seg.end_hour,
                    "duration": seg.duration_hours,
                    "location": seg.location,
                    "note": seg.note
                }
                for seg in day_report.duty_segments
            ]
            remarks_json = [
                {
                    "time_str": r.time_str,
                    "hour": r.hour,
                    "status": r.status.value,
                    "location": r.location,
                    "note": r.note
                }
                for r in day_report.remarks
            ]

            DailyLog.objects.create(
                trip=trip,
                day_number=day_report.day_number,
                log_date=day_report.log_date,
                total_miles_today=day_report.total_miles_today,
                off_duty_hours=day_report.off_duty_hours,
                sleeper_berth_hours=day_report.sleeper_berth_hours,
                driving_hours=day_report.driving_hours,
                on_duty_not_driving_hours=day_report.on_duty_not_driving_hours,
                total_day_hours=day_report.total_day_hours,
                cycle_hours_today=day_report.cycle_hours_today,
                cycle_hours_7day=day_report.cycle_hours_7day,
                cycle_hours_8day=day_report.cycle_hours_8day,
                cycle_hours_available_tomorrow=day_report.cycle_hours_available_tomorrow,
                duty_segments=duty_segs_json,
                remarks=remarks_json
            )

    # 7. Construct and return response
    serializer = TripDetailSerializer(trip)
    resp_data = dict(serializer.data)
    resp_data["hos_summary"] = {
        "is_legal": hos_result.is_legal,
        "status_badge": "LEGAL" if hos_result.is_legal else "REQUIRES_ADJUSTMENT",
        "current_cycle_used": hos_result.current_cycle_used_start,
        "cycle_hours_available_start": hos_result.cycle_hours_remaining_start,
        "total_cycle_hours_consumed": hos_result.total_cycle_hours_consumed,
        "cycle_hours_remaining_end": hos_result.cycle_hours_remaining_end,
        "required_34h_restart": hos_result.required_34h_restart,
        "restart_day": hos_result.restart_day,
        "driving_hours_remaining_day1": max(0.0, 11.0 - (hos_result.daily_logs[0].driving_hours if hos_result.daily_logs else 0.0)),
        "window_hours_remaining_day1": max(0.0, 14.0 - (hos_result.daily_logs[0].cycle_hours_today if hos_result.daily_logs else 0.0)),
        "summary_text": hos_result.status_summary,
        "violations": validation.get("violations", []),
        "explanations": hos_result.explanations,
        "checks_passed": validation.get("checks_passed", [])
    }

    return Response(resp_data, status=status.HTTP_201_CREATED)


class TripViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Read-only viewset for retrieving saved trips and ELD logs.
    """
    queryset = Trip.objects.prefetch_related('stops', 'duty_periods', 'daily_logs').all()

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return TripDetailSerializer
        return TripListSerializer
