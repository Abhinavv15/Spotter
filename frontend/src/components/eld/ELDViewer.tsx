/**
 * ELDViewer.tsx
 * Multi-page ELD log viewer with PDF export controls and responsive zoom/fit controls.
 * Nexterra signature lime styling.
 */
import { useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Download, Printer, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react'
import ELDLogSheet from './ELDLogSheet'
import { exportSingleLogPDF, exportFullTripPDF } from '../../lib/pdfExport'
import type { TripPlanResponse } from '../../types/trip'

interface ELDViewerProps {
  trip: TripPlanResponse
}

export default function ELDViewer({ trip }: ELDViewerProps) {
  const [currentDay, setCurrentDay] = useState(0)
  const [exporting, setExporting] = useState<null | 'single' | 'full'>(null)
  const [zoomLevel, setZoomLevel] = useState(100)
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
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2.5">
          <span className="text-xs sm:text-sm font-extrabold text-white uppercase tracking-wider font-heading">
            FMCSA Daily Logs
          </span>
          <span className="text-xs bg-[#8AE922]/20 text-[#8AE922] font-mono px-3 py-0.5 rounded-full border border-[#8AE922]/40 font-bold">
            {totalDays} Day{totalDays !== 1 ? 's' : ''} Generated
          </span>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Zoom controls for mobile/tablet */}
          <div className="hidden sm:flex items-center bg-[#080D0A] border border-white/10 rounded-xl p-1 text-xs text-slate-400">
            <button
              onClick={() => setZoomLevel(z => Math.max(60, z - 15))}
              className="p-1 hover:text-white transition-colors"
              title="Zoom out"
            >
              <ZoomOut size={14} />
            </button>
            <span className="px-2 font-mono text-[11px] font-bold text-slate-300">{zoomLevel}%</span>
            <button
              onClick={() => setZoomLevel(z => Math.min(150, z + 15))}
              className="p-1 hover:text-white transition-colors"
              title="Zoom in"
            >
              <ZoomIn size={14} />
            </button>
            <button
              onClick={() => setZoomLevel(100)}
              className="p-1 hover:text-[#8AE922] border-l border-white/10 ml-1 transition-colors"
              title="Reset zoom"
            >
              <Maximize2 size={14} />
            </button>
          </div>

          <button
            id="eld-export-single"
            onClick={handleExportSingle}
            disabled={!!exporting}
            className="flex items-center gap-2 text-xs bg-spotter-panel hover:bg-spotter-panelLight text-slate-200 hover:text-white px-4 py-2 rounded-xl border border-white/10 transition-all disabled:opacity-50 font-bold"
          >
            <Printer size={14} className="text-[#8AE922]" />
            {exporting === 'single' ? 'Exporting…' : 'Print Day'}
          </button>
          <button
            id="eld-export-full"
            onClick={handleExportFull}
            disabled={!!exporting}
            className="flex items-center gap-2 text-xs bg-[#8AE922] hover:bg-[#9EF538] text-[#080D0A] px-4 py-2 rounded-xl border border-[#8AE922] transition-all disabled:opacity-50 font-black shadow-glow-lime"
          >
            <Download size={14} />
            {exporting === 'full' ? 'Building PDF…' : 'Full Trip PDF'}
          </button>
        </div>
      </div>

      {/* ── Day tab strip ─────────────────────────────────────────────────── */}
      <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
        {trip.daily_logs.map((l, i) => (
          <button
            key={i}
            id={`eld-day-tab-${i + 1}`}
            onClick={() => setCurrentDay(i)}
            className={`text-xs px-3.5 py-2 rounded-xl border transition-all font-mono whitespace-nowrap ${
              i === currentDay
                ? 'bg-[#8AE922] border-[#8AE922] text-[#080D0A] font-black shadow-glow-lime'
                : 'bg-[#080D0A] border-white/10 text-slate-400 hover:border-[#8AE922]/40 hover:text-slate-200'
            }`}
          >
            Day {l.day_number}
            <span className={`ml-2 text-[10px] ${i === currentDay ? 'text-[#080D0A]/80 font-bold' : 'text-slate-500'}`}>{l.log_date}</span>
          </button>
        ))}
      </div>

      {/* ── Log renderer container with horizontal scroll support on mobile ── */}
      <div className="w-full overflow-x-auto custom-scrollbar border border-white/10 rounded-2xl bg-[#080D0A] p-3 sm:p-6 shadow-inner">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentDay}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            style={{ minWidth: '760px', width: `${zoomLevel}%`, margin: '0 auto' }}
            className="transition-all duration-150"
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
              className="w-full rounded-2xl shadow-glass"
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
      </div>

      {/* ── Navigation ────────────────────────────────────────────────────── */}
      {totalDays > 1 && (
        <div className="flex items-center justify-center gap-4 mt-1 font-mono">
          <button
            id="eld-prev-day"
            onClick={() => setCurrentDay(d => Math.max(0, d - 1))}
            disabled={currentDay === 0}
            className="p-2.5 rounded-xl bg-spotter-panel border border-white/10 text-slate-400 hover:text-white hover:border-[#8AE922]/50 disabled:opacity-30 transition-all"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-xs text-slate-400 font-semibold">
            Day <span className="font-bold text-[#8AE922]">{currentDay + 1}</span> of {totalDays}
          </span>
          <button
            id="eld-next-day"
            onClick={() => setCurrentDay(d => Math.min(totalDays - 1, d + 1))}
            disabled={currentDay === totalDays - 1}
            className="p-2.5 rounded-xl bg-spotter-panel border border-white/10 text-slate-400 hover:text-white hover:border-[#8AE922]/50 disabled:opacity-30 transition-all"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* ── Hours summary strip ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-1 font-mono">
        {[
          { label: 'Off Duty (10h/34h)', value: log.off_duty_hours, color: 'text-[#8AE922]', bg: 'bg-[#8AE922]/10 border-[#8AE922]/30' },
          { label: 'Sleeper Berth', value: log.sleeper_berth_hours, color: 'text-emerald-400', bg: 'bg-emerald-950/30 border-emerald-500/30' },
          { label: 'Driving (CMV)', value: log.driving_hours, color: 'text-[#8AE922]', bg: 'bg-[#8AE922]/15 border-[#8AE922]/40' },
          { label: 'On Duty (Not Driving)', value: log.on_duty_not_driving_hours, color: 'text-amber-400', bg: 'bg-amber-950/20 border-amber-500/30' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`rounded-2xl border p-3.5 ${bg} backdrop-blur-sm`}>
            <div className={`text-lg sm:text-2xl font-black ${color}`}>{value.toFixed(1)}h</div>
            <div className="text-[11px] text-slate-400 mt-1 font-medium">{label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
