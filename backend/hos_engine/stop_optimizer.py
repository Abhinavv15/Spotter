"""
Stop Optimization Engine for Spotter.
Enhances stop schedules by merging required breaks with mandatory fuel stops
and generating clear 'Why this stop?' justifications.
"""

from typing import List, Dict, Any
from .domain import ScheduledStop, StopType, HOSScheduleResult, DayLogReport


class StopOptimizer:
    """
    Analyzes and optimizes stops along the planned route.
    """

    @classmethod
    def optimize_and_annotate(cls, result: HOSScheduleResult) -> HOSScheduleResult:
        """
        Refines stop annotations, formats friendly times, and structures day-by-day summaries.
        """
        for stop in result.stops:
            # Format comprehensive reason explanations
            if stop.stop_type == StopType.CURRENT:
                stop.reason = f"Trip departure from {stop.location_name}. Driver begins pre-trip duty."
            elif stop.stop_type == StopType.PICKUP:
                stop.reason = (
                    f"Shipper Loading at {stop.location_name}. Exactly 1.0 hour scheduled for "
                    f"cargo loading, vehicle inspection, and bill of lading manifest verification."
                )
            elif stop.stop_type == StopType.DROPOFF:
                stop.reason = (
                    f"Consignee Delivery at {stop.location_name}. Exactly 1.0 hour scheduled for "
                    f"cargo unloading, receiver sign-off, and post-trip duty completion."
                )
            elif stop.stop_type == StopType.COMBINED:
                stop.reason = (
                    f"Dual-Purpose Stop at {stop.location_name}: Scheduled fueling (reached {stop.odometer_miles:.0f} mi, "
                    f"≤1,000-mile rule) and simultaneously fulfills mandatory 30-minute driving break (§ 395.3(a)(3)(ii)), "
                    f"saving 30+ minutes of unnecessary driver downtime."
                )
                stop.is_optimized = True
            elif stop.stop_type == StopType.FUEL:
                stop.reason = (
                    f"Commercial Fueling Stop at {stop.location_name} (odometer: {stop.odometer_miles:.0f} mi). "
                    f"Required to comply with standard ≤1,000-mile fueling threshold."
                )
            elif stop.stop_type == StopType.BREAK_30M:
                stop.reason = (
                    f"30-Minute Rest Break at {stop.location_name}. FMCSA § 395.3(a)(3)(ii) mandates "
                    f"at least 30 consecutive minutes of non-driving time after 8 cumulative driving hours."
                )
            elif stop.stop_type == StopType.REST_10H:
                stop.reason = (
                    f"10-Hour Mandatory Rest Period at {stop.location_name}. FMCSA § 395.3(a)(1) requires "
                    f"10 consecutive hours Off-Duty / Sleeper Berth before resuming CMV driving."
                )
            elif stop.stop_type == StopType.REST_34H:
                stop.reason = (
                    f"34-Hour Restart at {stop.location_name}. FMCSA § 395.3(c) allows a driver to "
                    f"reset the 70-hour / 8-day rolling cycle back to 0.0 hours used by taking 34+ consecutive hours rest."
                )

        return result
