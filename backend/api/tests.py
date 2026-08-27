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
