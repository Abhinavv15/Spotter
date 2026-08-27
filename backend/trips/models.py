import uuid
from django.db import models


class Trip(models.Model):
    """
    Represents a planned truck trip with full HOS compliance and routing data.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # Route locations
    current_location_name = models.CharField(max_length=255)
    current_location_lat = models.FloatField(null=True, blank=True)
    current_location_lng = models.FloatField(null=True, blank=True)

    pickup_location_name = models.CharField(max_length=255)
    pickup_location_lat = models.FloatField(null=True, blank=True)
    pickup_location_lng = models.FloatField(null=True, blank=True)

    dropoff_location_name = models.CharField(max_length=255)
    dropoff_location_lat = models.FloatField(null=True, blank=True)
    dropoff_location_lng = models.FloatField(null=True, blank=True)

    # HOS cycle input
    current_cycle_used = models.FloatField(
        default=0.0,
        help_text="Current cumulative on-duty cycle hours used prior to this trip (0-70)"
    )

    # Calculated metrics
    total_distance_miles = models.FloatField(default=0.0)
    total_duration_hours = models.FloatField(default=0.0)
    estimated_duration_hours = models.FloatField(default=0.0)
    driving_time_hours = models.FloatField(default=0.0)
    rest_time_hours = models.FloatField(default=0.0)
    total_trip_days = models.IntegerField(default=1)

    # Legality & summary
    is_legal = models.BooleanField(default=True)
    hos_status_summary = models.TextField(blank=True, default="")
    route_geometry = models.JSONField(
        default=list,
        blank=True,
        help_text="Encoded polyline coordinates [[lat, lng], ...]"
    )

    # Advanced metadata for ELD log headers
    driver_name = models.CharField(max_length=150, default="John E. Doe")
    carrier_name = models.CharField(max_length=200, default="Apex Logistics Express LLC")
    carrier_address = models.CharField(max_length=255, default="100 Freight Way, Chicago, IL 60607")
    home_terminal_address = models.CharField(max_length=255, default="100 Freight Way, Chicago, IL 60607")
    truck_number = models.CharField(max_length=50, default="TRK-7042")
    trailer_number = models.CharField(max_length=50, default="TRL-5309")
    co_driver_name = models.CharField(max_length=150, blank=True, default="")
    shipping_doc_number = models.CharField(max_length=100, default="BOL-884920")
    commodity = models.CharField(max_length=150, default="General Freight / Electronics")
    departure_time = models.DateTimeField(null=True, blank=True)
    home_terminal_tz = models.CharField(max_length=50, default="America/Chicago")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Trip {self.current_location_name} -> {self.dropoff_location_name} ({self.total_distance_miles:.1f} mi)"


class Stop(models.Model):
    """
    Individual stop along the planned trip.
    """
    class StopType(models.TextChoices):
        CURRENT = 'CURRENT', 'Current Location / Departure'
        PICKUP = 'PICKUP', 'Pickup Location (1 hr On-Duty)'
        DROPOFF = 'DROPOFF', 'Dropoff Location (1 hr On-Duty)'
        FUEL = 'FUEL', 'Fuel Stop'
        REST_10H = 'REST_10H', '10-Hour Mandatory Rest (Sleeper/Off-Duty)'
        REST_34H = 'REST_34H', '34-Hour Restart (Sleeper/Off-Duty)'
        BREAK_30M = 'BREAK_30M', '30-Minute Rest Break'
        COMBINED = 'COMBINED', 'Combined Fuel & Rest Break'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    trip = models.ForeignKey(Trip, related_name='stops', on_delete=models.CASCADE)
    stop_sequence = models.PositiveIntegerField(default=1)
    stop_type = models.CharField(max_length=20, choices=StopType.choices, default=StopType.CURRENT)
    location_name = models.CharField(max_length=255)
    latitude = models.FloatField()
    longitude = models.FloatField()
    arrival_time = models.DateTimeField()
    departure_time = models.DateTimeField()
    duration_minutes = models.PositiveIntegerField(default=0)
    distance_from_last_stop_miles = models.FloatField(default=0.0)
    odometer_miles = models.FloatField(default=0.0)
    reason = models.TextField(help_text="Detailed explanation of why this stop was scheduled")
    hos_impact = models.CharField(max_length=255, blank=True, default="")
    is_optimized = models.BooleanField(default=False)

    class Meta:
        ordering = ['stop_sequence']

    def __str__(self):
        return f"Stop #{self.stop_sequence}: {self.stop_type} at {self.location_name}"


class DutyPeriod(models.Model):
    """
    A continuous period of duty status used to construct the 24-hour ELD graph.
    """
    class DutyStatus(models.TextChoices):
        OFF_DUTY = 'OFF_DUTY', '1. Off Duty'
        SLEEPER_BERTH = 'SLEEPER_BERTH', '2. Sleeper Berth'
        DRIVING = 'DRIVING', '3. Driving'
        ON_DUTY_NOT_DRIVING = 'ON_DUTY_NOT_DRIVING', '4. On Duty (Not Driving)'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    trip = models.ForeignKey(Trip, related_name='duty_periods', on_delete=models.CASCADE)
    day_number = models.PositiveIntegerField(default=1)
    duty_status = models.CharField(max_length=30, choices=DutyStatus.choices)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    duration_hours = models.FloatField()
    start_location = models.CharField(max_length=255)
    end_location = models.CharField(max_length=255, blank=True, default="")
    notes = models.CharField(max_length=255, blank=True, default="")

    class Meta:
        ordering = ['start_time']

    def __str__(self):
        return f"Day {self.day_number}: {self.duty_status} ({self.duration_hours:.2f}h)"


class DailyLog(models.Model):
    """
    One completed 24-hour FMCSA Record of Duty Status / ELD Sheet per calendar day.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    trip = models.ForeignKey(Trip, related_name='daily_logs', on_delete=models.CASCADE)
    day_number = models.PositiveIntegerField(default=1)
    log_date = models.DateField()
    total_miles_today = models.FloatField(default=0.0)

    # 4 Status Hours (must reconcile to 24.0 hours)
    off_duty_hours = models.FloatField(default=0.0)
    sleeper_berth_hours = models.FloatField(default=0.0)
    driving_hours = models.FloatField(default=0.0)
    on_duty_not_driving_hours = models.FloatField(default=0.0)
    total_day_hours = models.FloatField(default=24.0)

    # 70-Hour / 8-Day Cycle Recap fields
    cycle_hours_today = models.FloatField(default=0.0)
    cycle_hours_7day = models.FloatField(default=0.0)
    cycle_hours_8day = models.FloatField(default=0.0)
    cycle_hours_available_tomorrow = models.FloatField(default=70.0)

    # Serialized duty line segments and remarks for SVG rendering
    duty_segments = models.JSONField(
        default=list,
        help_text="List of [{status: str, start_hour: float, end_hour: float, duration: float, location: str}]"
    )
    remarks = models.JSONField(
        default=list,
        help_text="List of [{time_str: str, hour: float, status: str, location: str, note: str}]"
    )

    class Meta:
        ordering = ['day_number']

    def __str__(self):
        return f"Daily Log Day {self.day_number} ({self.log_date}): {self.total_miles_today:.0f} mi"
