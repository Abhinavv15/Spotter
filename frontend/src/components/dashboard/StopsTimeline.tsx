/**
 * StopsTimeline.tsx
 * Vertical timeline of all scheduled stops with HOS context.
 * Nexterra styling with signature lime stop badges and clean cards.
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
  CURRENT:   { icon: Navigation2, label: 'Current Origin',     color: 'text-[#8AE922]', bg: 'bg-[#8AE922]/15', border: 'border-[#8AE922]/40' },
  PICKUP:    { icon: Package,     label: 'Shipper Pickup',     color: 'text-emerald-400', bg: 'bg-emerald-950/40', border: 'border-emerald-500/40' },
  DROPOFF:   { icon: MapPin,      label: 'Receiver Delivery',  color: 'text-[#8AE922]', bg: 'bg-[#8AE922]/15', border: 'border-[#8AE922]/40' },
  FUEL:      { icon: Fuel,        label: 'Fueling Stop',       color: 'text-amber-400',   bg: 'bg-amber-950/40',   border: 'border-amber-500/40' },
  REST_10H:  { icon: Moon,        label: '10h Off-Duty Rest',  color: 'text-teal-300',    bg: 'bg-teal-950/40',    border: 'border-teal-500/40' },
  REST_34H:  { icon: RefreshCw,   label: '34h Cycle Restart',  color: 'text-amber-400',   bg: 'bg-amber-950/40',   border: 'border-amber-500/40' },
  BREAK_30M: { icon: Coffee,      label: '30-min Rest Break',  color: 'text-[#8AE922]', bg: 'bg-[#8AE922]/15', border: 'border-[#8AE922]/40' },
  COMBINED:  { icon: Layers,      label: 'Combined Stop',      color: 'text-emerald-300', bg: 'bg-emerald-950/40', border: 'border-emerald-500/40' },
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
    <div className="relative flex flex-col gap-0 py-2">
      {stops.map((stop, i) => {
        const cfg = STOP_CONFIG[stop.stop_type] || STOP_CONFIG.CURRENT
        const Icon = cfg.icon
        const isLast = i === stops.length - 1

        return (
          <motion.div
            key={stop.stop_sequence}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className="flex gap-3.5"
          >
            {/* Stem */}
            <div className="flex flex-col items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 shrink-0 ${cfg.bg} ${cfg.border} z-10 shadow-sm`}>
                <Icon size={14} className={cfg.color} />
              </div>
              {!isLast && (
                <div className="w-px flex-1 bg-gradient-to-b from-white/20 to-white/5 my-1" style={{ minHeight: 28 }} />
              )}
            </div>

            {/* Card */}
            <div className={`mb-3.5 flex-1 rounded-2xl border ${cfg.border} ${cfg.bg} p-4 backdrop-blur-md`}>
              <div className="flex items-start justify-between gap-2 mb-1">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-extrabold uppercase tracking-wider font-heading ${cfg.color}`}>
                      {cfg.label}
                    </span>
                    {stop.is_optimized && (
                      <span className="text-[10px] font-bold bg-[#8AE922]/20 text-[#8AE922] border border-[#8AE922]/30 rounded-md px-1.5 py-0.5">
                        Optimized Stop
                      </span>
                    )}
                  </div>
                  <p className="text-sm sm:text-base font-bold text-slate-100 mt-1 leading-snug font-heading">
                    {stop.location_name}
                  </p>
                </div>
                <div className="text-right shrink-0 font-mono">
                  <p className="text-[10px] text-slate-400">Stop #{stop.stop_sequence}</p>
                  {stop.odometer_miles > 0 && (
                    <p className="text-xs font-bold text-[#8AE922]">
                      {stop.odometer_miles.toFixed(0)} mi
                    </p>
                  )}
                </div>
              </div>

              {/* Timing row */}
              <div className="flex items-center gap-3.5 text-xs text-slate-400 mt-2 flex-wrap font-medium">
                <span className="flex items-center gap-1.5 font-mono">
                  <Clock size={12} className="text-slate-500" />
                  <span>Arrive:</span>
                  <span className="text-slate-200 font-semibold">{formatTime(stop.arrival_time)}</span>
                </span>
                {stop.duration_minutes > 0 && (
                  <span className="flex items-center gap-1.5 font-mono">
                    <Milestone size={12} className="text-slate-500" />
                    <span>Duration:</span>
                    <span className="text-slate-200 font-semibold">{formatDuration(stop.duration_minutes)}</span>
                  </span>
                )}
                {stop.distance_from_last_stop_miles > 0 && (
                  <span className="text-slate-500 font-mono">
                    (+{stop.distance_from_last_stop_miles.toFixed(0)} mi)
                  </span>
                )}
              </div>

              {/* Reason */}
              {stop.reason && (
                <p className="text-xs text-slate-300 mt-2 leading-relaxed border-t border-white/5 pt-2">
                  <span className="text-slate-500 font-medium">Activity: </span>{stop.reason}
                </p>
              )}

              {/* HOS Impact */}
              {stop.hos_impact && (
                <p className="text-xs text-[#8AE922]/90 mt-1 leading-relaxed font-medium">
                  <span className="text-[#8AE922] font-bold">HOS Status: </span>{stop.hos_impact}
                </p>
              )}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
