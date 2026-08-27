"""
Domain entities and enums for the HOS Engine.
"""

from enum import Enum
from dataclasses import dataclass, field
from datetime import datetime, date
from typing import List, Optional, Dict, Any


class DutyStatus(str, Enum):
    OFF_DUTY = "OFF_DUTY"
    SLEEPER_BERTH = "SLEEPER_BERTH"
    DRIVING = "DRIVING"
    ON_DUTY_NOT_DRIVING = "ON_DUTY_NOT_DRIVING"

    @property
    def row_index(self) -> int:
        """1-indexed grid row on FMCSA paper log sheet."""
        mapping = {
            DutyStatus.OFF_DUTY: 1,
            DutyStatus.SLEEPER_BERTH: 2,
            DutyStatus.DRIVING: 3,
            DutyStatus.ON_DUTY_NOT_DRIVING: 4,
        }
        return mapping[self]

    @property
    def display_name(self) -> str:
        mapping = {
            DutyStatus.OFF_DUTY: "1. Off Duty",
            DutyStatus.SLEEPER_BERTH: "2. Sleeper Berth",
            DutyStatus.DRIVING: "3. Driving",
            DutyStatus.ON_DUTY_NOT_DRIVING: "4. On Duty (Not Driving)",
        }
        return mapping[self]


class StopType(str, Enum):
    CURRENT = "CURRENT"
    PICKUP = "PICKUP"
    DROPOFF = "DROPOFF"
    FUEL = "FUEL"
    REST_10H = "REST_10H"
    REST_34H = "REST_34H"
    BREAK_30M = "BREAK_30M"
    COMBINED = "COMBINED"


@dataclass
class DutySegment:
    """Continuous duty status chunk within a single calendar day (0:00 to 24:00)."""
    status: DutyStatus
    start_hour: float  # 0.0 to 24.0
    end_hour: float    # 0.0 to 24.0
    duration_hours: float
    location: str
    note: str = ""


@dataclass
class RemarkEntry:
    """Remark annotation for duty status changes."""
    time_str: str
    hour: float
    status: DutyStatus
    location: str
    note: str = ""


@dataclass
class DayLogReport:
    """Complete 24-hour daily log report for a single calendar day."""
    day_number: int
    log_date: date
    total_miles_today: float
    off_duty_hours: float
    sleeper_berth_hours: float
    driving_hours: float
    on_duty_not_driving_hours: float
    total_day_hours: float  # Reconciles to 24.0
    cycle_hours_today: float
    cycle_hours_7day: float
    cycle_hours_8day: float
    cycle_hours_available_tomorrow: float
    duty_segments: List[DutySegment] = field(default_factory=list)
    remarks: List[RemarkEntry] = field(default_factory=list)


@dataclass
class ScheduledStop:
    sequence: int
    stop_type: StopType
    location_name: str = ""
    latitude: float = 0.0
    longitude: float = 0.0
    arrival_time: Optional[datetime] = None
    departure_time: Optional[datetime] = None
    duration_minutes: int = 0
    distance_from_last_miles: float = 0.0
    odometer_miles: float = 0.0
    reason: str = ""
    hos_impact: str = ""
    is_optimized: bool = False


@dataclass
class HOSScheduleResult:
    is_legal: bool = True
    total_distance_miles: float = 0.0
    total_duration_hours: float = 0.0
    driving_time_hours: float = 0.0
    rest_time_hours: float = 0.0
    total_trip_days: int = 1
    current_cycle_used_start: float = 0.0
    cycle_hours_remaining_start: float = 70.0
    total_cycle_hours_consumed: float = 0.0
    cycle_hours_remaining_end: float = 70.0
    required_34h_restart: bool = False
    restart_day: Optional[int] = None
    stops: List[ScheduledStop] = field(default_factory=list)
    daily_logs: List[DayLogReport] = field(default_factory=list)
    violations: List[str] = field(default_factory=list)
    explanations: List[str] = field(default_factory=list)
    status_summary: str = "LEGAL"
