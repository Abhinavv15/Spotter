"""
HOS Mathematical Constants and Rule Calculations according to FMCSA § 395 (April 2022).
"""

# FMCSA Part 395 Constants
MAX_DAILY_DRIVING_HOURS = 11.0
MAX_DAILY_DUTY_WINDOW_HOURS = 14.0
MANDATORY_DAILY_REST_HOURS = 10.0
MAX_DRIVING_BEFORE_BREAK_HOURS = 8.0
MANDATORY_REST_BREAK_MINUTES = 30
MANDATORY_REST_BREAK_HOURS = 0.5
MAX_CYCLE_ON_DUTY_HOURS = 70.0
CYCLE_DAYS = 8
MANDATORY_RESTART_HOURS = 34.0
MAX_FUEL_INTERVAL_MILES = 1000.0
PICKUP_DURATION_HOURS = 1.0
DROPOFF_DURATION_HOURS = 1.0
FUELING_DURATION_HOURS = 0.5
DEFAULT_TRUCK_AVERAGE_MPH = 55.0


def calculate_cycle_hours_available(current_cycle_used: float) -> float:
    """Returns available on-duty cycle hours (0 to 70)."""
    used = max(0.0, min(70.0, current_cycle_used))
    return max(0.0, MAX_CYCLE_ON_DUTY_HOURS - used)


def requires_34h_restart_for_trip(
    current_cycle_used: float,
    estimated_trip_on_duty_hours: float
) -> bool:
    """
    Determines if the driver's current available cycle is insufficient
    to complete the trip without exceeding 70 on-duty hours in 8 days.
    """
    avail = calculate_cycle_hours_available(current_cycle_used)
    return estimated_trip_on_duty_hours > avail


def should_schedule_fuel_stop(
    miles_since_last_fuel: float,
    projected_next_leg_miles: float
) -> bool:
    """
    Checks if a fuel stop must be scheduled before exceeding 1,000 miles.
    """
    return (miles_since_last_fuel + projected_next_leg_miles) > MAX_FUEL_INTERVAL_MILES
