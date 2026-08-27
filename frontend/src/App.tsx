/**
 * App.tsx — Spotter Commercial HOS Route Planning & ELD Log Platform
 * Built for property motor carriers, fleet dispatchers, and commercial CMV drivers.
 * Full compliance with FMCSA 49 CFR Part 395 regulations.
 */
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Truck, Shield, FileText, Loader2, Sparkles, ArrowRight, Clock, Fuel, RefreshCw, Scale } from 'lucide-react'
import { Navbar } from './components/layout/Navbar'
import { HOSRulesModal } from './components/modals/HOSRulesModal'
import TripPlannerForm from './components/trip-form/TripPlannerForm'
import ResultsDashboard from './components/dashboard/ResultsDashboard'
import { planTripSchedule } from './services/api'
import type { TripPlanResponse, TripPlanRequest } from './types/trip'
import { LiveDispatchHeroWidget } from './components/hero/LiveDispatchHeroWidget'
import { SpotterLogo } from './components/ui/SpotterLogo'

// ── Feature badges for hero ───────────────────────────────────────────────────
const COMPLIANCE_PILLARS = [
  { icon: Clock, text: '11h Driving Limit · 14h Duty Window' },
  { icon: Shield, text: 'Mandatory 30m Rest & Fuel Scheduler' },
  { icon: RefreshCw, text: '70h/8-Day Cycle & 34h Restarts' },
  { icon: FileText, text: 'Audit-Ready 49 CFR § 395.8 ELD Logs' },
]

export default function App() {
  const [tripResult, setTripResult] = useState<TripPlanResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hosModalOpen, setHosModalOpen] = useState(false)
  const [activePreset, setActivePreset] = useState<Partial<TripPlanRequest> | undefined>(undefined)

  // Sync browser URL with planned trip parameters for easy browser bar sharing
  const syncUrlParams = (data: TripPlanRequest) => {
    try {
      const params = new URLSearchParams()
      if (data.current_location) params.set('origin', data.current_location)
      if (data.pickup_location) params.set('pickup', data.pickup_location)
      if (data.dropoff_location) params.set('dropoff', data.dropoff_location)
      if (data.current_cycle_used !== undefined) params.set('cycle', String(data.current_cycle_used))
      if (data.driver_name) params.set('driver', data.driver_name)
      if (data.carrier_name) params.set('carrier', data.carrier_name)
      if (data.truck_number) params.set('truck', data.truck_number)
      if (data.shipping_doc_number) params.set('doc', data.shipping_doc_number)
      if (data.commodity) params.set('commodity', data.commodity)

      const newUrl = `${window.location.pathname}?${params.toString()}#planner`
      window.history.replaceState({ path: newUrl }, '', newUrl)
    } catch {}
  }

  const handlePlanTrip = async (data: TripPlanRequest) => {
    setLoading(true)
    setError(null)
    try {
      syncUrlParams(data)
      const result = await planTripSchedule(data)
      setTripResult(result)
      setTimeout(() => {
        document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' })
      }, 120)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setTripResult(null)
    setError(null)
    try {
      window.history.replaceState({}, '', window.location.pathname)
    } catch {}
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleQuickDemo = (customPreset?: Partial<TripPlanRequest>) => {
    const demo: TripPlanRequest = {
      current_location: customPreset?.current_location || 'Chicago, IL',
      pickup_location: customPreset?.pickup_location || 'Gary, IN',
      dropoff_location: customPreset?.dropoff_location || 'Dallas, TX',
      current_cycle_used: customPreset?.current_cycle_used ?? 14,
      driver_name: customPreset?.driver_name || 'Marcus Vance',
      carrier_name: customPreset?.carrier_name || 'Apex Freight Systems',
      truck_number: customPreset?.truck_number || 'TRK-9021',
      commodity: customPreset?.commodity || 'Automotive Assemblies'
    }
    setActivePreset(demo)
    document.getElementById('planner')?.scrollIntoView({ behavior: 'smooth' })
  }

  // Robust on-mount shared plan loader from URL parameters
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const origin = params.get('origin')
    const pickup = params.get('pickup')
    const dropoff = params.get('dropoff')

    if (origin && pickup && dropoff) {
      const cycle = parseFloat(params.get('cycle') || '0') || 0
      const driver = params.get('driver') || ''
      const carrier = params.get('carrier') || ''
      const truck = params.get('truck') || ''
      const doc = params.get('doc') || ''
      const commodity = params.get('commodity') || ''

      const sharedRequest: TripPlanRequest = {
        current_location: origin,
        pickup_location: pickup,
        dropoff_location: dropoff,
        current_cycle_used: cycle,
        driver_name: driver,
        carrier_name: carrier,
        truck_number: truck,
        shipping_doc_number: doc,
        commodity: commodity
      }

      setActivePreset(sharedRequest)
      setTimeout(() => {
        handlePlanTrip(sharedRequest)
      }, 200)
    }
  }, [])

  return (
    <div className="relative min-h-screen text-white antialiased flex flex-col selection:bg-[#8AE922]/30 selection:text-[#8AE922] font-sans">
      
      {/* ── High-Definition Aerial Highway Forest Backdrop ──────────────────── */}
      <div 
        className="fixed inset-0 pointer-events-none nature-bg-layer z-0 opacity-80" 
        aria-hidden="true" 
      />
      <div 
        className="fixed inset-0 pointer-events-none bg-gradient-to-b from-[#070C09]/75 via-[#070C09]/88 to-[#070C09]/98 z-0" 
        aria-hidden="true" 
      />

      {/* ── Navbar ───────────────────────────────────────────────────────────── */}
      <Navbar
        onOpenHOSModal={() => setHosModalOpen(true)}
        onOpenPresets={() => handleQuickDemo()}
        onResetTrip={handleReset}
        isPlanningMode={!!tripResult}
      />

      {/* ── FMCSA Rules Modal ────────────────────────────────────────────────── */}
      <HOSRulesModal open={hosModalOpen} onOpenChange={setHosModalOpen} />

      <main className="flex-1 relative z-10 w-full">
        
        {/* ── Hero Section (Full Width with Glass Panel) ────────────────────── */}
        <section id="hero" className="relative overflow-hidden pt-8 pb-12 sm:pt-12 sm:pb-16">
          <div className="w-full px-6 sm:px-10 lg:px-14 xl:px-16">
            <div className="rounded-[2rem] glass-panel-deep p-7 sm:p-10 lg:p-14 border border-white/[0.08] shadow-2xl relative overflow-hidden">
              
              {/* Subtle ambient lighting */}
              <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-[#8AE922]/10 rounded-full blur-[140px] pointer-events-none" />

              <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
                {/* Left Column (7 cols) */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  className="lg:col-span-7"
                >
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#8AE922]/30 bg-[#8AE922]/10 text-xs font-semibold text-[#8AE922] mb-5">
                    <Scale size={13} className="text-[#8AE922]" />
                    FMCSA 49 CFR Part 395 · Interstate Property Carrier Rules
                  </div>

                  <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.08] tracking-tight mb-5 font-heading text-white">
                    Commercial <span className="text-[#8AE922]">HOS Route Dispatch</span> &amp; ELD Generator
                  </h1>

                  <p className="text-sm sm:text-lg text-neutral-300 leading-relaxed mb-7 max-w-2xl font-normal">
                    Automate compliant commercial truck routing under strict Federal Motor Carrier Safety regulations. 
                    Calculates exact 11h driving caps, 14h duty windows, 30-min mandatory breaks, 1,000-mile fueling intervals, 
                    and renders audit-ready 24-hour daily log sheets.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-8">
                    {COMPLIANCE_PILLARS.map(({ icon: Icon, text }) => (
                      <div key={text} className="flex items-center gap-2.5 text-xs text-neutral-300 font-medium bg-white/[0.04] border border-white/[0.06] px-3 py-2 rounded-xl backdrop-blur-md">
                        <Icon size={14} className="text-[#8AE922] shrink-0" />
                        <span>{text}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-3.5 flex-wrap">
                    <a
                      href="#planner"
                      className="group inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#8AE922] text-[#070C09] font-extrabold text-xs uppercase tracking-wider hover:bg-[#9EF538] transition-all font-heading shadow-md active:scale-95"
                    >
                      <span>Launch Trip Planner</span>
                      <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                    </a>
                    <button
                      type="button"
                      onClick={() => handleQuickDemo()}
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/[0.06] border border-white/[0.1] hover:border-[#8AE922]/40 hover:bg-white/[0.1] text-white text-xs font-bold transition-all backdrop-blur-md"
                    >
                      <Sparkles size={14} className="text-[#8AE922]" />
                      <span>Load Chicago ➔ Dallas Route</span>
                    </button>
                  </div>
                </motion.div>

                {/* Right Column (5 cols) Live Dispatch Telemetry Terminal */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="lg:col-span-5 h-[380px] sm:h-[420px] lg:h-[440px] relative"
                >
                  <LiveDispatchHeroWidget onLoadPreset={(preset) => handleQuickDemo(preset)} />
                </motion.div>
              </div>

            </div>
          </div>
        </section>

        {/* ── Planner & Dashboard Section (Full Width) ──────────────────────── */}
        <section id="planner" className="relative py-6 sm:py-10">
          <div className="w-full px-6 sm:px-10 lg:px-14 xl:px-16">
            <AnimatePresence mode="wait">
              {!tripResult ? (
                // ── Planning state: Form + Live Placeholder ───────────────────
                <motion.div
                  key="planning"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid lg:grid-cols-[480px_1fr] xl:grid-cols-[520px_1fr] gap-8 items-start"
                >
                  {/* Planner form panel */}
                  <div className="rounded-3xl border border-white/[0.08] glass-panel p-6 sm:p-8 shadow-xl">
                    <div className="mb-6">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#8AE922]" />
                        <h2 className="text-xl font-extrabold text-white font-heading tracking-tight">
                          Trip Dispatch Parameters
                        </h2>
                      </div>
                      <p className="text-xs text-neutral-400 mt-1">
                        Specify origin, pickup, delivery, and current cycle hours to compute legally scheduled shifts.
                      </p>
                    </div>
                    <TripPlannerForm
                      onSubmit={handlePlanTrip}
                      loading={loading}
                      error={error}
                      initialValues={activePreset}
                    />
                  </div>

                  {/* Placeholder for map */}
                  <div className="rounded-3xl border border-white/[0.08] glass-panel h-[480px] sm:h-[620px] flex flex-col items-center justify-center gap-4 text-center p-8 shadow-xl">
                    <div className="w-20 h-20 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-1">
                      <Truck size={36} className="text-[#8AE922]" />
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-heading tracking-tight">
                      Route &amp; ELD Visualizer
                    </h3>
                    <p className="text-xs sm:text-sm text-neutral-300 max-w-md leading-relaxed">
                      Enter dispatch waypoints or choose a preset to simulate mandatory 30-min breaks, 
                      10h sleeper resets, 34h restarts, and generate printable 24-hour ELD logs.
                    </p>
                    {loading && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-2.5 text-[#8AE922] font-semibold text-xs mt-2 bg-[#8AE922]/10 border border-[#8AE922]/30 px-5 py-2.5 rounded-full"
                      >
                        <Loader2 size={16} className="animate-spin" />
                        <span>Calculating legal routing &amp; FMCSA schedule…</span>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ) : (
                // ── Results state: Responsive Full-Frame dashboard ───────────
                <motion.div
                  key="results"
                  id="results-section"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="grid lg:grid-cols-[440px_1fr] xl:grid-cols-[480px_1fr] gap-8 items-start"
                >
                  {/* Left: modify trip form panel */}
                  <div className="flex flex-col gap-4">
                    <div className="rounded-3xl border border-white/[0.08] glass-panel p-6 shadow-xl">
                      <div className="mb-4">
                        <h2 className="text-sm font-extrabold text-white font-heading uppercase tracking-wider">
                          Adjust Dispatch Inputs
                        </h2>
                        <p className="text-xs text-neutral-400 mt-0.5">Modify parameters to re-calculate schedule.</p>
                      </div>
                      <TripPlannerForm
                        onSubmit={handlePlanTrip}
                        loading={loading}
                        error={error}
                        initialValues={activePreset}
                      />
                    </div>
                  </div>

                  {/* Right: results dashboard */}
                  <div className="rounded-3xl border border-white/[0.08] glass-panel p-5 sm:p-7 shadow-xl">
                    <ResultsDashboard trip={tripResult} onReset={handleReset} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* ── Enterprise FMCSA Compliance Architecture (Clean 4-Card Grid) ───── */}
        {!tripResult && (
          <section id="compliance-architecture" className="py-14 sm:py-20">
            <div className="w-full px-6 sm:px-10 lg:px-14 xl:px-16">
              <div className="rounded-[2rem] glass-panel-deep p-8 sm:p-12 border border-white/[0.08] shadow-2xl">
                
                <div className="max-w-2xl mb-10">
                  <span className="text-[11px] uppercase font-bold tracking-widest text-[#8AE922] mb-2 block font-mono">
                    Regulatory Architecture
                  </span>
                  <h2 className="text-2xl sm:text-4xl font-extrabold text-white font-heading tracking-tight">
                    FMCSA 49 CFR Part 395 Core Rules Engine
                  </h2>
                  <p className="text-xs sm:text-sm text-neutral-400 mt-2">
                    Deterministic scheduling logic built strictly according to official Federal Motor Carrier Safety Administration standards.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  
                  {/* Card 1 */}
                  <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.15] transition-colors flex flex-col justify-between">
                    <div>
                      <div className="p-2.5 rounded-xl bg-[#8AE922]/10 text-[#8AE922] w-fit mb-4">
                        <Clock size={20} />
                      </div>
                      <h3 className="text-base font-bold text-white font-heading mb-2">
                        11h Driving &amp; 14h Window
                      </h3>
                      <p className="text-xs text-neutral-400 leading-relaxed">
                        Enforces maximum 11 cumulative hours driving within a 14 consecutive hour on-duty window following 10 consecutive hours off-duty (§ 395.3(a)).
                      </p>
                    </div>
                    <div className="mt-5 pt-3 border-t border-white/[0.06] text-[11px] text-[#8AE922] font-mono font-semibold">
                      § 395.3(a)(3) Compliant
                    </div>
                  </div>

                  {/* Card 2 */}
                  <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.15] transition-colors flex flex-col justify-between">
                    <div>
                      <div className="p-2.5 rounded-xl bg-amber-400/10 text-amber-400 w-fit mb-4">
                        <Fuel size={20} />
                      </div>
                      <h3 className="text-base font-bold text-white font-heading mb-2">
                        30-Min Rest &amp; ≤1,000mi Fuel
                      </h3>
                      <p className="text-xs text-neutral-400 leading-relaxed">
                        Mandates 30 consecutive minutes of non-driving time before 8 cumulative hours of driving are exceeded. Intelligently clusters fuel stops.
                      </p>
                    </div>
                    <div className="mt-5 pt-3 border-t border-white/[0.06] text-[11px] text-amber-400 font-mono font-semibold">
                      § 395.3(a)(3)(ii) Provision
                    </div>
                  </div>

                  {/* Card 3 */}
                  <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.15] transition-colors flex flex-col justify-between">
                    <div>
                      <div className="p-2.5 rounded-xl bg-cyan-400/10 text-cyan-400 w-fit mb-4">
                        <RefreshCw size={20} />
                      </div>
                      <h3 className="text-base font-bold text-white font-heading mb-2">
                        70h/8-Day &amp; 34h Restart
                      </h3>
                      <p className="text-xs text-neutral-400 leading-relaxed">
                        Monitors rolling 8-day cumulative duty hours against the 70.0h ceiling. Schedules legal 34 consecutive hour off-duty resets when needed.
                      </p>
                    </div>
                    <div className="mt-5 pt-3 border-t border-white/[0.06] text-[11px] text-cyan-400 font-mono font-semibold">
                      § 395.3(b) &amp; § 395.3(c) Clock
                    </div>
                  </div>

                  {/* Card 4 */}
                  <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.15] transition-colors flex flex-col justify-between">
                    <div>
                      <div className="p-2.5 rounded-xl bg-emerald-400/10 text-emerald-400 w-fit mb-4">
                        <FileText size={20} />
                      </div>
                      <h3 className="text-base font-bold text-white font-heading mb-2">
                        Audit-Ready Vector ELD
                      </h3>
                      <p className="text-xs text-neutral-400 leading-relaxed">
                        Generates standardized 24-hour 4-line grid sheets (Off Duty, Sleeper, Driving, On Duty) with remarks and vector PDF roadside export.
                      </p>
                    </div>
                    <div className="mt-5 pt-3 border-t border-white/[0.06] text-[11px] text-emerald-400 font-mono font-semibold">
                      49 CFR § 395.8 Standard
                    </div>
                  </div>

                </div>

              </div>
            </div>
          </section>
        )}

      </main>

      {/* ── Enterprise Footer ────────────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.08] py-8 bg-[#070C09]/95 backdrop-blur-xl text-xs text-neutral-400">
        <div className="w-full px-6 sm:px-10 lg:px-14 xl:px-16 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <SpotterLogo size={30} showText={true} />
            <span className="text-neutral-400 font-mono text-[11px]">| Commercial HOS Route Intelligence</span>
          </div>
          <p className="text-center sm:text-left text-xs text-neutral-400">
            FMCSA 49 CFR Part 395 Engine · Django 5.1 &amp; React 19
          </p>
          <div className="flex items-center gap-5 text-xs font-medium">
            <button onClick={() => setHosModalOpen(true)} className="hover:text-[#8AE922] transition-colors">
              HOS Regulations Guide
            </button>
            <a
              href="https://www.fmcsa.dot.gov/regulations/hours-service/hours-service-drivers"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#8AE922] transition-colors"
            >
              DOT FMCSA Portal
            </a>
          </div>
        </div>
      </footer>

    </div>
  )
}
