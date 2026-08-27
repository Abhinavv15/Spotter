/**
 * HOSSummaryCard.tsx
 * Compact summary card showing HOS compliance status, key metrics,
 * and an animated radial gauge.
 */
import { motion } from 'framer-motion'
import { CheckCircle2, AlertTriangle, Clock, Gauge, RefreshCw, TrendingDown } from 'lucide-react'
import type { HOSSummary } from '../../types/trip'

interface HOSSummaryCardProps {
  summary: HOSSummary
  totalDays: number
  totalMiles: number
  drivingHours: number
  restHours: number
}

export default function HOSSummaryCard({
  summary,
  totalDays,
  totalMiles,
  drivingHours,
  restHours,
}: HOSSummaryCardProps) {
  const isLegal = summary.is_legal
  const cycleUsedPct = Math.min(100, (summary.total_cycle_hours_consumed / 70) * 100)
  const drivePct = Math.min(100, (drivingHours / (drivingHours + restHours)) * 100)

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/80 backdrop-blur overflow-hidden">
      {/* Status banner */}
      <div className={`px-5 py-3 flex items-center gap-3 ${isLegal ? 'bg-green-950/60' : 'bg-red-950/60'}`}>
        {isLegal ? (
          <CheckCircle2 size={20} className="text-green-400 flex-shrink-0" />
        ) : (
          <AlertTriangle size={20} className="text-red-400 flex-shrink-0" />
        )}
        <div>
          <p className={`font-bold text-sm ${isLegal ? 'text-green-300' : 'text-red-300'}`}>
            {isLegal ? 'HOS COMPLIANT' : 'REQUIRES ADJUSTMENT'}
          </p>
          <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{summary.summary_text}</p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-px bg-slate-800/50">
        <StatCell
          icon={<Clock size={14} className="text-blue-400" />}
          label="Total Days"
          value={totalDays.toString()}
          sub="planned"
        />
        <StatCell
          icon={<Gauge size={14} className="text-orange-400" />}
          label="Total Miles"
          value={totalMiles.toFixed(0)}
          sub="miles"
        />
        <StatCell
          icon={<TrendingDown size={14} className="text-green-400" />}
          label="Driving Time"
          value={`${drivingHours.toFixed(1)}h`}
          sub={`${drivePct.toFixed(0)}% of total`}
        />
        <StatCell
          icon={<RefreshCw size={14} className="text-purple-400" />}
          label="34h Restart"
          value={summary.required_34h_restart ? `Day ${summary.restart_day}` : 'Not Required'}
          sub={summary.required_34h_restart ? 'mandatory reset' : 'within 70h budget'}
          valueColor={summary.required_34h_restart ? 'text-yellow-400' : 'text-green-400'}
        />
      </div>

      {/* Cycle usage bar */}
      <div className="px-5 py-4 border-t border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-400">Cycle Usage (70h/8-day)</span>
          <span className="text-xs font-bold text-slate-200">
            {summary.total_cycle_hours_consumed.toFixed(1)}h / 70h
          </span>
        </div>
        <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${cycleUsedPct}%` }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
            className="h-full rounded-full"
            style={{
              background: cycleUsedPct > 85
                ? 'linear-gradient(90deg, #ef4444, #dc2626)'
                : cycleUsedPct > 60
                ? 'linear-gradient(90deg, #f97316, #ea580c)'
                : 'linear-gradient(90deg, #4ade80, #22c55e)'
            }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-slate-600 mt-1">
          <span>Start: {summary.current_cycle_used.toFixed(1)}h used</span>
          <span>Remaining: {summary.cycle_hours_remaining_end.toFixed(1)}h</span>
        </div>
      </div>

      {/* Violations */}
      {summary.violations?.length > 0 && (
        <div className="px-5 pb-4 border-t border-slate-800">
          <p className="text-xs font-semibold text-red-400 mt-3 mb-2 uppercase tracking-wider">
            Violations
          </p>
          <ul className="flex flex-col gap-1.5">
            {summary.violations.map((v, i) => (
              <li key={i} className="text-xs text-red-300 flex items-start gap-1.5">
                <span className="text-red-500 mt-0.5 flex-shrink-0">•</span>
                {v}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Explanations / compliance notes */}
      {summary.explanations?.length > 0 && (
        <div className="px-5 pb-4 border-t border-slate-800">
          <p className="text-xs font-semibold text-blue-400 mt-3 mb-2 uppercase tracking-wider">
            Compliance Notes
          </p>
          <ul className="flex flex-col gap-1.5">
            {summary.explanations.slice(0, 5).map((e, i) => (
              <li key={i} className="text-xs text-slate-400 flex items-start gap-1.5">
                <span className="text-blue-500 mt-0.5 flex-shrink-0">›</span>
                {e}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function StatCell({ icon, label, value, sub, valueColor = 'text-white' }: {
  icon: React.ReactNode
  label: string
  value: string
  sub: string
  valueColor?: string
}) {
  return (
    <div className="bg-slate-900/60 px-4 py-3">
      <div className="flex items-center gap-1.5 mb-1">
        {icon}
        <span className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</span>
      </div>
      <div className={`text-lg font-bold ${valueColor}`}>{value}</div>
      <div className="text-[10px] text-slate-600">{sub}</div>
    </div>
  )
}
