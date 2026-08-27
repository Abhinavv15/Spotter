import React, { useEffect, useMemo, useState } from 'react'
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { StopData, StopType } from '../../types/trip'
import { Truck, Maximize2, Minimize2 } from 'lucide-react'
import { Badge } from '../ui/badge'

// Fix for default Leaflet icon assets
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// Custom SVG HTML Markers for Leaflet
function createCustomPin(
  type: StopType,
  label: string | number,
  isSelected: boolean = false
): L.DivIcon {
  let bgColor = '#00D4C7' // Teal
  let borderColor = '#00D4C7'
  let iconSvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0B1020" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>'
  let shadow = '0 0 16px rgba(0, 212, 199, 0.6)'

  switch (type) {
    case 'CURRENT':
      bgColor = '#00D4C7'
      shadow = '0 0 20px rgba(0, 212, 199, 0.8)'
      break
    case 'PICKUP':
      bgColor = '#A78BFA'
      borderColor = '#C4B5FD'
      shadow = '0 0 18px rgba(167, 139, 250, 0.7)'
      iconSvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0B1020" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16.5 9.4 7.55 4.24a1.78 1.78 0 0 0-2.5 1.55v12.42a1.78 1.78 0 0 0 2.5 1.55L16.5 14.6a1.78 1.78 0 0 0 0-3.2Z"/></svg>'
      break
    case 'DROPOFF':
      bgColor = '#7FE7D5'
      borderColor = '#A7F3D0'
      shadow = '0 0 18px rgba(127, 231, 213, 0.7)'
      iconSvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0B1020" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/></svg>'
      break
    case 'FUEL':
      bgColor = '#F4B860'
      borderColor = '#FDE68A'
      shadow = '0 0 16px rgba(244, 184, 96, 0.7)'
      iconSvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0B1020" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="3" x2="15" y1="22" y2="22"/><line x1="4" x2="14" y1="9" y2="9"/><path d="M14 22V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v18"/></svg>'
      break
    case 'REST_10H':
    case 'REST_34H':
      bgColor = '#818CF8'
      borderColor = '#C7D2FE'
      shadow = '0 0 16px rgba(129, 140, 248, 0.7)'
      iconSvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0B1020" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>'
      break
    case 'BREAK_30M':
      bgColor = '#38BDF8'
      borderColor = '#BAE6FD'
      shadow = '0 0 14px rgba(56, 189, 248, 0.7)'
      iconSvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0B1020" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/></svg>'
      break
    case 'COMBINED':
      bgColor = '#FB923C'
      borderColor = '#FED7AA'
      shadow = '0 0 18px rgba(251, 146, 60, 0.8)'
      iconSvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0B1020" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>'
      break
  }

  const scale = isSelected ? 'scale-125' : 'hover:scale-110'
  const html = `
    <div class="relative group cursor-pointer transition-transform duration-200 ${scale}">
      <div style="background-color: ${bgColor}; box-shadow: ${shadow}; border: 2px solid ${borderColor};" 
           class="h-8 w-8 rounded-full flex items-center justify-center text-spotter-ink font-bold text-xs">
        ${iconSvg}
      </div>
      <div class="absolute -bottom-1 -right-1 bg-spotter-ink text-white font-mono text-[9px] font-bold px-1 rounded-full border border-white/20">
        ${label}
      </div>
    </div>
  `

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: html,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18]
  })
}

// Map Controller for Auto Bounds
function MapRecenter({
  routeCoords,
  selectedStop
}: {
  routeCoords: [number, number][]
  selectedStop?: StopData | null
}) {
  const map = useMap()

  useEffect(() => {
    if (selectedStop) {
      map.flyTo([selectedStop.latitude, selectedStop.longitude], 9, {
        animate: true,
        duration: 1.2
      })
    } else if (routeCoords.length > 1) {
      const bounds = L.latLngBounds(routeCoords.map(([lat, lng]) => [lat, lng]))
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12, animate: true })
    }
  }, [map, routeCoords, selectedStop])

  return null
}

interface TripMapProps {
  routeCoordinates: [number, number][]
  stops: StopData[]
  selectedStop?: StopData | null
  onSelectStop?: (stop: StopData) => void
  className?: string
}

export const TripMap: React.FC<TripMapProps> = ({
  routeCoordinates,
  stops,
  selectedStop,
  onSelectStop,
  className = "h-[500px]"
}) => {
  const [filterType, setFilterType] = useState<string>('ALL')
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Default Center (Continental US)
  const defaultCenter: [number, number] = useMemo(() => {
    if (routeCoordinates.length > 0) {
      return routeCoordinates[0]
    }
    return [39.8283, -98.5795]
  }, [routeCoordinates])

  const filteredStops = useMemo(() => {
    if (filterType === 'ALL') return stops
    if (filterType === 'FUEL') return stops.filter(s => s.stop_type === 'FUEL' || s.stop_type === 'COMBINED')
    if (filterType === 'REST') return stops.filter(s => s.stop_type === 'REST_10H' || s.stop_type === 'REST_34H')
    if (filterType === 'BREAK') return stops.filter(s => s.stop_type === 'BREAK_30M' || s.stop_type === 'COMBINED')
    if (filterType === 'WAYPOINTS') return stops.filter(s => s.stop_type === 'PICKUP' || s.stop_type === 'DROPOFF' || s.stop_type === 'CURRENT')
    return stops
  }, [stops, filterType])

  return (
    <div className={`relative w-full rounded-2xl overflow-hidden border border-white/15 bg-spotter-ink shadow-2xl ${isFullscreen ? 'fixed inset-0 z-50 rounded-none h-screen' : className}`}>
      
      {/* Map Filter Controls Bar */}
      <div className="absolute top-3 left-3 z-[400] flex flex-wrap gap-1.5 p-1.5 rounded-xl bg-spotter-space/90 backdrop-blur-md border border-white/10 shadow-lg">
        {['ALL', 'FUEL', 'REST', 'BREAK', 'WAYPOINTS'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterType(cat)}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
              filterType === cat
                ? 'bg-primary text-spotter-ink shadow-glow-teal'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Map Action Controls */}
      <div className="absolute top-3 right-3 z-[400] flex items-center space-x-2">
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-2 rounded-xl bg-spotter-space/90 backdrop-blur-md border border-white/15 text-slate-300 hover:text-white hover:bg-white/10 transition-all shadow-lg"
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Map"}
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </button>
      </div>

      {/* Route Stats Overlay Pill */}
      {stops.length > 0 && (
        <div className="absolute bottom-4 left-4 z-[400] hidden sm:flex items-center space-x-3 px-3.5 py-2 rounded-xl bg-spotter-space/90 backdrop-blur-md border border-white/15 shadow-xl text-xs">
          <div className="flex items-center space-x-1.5 text-primary font-bold font-mono">
            <Truck className="h-4 w-4" />
            <span>{stops.length} Stops</span>
          </div>
          <div className="h-3 w-px bg-white/20" />
          <div className="text-slate-300">
            {stops.filter(s => s.stop_type === 'FUEL' || s.stop_type === 'COMBINED').length} Fuelings
          </div>
          <div className="h-3 w-px bg-white/20" />
          <div className="text-slate-300">
            {stops.filter(s => s.stop_type === 'REST_10H' || s.stop_type === 'REST_34H').length} Sleep Periods
          </div>
        </div>
      )}

      {/* Leaflet Map */}
      <MapContainer
        center={defaultCenter}
        zoom={5}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        {/* CartoDB Dark Matter Tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          maxZoom={19}
        />

        <MapRecenter routeCoords={routeCoordinates} selectedStop={selectedStop} />

        {/* Glow Underlay for Route */}
        {routeCoordinates.length > 1 && (
          <>
            <Polyline
              positions={routeCoordinates}
              pathOptions={{
                color: '#00D4C7',
                weight: 8,
                opacity: 0.35,
                lineCap: 'round',
                lineJoin: 'round'
              }}
            />
            {/* Crisp Foreground Route Line */}
            <Polyline
              positions={routeCoordinates}
              pathOptions={{
                color: '#00D4C7',
                weight: 3.5,
                opacity: 0.95,
                dashArray: '8, 6',
                lineCap: 'round',
                lineJoin: 'round'
              }}
            />
          </>
        )}

        {/* Markers */}
        {filteredStops.map((stop, idx) => {
          const isSelected = selectedStop?.id === stop.id
          return (
            <Marker
              key={`${stop.latitude}-${stop.longitude}-${idx}`}
              position={[stop.latitude, stop.longitude]}
              icon={createCustomPin(stop.stop_type, stop.stop_sequence, isSelected)}
              eventHandlers={{
                click: () => onSelectStop?.(stop)
              }}
            >
              <Popup className="custom-popup">
                <div className="p-1 max-w-xs text-xs space-y-1.5">
                  <div className="flex items-center justify-between border-b border-white/10 pb-1">
                    <span className="font-mono font-bold text-primary">
                      Stop #{stop.stop_sequence}
                    </span>
                    <Badge variant="teal" className="text-[10px] py-0 px-1.5">
                      {stop.stop_type}
                    </Badge>
                  </div>
                  <h4 className="font-bold text-white text-sm">
                    {stop.location_name}
                  </h4>
                  <div className="text-slate-300 space-y-0.5 text-[11px]">
                    <p><strong>Duration:</strong> {stop.duration_minutes} mins</p>
                    <p><strong>Odometer:</strong> {stop.odometer_miles.toFixed(0)} mi</p>
                    {stop.hos_impact && (
                      <p className="text-accent font-medium">HOS: {stop.hos_impact}</p>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 bg-white/5 p-1.5 rounded border border-white/5 italic">
                    "{stop.reason}"
                  </p>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  )
}
