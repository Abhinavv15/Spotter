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
  let bgColor = '#8AE922' // Nexterra Lime
  let borderColor = '#9EF538'
  let iconSvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#080D0A" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>'
  let shadow = '0 0 18px rgba(138, 233, 34, 0.7)'

  switch (type) {
    case 'CURRENT':
      bgColor = '#8AE922'
      borderColor = '#9EF538'
      shadow = '0 0 22px rgba(138, 233, 34, 0.85)'
      break
    case 'PICKUP':
      bgColor = '#4ADE80' // Leaf
      borderColor = '#86EFAC'
      shadow = '0 0 18px rgba(74, 222, 128, 0.7)'
      iconSvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#080D0A" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16.5 9.4 7.55 4.24a1.78 1.78 0 0 0-2.5 1.55v12.42a1.78 1.78 0 0 0 2.5 1.55L16.5 14.6a1.78 1.78 0 0 0 0-3.2Z"/></svg>'
      break
    case 'DROPOFF':
      bgColor = '#8AE922'
      borderColor = '#BAF768'
      shadow = '0 0 20px rgba(138, 233, 34, 0.8)'
      iconSvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#080D0A" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/></svg>'
      break
    case 'FUEL':
      bgColor = '#FACC15' // Amber Gold
      borderColor = '#FDE047'
      shadow = '0 0 18px rgba(250, 204, 21, 0.75)'
      iconSvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#080D0A" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="3" x2="15" y1="22" y2="22"/><line x1="4" x2="14" y1="9" y2="9"/><path d="M14 22V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v18"/></svg>'
      break
    case 'REST_10H':
    case 'REST_34H':
      bgColor = '#2DD4BF' // Teal
      borderColor = '#5EEAD4'
      shadow = '0 0 18px rgba(45, 212, 191, 0.7)'
      iconSvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#080D0A" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>'
      break
    case 'BREAK_30M':
      bgColor = '#8AE922'
      borderColor = '#BAF768'
      shadow = '0 0 16px rgba(138, 233, 34, 0.7)'
      iconSvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#080D0A" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/></svg>'
      break
    case 'COMBINED':
      bgColor = '#FACC15'
      borderColor = '#FEF08A'
      shadow = '0 0 18px rgba(250, 204, 21, 0.8)'
      iconSvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#080D0A" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>'
      break
  }

  const scale = isSelected ? 'scale-125' : 'hover:scale-110'
  const html = `
    <div class="relative group cursor-pointer transition-transform duration-200 ${scale}">
      <div style="background-color: ${bgColor}; box-shadow: ${shadow}; border: 2px solid ${borderColor};" 
           class="h-8 w-8 rounded-full flex items-center justify-center text-[#080D0A] font-extrabold text-xs">
        ${iconSvg}
      </div>
      <div class="absolute -bottom-1 -right-1 bg-[#080D0A] text-white font-mono text-[9px] font-extrabold px-1 rounded-full border border-white/20">
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
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12, animate: true })
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
    <div className={`relative w-full rounded-3xl overflow-hidden border border-white/10 bg-[#080D0A] shadow-2xl ${isFullscreen ? 'fixed inset-0 z-50 rounded-none h-screen' : className}`}>
      
      {/* Map Filter Controls Bar */}
      <div className="absolute top-4 left-4 z-[400] flex flex-wrap gap-1.5 p-1.5 rounded-2xl bg-[#080D0A]/90 backdrop-blur-xl border border-white/10 shadow-xl">
        {['ALL', 'FUEL', 'REST', 'BREAK', 'WAYPOINTS'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterType(cat)}
            className={`px-3 py-1 text-[11px] font-extrabold rounded-xl transition-all font-heading ${
              filterType === cat
                ? 'bg-[#8AE922] text-[#080D0A] shadow-glow-lime'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Map Action Controls */}
      <div className="absolute top-4 right-4 z-[400] flex items-center space-x-2">
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-2.5 rounded-2xl bg-[#080D0A]/90 backdrop-blur-xl border border-white/10 text-slate-300 hover:text-white hover:border-[#8AE922]/50 transition-all shadow-xl"
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Map"}
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </button>
      </div>

      {/* Route Stats Overlay Pill */}
      {stops.length > 0 && (
        <div className="absolute bottom-4 left-4 z-[400] hidden sm:flex items-center space-x-3.5 px-4 py-2.5 rounded-2xl bg-[#080D0A]/90 backdrop-blur-xl border border-white/10 shadow-2xl text-xs font-mono">
          <div className="flex items-center space-x-1.5 text-[#8AE922] font-extrabold">
            <Truck className="h-4 w-4" />
            <span>{stops.length} Total Stops</span>
          </div>
          <div className="h-3 w-px bg-white/20" />
          <div className="text-slate-300">
            {stops.filter(s => s.stop_type === 'FUEL' || s.stop_type === 'COMBINED').length} Fuel Stops
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
        {/* OpenStreetMap Dark Filter Tiles (100% Free & No API Key Watermark) */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
          className="dark-tiles"
        />

        <MapRecenter routeCoords={routeCoordinates} selectedStop={selectedStop} />

        {/* Glow Underlay for Route */}
        {routeCoordinates.length > 1 && (
          <>
            <Polyline
              positions={routeCoordinates}
              pathOptions={{
                color: '#8AE922',
                weight: 9,
                opacity: 0.35,
                lineCap: 'round',
                lineJoin: 'round'
              }}
            />
            {/* Crisp Foreground Route Line */}
            <Polyline
              positions={routeCoordinates}
              pathOptions={{
                color: '#8AE922',
                weight: 3.5,
                opacity: 0.98,
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
                    <span className="font-mono font-bold text-[#8AE922]">
                      Stop #{stop.stop_sequence}
                    </span>
                    <Badge variant="lime" className="text-[10px] py-0 px-1.5">
                      {stop.stop_type}
                    </Badge>
                  </div>
                  <h4 className="font-bold text-white text-sm font-heading">
                    {stop.location_name}
                  </h4>
                  <div className="text-slate-300 space-y-0.5 text-[11px] font-mono">
                    <p><strong>Duration:</strong> {stop.duration_minutes} mins</p>
                    <p><strong>Odometer:</strong> {stop.odometer_miles.toFixed(0)} mi</p>
                    {stop.hos_impact && (
                      <p className="text-amber-400 font-semibold">HOS: {stop.hos_impact}</p>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 bg-white/5 p-1.5 rounded-lg border border-white/5 italic">
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
