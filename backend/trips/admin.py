from django.contrib import admin
from .models import Trip, Stop, DutyPeriod, DailyLog


@admin.register(Trip)
class TripAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'current_location_name', 'pickup_location_name',
        'dropoff_location_name', 'total_distance_miles',
        'total_trip_days', 'is_legal', 'created_at'
    )
    list_filter = ('is_legal', 'created_at')
    search_fields = ('current_location_name', 'pickup_location_name', 'dropoff_location_name', 'driver_name')


@admin.register(Stop)
class StopAdmin(admin.ModelAdmin):
    list_display = ('stop_sequence', 'trip', 'stop_type', 'location_name', 'arrival_time', 'duration_minutes', 'is_optimized')
    list_filter = ('stop_type', 'is_optimized')


@admin.register(DutyPeriod)
class DutyPeriodAdmin(admin.ModelAdmin):
    list_display = ('trip', 'day_number', 'duty_status', 'start_time', 'end_time', 'duration_hours', 'start_location')
    list_filter = ('duty_status', 'day_number')


@admin.register(DailyLog)
class DailyLogAdmin(admin.ModelAdmin):
    list_display = ('trip', 'day_number', 'log_date', 'total_miles_today', 'driving_hours', 'total_day_hours')
    list_filter = ('day_number', 'log_date')
