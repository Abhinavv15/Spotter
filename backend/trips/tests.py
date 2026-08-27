from django.test import TestCase
from django.utils import timezone
from .models import Trip, Stop, DutyPeriod, DailyLog


class TripModelTests(TestCase):
    def test_create_trip_and_related_models(self):
        trip = Trip.objects.create(
            current_location_name="Chicago, IL",
            pickup_location_name="Indianapolis, IN",
            dropoff_location_name="Atlanta, GA",
            current_cycle_used=15.5,
            total_distance_miles=715.0,
            estimated_duration_hours=12.0,
            is_legal=True,
            departure_time=timezone.now()
        )
        self.assertEqual(Trip.objects.count(), 1)
        self.assertTrue(trip.is_legal)

        stop = Stop.objects.create(
            trip=trip,
            stop_sequence=1,
            stop_type=Stop.StopType.PICKUP,
            location_name="Indianapolis, IN",
            latitude=39.7684,
            longitude=-86.1581,
            arrival_time=timezone.now(),
            departure_time=timezone.now(),
            duration_minutes=60,
            reason="Cargo loading / 1 hour On-Duty"
        )
        self.assertEqual(trip.stops.count(), 1)
        self.assertEqual(stop.stop_type, Stop.StopType.PICKUP)

        daily_log = DailyLog.objects.create(
            trip=trip,
            day_number=1,
            log_date=timezone.now().date(),
            total_miles_today=450.0,
            off_duty_hours=10.0,
            sleeper_berth_hours=0.0,
            driving_hours=8.0,
            on_duty_not_driving_hours=6.0,
            total_day_hours=24.0
        )
        self.assertEqual(daily_log.total_day_hours, 24.0)
