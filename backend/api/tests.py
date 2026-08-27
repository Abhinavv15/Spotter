from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status


class RoutingAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_health_check_returns_200(self):
        response = self.client.get(reverse('api-health'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data.get('status'), 'healthy')

    def test_location_autocomplete_returns_suggestions(self):
        response = self.client.get(reverse('location-autocomplete') + '?q=Chicago')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data.get('results', [])
        self.assertGreater(len(results), 0)
        self.assertTrue(any('Chicago' in item.get('name', '') for item in results))

    def test_route_preview_success(self):
        payload = {
            "current_location": "Chicago, IL",
            "pickup_location": "Indianapolis, IN",
            "dropoff_location": "Atlanta, GA"
        }
        response = self.client.post(reverse('route-preview'), payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total_distance_miles', response.data)
        self.assertIn('estimated_duration_hours', response.data)
        self.assertIn('route_geometry', response.data)
        self.assertGreater(response.data['total_distance_miles'], 100)

    def test_route_preview_validation_error(self):
        response = self.client.post(reverse('route-preview'), {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class TripPlanAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_plan_trip_success(self):
        payload = {
            "current_location": "Chicago, IL",
            "pickup_location": "Indianapolis, IN",
            "dropoff_location": "Atlanta, GA",
            "current_cycle_used": 24.5,
            "driver_name": "Sarah Miller",
            "carrier_name": "Titan Freightways",
            "truck_number": "TRK-9021",
            "trailer_number": "TRL-4412"
        }
        response = self.client.post(reverse('trip-plan'), payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('id', response.data)
        self.assertIn('stops', response.data)
        self.assertIn('daily_logs', response.data)
        self.assertIn('hos_summary', response.data)
        self.assertEqual(response.data['driver_name'], "Sarah Miller")
        self.assertEqual(response.data['current_cycle_used'], 24.5)
        self.assertGreater(len(response.data['stops']), 2)
        self.assertGreater(len(response.data['daily_logs']), 0)
        self.assertEqual(response.data['hos_summary']['status_badge'], 'LEGAL')

        # Test retrieve by ID
        trip_id = response.data['id']
        detail_resp = self.client.get(f'/api/trips/{trip_id}/')
        self.assertEqual(detail_resp.status_code, status.HTTP_200_OK)
        self.assertEqual(detail_resp.data['id'], trip_id)

    def test_plan_trip_invalid_cycle_hours(self):
        payload = {
            "current_location": "Chicago, IL",
            "pickup_location": "Indianapolis, IN",
            "dropoff_location": "Atlanta, GA",
            "current_cycle_used": 75.0  # Invalid > 70
        }
        response = self.client.post(reverse('trip-plan'), payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_plan_trip_missing_locations(self):
        payload = {
            "current_location": "",
            "pickup_location": "Indianapolis, IN",
            "dropoff_location": "Atlanta, GA",
            "current_cycle_used": 10.0
        }
        response = self.client.post(reverse('trip-plan'), payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
