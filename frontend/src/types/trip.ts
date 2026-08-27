export type StopType = 
  | 'CURRENT' 
  | 'PICKUP' 
  | 'DROPOFF' 
  | 'FUEL' 
  | 'REST_10H' 
  | 'REST_34H' 
  | 'BREAK_30M' 
  | 'COMBINED'

export type DutyStatusType = 
  | 'OFF_DUTY' 
  | 'SLEEPER_BERTH' 
  | 'DRIVING' 
  | 'ON_DUTY_NOT_DRIVING'

export interface Coordinates {
  lat: number
  lng: number
}

export interface StopData {
  id?: string
  stop_sequence: number
  stop_type: StopType
  location_name: string
  latitude: number
  longitude: number
  arrival_time: string
  departure_time: string
  duration_minutes: number
  distance_from_last_stop_miles: number
  odometer_miles: number
  reason: string
  hos_impact?: string
  is_optimized?: boolean
}

export interface DutyPeriodData {
  id?: string
  day_number: number
  duty_status: DutyStatusType
  start_time: string
  end_time: string
  duration_hours: number
  start_location: string
  end_location?: string
  notes?: string
}

export interface DutySegment {
  status: DutyStatusType
  start_hour: number // 0.0 to 24.0
  end_hour: number // 0.0 to 24.0
  duration: number // in hours
  location: string
  note?: string
}

export interface LogRemark {
  time_str: string
  hour: number // 0.0 to 24.0
  status: DutyStatusType
  location: string
  note: string
}

export interface DailyLogData {
  id?: string
  day_number: number
  log_date: string // YYYY-MM-DD
  total_miles_today: number
  off_duty_hours: number
  sleeper_berth_hours: number
  driving_hours: number
  on_duty_not_driving_hours: number
  total_day_hours: number
  cycle_hours_today: number
  cycle_hours_7day: number
  cycle_hours_8day: number
  cycle_hours_available_tomorrow: number
  duty_segments: DutySegment[]
  remarks: LogRemark[]
}

export interface HOSSummary {
  is_legal: boolean
  status_badge: 'LEGAL' | 'REQUIRES_ADJUSTMENT'
  current_cycle_used: number
  cycle_hours_available_start: number
  total_cycle_hours_consumed: number
  cycle_hours_remaining_end: number
  required_34h_restart: boolean
  restart_day?: number
  driving_hours_remaining_day1: number
  window_hours_remaining_day1: number
  summary_text: string
  violations: string[]
  explanations: string[]
}

export interface TripPlanRequest {
  current_location: string
  pickup_location: string
  dropoff_location: string
  current_cycle_used: number
  
  // Advanced options
  driver_name?: string
  carrier_name?: string
  carrier_address?: string
  home_terminal_address?: string
  truck_number?: string
  trailer_number?: string
  shipping_doc_number?: string
  commodity?: string
  departure_time?: string
  home_terminal_tz?: string
}

export interface TripPlanResponse {
  id: string
  current_location_name: string
  current_location_coords: Coordinates
  pickup_location_name: string
  pickup_location_coords: Coordinates
  dropoff_location_name: string
  dropoff_location_coords: Coordinates
  current_cycle_used: number
  
  total_distance_miles: number
  total_duration_hours: number
  driving_time_hours: number
  rest_time_hours: number
  total_trip_days: number
  
  is_legal: boolean
  hos_status_summary: string
  route_geometry: [number, number][] // [[lat, lng], ...]
  
  driver_name: string
  carrier_name: string
  carrier_address: string
  home_terminal_address: string
  truck_number: string
  trailer_number: string
  co_driver_name?: string
  shipping_doc_number: string
  commodity: string
  departure_time: string
  home_terminal_tz: string
  
  stops: StopData[]
  duty_periods: DutyPeriodData[]
  daily_logs: DailyLogData[]
  hos_summary: HOSSummary
}

export interface LocationSuggestion {
  name: string
  city?: string
  state?: string
  country?: string
  lat: number
  lng: number
  display_name: string
}
