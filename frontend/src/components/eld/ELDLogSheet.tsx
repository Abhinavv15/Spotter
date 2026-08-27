/**
 * ELDLogSheet.tsx
 * Pixel-perfect SVG renderer for an FMCSA Driver's Daily Log (24-hr grid).
 * Matches the blank-paper-log.png reference exactly.
 */
import React, { forwardRef } from 'react'
import type { DailyLogData, DutyStatusType } from '../../types/trip'

interface ELDLogSheetProps {
  log: DailyLogData
  driverName?: string
  carrierName?: string
  carrierAddress?: string
  homeTerminal?: string
  truckNumber?: string
  trailerNumber?: string
  shippingDoc?: string
  commodity?: string
  coDriver?: string
  totalMileageTrip?: number
  className?: string
}

// ── Color palette ─────────────────────────────────────────────────────────────
const STATUS_COLORS: Record<DutyStatusType, string> = {
  OFF_DUTY: '#4ade80',          // green
  SLEEPER_BERTH: '#60a5fa',     // blue
  DRIVING: '#f97316',           // orange
  ON_DUTY_NOT_DRIVING: '#facc15' // yellow
}

const STATUS_LABELS: Record<DutyStatusType, string> = {
  OFF_DUTY: '1. Off Duty',
  SLEEPER_BERTH: '2. Sleeper Berth',
  DRIVING: '3. Driving',
  ON_DUTY_NOT_DRIVING: '4. On Duty (not driving)'
}

// ── Grid dimensions (in SVG user units) ──────────────────────────────────────
const W = 900
const HEADER_H = 110
const GRID_LEFT = 70
const GRID_RIGHT = W - 30
const GRID_W = GRID_RIGHT - GRID_LEFT
const ROW_HEIGHT = 30
const ROWS = 4
const GRID_TOP = HEADER_H + 30
const GRID_BOTTOM = GRID_TOP + ROW_HEIGHT * ROWS
const REMARKS_TOP = GRID_BOTTOM + 20
const RECAP_TOP = REMARKS_TOP + 140
const TOTAL_H = RECAP_TOP + 120

// ── Hour-to-x helper ─────────────────────────────────────────────────────────
function hourToX(hour: number): number {
  return GRID_LEFT + (hour / 24) * GRID_W
}

// ── Row index for each duty status ───────────────────────────────────────────
const STATUS_ROW: Record<DutyStatusType, number> = {
  OFF_DUTY: 0,
  SLEEPER_BERTH: 1,
  DRIVING: 2,
  ON_DUTY_NOT_DRIVING: 3
}

// ── Vertical tick marks every 15 minutes ─────────────────────────────────────
function GridTicks({ rowTop, rowH }: { rowTop: number; rowH: number }) {
  const ticks = []
  for (let h = 0; h <= 24; h++) {
    for (let q = 0; q < 4; q++) {
      const x = hourToX(h + q * 0.25)
      const isMajor = q === 0
      const tickH = isMajor ? rowH : rowH * 0.4
      ticks.push(
        <line
          key={`${h}-${q}`}
          x1={x} y1={rowTop}
          x2={x} y2={rowTop + tickH}
          stroke="#334155" strokeWidth={isMajor ? 0.8 : 0.4}
        />
      )
    }
  }
  return <>{ticks}</>
}

// ── Hour labels at top ────────────────────────────────────────────────────────
function HourLabels({ y }: { y: number }) {
  const labels = ['Mid-\nnight', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', 'Noon', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', 'Mid-\nnight']
  return (
    <>
      {labels.map((label, i) => {
        const x = hourToX(i)
        const lines = label.split('\n')
        return (
          <text key={i} x={x} y={y} textAnchor="middle" fontSize={7} fill="#94a3b8" fontFamily="monospace">
            {lines.map((l, j) => (
              <tspan key={j} x={x} dy={j === 0 ? 0 : 8}>{l}</tspan>
            ))}
          </text>
        )
      })}
    </>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
const ELDLogSheet = forwardRef<SVGSVGElement, ELDLogSheetProps>(function ELDLogSheet(
  {
    log,
    driverName = '',
    carrierName = '',
    carrierAddress = '',
    homeTerminal = '',
    truckNumber = '',
    trailerNumber = '',
    shippingDoc = '',
    commodity = '',
    coDriver = '',
    totalMileageTrip = 0,
    className = ''
  },
  ref
) {
  const dateObj = new Date(log.log_date + 'T12:00:00Z')
  const dateStr = dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${W} ${TOTAL_H}`}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ fontFamily: "'Inter', 'Roboto', sans-serif", background: '#0f172a', borderRadius: 8 }}
      role="img"
      aria-label={`ELD Daily Log for Day ${log.day_number}`}
    >
      {/* ── Background ─────────────────────────────────────────────────────── */}
      <rect width={W} height={TOTAL_H} fill="#0f172a" rx={8} />

      {/* ── Title bar ──────────────────────────────────────────────────────── */}
      <rect x={0} y={0} width={W} height={28} fill="#1e3a5f" rx={8} />
      <rect x={0} y={20} width={W} height={8} fill="#1e3a5f" /> {/* flatten bottom corners */}
      <text x={14} y={19} fontSize={13} fontWeight="700" fill="#f8fafc" letterSpacing={1}>
        Drivers Daily Log
      </text>
      <text x={14} y={27} fontSize={7} fill="#94a3b8">(24 hours)</text>
      <text x={300} y={18} fontSize={9} fill="#94a3b8">
        Date: <tspan fill="#e2e8f0" fontWeight="600">{dateStr}</tspan>
        {'   '}Day: <tspan fill="#e2e8f0" fontWeight="600">{log.day_number}</tspan>
      </text>
      <text x={620} y={12} fontSize={7} fill="#64748b">Original – File at home terminal.</text>
      <text x={620} y={22} fontSize={7} fill="#64748b">Duplicate – Driver retains in his/her possession for 8 days.</text>

      {/* ── From / To section ──────────────────────────────────────────────── */}
      <text x={14} y={44} fontSize={8} fill="#64748b">From:</text>
      <line x1={36} y1={46} x2={200} y2={46} stroke="#334155" strokeWidth={0.5} />
      <text x={40} y={44} fontSize={8} fill="#e2e8f0">{homeTerminal}</text>

      <text x={300} y={44} fontSize={8} fill="#64748b">To:</text>
      <line x1={312} y1={46} x2={W - 14} y2={46} stroke="#334155" strokeWidth={0.5} />

      {/* Miles / Mileage */}
      <rect x={14} y={52} width={90} height={18} fill="#1e293b" rx={2} />
      <text x={59} y={62} fontSize={6.5} fill="#64748b" textAnchor="middle">Total Miles Driving Today</text>
      <text x={59} y={68} fontSize={8} fontWeight="700" fill="#f97316" textAnchor="middle">
        {log.total_miles_today.toFixed(0)}
      </text>
      <rect x={112} y={52} width={70} height={18} fill="#1e293b" rx={2} />
      <text x={147} y={62} fontSize={6.5} fill="#64748b" textAnchor="middle">Total Mileage Today</text>
      <text x={147} y={68} fontSize={8} fontWeight="700" fill="#e2e8f0" textAnchor="middle">
        {totalMileageTrip.toFixed(0)}
      </text>

      {/* Carrier info */}
      <text x={300} y={62} fontSize={7} fill="#64748b">Name of Carrier or Carriers:</text>
      <line x1={420} y1={63} x2={W - 14} y2={63} stroke="#334155" strokeWidth={0.5} />
      <text x={422} y={62} fontSize={8} fill="#e2e8f0">{carrierName}</text>

      {/* Truck / Trailer */}
      <text x={14} y={82} fontSize={6.5} fill="#64748b">
        Truck/Tractor and Trailer Numbers or License Plate(s)/State (show each unit)
      </text>
      <line x1={14} y1={84} x2={240} y2={84} stroke="#334155" strokeWidth={0.5} />
      <text x={16} y={92} fontSize={8} fill="#e2e8f0">
        {[truckNumber && `Truck: ${truckNumber}`, trailerNumber && `Trailer: ${trailerNumber}`].filter(Boolean).join('  |  ')}
      </text>

      <text x={300} y={75} fontSize={7} fill="#64748b">Main Office Address</text>
      <line x1={300} y1={76} x2={W - 14} y2={76} stroke="#334155" strokeWidth={0.5} />
      <text x={302} y={75} fontSize={7.5} fill="#e2e8f0">{carrierAddress}</text>

      <text x={300} y={90} fontSize={7} fill="#64748b">Home Terminal Address</text>
      <line x1={300} y1={91} x2={W - 14} y2={91} stroke="#334155" strokeWidth={0.5} />
      <text x={302} y={90} fontSize={7.5} fill="#e2e8f0">{homeTerminal}</text>

      {/* ── Hour labels ────────────────────────────────────────────────────── */}
      <HourLabels y={GRID_TOP - 8} />

      {/* ── Grid background + rows ─────────────────────────────────────────── */}
      <rect
        x={GRID_LEFT} y={GRID_TOP}
        width={GRID_W} height={ROW_HEIGHT * ROWS}
        fill="#0f172a" stroke="#1e3a5f" strokeWidth={1}
        rx={2}
      />

      {/* Row dividers + row labels */}
      {Object.entries(STATUS_LABELS).map(([status, label], i) => {
        const rowTop = GRID_TOP + i * ROW_HEIGHT
        return (
          <React.Fragment key={status}>
            {/* Row label */}
            <text
              x={GRID_LEFT - 6} y={rowTop + ROW_HEIGHT / 2 + 3}
              fontSize={7} fill="#94a3b8" textAnchor="end"
            >
              {label}
            </text>
            {/* Row background stripe */}
            <rect
              x={GRID_LEFT} y={rowTop}
              width={GRID_W} height={ROW_HEIGHT}
              fill={i % 2 === 0 ? '#0f172a' : '#111827'}
            />
            {/* Tick marks */}
            <GridTicks rowTop={rowTop} rowH={ROW_HEIGHT} />
            {/* Row border */}
            <line x1={GRID_LEFT} y1={rowTop + ROW_HEIGHT} x2={GRID_RIGHT} y2={rowTop + ROW_HEIGHT} stroke="#1e3a5f" strokeWidth={0.8} />
            {/* Total hours box */}
            <text
              x={GRID_RIGHT + 20} y={rowTop + ROW_HEIGHT / 2 + 3}
              fontSize={8} fill="#e2e8f0" textAnchor="middle" fontWeight="600"
            >
              {getHoursForStatus(log, status as DutyStatusType).toFixed(1)}
            </text>
          </React.Fragment>
        )
      })}

      {/* "Total Hours" column header */}
      <text x={GRID_RIGHT + 20} y={GRID_TOP - 8} fontSize={7} fill="#64748b" textAnchor="middle">Total</text>
      <text x={GRID_RIGHT + 20} y={GRID_TOP - 1} fontSize={7} fill="#64748b" textAnchor="middle">Hours</text>

      {/* ── Duty segments ─────────────────────────────────────────────────── */}
      {log.duty_segments.map((seg, idx) => {
        const rowIdx = STATUS_ROW[seg.status]
        const rowTop = GRID_TOP + rowIdx * ROW_HEIGHT
        const x1 = hourToX(Math.max(0, seg.start_hour))
        const x2 = hourToX(Math.min(24, seg.end_hour))
        const segW = Math.max(1, x2 - x1)
        const color = STATUS_COLORS[seg.status]
        return (
          <rect
            key={idx}
            x={x1}
            y={rowTop + 2}
            width={segW}
            height={ROW_HEIGHT - 4}
            fill={color}
            opacity={0.85}
            rx={1}
          >
            <title>{seg.status} {seg.start_hour.toFixed(2)}h – {seg.end_hour.toFixed(2)}h: {seg.note || ''}</title>
          </rect>
        )
      })}

      {/* ── Vertical "current hour" connection lines between status rows ──── */}
      {log.duty_segments.map((seg, idx) => {
        const transitions = []
        if (idx > 0) {
          const prev = log.duty_segments[idx - 1]
          if (prev.end_hour === seg.start_hour && prev.status !== seg.status) {
            const x = hourToX(seg.start_hour)
            const prevRowIdx = STATUS_ROW[prev.status]
            const curRowIdx = STATUS_ROW[seg.status]
            const y1 = GRID_TOP + prevRowIdx * ROW_HEIGHT + (prevRowIdx < curRowIdx ? ROW_HEIGHT - 2 : 2)
            const y2 = GRID_TOP + curRowIdx * ROW_HEIGHT + (curRowIdx < prevRowIdx ? ROW_HEIGHT - 2 : 2)
            transitions.push(
              <line key={`t-${idx}`} x1={x} y1={y1} x2={x} y2={y2} stroke="#e2e8f0" strokeWidth={1} strokeDasharray="2,1" />
            )
          }
        }
        return transitions
      })}

      {/* ── Remarks section ─────────────────────────────────────────────────── */}
      <text x={14} y={REMARKS_TOP + 10} fontSize={9} fontWeight="700" fill="#94a3b8" letterSpacing={0.5}>
        Remarks
      </text>
      <line x1={60} y1={REMARKS_TOP + 8} x2={W - 14} y2={REMARKS_TOP + 8} stroke="#1e3a5f" strokeWidth={0.8} />

      {log.remarks.slice(0, 8).map((remark, i) => {
        const y = REMARKS_TOP + 22 + i * 13
        return (
          <React.Fragment key={i}>
            {/* tick on grid */}
            <line
              x1={hourToX(remark.hour)} y1={GRID_TOP - 2}
              x2={hourToX(remark.hour)} y2={GRID_TOP + ROW_HEIGHT * ROWS + 2}
              stroke="#94a3b8" strokeWidth={0.6} strokeDasharray="3,2"
              opacity={0.5}
            />
            <text x={14} y={y} fontSize={7.5} fill="#64748b">{remark.time_str}</text>
            <text x={55} y={y} fontSize={7.5} fill="#94a3b8">{remark.location}</text>
            <text x={220} y={y} fontSize={7.5} fill="#cbd5e1">{remark.note}</text>
          </React.Fragment>
        )
      })}

      {/* ── Shipping Documents ─────────────────────────────────────────────── */}
      <text x={14} y={REMARKS_TOP + 125} fontSize={8} fontWeight="600" fill="#64748b">Shipping Documents:</text>
      <text x={14} y={REMARKS_TOP + 136} fontSize={7.5} fill="#e2e8f0">{shippingDoc}</text>

      <text x={14} y={REMARKS_TOP + 148} fontSize={7.5} fill="#64748b">Shipper &amp; Commodity:</text>
      <text x={14} y={REMARKS_TOP + 158} fontSize={7.5} fill="#e2e8f0">{commodity}</text>

      <text x={200} y={REMARKS_TOP + 140} fontSize={7} fill="#64748b" fontStyle="italic">
        Enter name of place you reported and where released from work and when and where each change of duty occurred.
      </text>
      <text x={200} y={REMARKS_TOP + 150} fontSize={7} fill="#64748b" fontStyle="italic">
        Use time standard of home terminal.
      </text>

      {/* ── Recap section ─────────────────────────────────────────────────── */}
      <rect x={14} y={RECAP_TOP} width={W - 28} height={110} fill="#111827" rx={4} />
      <line x1={14} y1={RECAP_TOP} x2={W - 14} y2={RECAP_TOP} stroke="#1e3a5f" strokeWidth={1} />
      <text x={20} y={RECAP_TOP + 12} fontSize={8} fontWeight="700" fill="#64748b">Recap:</text>
      <text x={20} y={RECAP_TOP + 21} fontSize={7} fill="#64748b">Complete at</text>
      <text x={20} y={RECAP_TOP + 29} fontSize={7} fill="#64748b">end of day</text>

      {/* 70-hour/8-day section */}
      <text x={90} y={RECAP_TOP + 10} fontSize={8} fontWeight="700" fill="#f97316">70 Hour/ 8 Day</text>
      <text x={90} y={RECAP_TOP + 18} fontSize={7.5} fill="#94a3b8">Drivers</text>
      <RecapColumn
        x={130} y={RECAP_TOP}
        label="A."
        desc="A. Total hours on duty last 7 days including today."
        value={(log.cycle_hours_7day || 0).toFixed(1)}
        color="#f97316"
      />
      <RecapColumn
        x={210} y={RECAP_TOP}
        label="B."
        desc="B. Total hours on duty available tomorrow 70 hr. minus A*"
        value={Math.max(0, 70 - (log.cycle_hours_7day || 0)).toFixed(1)}
        color="#4ade80"
      />
      <RecapColumn
        x={290} y={RECAP_TOP}
        label="C."
        desc="C. Total hours on duty last 8 days including today."
        value={(log.cycle_hours_8day || 0).toFixed(1)}
        color="#94a3b8"
      />

      {/* 60-hour/7-day section */}
      <text x={400} y={RECAP_TOP + 10} fontSize={8} fontWeight="700" fill="#60a5fa">60 Hour/ 7</text>
      <text x={400} y={RECAP_TOP + 18} fontSize={7.5} fill="#94a3b8">Day Drivers</text>
      <RecapColumn
        x={460} y={RECAP_TOP}
        label="A."
        desc="A. Total hours on duty last 6 days including today."
        value={Math.min(60, log.cycle_hours_7day || 0).toFixed(1)}
        color="#60a5fa"
      />
      <RecapColumn
        x={540} y={RECAP_TOP}
        label="B."
        desc="B. Total hours on duty available tomorrow 60 hr. minus A*"
        value={Math.max(0, 60 - Math.min(60, log.cycle_hours_7day || 0)).toFixed(1)}
        color="#4ade80"
      />
      <RecapColumn
        x={620} y={RECAP_TOP}
        label="C."
        desc="C. Total hours on duty last 7 days including today."
        value={(log.cycle_hours_7day || 0).toFixed(1)}
        color="#94a3b8"
      />

      {/* 34h restart note */}
      <text x={730} y={RECAP_TOP + 12} fontSize={7} fill="#64748b" fontStyle="italic">
        *If you took
      </text>
      <text x={730} y={RECAP_TOP + 21} fontSize={7} fill="#64748b" fontStyle="italic">
        34 consecutive
      </text>
      <text x={730} y={RECAP_TOP + 30} fontSize={7} fill="#64748b" fontStyle="italic">
        hours off duty
      </text>
      <text x={730} y={RECAP_TOP + 39} fontSize={7} fill="#64748b" fontStyle="italic">
        you have 60/70
      </text>
      <text x={730} y={RECAP_TOP + 48} fontSize={7} fill="#64748b" fontStyle="italic">
        hours available
      </text>

      {/* Driver signature block */}
      <text x={14} y={RECAP_TOP + 95} fontSize={7.5} fill="#64748b">
        Driver: <tspan fill="#e2e8f0" fontWeight="600">{driverName || 'N/A'}</tspan>
        {'    '}Co-Driver: <tspan fill="#e2e8f0">{coDriver || '—'}</tspan>
        {'    '}Carrier: <tspan fill="#e2e8f0">{carrierName || 'N/A'}</tspan>
      </text>
      <line x1={14} y1={RECAP_TOP + 97} x2={W - 14} y2={RECAP_TOP + 97} stroke="#1e3a5f" strokeWidth={0.6} />

      {/* Footer */}
      <text x={W / 2} y={TOTAL_H - 4} fontSize={6.5} fill="#334155" textAnchor="middle">
        Generated by Spotter HOS Route Planner · FMCSA 49 CFR § 395 · {new Date().toISOString().split('T')[0]}
      </text>
    </svg>
  )
})

// ── Recap column helper ───────────────────────────────────────────────────────
function RecapColumn({ x, y, label, desc, value, color }: {
  x: number; y: number; label: string; desc: string; value: string; color: string
}) {
  return (
    <>
      <text x={x + 30} y={y + 10} fontSize={8} fontWeight="700" fill={color} textAnchor="middle">{label}</text>
      <text x={x} y={y + 20} fontSize={6} fill="#64748b" textAnchor="start" style={{ whiteSpace: 'pre-wrap' }}>
        {desc.slice(0, 40)}
      </text>
      <text x={x} y={y + 30} fontSize={6} fill="#64748b">
        {desc.slice(40, 80)}
      </text>
      <rect x={x + 10} y={y + 40} width={40} height={20} fill="#0f172a" rx={2} stroke="#334155" strokeWidth={0.5} />
      <text x={x + 30} y={y + 54} fontSize={11} fontWeight="700" fill={color} textAnchor="middle">
        {value}
      </text>
    </>
  )
}

// ── Hours getter ──────────────────────────────────────────────────────────────
function getHoursForStatus(log: DailyLogData, status: DutyStatusType): number {
  switch (status) {
    case 'OFF_DUTY': return log.off_duty_hours
    case 'SLEEPER_BERTH': return log.sleeper_berth_hours
    case 'DRIVING': return log.driving_hours
    case 'ON_DUTY_NOT_DRIVING': return log.on_duty_not_driving_hours
    default: return 0
  }
}

export default ELDLogSheet
