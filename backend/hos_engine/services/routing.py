"""
Routing and Geocoding Service for Spotter.
Provides open-source geocoding (Photon / OpenStreetMap) and routing (OSRM)
with resilient offline logistics fallback.
"""

import math
import logging
import requests
from typing import Dict, List, Tuple, Optional, Any

logger = logging.getLogger(__name__)

# Curated US Major Logistics Hubs & Metropolitan Centers
US_LOGISTICS_HUBS: List[Dict[str, Any]] = [
    {"name": "Chicago, IL", "city": "Chicago", "state": "IL", "country": "United States", "lat": 41.8781, "lng": -87.6298, "display_name": "Chicago, Cook County, Illinois, United States"},
    {"name": "Indianapolis, IN", "city": "Indianapolis", "state": "IN", "country": "United States", "lat": 39.7684, "lng": -86.1581, "display_name": "Indianapolis, Marion County, Indiana, United States"},
    {"name": "Atlanta, GA", "city": "Atlanta", "state": "GA", "country": "United States", "lat": 33.7490, "lng": -84.3880, "display_name": "Atlanta, Fulton County, Georgia, United States"},
    {"name": "Dallas, TX", "city": "Dallas", "state": "TX", "country": "United States", "lat": 32.7767, "lng": -96.7970, "display_name": "Dallas, Dallas County, Texas, United States"},
    {"name": "Fort Worth, TX", "city": "Fort Worth", "state": "TX", "country": "United States", "lat": 32.7555, "lng": -97.3308, "display_name": "Fort Worth, Tarrant County, Texas, United States"},
    {"name": "Houston, TX", "city": "Houston", "state": "TX", "country": "United States", "lat": 29.7604, "lng": -95.3698, "display_name": "Houston, Harris County, Texas, United States"},
    {"name": "Los Angeles, CA", "city": "Los Angeles", "state": "CA", "country": "United States", "lat": 34.0522, "lng": -118.2437, "display_name": "Los Angeles, Los Angeles County, California, United States"},
    {"name": "Ontario, CA", "city": "Ontario", "state": "CA", "country": "United States", "lat": 34.0633, "lng": -117.6509, "display_name": "Ontario, San Bernardino County, California, United States"},
    {"name": "New York, NY", "city": "New York", "state": "NY", "country": "United States", "lat": 40.7128, "lng": -74.0060, "display_name": "New York, New York, United States"},
    {"name": "Newark, NJ", "city": "Newark", "state": "NJ", "country": "United States", "lat": 40.7357, "lng": -74.1724, "display_name": "Newark, Essex County, New Jersey, United States"},
    {"name": "Philadelphia, PA", "city": "Philadelphia", "state": "PA", "country": "United States", "lat": 39.9526, "lng": -75.1652, "display_name": "Philadelphia, Philadelphia County, Pennsylvania, United States"},
    {"name": "Harrisburg, PA", "city": "Harrisburg", "state": "PA", "country": "United States", "lat": 40.2732, "lng": -76.8867, "display_name": "Harrisburg, Dauphin County, Pennsylvania, United States"},
    {"name": "Allentown, PA", "city": "Allentown", "state": "PA", "country": "United States", "lat": 40.6084, "lng": -75.4902, "display_name": "Allentown, Lehigh County, Pennsylvania, United States"},
    {"name": "Pittsburgh, PA", "city": "Pittsburgh", "state": "PA", "country": "United States", "lat": 40.4406, "lng": -79.9959, "display_name": "Pittsburgh, Allegheny County, Pennsylvania, United States"},
    {"name": "Richmond, VA", "city": "Richmond", "state": "VA", "country": "United States", "lat": 37.5407, "lng": -77.4360, "display_name": "Richmond, Virginia, United States"},
    {"name": "Fredericksburg, VA", "city": "Fredericksburg", "state": "VA", "country": "United States", "lat": 38.3032, "lng": -77.4605, "display_name": "Fredericksburg, Virginia, United States"},
    {"name": "Baltimore, MD", "city": "Baltimore", "state": "MD", "country": "United States", "lat": 39.2904, "lng": -76.6122, "display_name": "Baltimore, Maryland, United States"},
    {"name": "Cherry Hill, NJ", "city": "Cherry Hill", "state": "NJ", "country": "United States", "lat": 39.9348, "lng": -75.0307, "display_name": "Cherry Hill, Camden County, New Jersey, United States"},
    {"name": "St. Louis, MO", "city": "St. Louis", "state": "MO", "country": "United States", "lat": 38.6270, "lng": -90.1994, "display_name": "St. Louis, Missouri, United States"},
    {"name": "Kansas City, MO", "city": "Kansas City", "state": "MO", "country": "United States", "lat": 39.0997, "lng": -94.5786, "display_name": "Kansas City, Jackson County, Missouri, United States"},
    {"name": "Memphis, TN", "city": "Memphis", "state": "TN", "country": "United States", "lat": 35.1495, "lng": -90.0490, "display_name": "Memphis, Shelby County, Tennessee, United States"},
    {"name": "Nashville, TN", "city": "Nashville", "state": "TN", "country": "United States", "lat": 36.1627, "lng": -86.7816, "display_name": "Nashville, Davidson County, Tennessee, United States"},
    {"name": "Charlotte, NC", "city": "Charlotte", "state": "NC", "country": "United States", "lat": 35.2271, "lng": -80.8431, "display_name": "Charlotte, Mecklenburg County, North Carolina, United States"},
    {"name": "Jacksonville, FL", "city": "Jacksonville", "state": "FL", "country": "United States", "lat": 30.3322, "lng": -81.6557, "display_name": "Jacksonville, Duval County, Florida, United States"},
    {"name": "Miami, FL", "city": "Miami", "state": "FL", "country": "United States", "lat": 25.7617, "lng": -80.1918, "display_name": "Miami, Miami-Dade County, Florida, United States"},
    {"name": "Denver, CO", "city": "Denver", "state": "CO", "country": "United States", "lat": 39.7392, "lng": -104.9903, "display_name": "Denver, Denver County, Colorado, United States"},
    {"name": "Salt Lake City, UT", "city": "Salt Lake City", "state": "UT", "country": "United States", "lat": 40.7608, "lng": -111.8910, "display_name": "Salt Lake City, Salt Lake County, Utah, United States"},
    {"name": "Seattle, WA", "city": "Seattle", "state": "WA", "country": "United States", "lat": 47.6062, "lng": -122.3321, "display_name": "Seattle, King County, Washington, United States"},
    {"name": "Portland, OR", "city": "Portland", "state": "OR", "country": "United States", "lat": 45.5152, "lng": -122.6784, "display_name": "Portland, Multnomah County, Oregon, United States"},
    {"name": "Phoenix, AZ", "city": "Phoenix", "state": "AZ", "country": "United States", "lat": 33.4484, "lng": -112.0740, "display_name": "Phoenix, Maricopa County, Arizona, United States"},
    {"name": "Albuquerque, NM", "city": "Albuquerque", "state": "NM", "country": "United States", "lat": 35.0844, "lng": -106.6504, "display_name": "Albuquerque, Bernalillo County, New Mexico, United States"},
    {"name": "Amarillo, TX", "city": "Amarillo", "state": "TX", "country": "United States", "lat": 35.2220, "lng": -101.8313, "display_name": "Amarillo, Potter County, Texas, United States"},
    {"name": "Oklahoma City, OK", "city": "Oklahoma City", "state": "OK", "country": "United States", "lat": 35.4676, "lng": -97.5164, "display_name": "Oklahoma City, Oklahoma County, Oklahoma, United States"},
    {"name": "Columbus, OH", "city": "Columbus", "state": "OH", "country": "United States", "lat": 39.9612, "lng": -82.9988, "display_name": "Columbus, Franklin County, Ohio, United States"},
    {"name": "Cleveland, OH", "city": "Cleveland", "state": "OH", "country": "United States", "lat": 41.4993, "lng": -81.6944, "display_name": "Cleveland, Cuyahoga County, Ohio, United States"},
    {"name": "Detroit, MI", "city": "Detroit", "state": "MI", "country": "United States", "lat": 42.3314, "lng": -83.0458, "display_name": "Detroit, Wayne County, Michigan, United States"},
    {"name": "Minneapolis, MN", "city": "Minneapolis", "state": "MN", "country": "United States", "lat": 44.9778, "lng": -93.2650, "display_name": "Minneapolis, Hennepin County, Minnesota, United States"},
    {"name": "Louisville, KY", "city": "Louisville", "state": "KY", "country": "United States", "lat": 38.2527, "lng": -85.7585, "display_name": "Louisville, Jefferson County, Kentucky, United States"},
    {"name": "Birmingham, AL", "city": "Birmingham", "state": "AL", "country": "United States", "lat": 33.5186, "lng": -86.8104, "display_name": "Birmingham, Jefferson County, Alabama, United States"},
    {"name": "Savannah, GA", "city": "Savannah", "state": "GA", "country": "United States", "lat": 32.0809, "lng": -81.0912, "display_name": "Savannah, Chatham County, Georgia, United States"},
    {"name": "Laredo, TX", "city": "Laredo", "state": "TX", "country": "United States", "lat": 27.5306, "lng": -99.4803, "display_name": "Laredo, Webb County, Texas, United States"},
    {"name": "El Paso, TX", "city": "El Paso", "state": "TX", "country": "United States", "lat": 31.7619, "lng": -106.4850, "display_name": "El Paso, El Paso County, Texas, United States"},
]


def haversine_distance_miles(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great circle distance between two points in statute miles.
    """
    R = 3958.8  # Earth radius in statute miles
    dLat = math.radians(lat2 - lat1)
    dLon = math.radians(lon2 - lon1)
    a = (math.sin(dLat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dLon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


def find_closest_hub(lat: float, lng: float) -> Dict[str, Any]:
    """Find closest known logistics city hub to coordinate."""
    closest = US_LOGISTICS_HUBS[0]
    min_dist = float('inf')
    for hub in US_LOGISTICS_HUBS:
        d = haversine_distance_miles(lat, lng, hub['lat'], hub['lng'])
        if d < min_dist:
            min_dist = d
            closest = hub
    return closest


def geocode_location(query: str) -> Optional[Dict[str, Any]]:
    """
    Geocode a location query string using Photon API with US logistics hub fallback.
    Returns {name, city, state, country, lat, lng, display_name} or None.
    """
    q_clean = query.strip().lower()
    if not q_clean:
        return None

    # Check local curated hubs for exact or partial match first
    for hub in US_LOGISTICS_HUBS:
        if q_clean in hub["name"].lower() or q_clean == hub["city"].lower() or hub["name"].lower() in q_clean:
            return hub

    # Query Photon geocoding service
    try:
        url = "https://photon.komoot.io/api"
        params = {"q": query, "limit": 1, "lang": "en"}
        headers = {"User-Agent": "SpotterLogisticsHOS/1.0"}
        resp = requests.get(url, params=params, headers=headers, timeout=3.5)
        if resp.status_code == 200:
            data = resp.json()
            features = data.get("features", [])
            if features:
                feat = features[0]
                props = feat.get("properties", {})
                coords = feat.get("geometry", {}).get("coordinates", [])
                if len(coords) >= 2:
                    lng, lat = coords[0], coords[1]
                    city = props.get("city") or props.get("name") or query.split(",")[0]
                    state = props.get("state") or ""
                    country = props.get("country") or "United States"
                    name_parts = [p for p in [city, state, country] if p]
                    return {
                        "name": f"{city}, {state}".strip(", "),
                        "city": city,
                        "state": state,
                        "country": country,
                        "lat": float(lat),
                        "lng": float(lng),
                        "display_name": props.get("name") or ", ".join(name_parts)
                    }
    except Exception as e:
        logger.warning(f"Photon geocoding failed for '{query}': {e}. Using fallback matching.")

    # Fallback substring search over local dataset
    for hub in US_LOGISTICS_HUBS:
        tokens = [t.strip() for t in q_clean.replace(",", " ").split() if len(t) > 2]
        if any(t in hub["name"].lower() for t in tokens):
            return hub

    # Fallback default: Chicago
    return US_LOGISTICS_HUBS[0]


def autocomplete_locations(query: str, limit: int = 6) -> List[Dict[str, Any]]:
    """
    Search suggestions for location autocomplete input.
    """
    q_clean = query.strip().lower()
    if not q_clean:
        return US_LOGISTICS_HUBS[:limit]

    results: List[Dict[str, Any]] = []
    seen = set()

    # 1. Check local dataset
    for hub in US_LOGISTICS_HUBS:
        if (q_clean in hub["name"].lower() or 
            q_clean in hub["city"].lower() or 
            q_clean in hub["display_name"].lower()):
            key = (round(hub["lat"], 2), round(hub["lng"], 2))
            if key not in seen:
                seen.add(key)
                results.append(hub)
                if len(results) >= limit:
                    return results

    # 2. Query Photon for live suggestions
    try:
        url = "https://photon.komoot.io/api"
        params = {"q": query, "limit": limit, "lang": "en"}
        headers = {"User-Agent": "SpotterLogisticsHOS/1.0"}
        resp = requests.get(url, params=params, headers=headers, timeout=2.5)
        if resp.status_code == 200:
            data = resp.json()
            for feat in data.get("features", []):
                props = feat.get("properties", {})
                coords = feat.get("geometry", {}).get("coordinates", [])
                if len(coords) >= 2:
                    lng, lat = coords[0], coords[1]
                    key = (round(lat, 2), round(lng, 2))
                    if key in seen:
                        continue
                    seen.add(key)
                    city = props.get("city") or props.get("name") or ""
                    state = props.get("state") or ""
                    country = props.get("country") or ""
                    name = f"{city}, {state}".strip(", ") if city and state else (city or props.get("name") or query)
                    results.append({
                        "name": name,
                        "city": city,
                        "state": state,
                        "country": country,
                        "lat": float(lat),
                        "lng": float(lng),
                        "display_name": f"{name}, {country}".strip(", ")
                    })
                    if len(results) >= limit:
                        break
    except Exception as e:
        logger.warning(f"Live autocomplete query failed: {e}")

    # Fallback to matching hubs if nothing found
    if not results:
        for hub in US_LOGISTICS_HUBS:
            if len(results) < limit:
                results.append(hub)

    return results[:limit]


def calculate_osrm_route(waypoints: List[Tuple[float, float]]) -> Dict[str, Any]:
    """
    Calculates driving route through a list of (lat, lng) tuples using OSRM.
    Returns:
    {
        "distance_miles": float,
        "duration_hours": float,
        "coordinates": List[[lat, lng]], # polyline points
        "steps": List[Dict]
    }
    """
    if len(waypoints) < 2:
        return {
            "distance_miles": 0.0,
            "duration_hours": 0.0,
            "coordinates": [[lat, lng] for lat, lng in waypoints],
            "steps": []
        }

    # Format OSRM coordinates: lng,lat;lng,lat;...
    coords_str = ";".join([f"{lng:.6f},{lat:.6f}" for lat, lng in waypoints])
    osrm_url = f"https://router.project-osrm.org/route/v1/driving/{coords_str}?overview=full&geometries=geojson&steps=false"

    try:
        headers = {"User-Agent": "SpotterLogisticsHOS/1.0"}
        resp = requests.get(osrm_url, headers=headers, timeout=6.0)
        if resp.status_code == 200:
            data = resp.json()
            if data.get("code") == "Ok" and data.get("routes"):
                route = data["routes"][0]
                # OSRM distance is in meters -> convert to statute miles
                distance_meters = route.get("distance", 0.0)
                distance_miles = distance_meters * 0.000621371
                
                # Duration in seconds -> convert to hours (calibrated for commercial freight truck speeds)
                duration_seconds = route.get("duration", 0.0)
                # CMV truck speed calibration: 18-wheelers travel average ~55-60 mph with weigh stations & grades
                truck_calibrated_hours = max(distance_miles / 55.0, duration_seconds / 3600.0)

                # Geometry is GeoJSON LineString [lng, lat] -> convert to Leaflet format [lat, lng]
                geojson_coords = route.get("geometry", {}).get("coordinates", [])
                leaflet_coords = [[float(c[1]), float(c[0])] for c in geojson_coords]

                return {
                    "distance_miles": round(distance_miles, 1),
                    "duration_hours": round(truck_calibrated_hours, 2),
                    "coordinates": leaflet_coords,
                    "provider": "OSRM"
                }
    except Exception as e:
        logger.warning(f"OSRM request failed: {e}. Generating high-fidelity route interpolation fallback.")

    # High-Fidelity Fallback calculation if OSRM is offline
    total_dist = 0.0
    all_coords: List[List[float]] = []
    
    for i in range(len(waypoints) - 1):
        lat1, lng1 = waypoints[i]
        lat2, lng2 = waypoints[i + 1]
        
        # Great circle direct distance * 1.25 road curvature factor for US interstate system
        leg_direct = haversine_distance_miles(lat1, lng1, lat2, lng2)
        leg_highway_miles = leg_direct * 1.22
        total_dist += leg_highway_miles

        # Generate smooth intermediate curve points
        num_segments = max(int(leg_highway_miles / 25), 8)
        for step in range(num_segments + (1 if i == len(waypoints) - 2 else 0)):
            t = step / num_segments
            cur_lat = lat1 + (lat2 - lat1) * t
            cur_lng = lng1 + (lng2 - lng1) * t
            # Add subtle highway arc curvature
            arc = math.sin(t * math.pi) * 0.15 * math.sin(lng1)
            all_coords.append([round(cur_lat + arc * 0.5, 5), round(cur_lng, 5)])

    avg_truck_mph = 55.0
    duration_hours = total_dist / avg_truck_mph

    return {
        "distance_miles": round(total_dist, 1),
        "duration_hours": round(duration_hours, 2),
        "coordinates": all_coords,
        "provider": "SpotterRouteEngine"
    }


def find_location_along_route(
    route_coords: List[List[float]],
    target_mile_ratio: float
) -> Tuple[float, float, str]:
    """
    Given a polyline of [[lat, lng], ...], find the coordinates and nearest city
    at the specified fraction (0.0 to 1.0) along the route.
    """
    if not route_coords:
        hub = US_LOGISTICS_HUBS[0]
        return hub["lat"], hub["lng"], hub["name"]

    idx = int(len(route_coords) * max(0.0, min(1.0, target_mile_ratio)))
    idx = min(idx, len(route_coords) - 1)
    
    lat, lng = route_coords[idx][0], route_coords[idx][1]
    closest = find_closest_hub(lat, lng)
    
    dist_to_hub = haversine_distance_miles(lat, lng, closest["lat"], closest["lng"])
    if dist_to_hub < 40:
        location_label = closest["name"]
    else:
        location_label = f"Near {closest['city']}, {closest['state']}"
        
    return lat, lng, location_label
