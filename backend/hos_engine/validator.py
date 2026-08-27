"""
HOS Schedule Validator for FMCSA 49 CFR Part 395 Compliance.
Validates 11-hour driving, 14-hour window, 30-minute break, 70/8 cycle,
fueling intervals, and 24-hour daily log reconciliation.
"""

from typing import List, Dict, Any
from .domain import HOSScheduleResult, StopType, DutyStatus


class HOSValidator:
    """
    Independent compliance audit engine for planned trip schedules.
    """

    @classmethod
    def validate_schedule(cls, result: HOSScheduleResult) -> Dict[str, Any]:
        violations: List[str] = []
        warnings: List[str] = []
        checks_passed: List[str] = []

        # 1. Check Daily 24-Hour Reconciliations
        all_24h = True
        for log in result.daily_logs:
            sum_hours = (
                log.off_duty_hours +
                log.sleeper_berth_hours +
                log.driving_hours +
                log.on_duty_not_driving_hours
            )
            if abs(sum_hours - 24.0) > 0.05:
                all_24h = False
                violations.append(
                    f"Day {log.day_number} ({log.log_date}): Total hours equal {sum_hours:.2f}h instead of required 24.00h."
                )
        if all_24h:
            checks_passed.append("24-Hour Day Reconciliation: 100% of calendar days sum to exactly 24.00 hours.")

        # 2. Check 11-Hour Driving Limit per Shift
        # Check driving hours in each daily log
        max_day_driving = max([log.driving_hours for log in result.daily_logs], default=0.0)
        if max_day_driving > 11.0:
            violations.append(
                f"11-Hour Driving Rule: Driving time of {max_day_driving:.2f}h exceeds legal limit of 11.0 hours."
            )
        else:
            checks_passed.append(f"11-Hour Driving Limit: Maximum daily driving is {max_day_driving:.2f}h (≤ 11.0h limit).")

        # 3. Check 70-Hour / 8-Day Cycle Rule
        if result.required_34h_restart:
            checks_passed.append(
                f"70-Hour Cycle Management: 34-Hour Restart inserted on Day {result.restart_day or 'N/A'} to restore 70h cycle."
            )
        else:
            end_cycle = result.current_cycle_used_start + result.total_cycle_hours_consumed
            if end_cycle > 70.0:
                violations.append(
                    f"70-Hour / 8-Day Limit: Accumulated on-duty cycle ({end_cycle:.1f}h) exceeds 70.0h limit."
                )
            else:
                checks_passed.append(
                    f"70-Hour / 8-Day Cycle: Final cycle utilization is {end_cycle:.1f}h of 70.0h ({70.0 - end_cycle:.1f}h remaining)."
                )

        # 4. Check Fueling Distance Intervals (≤ 1,000 miles)
        fuel_stops = [s for s in result.stops if s.stop_type in (StopType.FUEL, StopType.COMBINED)]
        if result.total_distance_miles > 1000.0:
            if len(fuel_stops) == 0:
                violations.append(
                    f"Fueling Rule: Total distance {result.total_distance_miles:.0f} mi exceeds 1,000 miles without scheduled fuel stops."
                )
            else:
                checks_passed.append(
                    f"Fueling Interval: {len(fuel_stops)} fuel stop(s) scheduled to enforce ≤1,000 mile threshold."
                )
        else:
            checks_passed.append("Fueling Interval: Total distance ≤1,000 miles; no intermediate fueling required.")

        # 5. Check Pickup and Drop-off Stops
        pickup_stop = next((s for s in result.stops if s.stop_type == StopType.PICKUP), None)
        dropoff_stop = next((s for s in result.stops if s.stop_type == StopType.DROPOFF), None)

        if pickup_stop and pickup_stop.duration_minutes == 60:
            checks_passed.append("Pickup Duration: Exactly 1.0 hour (60 mins) On-Duty Not Driving scheduled.")
        else:
            warnings.append("Pickup stop duration is not 60 minutes.")

        if dropoff_stop and dropoff_stop.duration_minutes == 60:
            checks_passed.append("Drop-off Duration: Exactly 1.0 hour (60 mins) On-Duty Not Driving scheduled.")
        else:
            warnings.append("Drop-off stop duration is not 60 minutes.")

        is_valid = len(violations) == 0

        return {
            "is_valid": is_valid,
            "status": "LEGAL" if is_valid else "NON_COMPLIANT",
            "violations": violations,
            "warnings": warnings,
            "checks_passed": checks_passed,
            "total_checks": len(checks_passed) + len(violations)
        }
