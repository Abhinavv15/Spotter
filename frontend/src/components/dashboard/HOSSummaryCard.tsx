/**
 * HOSSummaryCard.tsx
 * Compact summary card showing HOS compliance status, key metrics,
 * and animated cycle telemetry with Nexterra lime styling.
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
  const drivePct = Math.min(100, (drivingHours / (drivingHours + restHours || 1)) * 100)

  return (
    <div className="rounded-2xl border border-white/10 bg-spotter-panel/90 backdrop-blur-md overflow-hidden shadow-glass">
      {/* Status banner */}
      <div className={`px-6 py-4 flex items-center gap-3.5 ${
        isLegal 
          ? 'bg-[#8AE922]/15 border-b border-[#8AE922]/30' 
          : 'bg-rose-950/40 border-b border-rose-500/20'
      }`}>
        {isLegal ? (
          <CheckCircle2 size={24} className="text-[#8AE922] shrink-0" />
        ) : (
          <AlertTriangle size={24} className="text-rose-400 shrink-0" />
        )}
        <div>
          <p className={`font-black text-sm tracking-wide font-heading ${isLegal ? 'text-[#8AE922]' : 'text-rose-300'}`}>
            {isLegal ? 'FMCSA HOS COMPLIANT' : 'REQUIRES SCHEDULE ADJUSTMENT'}
          </p>
          <p className="text-xs text-slate-300 mt-0.5">{summary.summary_text}</p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-white/5 border-b border-white/10">
        <StatCell
          icon={<Clock size={16} className="text-[#8AE922]" />}
          label="Total Days"
          value={totalDays.toString()}
          sub="Trip duration"
          valueColor="text-[#8AE922]"
        />
        <StatCell
          icon={<Gauge size={16} className="text-emerald-400" />}
          label="Total Miles"
          value={`${totalMiles.toFixed(0)} mi`}
          sub="Highway distance"
          valueColor="text-white"
        />
        <StatCell
          icon={<TrendingDown size={16} className="text-[#8AE922]" />}
          label="Drive Time"
          value={`${drivingHours.toFixed(1)}h`}
          sub={`${drivePct.toFixed(0)}% in CMV motion`}
          valueColor="text-white"
        />
        <StatCell
          icon={<RefreshCw size={16} className="text-amber-400" />}
          label="34h Restart"
          value={summary.required_34h_restart ? `Day ${summary.restart_day}` : 'Not Required'}
          sub={summary.required_34h_restart ? 'Mandatory reset' : 'Under 70h budget'}
          valueColor={summary.required_34h_restart ? 'text-amber-400' : 'text-[#8AE922]'}
        />
      </div>

      {/* Cycle usage bar */}
      <div className="px-6 py-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs sm:text-sm font-bold text-slate-200 flex items-center gap-2 font-heading">
            <Clock size={14} className="text-[#8AE922]" />
            70-Hour / 8-Day Cycle Cumulative Usage
          </span>
          <span className="text-xs sm:text-sm font-mono font-extrabold text-[#8AE922]">
            {summary.total_cycle_hours_consumed.toFixed(1)}h / 70.0h
          </span>
        </div>
        <div className="h-3 bg-[#080D0A] rounded-full overflow-hidden border border-white/5 my-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${cycleUsedPct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full rounded-full shadow-sm"
            style={{
              background: cycleUsedPct > 85
                ? 'linear-gradient(90deg, #F43F5E, #E11D48)'
                : cycleUsedPct > 60
                ? 'linear-gradient(90deg, #FACC15, #EAB308)'
                : 'linear-gradient(90deg, #8AE922, #4ADE80)'
            }}
          />
        </div>
        <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-mono font-medium">
          <span>Starting cycle: {summary.current_cycle_used.toFixed(1)}h</span>
          <span>Cycle remaining at delivery: {summary.cycle_hours_remaining_end.toFixed(1)}h</span>
        </div>
      </div>

      {/* Violations */}
      {summary.violations?.length > 0 && (
        <div className="px-6 pb-4 border-t border-rose-500/20 bg-rose-950/10">
          <p className="text-xs font-bold text-rose-400 mt-3 mb-2 uppercase tracking-wider flex items-center gap-1.5 font-heading">
            <AlertTriangle size={14} />
            Detected Violations (§ 395)
          </p>
          <ul className="flex flex-col gap-1.5">
            {summary.violations.map((v, i) => (
              <li key={i} className="text-xs text-rose-300 flex items-start gap-1.5">
                <span className="text-rose-500 mt-0.5 shrink-0">•</span>
                {v}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Compliance notes */}
      {summary.explanations?.length > 0 && (
        <div className="px-6 pb-5 border-t border-white/10">
          <p className="text-xs font-bold text-[#8AE922] mt-3 mb-2 uppercase tracking-wider font-heading">
            FMCSA Rule Verifications
          </p>
          <ul className="flex flex-col gap-1.5">
            {summary.explanations.slice(0, 5).map((e, i) => (
              <li key={i} className="text-xs text-slate-300 flex items-start gap-1.5">
                <span className="text-[#8AE922] mt-0.5 shrink-0 font-bold">✓</span>
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
    <div className="bg-[#0C140F]/60 px-5 py-3.5">
      <div className="flex items-center gap-1.5 mb-1">
        {icon}
        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold font-heading">{label}</span>
      </div>
      <div className={`text-base sm:text-xl font-black font-mono ${valueColor}`}>{value}</div>
      <div className="text-[10px] text-slate-500 font-medium">{sub}</div>
    </div>
  )
}
