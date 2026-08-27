/**
 * ResultsDashboard.tsx
 * Main tabbed results view: Map | ELD Logs | Stops | HOS Summary
 */
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Map, FileText, List, BarChart3, X, Share2 } from 'lucide-react'
import { TripMap } from '../map/TripMap'
import ELDViewer from '../eld/ELDViewer'
import StopsTimeline from './StopsTimeline'
import HOSSummaryCard from './HOSSummaryCard'
import type { TripPlanResponse } from '../../types/trip'

interface ResultsDashboardProps {
  trip: TripPlanResponse
  onReset: () => void
}

const TABS = [
  { id: 'map',     label: 'Route Map',    icon: Map },
  { id: 'eld',     label: 'ELD Logs',     icon: FileText },
  { id: 'stops',   label: 'Stops',        icon: List },
  { id: 'summary', label: 'HOS Summary',  icon: BarChart3 },
] as const

type TabId = typeof TABS[number]['id']

export default function ResultsDashboard({ trip, onReset }: ResultsDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabId>('map')

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      await navigator.share({ title: 'Spotter Trip Plan', url })
    } else {
      await navigator.clipboard.writeText(url)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-4 h-full"
    >
      {/* ── Header strip ────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-white leading-tight">
            {trip.pickup_location_name}
            <span className="text-slate-500 font-normal mx-2">→</span>
            {trip.dropoff_location_name}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {trip.total_distance_miles.toFixed(0)} miles · {trip.total_trip_days} days · {trip.total_duration_hours.toFixed(1)}h total
            {trip.driver_name && <span className="ml-2">· Driver: {trip.driver_name}</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
            trip.is_legal
              ? 'bg-green-950/60 border-green-800 text-green-300'
              : 'bg-red-950/60 border-red-800 text-red-300'
          }`}>
            {trip.is_legal ? '✓ LEGAL' : '⚠ ADJUSTMENT NEEDED'}
          </span>
          <button
            id="btn-share-trip"
            onClick={handleShare}
            className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
            title="Share trip"
          >
            <Share2 size={14} />
          </button>
          <button
            id="btn-reset-trip"
            onClick={onReset}
            className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-red-400 transition-colors"
            title="Plan new trip"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* ── Tab bar ──────────────────────────────────────────────────────────── */}
      <div className="flex gap-1 p-1 bg-slate-900/80 rounded-xl border border-slate-800">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            id={`tab-${id}`}
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
              activeTab === id
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Icon size={13} />
            <span className="hidden sm:block">{label}</span>
          </button>
        ))}
      </div>

      {/* ── Tab content ──────────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="flex-1 min-h-0"
        >
          {activeTab === 'map' && (
            <div className="h-[500px] rounded-xl overflow-hidden border border-slate-800">
              <TripMap
                stops={trip.stops}
                routeCoordinates={trip.route_geometry}
              />
            </div>
          )}

          {activeTab === 'eld' && (
            <ELDViewer trip={trip} />
          )}

          {activeTab === 'stops' && (
            <div className="max-h-[600px] overflow-y-auto pr-1 custom-scrollbar">
              <StopsTimeline stops={trip.stops} />
            </div>
          )}

          {activeTab === 'summary' && (
            <HOSSummaryCard
              summary={trip.hos_summary}
              totalDays={trip.total_trip_days}
              totalMiles={trip.total_distance_miles}
              drivingHours={trip.driving_time_hours}
              restHours={trip.rest_time_hours}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}
