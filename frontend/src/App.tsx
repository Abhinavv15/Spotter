/**
 * App.tsx — Nexterra Spotter HOS Route Planner
 * Aerial Highway Forest Nature Background with Frosted Glassmorphic Architecture.
 */
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Truck, Shield, FileText, Loader2, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react'
import { Navbar } from './components/layout/Navbar'
import { HOSRulesModal } from './components/modals/HOSRulesModal'
import TripPlannerForm from './components/trip-form/TripPlannerForm'
import ResultsDashboard from './components/dashboard/ResultsDashboard'
import { planTripSchedule } from './services/api'
import type { TripPlanResponse, TripPlanRequest } from './types/trip'
import { HighwayGame } from './components/game/HighwayGame'
import { SpotterLogo } from './components/ui/SpotterLogo'

// ── Feature chips for the hero ────────────────────────────────────────────────
const FEATURES = [
  { icon: Truck, text: 'FMCSA 49 CFR § 395 Compliant' },
  { icon: Shield, text: '70h/8-Day Cycle Clock Engine' },
  { icon: FileText, text: 'ELD Vector Logs & PDF Export' },
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
      // Smooth scroll to results
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

  const handleQuickDemo = () => {
    const demo: TripPlanRequest = {
      current_location: 'Chicago, IL',
      pickup_location: 'Gary, IN',
      dropoff_location: 'Dallas, TX',
      current_cycle_used: 14,
      driver_name: 'Marcus Vance',
      carrier_name: 'Apex Freight Systems',
      truck_number: 'TRK-9021',
      commodity: 'Automotive Assemblies'
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

      // Populate input form fields
      setActivePreset(sharedRequest)

      // Run calculation automatically
      setTimeout(() => {
        handlePlanTrip(sharedRequest)
      }, 200)
    }
  }, [])

  return (
    <div className="relative min-h-screen text-white antialiased flex flex-col selection:bg-[#8AE922]/30 selection:text-[#8AE922] font-sans">
      {/* ── Fixed Aerial Highway Forest Nature Background ──────────────────── */}
      <div 
        className="fixed inset-0 pointer-events-none nature-bg-layer z-0 opacity-90" 
        aria-hidden="true" 
      />
      {/* Ambient dark gradient overlay to guarantee high contrast */}
      <div 
        className="fixed inset-0 pointer-events-none bg-gradient-to-b from-[#070C09]/60 via-[#070C09]/80 to-[#070C09]/95 z-0" 
        aria-hidden="true" 
      />

      {/* ── Navbar ───────────────────────────────────────────────────────────── */}
      <Navbar
        onOpenHOSModal={() => setHosModalOpen(true)}
        onOpenPresets={handleQuickDemo}
        onResetTrip={handleReset}
        isPlanningMode={!!tripResult}
      />

      {/* ── FMCSA Rules Modal ────────────────────────────────────────────────── */}
      <HOSRulesModal open={hosModalOpen} onOpenChange={setHosModalOpen} />

      <main className="flex-1 relative z-10 w-full">
        {/* ── Hero Section (Full Width with Glass Panel) ────────────────────── */}
        <section id="hero" className="relative overflow-hidden pt-8 pb-14 sm:pt-14 sm:pb-20">
          <div className="w-full px-6 sm:px-10 lg:px-14 xl:px-16">
            <div className="rounded-[2.5rem] glass-panel-deep p-8 sm:p-12 lg:p-16 shadow-glass border border-white/15 relative overflow-hidden">
              {/* Subtle inner green glow */}
              <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#8AE922]/10 rounded-full blur-[140px] pointer-events-none" />

              <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
                {/* Left Column (7 cols) */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  className="lg:col-span-7"
                >
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#8AE922]/40 bg-[#8AE922]/15 text-xs font-bold text-[#8AE922] mb-6 shadow-sm">
                    <Shield size={13} className="text-[#8AE922]" />
                    FMCSA 49 CFR § 395 · Interstate Property Carrier Rules
                  </div>

                  <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight mb-6 font-heading text-white">
                    Autonomous{' '}
                    <span className="text-[#8AE922]">
                      HOS Route Planning
                    </span>
                    {' '}&amp; ELD Generation
                  </h1>

                  <p className="text-base sm:text-xl text-slate-200 leading-relaxed mb-8 max-w-2xl font-normal">
                    Simulate commercial trucking routes under strict FMCSA rules — mandatory 30-min breaks, 
                    10h rest periods, 34h cycle restarts, and fueling stops with instant vector ELD log sheets.
                  </p>

                  <div className="flex flex-wrap gap-3.5 mb-9">
                    {FEATURES.map(({ icon: Icon, text }) => (
                      <div key={text} className="flex items-center gap-2 text-xs sm:text-sm text-slate-200 font-semibold bg-white/10 border border-white/15 px-3.5 py-2 rounded-2xl backdrop-blur-xl">
                        <Icon size={16} className="text-[#8AE922] shrink-0" />
                        {text}
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 flex-wrap">
                    <a
                      href="#planner"
                      className="group inline-flex items-center overflow-hidden rounded-full bg-[#8AE922] p-1.5 pr-7 text-[#070C09] font-black text-sm uppercase tracking-wider shadow-glow-lime hover:bg-[#9EF538] transition-all font-heading"
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#070C09] text-[#8AE922] transition-transform duration-300 group-hover:translate-x-1 mr-3">
                        <ArrowRight size={16} />
                      </span>
                      <span>Launch Trip Planner</span>
                    </a>
                    <button
                      onClick={handleQuickDemo}
                      className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white/10 border border-white/20 hover:border-[#8AE922]/50 hover:bg-white/15 text-white text-sm font-bold transition-all backdrop-blur-xl"
                    >
                      <Sparkles size={16} className="text-[#8AE922]" />
                      Load Demo Route
                    </button>
                  </div>
                </motion.div>

                {/* Right Column (5 cols) Interactive Truck Highway Runner & Telemetry Simulator */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.7, delay: 0.15 }}
                  className="lg:col-span-5 h-[400px] sm:h-[450px] lg:h-[480px] relative rounded-3xl overflow-hidden border border-white/20 bg-[#080D0A]/90 shadow-glass backdrop-blur-2xl"
                >
                  <HighwayGame />
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Planner & Dashboard Section (Full Width) ──────────────────────── */}
        <section id="planner" className="relative py-8 sm:py-12">
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
                  <div className="rounded-3xl border border-white/15 glass-panel p-6 sm:p-8 shadow-glass">
                    <div className="mb-6">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#8AE922] animate-ping" />
                        <h2 className="text-xl font-extrabold text-white font-heading tracking-tight">
                          Trip Dispatch Parameters
                        </h2>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-300 mt-1">
                        Enter origin, shipper pickup, and receiver delivery to compute legally compliant shifts.
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
                  <div className="rounded-3xl border border-white/15 glass-panel h-[480px] sm:h-[620px] flex flex-col items-center justify-center gap-5 text-center p-8 shadow-glass">
                    <div className="w-24 h-24 rounded-3xl bg-[#070C09]/90 border border-[#8AE922]/50 shadow-glow-lime flex items-center justify-center mb-2">
                      <Truck size={42} className="text-[#8AE922] animate-pulse" />
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-heading tracking-tight">
                      Route &amp; ELD Visualizer Ready
                    </h3>
                    <p className="text-sm text-slate-200 max-w-md leading-relaxed">
                      Click <strong className="text-[#8AE922] font-bold">"Generate Compliant Route"</strong> or select a 
                      quick preset to simulate all mandatory stops, 10h resets, and generate printable ELD logs.
                    </p>
                    {loading && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-3 text-[#8AE922] font-bold text-sm mt-2 bg-[#8AE922]/20 border border-[#8AE922]/50 px-6 py-3 rounded-full shadow-glow-lime"
                      >
                        <Loader2 size={18} className="animate-spin" />
                        <span>Optimizing routing &amp; FMCSA schedule…</span>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ) : (
                // ── Results state: Responsive Full-Frame dashboard ───────────
                <motion.div
                  key="results"
                  id="results-section"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="grid lg:grid-cols-[440px_1fr] xl:grid-cols-[480px_1fr] gap-8 items-start"
                >
                  {/* Left: modify trip form panel */}
                  <div className="flex flex-col gap-4">
                    <div className="rounded-3xl border border-white/15 glass-panel p-6 shadow-glass">
                      <div className="mb-5">
                        <h2 className="text-base font-extrabold text-white font-heading uppercase tracking-wide">
                          Re-plan Trip Parameters
                        </h2>
                        <p className="text-xs text-slate-300 mt-0.5">Adjust inputs to regenerate schedule.</p>
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
                  <div className="rounded-3xl border border-white/15 glass-panel p-5 sm:p-8 shadow-glass">
                    <ResultsDashboard trip={tripResult} onReset={handleReset} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* ── Nexterra "Milestones of Impact" Section (Full Width) ──────── */}
        {!tripResult && (
          <section id="milestones" className="py-16 sm:py-24">
            <div className="w-full px-6 sm:px-10 lg:px-14 xl:px-16">
              <div className="rounded-[2.5rem] glass-panel-deep p-8 sm:p-14 border border-white/15 shadow-glass">
                <div className="text-center mb-14">
                  <span className="text-xs uppercase font-extrabold tracking-widest text-[#8AE922] mb-3 block">
                    Our Compliance Journey
                  </span>
                  <h2 className="text-3xl sm:text-5xl font-extrabold text-white font-heading tracking-tight">
                    Milestones of Impact
                  </h2>
                </div>

                {/* Milestones Cards matching Nexterra Dribbble layout */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                  {/* Milestone 1 (Dark Frosted Card) */}
                  <div className="rounded-3xl border border-white/15 bg-white/5 p-8 shadow-glass backdrop-blur-2xl flex flex-col justify-between hover:border-white/25 transition-all">
                    <div>
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Stage 01 · 1970s – 1990s</div>
                      <h3 className="text-2xl font-extrabold text-white font-heading mb-4">
                        11h &amp; 14h Duty Limits
                      </h3>
                      <p className="text-sm text-slate-300 leading-relaxed">
                        Industry standards emerge, establishing rigid 11 cumulative hours driving cap within the 14-hour consecutive on-duty window across interstate corridors.
                      </p>
                    </div>
                    <div className="mt-8 pt-4 border-t border-white/10 flex items-center text-xs text-[#8AE922] font-bold gap-1.5">
                      <CheckCircle2 size={14} /> FMCSA § 395.3(a)(2) Standard
                    </div>
                  </div>

                  {/* Milestone 2 (Highlighted Vibrant Lime Green Card) */}
                  <div className="rounded-3xl bg-[#8AE922] text-[#070C09] p-8 shadow-glow-lime flex flex-col justify-between transform md:-translate-y-2 transition-all">
                    <div>
                      <div className="text-xs font-black uppercase tracking-wider text-[#070C09]/80 mb-2">Stage 02 · 2000s &amp; Beyond</div>
                      <h3 className="text-2xl sm:text-3xl font-black text-[#070C09] font-heading mb-4">
                        Autonomous HOS Scheduling
                      </h3>
                      <p className="text-sm font-semibold text-[#070C09]/95 leading-relaxed">
                        Deterministic multi-stop simulation embedding 30-min mandatory breaks, 1,000-mile fuel stops, 10h sleep periods, and 34h cycle restarts.
                      </p>
                    </div>
                    <div className="mt-8 pt-4 border-t border-[#070C09]/15 flex items-center text-xs font-extrabold text-[#070C09] gap-1.5">
                      <CheckCircle2 size={14} /> Dynamic FMCSA Engine
                    </div>
                  </div>

                  {/* Milestone 3 (Dark Frosted Card) */}
                  <div className="rounded-3xl border border-white/15 bg-white/5 p-8 shadow-glass backdrop-blur-2xl flex flex-col justify-between hover:border-white/25 transition-all">
                    <div>
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Stage 03 · 2010s – Present</div>
                      <h3 className="text-2xl font-extrabold text-white font-heading mb-4">
                        Vector ELD &amp; PDF Export
                      </h3>
                      <p className="text-sm text-slate-300 leading-relaxed">
                        Product distribution network established, generating 24-hour FMCSA daily grid sheets with duty recap, remarks timeline, and vector PDF export ready for DOT roadside audit.
                      </p>
                    </div>
                    <div className="mt-8 pt-4 border-t border-white/10 flex items-center text-xs text-[#8AE922] font-bold gap-1.5">
                      <CheckCircle2 size={14} /> Audit-Ready 49 CFR § 395.8
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* ── Footer (Full Width Glass) ────────────────────────────────────────── */}
      <footer className="border-t border-white/10 py-10 bg-[#070C09]/90 backdrop-blur-xl text-xs text-slate-400">
        <div className="w-full px-6 sm:px-10 lg:px-14 xl:px-16 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <SpotterLogo size={32} showText={true} />
            <span className="text-slate-500 font-mono text-[11px]">| Commercial HOS Route Intelligence</span>
          </div>
          <p className="text-center sm:text-left text-xs">
            Built per FMCSA 49 CFR § 395 (April 2022 Guidelines) · Django 5.1 &amp; React 19
          </p>
          <div className="flex items-center gap-5 text-xs font-medium">
            <button onClick={() => setHosModalOpen(true)} className="hover:text-[#8AE922] transition-colors">
              FMCSA Rules
            </button>
            <a
              href="https://www.fmcsa.dot.gov/regulations/hours-service/hours-service-drivers"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#8AE922] transition-colors"
            >
              DOT Regulations
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
