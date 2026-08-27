/**
 * StopsTimeline.tsx
 * Vertical timeline of all scheduled stops with HOS context.
 */
import { motion } from 'framer-motion'
import { 
  Navigation2, Package, MapPin, Fuel, Moon, RefreshCw, 
  Coffee, Layers, Clock, Milestone, type LucideIcon
} from 'lucide-react'
import type { StopData, StopType } from '../../types/trip'

const STOP_CONFIG: Record<StopType, {
  icon: LucideIcon
  label: string
  color: string
  bg: string
  border: string
}> = {
  CURRENT:   { icon: Navigation2, label: 'Current Location', color: 'text-blue-400',   bg: 'bg-blue-950/40',   border: 'border-blue-800' },
  PICKUP:    { icon: Package,     label: 'Pickup',           color: 'text-green-400',  bg: 'bg-green-950/40',  border: 'border-green-800' },
  DROPOFF:   { icon: MapPin,      label: 'Dropoff',          color: 'text-orange-400', bg: 'bg-orange-950/40', border: 'border-orange-800' },
  FUEL:      { icon: Fuel,        label: 'Fuel Stop',        color: 'text-yellow-400', bg: 'bg-yellow-950/40', border: 'border-yellow-800' },
  REST_10H:  { icon: Moon,        label: '10h Rest',         color: 'text-purple-400', bg: 'bg-purple-950/40', border: 'border-purple-800' },
  REST_34H:  { icon: RefreshCw,   label: '34h Restart',      color: 'text-red-400',    bg: 'bg-red-950/40',    border: 'border-red-800' },
  BREAK_30M: { icon: Coffee,      label: '30-min Break',     color: 'text-teal-400',   bg: 'bg-teal-950/40',   border: 'border-teal-800' },
  COMBINED:  { icon: Layers,      label: 'Combined Stop',    color: 'text-indigo-400', bg: 'bg-indigo-950/40', border: 'border-indigo-800' },
}

interface StopsTimelineProps {
  stops: StopData[]
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString('en-US', {
      month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
      timeZone: 'UTC', hour12: true
    })
  } catch { return iso }
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

export default function StopsTimeline({ stops }: StopsTimelineProps) {
  return (
    <div className="relative flex flex-col gap-0">
      {stops.map((stop, i) => {
        const cfg = STOP_CONFIG[stop.stop_type] || STOP_CONFIG.CURRENT
        const Icon = cfg.icon
        const isLast = i === stops.length - 1

        return (
          <motion.div
            key={stop.stop_sequence}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex gap-3"
          >
            {/* Stem */}
            <div className="flex flex-col items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 flex-shrink-0 ${cfg.bg} ${cfg.border} z-10`}>
                <Icon size={14} className={cfg.color} />
              </div>
              {!isLast && (
                <div className="w-px flex-1 bg-gradient-to-b from-slate-700 to-slate-800 my-1" style={{ minHeight: 24 }} />
              )}
            </div>

            {/* Card */}
            <div className={`mb-3 flex-1 rounded-xl border ${cfg.border} ${cfg.bg} p-3`}>
              <div className="flex items-start justify-between gap-2 mb-1">
                <div>
                  <span className={`text-xs font-bold uppercase tracking-wider ${cfg.color}`}>
                    {cfg.label}
                  </span>
                  {stop.is_optimized && (
                    <span className="ml-2 text-[9px] bg-indigo-900/60 text-indigo-300 border border-indigo-800 rounded px-1 py-0.5">
                      Optimized
                    </span>
                  )}
                  <p className="text-sm font-semibold text-slate-200 mt-0.5 leading-tight">
                    {stop.location_name}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-[10px] text-slate-500">Stop #{stop.stop_sequence}</p>
                  {stop.odometer_miles > 0 && (
                    <p className="text-[10px] font-semibold text-slate-400">
                      {stop.odometer_miles.toFixed(0)} mi
                    </p>
                  )}
                </div>
              </div>

              {/* Timing row */}
              <div className="flex items-center gap-3 text-[10px] text-slate-500 mt-1.5 flex-wrap">
                <span className="flex items-center gap-1">
                  <Clock size={9} />
                  Arrive: <span className="text-slate-400 ml-0.5">{formatTime(stop.arrival_time)}</span>
                </span>
                {stop.duration_minutes > 0 && (
                  <span className="flex items-center gap-1">
                    <Milestone size={9} />
                    Stay: <span className="text-slate-400 ml-0.5">{formatDuration(stop.duration_minutes)}</span>
                  </span>
                )}
                {stop.distance_from_last_stop_miles > 0 && (
                  <span className="text-slate-600">
                    +{stop.distance_from_last_stop_miles.toFixed(0)} mi from last
                  </span>
                )}
              </div>

              {/* Reason */}
              {stop.reason && (
                <p className="text-[10px] text-slate-500 mt-1.5 leading-relaxed border-t border-slate-800/50 pt-1.5">
                  <span className="text-slate-600">Why: </span>{stop.reason}
                </p>
              )}

              {/* HOS Impact */}
              {stop.hos_impact && (
                <p className="text-[10px] text-blue-400/70 mt-1 leading-relaxed">
                  <span className="text-blue-500/80">HOS: </span>{stop.hos_impact}
                </p>
              )}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
