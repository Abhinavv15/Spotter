from rest_framework import serializers
from .models import Trip, Stop, DutyPeriod, DailyLog


class StopSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stop
        fields = '__all__'


class DutyPeriodSerializer(serializers.ModelSerializer):
    class Meta:
        model = DutyPeriod
        fields = '__all__'


class DailyLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyLog
        fields = '__all__'


class TripDetailSerializer(serializers.ModelSerializer):
    stops = StopSerializer(many=True, read_only=True)
    duty_periods = DutyPeriodSerializer(many=True, read_only=True)
    daily_logs = DailyLogSerializer(many=True, read_only=True)

    class Meta:
        model = Trip
        fields = '__all__'


class TripListSerializer(serializers.ModelSerializer):
    stops_count = serializers.IntegerField(source='stops.count', read_only=True)
    days_count = serializers.IntegerField(source='daily_logs.count', read_only=True)

    class Meta:
        model = Trip
        fields = [
            'id', 'current_location_name', 'pickup_location_name',
            'dropoff_location_name', 'total_distance_miles',
            'total_duration_hours', 'driving_time_hours', 'rest_time_hours',
            'total_trip_days', 'current_cycle_used', 'is_legal',
            'hos_status_summary', 'stops_count', 'days_count', 'created_at'
        ]
