from django.test import TestCase
from datetime import datetime
from .domain import DutyStatus, StopType
from .scheduler import HOSScheduler
from .validator import HOSValidator


class HOSEngineUnitTests(TestCase):
    def setUp(self):
        self.chicago = {"name": "Chicago, IL", "city": "Chicago", "state": "IL", "lat": 41.8781, "lng": -87.6298}
        self.indianapolis = {"name": "Indianapolis, IN", "city": "Indianapolis", "state": "IN", "lat": 39.7684, "lng": -86.1581}
        self.atlanta = {"name": "Atlanta, GA", "city": "Atlanta", "state": "GA", "lat": 33.7490, "lng": -84.3880}
        self.los_angeles = {"name": "Los Angeles, CA", "city": "Los Angeles", "state": "CA", "lat": 34.0522, "lng": -118.2437}

    def test_short_single_day_trip(self):
        # Chicago -> Indianapolis (180 miles)
        scheduler = HOSScheduler(
            current_location=self.chicago,
            pickup_location=self.chicago,
            dropoff_location=self.indianapolis,
            total_distance_miles=180.0,
            route_geometry=[[41.8781, -87.6298], [39.7684, -86.1581]],
            current_cycle_used=10.0
        )
        res = scheduler.plan_schedule()
        val = HOSValidator.validate_schedule(res)

        self.assertTrue(res.is_legal)
        self.assertTrue(val["is_valid"])
        self.assertEqual(res.total_trip_days, 1)
        self.assertEqual(res.daily_logs[0].total_day_hours, 24.0)

    def test_trip_requiring_30_min_break(self):
        # 520 miles -> ~9.5 hours driving -> requires 30-min break
        scheduler = HOSScheduler(
            current_location=self.chicago,
            pickup_location=self.chicago,
            dropoff_location=self.atlanta,
            total_distance_miles=520.0,
            route_geometry=[[41.8781, -87.6298], [33.7490, -84.3880]],
            current_cycle_used=0.0
        )
        res = scheduler.plan_schedule()
        
        break_stops = [s for s in res.stops if s.stop_type in (StopType.BREAK_30M, StopType.COMBINED)]
        self.assertGreaterEqual(len(break_stops), 1)

    def test_trip_exceeding_11_driving_hours_schedules_10h_rest(self):
        # 850 miles -> ~15.5 hours driving -> mandates 10h rest
        scheduler = HOSScheduler(
            current_location=self.chicago,
            pickup_location=self.chicago,
            dropoff_location=self.atlanta,
            total_distance_miles=850.0,
            route_geometry=[[41.8781, -87.6298], [33.7490, -84.3880]],
            current_cycle_used=0.0
        )
        res = scheduler.plan_schedule()
        
        rest_stops = [s for s in res.stops if s.stop_type == StopType.REST_10H]
        self.assertGreaterEqual(len(rest_stops), 1)
        self.assertGreater(res.total_trip_days, 1)

    def test_high_initial_cycle_triggers_34h_restart(self):
        # Current cycle = 66 hours (4h remaining), 700 miles trip requiring 14h on-duty
        scheduler = HOSScheduler(
            current_location=self.chicago,
            pickup_location=self.chicago,
            dropoff_location=self.atlanta,
            total_distance_miles=700.0,
            route_geometry=[[41.8781, -87.6298], [33.7490, -84.3880]],
            current_cycle_used=66.0
        )
        res = scheduler.plan_schedule()
        
        self.assertTrue(res.required_34h_restart)
        restart_stops = [s for s in res.stops if s.stop_type == StopType.REST_34H]
        self.assertGreaterEqual(len(restart_stops), 1)
        self.assertEqual(restart_stops[0].duration_minutes, 34 * 60)

    def test_fuel_stops_scheduled_for_long_trips(self):
        # Chicago -> LA (2,100 miles) -> requires at least 2 fuelings (≤1,000 miles)
        scheduler = HOSScheduler(
            current_location=self.chicago,
            pickup_location=self.chicago,
            dropoff_location=self.los_angeles,
            total_distance_miles=2100.0,
            route_geometry=[[41.8781, -87.6298], [34.0522, -118.2437]],
            current_cycle_used=15.0
        )
        res = scheduler.plan_schedule()
        
        fuelings = [s for s in res.stops if s.stop_type in (StopType.FUEL, StopType.COMBINED)]
        self.assertGreaterEqual(len(fuelings), 2)

    def test_pickup_and_dropoff_each_consume_one_hour(self):
        scheduler = HOSScheduler(
            current_location=self.chicago,
            pickup_location=self.indianapolis,
            dropoff_location=self.atlanta,
            total_distance_miles=700.0,
            route_geometry=[[41.8781, -87.6298], [33.7490, -84.3880]],
            current_cycle_used=0.0
        )
        res = scheduler.plan_schedule()
        
        pickup = next(s for s in res.stops if s.stop_type == StopType.PICKUP)
        dropoff = next(s for s in res.stops if s.stop_type == StopType.DROPOFF)
        self.assertEqual(pickup.duration_minutes, 60)
        self.assertEqual(dropoff.duration_minutes, 60)

    def test_all_daily_logs_reconcile_to_24_hours(self):
        scheduler = HOSScheduler(
            current_location=self.chicago,
            pickup_location=self.chicago,
            dropoff_location=self.los_angeles,
            total_distance_miles=2100.0,
            route_geometry=[[41.8781, -87.6298], [34.0522, -118.2437]],
            current_cycle_used=40.0
        )
        res = scheduler.plan_schedule()
        
        self.assertGreater(len(res.daily_logs), 2)
        for log in res.daily_logs:
            self.assertEqual(log.total_day_hours, 24.0)
            status_sum = (
                log.off_duty_hours +
                log.sleeper_berth_hours +
                log.driving_hours +
                log.on_duty_not_driving_hours
            )
            self.assertAlmostEqual(status_sum, 24.0, places=2)
