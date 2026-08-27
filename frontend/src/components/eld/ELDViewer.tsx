/**
 * ELDViewer.tsx
 * Multi-page ELD log viewer with PDF export controls.
 */
import { useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Download, Printer } from 'lucide-react'
import ELDLogSheet from './ELDLogSheet'
import { exportSingleLogPDF, exportFullTripPDF } from '../../lib/pdfExport'
import type { TripPlanResponse } from '../../types/trip'

interface ELDViewerProps {
  trip: TripPlanResponse
}

export default function ELDViewer({ trip }: ELDViewerProps) {
  const [currentDay, setCurrentDay] = useState(0)
  const [exporting, setExporting] = useState<null | 'single' | 'full'>(null)
  const svgRefs = useRef<(SVGSVGElement | null)[]>([])
  const totalDays = trip.daily_logs.length

  const handleExportSingle = useCallback(async () => {
    const svgEl = svgRefs.current[currentDay]
    if (!svgEl) return
    setExporting('single')
    try {
      await exportSingleLogPDF(svgEl, `eld-day-${currentDay + 1}.pdf`)
    } finally {
      setExporting(null)
    }
  }, [currentDay])

  const handleExportFull = useCallback(async () => {
    const refs = svgRefs.current.filter(Boolean) as SVGSVGElement[]
    if (refs.length === 0) return
    setExporting('full')
    try {
      await exportFullTripPDF(refs, trip)
    } finally {
      setExporting(null)
    }
  }, [trip])

  const log = trip.daily_logs[currentDay]
  if (!log) return null

  return (
    <div className="flex flex-col gap-4">
      {/* ── Toolbar ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
            Daily Logs
          </span>
          <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full border border-slate-700">
            {totalDays} day{totalDays !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="eld-export-single"
            onClick={handleExportSingle}
            disabled={!!exporting}
            className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg border border-slate-700 transition-all disabled:opacity-50"
          >
            <Printer size={13} />
            {exporting === 'single' ? 'Exporting…' : 'Export Day'}
          </button>
          <button
            id="eld-export-full"
            onClick={handleExportFull}
            disabled={!!exporting}
            className="flex items-center gap-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg border border-blue-500 transition-all disabled:opacity-50 font-semibold"
          >
            <Download size={13} />
            {exporting === 'full' ? 'Building PDF…' : 'Full Report PDF'}
          </button>
        </div>
      </div>

      {/* ── Day tab strip ─────────────────────────────────────────────────── */}
      <div className="flex gap-1 flex-wrap">
        {trip.daily_logs.map((l, i) => (
          <button
            key={i}
            id={`eld-day-tab-${i + 1}`}
            onClick={() => setCurrentDay(i)}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-all font-medium ${
              i === currentDay
                ? 'bg-blue-600 border-blue-500 text-white'
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200'
            }`}
          >
            Day {l.day_number}
            <span className="ml-1.5 opacity-70 text-[10px]">{l.log_date}</span>
          </button>
        ))}
      </div>

      {/* ── Log renderer ──────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentDay}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
          className="relative"
        >
          <ELDLogSheet
            ref={(el) => { svgRefs.current[currentDay] = el }}
            log={log}
            driverName={trip.driver_name}
            carrierName={trip.carrier_name}
            carrierAddress={trip.carrier_address}
            homeTerminal={trip.home_terminal_address}
            truckNumber={trip.truck_number}
            trailerNumber={trip.trailer_number}
            shippingDoc={trip.shipping_doc_number}
            commodity={trip.commodity}
            coDriver={trip.co_driver_name}
            totalMileageTrip={trip.total_distance_miles}
            className="w-full rounded-xl shadow-2xl"
          />

          {/* Prerender remaining SVGs off-screen for PDF export */}
          <div className="sr-only" aria-hidden="true">
            {trip.daily_logs.map((l, i) => {
              if (i === currentDay) return null
              return (
                <ELDLogSheet
                  key={i}
                  ref={(el) => { svgRefs.current[i] = el }}
                  log={l}
                  driverName={trip.driver_name}
                  carrierName={trip.carrier_name}
                  carrierAddress={trip.carrier_address}
                  homeTerminal={trip.home_terminal_address}
                  truckNumber={trip.truck_number}
                  trailerNumber={trip.trailer_number}
                  shippingDoc={trip.shipping_doc_number}
                  commodity={trip.commodity}
                  coDriver={trip.co_driver_name}
                  totalMileageTrip={trip.total_distance_miles}
                />
              )
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* ── Navigation ────────────────────────────────────────────────────── */}
      {totalDays > 1 && (
        <div className="flex items-center justify-center gap-4 mt-1">
          <button
            id="eld-prev-day"
            onClick={() => setCurrentDay(d => Math.max(0, d - 1))}
            disabled={currentDay === 0}
            className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 disabled:opacity-30 transition-all"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm text-slate-400">
            Day <span className="font-bold text-white">{currentDay + 1}</span> of {totalDays}
          </span>
          <button
            id="eld-next-day"
            onClick={() => setCurrentDay(d => Math.min(totalDays - 1, d + 1))}
            disabled={currentDay === totalDays - 1}
            className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 disabled:opacity-30 transition-all"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* ── Hours summary strip ───────────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-3 mt-2">
        {[
          { label: 'Off Duty', value: log.off_duty_hours, color: 'text-green-400', bg: 'bg-green-400/10 border-green-400/20' },
          { label: 'Sleeper Berth', value: log.sleeper_berth_hours, color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/20' },
          { label: 'Driving', value: log.driving_hours, color: 'text-orange-400', bg: 'bg-orange-400/10 border-orange-400/20' },
          { label: 'On Duty ND', value: log.on_duty_not_driving_hours, color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/20' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`rounded-lg border p-3 ${bg}`}>
            <div className={`text-xl font-bold ${color}`}>{value.toFixed(1)}h</div>
            <div className="text-xs text-slate-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
