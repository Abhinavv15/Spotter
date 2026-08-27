import type {
  LocationSuggestion,
  TripPlanRequest,
  TripPlanResponse
} from '../types/trip'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'

export async function fetchLocationSuggestions(query: string): Promise<LocationSuggestion[]> {
  if (!query || query.trim().length < 1) return []
  try {
    const res = await fetch(`${API_BASE_URL}/locations/autocomplete/?q=${encodeURIComponent(query.trim())}`)
    if (!res.ok) throw new Error(`Status ${res.status}`)
    const data = await res.json()
    return data.results || []
  } catch (err) {
    console.warn('Autocomplete fetch failed, using fallback:', err)
    return []
  }
}

export async function fetchRoutePreview(
  current: string,
  pickup: string,
  dropoff: string
): Promise<{
  total_distance_miles: number
  estimated_duration_hours: number
  route_geometry: [number, number][]
  current_location: LocationSuggestion
  pickup_location: LocationSuggestion
  dropoff_location: LocationSuggestion
}> {
  const res = await fetch(`${API_BASE_URL}/routes/preview/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      current_location: current,
      pickup_location: pickup,
      dropoff_location: dropoff
    })
  })
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}))
    throw new Error(errData.error || 'Failed to preview route')
  }
  return await res.json()
}

export async function planTripSchedule(payload: TripPlanRequest): Promise<TripPlanResponse> {
  const res = await fetch(`${API_BASE_URL}/trips/plan/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}))
    throw new Error(errData.error || 'Failed to generate HOS trip plan')
  }
  return await res.json()
}
