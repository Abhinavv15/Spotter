/**
 * ResultsDashboard.tsx
 * Main tabbed results view: Map | Directions | ELD Logs | Stops | HOS Summary
 * Nexterra styling with signature lime tabs and glowing compliance pill.
 */
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Map, Compass, FileText, List, BarChart3, X, Share2, CheckCircle, AlertTriangle, Navigation, ArrowUpRight, Milestone } from 'lucide-react'
import { TripMap } from '../map/TripMap'
import ELDViewer from '../eld/ELDViewer'
import StopsTimeline from './StopsTimeline'
import HOSSummaryCard from './HOSSummaryCard'
import { ShareModal } from '../modals/ShareModal'
import type { TripPlanResponse } from '../../types/trip'

interface ResultsDashboardProps {
  trip: TripPlanResponse
  onReset: () => void
}

const TABS = [
  { id: 'map',        label: 'Route Map',         icon: Map },
  { id: 'directions', label: 'Turn Directions',   icon: Compass },
  { id: 'eld',        label: 'ELD Logs',          icon: FileText },
  { id: 'stops',      label: 'Stops & Timeline',  icon: List },
  { id: 'summary',    label: 'HOS Telemetry',     icon: BarChart3 },
] as const

type TabId = typeof TABS[number]['id']

export default function ResultsDashboard({ trip, onReset }: ResultsDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabId>('map')
  const [shareModalOpen, setShareModalOpen] = useState(false)

  const handleShare = () => {
    setShareModalOpen(true)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-5 h-full"
    >
      {/* ── Header strip ────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg sm:text-2xl font-extrabold text-white leading-tight font-heading">
              {trip.pickup_location_name}
              <span className="text-[#8AE922] font-normal mx-2.5">→</span>
              {trip.dropoff_location_name}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 flex items-center gap-2 flex-wrap font-medium">
            <span className="text-[#8AE922] font-bold">{trip.total_distance_miles.toFixed(0)} mi</span>
            <span>·</span>
            <span>{trip.total_trip_days} Day{trip.total_trip_days > 1 ? 's' : ''}</span>
            <span>·</span>
            <span>{trip.total_duration_hours.toFixed(1)}h Total</span>
            {trip.driver_name && (
              <>
                <span>·</span>
                <span className="text-slate-300">Driver: {trip.driver_name}</span>
              </>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center gap-1.5 text-xs font-black px-4 py-1.5 rounded-full border shadow-sm ${
            trip.is_legal
              ? 'bg-[#8AE922]/20 border-[#8AE922]/50 text-[#8AE922] shadow-glow-lime'
              : 'bg-rose-950/60 border-rose-500/50 text-rose-300'
          }`}>
            {trip.is_legal ? (
              <>
                <CheckCircle size={14} className="text-[#8AE922]" />
                <span>FMCSA LEGAL</span>
              </>
            ) : (
              <>
                <AlertTriangle size={14} className="text-rose-400" />
                <span>ADJUSTMENT NEEDED</span>
              </>
            )}
          </span>

          <button
            id="btn-share-trip"
            onClick={handleShare}
            className="p-2.5 rounded-xl bg-spotter-panel border border-white/10 text-slate-400 hover:text-white hover:border-[#8AE922]/50 transition-colors"
            title="Share trip link"
          >
            <Share2 size={16} />
          </button>

          <button
            id="btn-reset-trip"
            onClick={onReset}
            className="p-2.5 rounded-xl bg-spotter-panel border border-white/10 text-slate-400 hover:text-rose-400 hover:border-rose-500/40 transition-colors"
            title="Plan new trip"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* ── Tab bar ──────────────────────────────────────────────────────────── */}
      <div className="flex gap-2 p-1.5 bg-[#080D0A] rounded-2xl border border-white/10 overflow-x-auto custom-scrollbar">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            id={`tab-${id}`}
            onClick={() => setActiveTab(id)}
            className={`flex-1 min-w-[110px] flex items-center justify-center gap-2 py-2.5 px-3.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap font-heading ${
              activeTab === id
                ? 'bg-[#8AE922] text-[#080D0A] shadow-glow-lime font-black'
                : 'text-slate-400 hover:text-slate-200 hover:bg-spotter-panel/80'
            }`}
          >
            <Icon size={15} className={activeTab === id ? 'text-[#080D0A]' : 'text-slate-400'} />
            <span>{label}</span>
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
            <div className="h-[500px] sm:h-[580px] lg:h-[640px] rounded-2xl overflow-hidden border border-white/10 bg-spotter-panel/50 shadow-glass">
              <TripMap
                stops={trip.stops}
                routeCoordinates={trip.route_geometry}
                className="h-full w-full"
              />
            </div>
          )}

          {activeTab === 'directions' && (
            <div className="rounded-2xl border border-white/10 bg-[#0C140F]/90 p-5 sm:p-7 shadow-glass max-h-[640px] overflow-y-auto custom-scrollbar">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-[#8AE922]/20 text-[#8AE922]">
                    <Navigation size={18} />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white font-heading">
                      Turn-by-Turn Highway Directions
                    </h3>
                    <p className="text-xs text-slate-400">
                      OSRM Optimized Commercial Freight Route Navigation
                    </p>
                  </div>
                </div>
                <div className="text-right font-mono text-xs text-slate-400">
                  <span className="text-[#8AE922] font-bold">{trip.directions?.length || trip.stops.length}</span> Steps
                </div>
              </div>

              <div className="space-y-3">
                {trip.directions && trip.directions.length > 0 ? (
                  trip.directions.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-[#080D0A] border border-white/10 flex items-start gap-3.5 hover:border-[#8AE922]/40 transition-colors"
                    >
                      <div className="p-2 rounded-xl bg-[#8AE922]/15 text-[#8AE922] shrink-0 mt-0.5 font-mono text-xs font-bold">
                        #{idx + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-bold text-slate-100 font-heading">
                            {step.instruction}
                          </p>
                          <span className="text-xs font-mono font-bold text-[#8AE922] shrink-0">
                            {step.distance_miles.toFixed(1)} mi
                          </span>
                        </div>
                        {step.road && (
                          <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                            <ArrowUpRight size={12} className="text-[#8AE922]" />
                            <span>Road: {step.road}</span>
                            {step.duration_minutes > 0 && (
                              <span className="text-slate-500 ml-1">· ~{step.duration_minutes.toFixed(0)} min</span>
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  // Fallback to stop-to-stop segment directions
                  trip.stops.map((stop, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-[#080D0A] border border-white/10 flex items-start gap-3.5"
                    >
                      <div className="p-2 rounded-xl bg-[#8AE922]/15 text-[#8AE922] shrink-0 mt-0.5">
                        <Milestone size={14} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-bold text-slate-100 font-heading">
                            Leg #{idx + 1}: {stop.location_name}
                          </p>
                          <span className="text-xs font-mono font-bold text-[#8AE922]">
                            {stop.distance_from_last_stop_miles > 0 ? `+${stop.distance_from_last_stop_miles.toFixed(0)} mi` : 'Start'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{stop.reason}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'eld' && (
            <div className="rounded-2xl overflow-hidden border border-white/10 bg-spotter-panel/30 p-2 sm:p-5 shadow-glass">
              <ELDViewer trip={trip} />
            </div>
          )}

          {activeTab === 'stops' && (
            <div className="max-h-[640px] overflow-y-auto pr-1 custom-scrollbar">
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

      {/* ── Interactive Share Plan Modal ────────────────────────────────────── */}
      <ShareModal
        open={shareModalOpen}
        onOpenChange={setShareModalOpen}
        trip={trip}
      />
    </motion.div>
  )
}
