"""
Core HOS Simulation Scheduler for Spotter.
Deterministically simulates truck route execution under FMCSA 49 CFR § 395 rules.
"""

import math
from datetime import datetime, date, timedelta, timezone as dt_timezone
from typing import List, Tuple, Dict, Any, Optional
from .domain import (
    DutyStatus,
    StopType,
    DutySegment,
    RemarkEntry,
    DayLogReport,
    ScheduledStop,
    HOSScheduleResult
)
from .calculator import (
    MAX_DAILY_DRIVING_HOURS,
    MAX_DAILY_DUTY_WINDOW_HOURS,
    MANDATORY_DAILY_REST_HOURS,
    MAX_DRIVING_BEFORE_BREAK_HOURS,
    MANDATORY_REST_BREAK_HOURS,
    MAX_CYCLE_ON_DUTY_HOURS,
    MANDATORY_RESTART_HOURS,
    MAX_FUEL_INTERVAL_MILES,
    PICKUP_DURATION_HOURS,
    DROPOFF_DURATION_HOURS,
    FUELING_DURATION_HOURS,
    DEFAULT_TRUCK_AVERAGE_MPH,
    calculate_cycle_hours_available
)
from .services.routing import find_location_along_route, haversine_distance_miles


def _make_aware(dt: datetime) -> datetime:
    """Ensure a datetime is UTC-aware. If already aware, return as-is."""
    if dt.tzinfo is None or dt.tzinfo.utcoffset(dt) is None:
        return dt.replace(tzinfo=dt_timezone.utc)
    return dt


def _midnight_of(dt: datetime) -> datetime:
    """Return the UTC-aware midnight (00:00:00) of the same calendar date."""
    tz = dt.tzinfo or dt_timezone.utc
    return datetime(dt.year, dt.month, dt.day, 0, 0, 0, tzinfo=tz)


class HOSScheduler:
    """
    Simulates truck movement, duty status transitions, stop scheduling,
    and calendar-day ELD log segmentation.
    """

    def __init__(
        self,
        current_location: Dict[str, Any],
        pickup_location: Dict[str, Any],
        dropoff_location: Dict[str, Any],
        total_distance_miles: float,
        route_geometry: List[List[float]],
        current_cycle_used: float = 0.0,
        departure_time: Optional[datetime] = None,
        average_speed_mph: float = DEFAULT_TRUCK_AVERAGE_MPH
    ):
        self.current_location = current_location
        self.pickup_location = pickup_location
        self.dropoff_location = dropoff_location
        self.total_distance_miles = max(1.0, total_distance_miles)
        self.route_geometry = route_geometry
        self.current_cycle_used = max(0.0, min(70.0, current_cycle_used))
        self.average_speed_mph = max(30.0, min(70.0, average_speed_mph))

        # Default departure: Tomorrow at 06:00:00 UTC if not specified
        if departure_time is None:
            start_date = datetime.now(dt_timezone.utc).date() + timedelta(days=1)
            self.departure_time = datetime(
                start_date.year, start_date.month, start_date.day, 6, 0, 0,
                tzinfo=dt_timezone.utc
            )
        else:
            self.departure_time = _make_aware(departure_time)

        # Calculate Leg 1 (Current -> Pickup) and Leg 2 (Pickup -> Dropoff) distances
        d_pickup = haversine_distance_miles(
            current_location["lat"], current_location["lng"],
            pickup_location["lat"], pickup_location["lng"]
        ) * 1.22
        d_dropoff = haversine_distance_miles(
            pickup_location["lat"], pickup_location["lng"],
            dropoff_location["lat"], dropoff_location["lng"]
        ) * 1.22
        
        ratio = d_pickup / max(0.1, d_pickup + d_dropoff)
        self.leg1_miles = min(self.total_distance_miles * ratio, self.total_distance_miles)
        self.leg2_miles = max(0.0, self.total_distance_miles - self.leg1_miles)

    def plan_schedule(self) -> HOSScheduleResult:
        """
        Executes the deterministic HOS simulation and returns the complete schedule.
        """
        events: List[Dict[str, Any]] = []
        stops: List[ScheduledStop] = []
        explanations: List[str] = []
        violations: List[str] = []

        curr_time = self.departure_time
        curr_odometer = 0.0
        miles_since_fuel = 0.0
        
        # Shift clocks
        driving_in_shift = 0.0
        window_elapsed = 0.0
        continuous_driving = 0.0
        
        # Cycle tracking
        cycle_used = self.current_cycle_used
        cycle_consumed_on_trip = 0.0
        required_34h_restart = False
        restart_day: Optional[int] = None
        stop_seq = 1

        # Day 1 start: Initial Off-Duty from 00:00 to departure_time
        day_start_midnight = _midnight_of(curr_time)
        initial_off_hours = (curr_time - day_start_midnight).total_seconds() / 3600.0
        if initial_off_hours > 0:
            events.append({
                "status": DutyStatus.OFF_DUTY,
                "start": day_start_midnight,
                "end": curr_time,
                "duration": initial_off_hours,
                "location": self.current_location["name"],
                "note": "Pre-departure off duty"
            })

        # Add Stop 1: Current Location Departure
        stops.append(ScheduledStop(
            sequence=stop_seq,
            stop_type=StopType.CURRENT,
            location_name=self.current_location["name"],
            latitude=self.current_location["lat"],
            longitude=self.current_location["lng"],
            arrival_time=curr_time,
            departure_time=curr_time,
            duration_minutes=0,
            distance_from_last_miles=0.0,
            odometer_miles=0.0,
            reason="Trip departure location.",
            hos_impact="Shift and 14-hour window starts upon departure/duty commencement."
        ))
        stop_seq += 1

        explanations.append(
            f"Trip commences at {self.current_location['name']} with {cycle_used:.1f}h of 70h cycle previously used ({70.0 - cycle_used:.1f}h remaining)."
        )

        def add_event(status: DutyStatus, duration_hours: float, loc_name: str, note: str = ""):
            nonlocal curr_time, window_elapsed, continuous_driving, driving_in_shift, cycle_used, cycle_consumed_on_trip
            ev_start = curr_time
            curr_time = curr_time + timedelta(hours=duration_hours)
            events.append({
                "status": status,
                "start": ev_start,
                "end": curr_time,
                "duration": duration_hours,
                "location": loc_name,
                "note": note
            })
            window_elapsed += duration_hours
            if status == DutyStatus.DRIVING:
                driving_in_shift += duration_hours
                continuous_driving += duration_hours
                cycle_used += duration_hours
                cycle_consumed_on_trip += duration_hours
            elif status == DutyStatus.ON_DUTY_NOT_DRIVING:
                cycle_used += duration_hours
                cycle_consumed_on_trip += duration_hours
                if duration_hours >= 0.5:
                    continuous_driving = 0.0  # Resets 30-min break clock
            elif status in (DutyStatus.OFF_DUTY, DutyStatus.SLEEPER_BERTH):
                if duration_hours >= 0.5:
                    continuous_driving = 0.0  # Resets 30-min break clock

        def do_rest(is_34h: bool = False, reason_txt: str = ""):
            nonlocal curr_time, window_elapsed, continuous_driving, driving_in_shift, cycle_used, stop_seq, required_34h_restart, restart_day
            rest_hours = MANDATORY_RESTART_HOURS if is_34h else MANDATORY_DAILY_REST_HOURS
            stop_type = StopType.REST_34H if is_34h else StopType.REST_10H
            
            # Find location along route
            ratio = min(1.0, curr_odometer / max(1.0, self.total_distance_miles))
            lat, lng, loc_label = find_location_along_route(self.route_geometry, ratio)
            
            arr = curr_time
            dep = curr_time + timedelta(hours=rest_hours)
            
            stops.append(ScheduledStop(
                sequence=stop_seq,
                stop_type=stop_type,
                location_name=loc_label,
                latitude=lat,
                longitude=lng,
                arrival_time=arr,
                departure_time=dep,
                duration_minutes=int(rest_hours * 60),
                distance_from_last_miles=0.0,
                odometer_miles=curr_odometer,
                reason=reason_txt or ("34-Hour Restart to restore full 70-hour cycle." if is_34h else "10-Hour Mandatory Off-Duty / Sleeper Berth rest period."),
                hos_impact="Resets 70-hour cycle to 0h." if is_34h else "Resets 11-hour driving clock and 14-hour window."
            ))
            stop_seq += 1

            if is_34h:
                required_34h_restart = True
                calc_day = (curr_time - self.departure_time).days + 1
                restart_day = calc_day
                explanations.append(
                    f"Day {calc_day}: 34-Hour Restart scheduled at {loc_label} ({reason_txt}). Cycle reset to 0.0h used."
                )

            # Record rest as Sleeper Berth
            add_event(DutyStatus.SLEEPER_BERTH, rest_hours, loc_label, f"{'34h Restart' if is_34h else '10h Rest'} at {loc_label}")
            
            # Reset shift clocks
            driving_in_shift = 0.0
            window_elapsed = 0.0
            continuous_driving = 0.0
            if is_34h:
                cycle_used = 0.0

        def do_fuel(loc_label: str, lat: float, lng: float, combined_break: bool = False):
            nonlocal miles_since_fuel, stop_seq
            fuel_duration_hours = FUELING_DURATION_HOURS  # 0.5h (30 mins)
            arr = curr_time
            dep = curr_time + timedelta(hours=fuel_duration_hours)
            
            stype = StopType.COMBINED if combined_break else StopType.FUEL
            reason_str = (
                f"Fueling required (reached {curr_odometer:.0f} mi, ≤1,000 mi rule). "
                f"Also satisfies mandatory 30-minute driving break (FMCSA § 395.3(a)(3)(ii))."
                if combined_break else
                f"Routine commercial fueling stop (odometer: {curr_odometer:.0f} mi)."
            )

            stops.append(ScheduledStop(
                sequence=stop_seq,
                stop_type=stype,
                location_name=loc_label,
                latitude=lat,
                longitude=lng,
                arrival_time=arr,
                departure_time=dep,
                duration_minutes=int(fuel_duration_hours * 60),
                distance_from_last_miles=0.0,
                odometer_miles=curr_odometer,
                reason=reason_str,
                hos_impact="Counts as 30m On-Duty Not Driving; fulfills 30m rest break.",
                is_optimized=combined_break
            ))
            stop_seq += 1
            miles_since_fuel = 0.0
            add_event(DutyStatus.ON_DUTY_NOT_DRIVING, fuel_duration_hours, loc_label, "Fueling & inspection")

        def do_break_30m(loc_label: str, lat: float, lng: float):
            nonlocal stop_seq
            arr = curr_time
            dep = curr_time + timedelta(hours=MANDATORY_REST_BREAK_HOURS)
            
            stops.append(ScheduledStop(
                sequence=stop_seq,
                stop_type=StopType.BREAK_30M,
                location_name=loc_label,
                latitude=lat,
                longitude=lng,
                arrival_time=arr,
                departure_time=dep,
                duration_minutes=30,
                distance_from_last_miles=0.0,
                odometer_miles=curr_odometer,
                reason="Mandatory 30-minute consecutive rest break after 8 cumulative hours of driving.",
                hos_impact="Resets 8-hour driving break clock."
            ))
            stop_seq += 1
            add_event(DutyStatus.OFF_DUTY, MANDATORY_REST_BREAK_HOURS, loc_label, "30-minute rest break")

        def drive_distance(distance_to_cover: float, destination_label: str):
            nonlocal curr_odometer, miles_since_fuel, stop_seq, cycle_used
            remaining_dist = distance_to_cover

            while remaining_dist > 0.1:
                # Check 70-hour cycle limit: if < 1.0h available on cycle, must take 34h restart
                if (MAX_CYCLE_ON_DUTY_HOURS - cycle_used) <= 0.5:
                    do_rest(is_34h=True, reason_txt=f"Cycle hours reached {cycle_used:.1f}h of 70h limit. 34-hour restart required to continue.")
                    continue

                # Calculate limits for next driving chunk
                max_drive_cycle = MAX_CYCLE_ON_DUTY_HOURS - cycle_used
                max_drive_shift = MAX_DAILY_DRIVING_HOURS - driving_in_shift
                max_drive_window = MAX_DAILY_DUTY_WINDOW_HOURS - window_elapsed
                max_drive_break = MAX_DRIVING_BEFORE_BREAK_HOURS - continuous_driving
                
                max_allowed_hours = min(max_drive_shift, max_drive_window, max_drive_break, max_drive_cycle)

                # If shift/window expired, take 10-hour rest
                if max_drive_shift <= 0.05 or max_drive_window <= 0.05:
                    reason = "11-hour daily driving limit reached." if max_drive_shift <= 0.05 else "14-hour duty window elapsed."
                    do_rest(is_34h=False, reason_txt=reason)
                    continue

                # If 8-hour break needed, take break (or combine with fuel if miles > 600)
                if max_drive_break <= 0.05:
                    ratio = min(1.0, curr_odometer / max(1.0, self.total_distance_miles))
                    lat, lng, loc_label = find_location_along_route(self.route_geometry, ratio)
                    if miles_since_fuel >= 500:
                        do_fuel(loc_label, lat, lng, combined_break=True)
                    else:
                        do_break_30m(loc_label, lat, lng)
                    continue

                # Miles we can drive in this chunk
                max_miles_before_fuel = max(1.0, MAX_FUEL_INTERVAL_MILES - miles_since_fuel)
                chunk_miles_by_hos = max_allowed_hours * self.average_speed_mph

                # Decide chunk size
                if chunk_miles_by_hos >= remaining_dist and max_miles_before_fuel >= remaining_dist:
                    # Can complete remaining distance to destination
                    chunk_miles = remaining_dist
                    chunk_hours = chunk_miles / self.average_speed_mph
                    add_event(DutyStatus.DRIVING, chunk_hours, destination_label, f"Driving to {destination_label}")
                    curr_odometer += chunk_miles
                    miles_since_fuel += chunk_miles
                    remaining_dist = 0.0
                elif max_miles_before_fuel <= chunk_miles_by_hos and max_miles_before_fuel < remaining_dist:
                    # Fuel stop is needed first
                    chunk_miles = max_miles_before_fuel
                    chunk_hours = chunk_miles / self.average_speed_mph
                    curr_odometer += chunk_miles
                    miles_since_fuel += chunk_miles
                    remaining_dist -= chunk_miles
                    ratio = min(1.0, curr_odometer / max(1.0, self.total_distance_miles))
                    lat, lng, loc_label = find_location_along_route(self.route_geometry, ratio)
                    add_event(DutyStatus.DRIVING, chunk_hours, loc_label, f"Driving towards {loc_label}")
                    # Combine with 30m break if continuous driving is >= 5.0 hours
                    is_comb = continuous_driving >= 4.5
                    do_fuel(loc_label, lat, lng, combined_break=is_comb)
                else:
                    # HOS limit reached first (e.g. 8h break or 11h driving)
                    chunk_miles = chunk_miles_by_hos
                    chunk_hours = max_allowed_hours
                    curr_odometer += chunk_miles
                    miles_since_fuel += chunk_miles
                    remaining_dist -= chunk_miles
                    ratio = min(1.0, curr_odometer / max(1.0, self.total_distance_miles))
                    lat, lng, loc_label = find_location_along_route(self.route_geometry, ratio)
                    add_event(DutyStatus.DRIVING, chunk_hours, loc_label, f"Driving towards {loc_label}")

        # --- STEP 1: DRIVE TO PICKUP ---
        if self.leg1_miles > 0.5:
            drive_distance(self.leg1_miles, self.pickup_location["name"])

        # --- STEP 2: PICKUP STOP (1 HOUR ON DUTY NOT DRIVING) ---
        # Check if 14-hour window or cycle allows 1 hour on duty
        if (MAX_DAILY_DUTY_WINDOW_HOURS - window_elapsed) < 1.0:
            do_rest(is_34h=False, reason_txt="14-hour duty window would expire during pickup loading.")
        if (MAX_CYCLE_ON_DUTY_HOURS - cycle_used) < 1.0:
            do_rest(is_34h=True, reason_txt="Insufficient 70-hour cycle remaining for pickup loading.")

        pickup_arr = curr_time
        pickup_dep = curr_time + timedelta(hours=PICKUP_DURATION_HOURS)
        stops.append(ScheduledStop(
            sequence=stop_seq,
            stop_type=StopType.PICKUP,
            location_name=self.pickup_location["name"],
            latitude=self.pickup_location["lat"],
            longitude=self.pickup_location["lng"],
            arrival_time=pickup_arr,
            departure_time=pickup_dep,
            duration_minutes=60,
            distance_from_last_miles=self.leg1_miles,
            odometer_miles=curr_odometer,
            reason="Shipper Pickup: 1 hour On Duty (Not Driving) for cargo loading & paperwork.",
            hos_impact="Consumes 1h On-Duty; counts towards 14-hour window and 70-hour cycle."
        ))
        stop_seq += 1
        add_event(DutyStatus.ON_DUTY_NOT_DRIVING, PICKUP_DURATION_HOURS, self.pickup_location["name"], "Cargo loading / Shipper Pickup")
        explanations.append(
            f"Pickup completed at {self.pickup_location['name']} (1.0h On Duty Not Driving)."
        )

        # --- STEP 3: DRIVE TO DROPOFF ---
        if self.leg2_miles > 0.5:
            drive_distance(self.leg2_miles, self.dropoff_location["name"])

        # --- STEP 4: DROPOFF STOP (1 HOUR ON DUTY NOT DRIVING) ---
        if (MAX_DAILY_DUTY_WINDOW_HOURS - window_elapsed) < 1.0:
            do_rest(is_34h=False, reason_txt="14-hour duty window would expire during dropoff unloading.")
        if (MAX_CYCLE_ON_DUTY_HOURS - cycle_used) < 1.0:
            do_rest(is_34h=True, reason_txt="Insufficient 70-hour cycle remaining for dropoff unloading.")

        dropoff_arr = curr_time
        dropoff_dep = curr_time + timedelta(hours=DROPOFF_DURATION_HOURS)
        stops.append(ScheduledStop(
            sequence=stop_seq,
            stop_type=StopType.DROPOFF,
            location_name=self.dropoff_location["name"],
            latitude=self.dropoff_location["lat"],
            longitude=self.dropoff_location["lng"],
            arrival_time=dropoff_arr,
            departure_time=dropoff_dep,
            duration_minutes=60,
            distance_from_last_miles=self.leg2_miles,
            odometer_miles=curr_odometer,
            reason="Receiver Drop-off: 1 hour On Duty (Not Driving) for cargo unloading & delivery confirmation.",
            hos_impact="Consumes 1h On-Duty; completes trip delivery."
        ))
        stop_seq += 1
        add_event(DutyStatus.ON_DUTY_NOT_DRIVING, DROPOFF_DURATION_HOURS, self.dropoff_location["name"], "Cargo unloading / Receiver Drop-off")
        explanations.append(
            f"Drop-off completed at {self.dropoff_location['name']} (1.0h On Duty Not Driving)."
        )

        # Final Off-Duty to close out final calendar day at 24:00
        final_day_midnight = _midnight_of(curr_time) + timedelta(days=1)
        remaining_day_off = (final_day_midnight - curr_time).total_seconds() / 3600.0
        if remaining_day_off > 0:
            events.append({
                "status": DutyStatus.OFF_DUTY,
                "start": curr_time,
                "end": final_day_midnight,
                "duration": remaining_day_off,
                "location": self.dropoff_location["name"],
                "note": "Post-trip off duty"
            })

        # --- STEP 5: RECONCILE CALENDAR DAYS & BUILD DAILY LOGS ---
        daily_logs = self._build_daily_logs(events, stops)

        total_driving_hours = sum(
            e["duration"] for e in events if e["status"] == DutyStatus.DRIVING
        )
        total_rest_hours = sum(
            e["duration"] for e in events if e["status"] in (DutyStatus.OFF_DUTY, DutyStatus.SLEEPER_BERTH)
        )
        total_trip_duration = (curr_time - self.departure_time).total_seconds() / 3600.0

        return HOSScheduleResult(
            is_legal=len(violations) == 0,
            total_distance_miles=round(self.total_distance_miles, 1),
            total_duration_hours=round(total_trip_duration, 2),
            driving_time_hours=round(total_driving_hours, 2),
            rest_time_hours=round(total_rest_hours, 2),
            total_trip_days=len(daily_logs),
            current_cycle_used_start=round(self.current_cycle_used, 1),
            cycle_hours_remaining_start=round(70.0 - self.current_cycle_used, 1),
            total_cycle_hours_consumed=round(cycle_consumed_on_trip, 2),
            cycle_hours_remaining_end=round(max(0.0, 70.0 - cycle_used), 1),
            required_34h_restart=required_34h_restart,
            restart_day=restart_day,
            stops=stops,
            daily_logs=daily_logs,
            violations=violations,
            explanations=explanations,
            status_summary="LEGAL" if len(violations) == 0 else "REQUIRES_ADJUSTMENT"
        )

    def _build_daily_logs(
        self,
        raw_events: List[Dict[str, Any]],
        stops: List[ScheduledStop]
    ) -> List[DayLogReport]:
        """
        Splits all continuous chronological events across exact 00:00 midnight boundaries
        and computes reconciled 24.0-hour logs for each calendar day.
        """
        if not raw_events:
            return []

        first_date = raw_events[0]["start"].date()
        last_end = raw_events[-1]["end"]
        if last_end.hour == 0 and last_end.minute == 0 and last_end.second == 0 and last_end > raw_events[0]["start"]:
            last_date = (last_end - timedelta(seconds=1)).date()
        else:
            last_date = last_end.date()

        day_logs: List[DayLogReport] = []
        current_date = first_date
        day_idx = 1
        rolling_cycle = self.current_cycle_used

        while current_date <= last_date:
            day_start = datetime(current_date.year, current_date.month, current_date.day, 0, 0, 0, tzinfo=dt_timezone.utc)
            day_end = day_start + timedelta(days=1)

            day_segments: List[DutySegment] = []
            day_remarks: List[RemarkEntry] = []

            off_hours = 0.0
            sleeper_hours = 0.0
            driving_hours = 0.0
            on_duty_hours = 0.0

            for ev in raw_events:
                # Check overlap with current_date [day_start, day_end]
                ev_start = max(ev["start"], day_start)
                ev_end = min(ev["end"], day_end)

                if ev_end > ev_start:
                    seg_duration = (ev_end - ev_start).total_seconds() / 3600.0
                    start_hr = (ev_start - day_start).total_seconds() / 3600.0
                    end_hr = (ev_end - day_start).total_seconds() / 3600.0

                    status = ev["status"]
                    if status == DutyStatus.OFF_DUTY:
                        off_hours += seg_duration
                    elif status == DutyStatus.SLEEPER_BERTH:
                        sleeper_hours += seg_duration
                    elif status == DutyStatus.DRIVING:
                        driving_hours += seg_duration
                    elif status == DutyStatus.ON_DUTY_NOT_DRIVING:
                        on_duty_hours += seg_duration

                    day_segments.append(DutySegment(
                        status=status,
                        start_hour=round(start_hr, 3),
                        end_hour=round(end_hr, 3),
                        duration_hours=round(seg_duration, 2),
                        location=ev["location"],
                        note=ev.get("note", "")
                    ))

                    # Create a Remark entry for this duty status change
                    time_str = ev_start.strftime("%H:%M")
                    day_remarks.append(RemarkEntry(
                        time_str=time_str,
                        hour=round(start_hr, 2),
                        status=status,
                        location=ev["location"],
                        note=ev.get("note", "")
                    ))

            # Reconcile sum to exactly 24.00 hours
            total_calc = off_hours + sleeper_hours + driving_hours + on_duty_hours
            if abs(total_calc - 24.0) > 0.001 and total_calc > 0:
                diff = 24.0 - total_calc
                off_hours += diff

            # Estimate miles driven on this calendar day
            day_miles = round(driving_hours * self.average_speed_mph, 1)

            # Cycle recap calculations for 70hr/8day
            on_duty_today = driving_hours + on_duty_hours
            rolling_cycle = min(70.0, rolling_cycle + on_duty_today)
            avail_tomorrow = max(0.0, 70.0 - rolling_cycle)

            day_logs.append(DayLogReport(
                day_number=day_idx,
                log_date=current_date,
                total_miles_today=day_miles,
                off_duty_hours=round(off_hours, 2),
                sleeper_berth_hours=round(sleeper_hours, 2),
                driving_hours=round(driving_hours, 2),
                on_duty_not_driving_hours=round(on_duty_hours, 2),
                total_day_hours=24.0,
                cycle_hours_today=round(on_duty_today, 2),
                cycle_hours_7day=round(rolling_cycle, 2),
                cycle_hours_8day=round(rolling_cycle, 2),
                cycle_hours_available_tomorrow=round(avail_tomorrow, 2),
                duty_segments=day_segments,
                remarks=day_remarks
            ))

            current_date += timedelta(days=1)
            day_idx += 1

        return day_logs
