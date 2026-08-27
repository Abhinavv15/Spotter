/**
 * App.tsx — Spotter HOS Route Planner
 * Complete application shell with landing hero, trip planner, and results.
 */
import { useState, Suspense, lazy } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Truck, Shield, FileText, ChevronDown, Loader2 } from 'lucide-react'
import TripPlannerForm from './components/trip-form/TripPlannerForm'
import ResultsDashboard from './components/dashboard/ResultsDashboard'
import { planTripSchedule } from './services/api'
import type { TripPlanResponse, TripPlanRequest } from './types/trip'

// Lazy-load heavy 3D scene
const HeroScene = lazy(() => import('./components/three/HeroScene'))

// ── Feature chips for the hero ────────────────────────────────────────────────
const FEATURES = [
  { icon: Truck, text: 'FMCSA 49 CFR § 395 Compliant' },
  { icon: Shield, text: '70h/8-day Cycle Enforcement' },
  { icon: FileText, text: 'ELD Log Generation & PDF Export' },
]

export default function App() {
  const [tripResult, setTripResult] = useState<TripPlanResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePlanTrip = async (data: TripPlanRequest) => {
    setLoading(true)
    setError(null)
    try {
      const result = await planTripSchedule(data)
      setTripResult(result)
      // Smooth scroll to results
      setTimeout(() => {
        document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setTripResult(null)
    setError(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-[#060c17] text-white">
      {/* ── Background gradient ──────────────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-blue-900/20 blur-[120px]" />
        <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-indigo-900/15 blur-[100px]" />
        <div className="absolute top-1/2 left-0 w-[300px] h-[300px] rounded-full bg-cyan-900/10 blur-[80px]" />
      </div>

      {/* ── Navbar ───────────────────────────────────────────────────────────── */}
      <nav className="relative z-50 border-b border-slate-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Truck size={16} className="text-white" />
            </div>
            <div>
              <span className="text-lg font-bold text-white tracking-tight">Spotter</span>
              <span className="ml-2 text-xs text-slate-500 font-medium">HOS Route Planner</span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-400">
            <a href="#planner" className="hover:text-white transition-colors">Planner</a>
            <a
              href="https://www.fmcsa.dot.gov/regulations/hours-service/hours-service-drivers"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              FMCSA Rules
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg border border-slate-700 hover:border-slate-500 transition-colors text-xs"
            >
              GitHub
            </a>
          </div>
        </div>
      </nav>

      <main>
        {/* ── Hero Section ─────────────────────────────────────────────────── */}
        <section id="hero" className="relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 pt-16 pb-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left: copy */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7 }}
              >
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-800/60 bg-blue-950/40 text-xs text-blue-300 mb-6">
                  <Shield size={11} />
                  FMCSA 49 CFR § 395 · April 2022 · Interstate Truck Driver Rules
                </div>

                <h1 className="text-5xl sm:text-6xl font-black leading-[1.05] tracking-tight mb-5">
                  HOS-Compliant{' '}
                  <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                    Route Planning
                  </span>
                  {' '}for Professional Drivers
                </h1>

                <p className="text-lg text-slate-400 leading-relaxed mb-8 max-w-lg">
                  Enter your trip locations and cycle hours. Spotter simulates the full schedule
                  — mandatory breaks, 34h restarts, fuel stops — and generates FMCSA-compliant
                  ELD logs with PDF export.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 mb-8">
                  {FEATURES.map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-center gap-2 text-sm text-slate-400">
                      <Icon size={14} className="text-blue-400 flex-shrink-0" />
                      {text}
                    </div>
                  ))}
                </div>

                <a
                  href="#planner"
                  className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
                >
                  <ChevronDown size={16} className="animate-bounce" />
                  Plan your first trip
                </a>
              </motion.div>

              {/* Right: 3D globe */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="h-[420px] lg:h-[500px] relative"
              >
                <Suspense fallback={
                  <div className="w-full h-full flex items-center justify-center">
                    <Loader2 size={32} className="animate-spin text-blue-500/30" />
                  </div>
                }>
                  <HeroScene />
                </Suspense>
                {/* Glow */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-blue-500/10 blur-[80px]" />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── Planner Section ───────────────────────────────────────────────── */}
        <section id="planner" className="relative py-8">
          <div className="max-w-7xl mx-auto px-6">
            <AnimatePresence mode="wait">
              {!tripResult ? (
                // ── Planning state: form + empty map ──────────────────────────
                <motion.div
                  key="planning"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid lg:grid-cols-[400px_1fr] gap-8 items-start"
                >
                  {/* Planner form panel */}
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur p-6">
                    <div className="mb-5">
                      <h2 className="text-lg font-bold text-white">Plan Your Trip</h2>
                      <p className="text-xs text-slate-500 mt-1">
                        Enter locations and current cycle hours to generate your HOS schedule.
                      </p>
                    </div>
                    <TripPlannerForm
                      onSubmit={handlePlanTrip}
                      loading={loading}
                      error={error}
                    />
                  </div>

                  {/* Placeholder for map */}
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/40 h-[500px] flex flex-col items-center justify-center gap-4 text-center p-8">
                    <div className="w-16 h-16 rounded-2xl bg-slate-800/60 border border-slate-700 flex items-center justify-center mb-2">
                      <Truck size={28} className="text-slate-600" />
                    </div>
                    <h3 className="text-base font-semibold text-slate-400">
                      Route Map
                    </h3>
                    <p className="text-sm text-slate-600 max-w-xs">
                      Enter your locations and click "Plan HOS Route" to see the optimized 
                      route with all stops mapped here.
                    </p>
                    {loading && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-2 text-blue-400"
                      >
                        <Loader2 size={16} className="animate-spin" />
                        <span className="text-sm">Computing HOS schedule…</span>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ) : (
                // ── Results state: full-width dashboard ──────────────────────
                <motion.div
                  key="results"
                  id="results-section"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="grid lg:grid-cols-[400px_1fr] gap-8 items-start"
                >
                  {/* Left: form (collapsed) + HOS summary */}
                  <div className="flex flex-col gap-4">
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
                      <div className="mb-4">
                        <h2 className="text-base font-bold text-white">Plan Another Trip</h2>
                        <p className="text-xs text-slate-500 mt-0.5">Current results will be replaced.</p>
                      </div>
                      <TripPlannerForm
                        onSubmit={handlePlanTrip}
                        loading={loading}
                        error={error}
                      />
                    </div>
                  </div>

                  {/* Right: results dashboard */}
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
                    <ResultsDashboard trip={tripResult} onReset={handleReset} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* ── How It Works section ─────────────────────────────────────────── */}
        {!tripResult && (
          <section className="py-16">
            <div className="max-w-7xl mx-auto px-6">
              <div className="text-center mb-10">
                <h2 className="text-2xl font-bold text-white mb-2">How It Works</h2>
                <p className="text-slate-400 text-sm">Three steps to a fully planned, FMCSA-compliant trip</p>
              </div>
              <div className="grid sm:grid-cols-3 gap-6">
                {[
                  {
                    step: '01',
                    title: 'Enter Trip Details',
                    desc: 'Provide current location, pickup, dropoff, and your current 70h cycle usage.',
                    color: 'from-blue-500 to-cyan-500'
                  },
                  {
                    step: '02',
                    title: 'HOS Simulation',
                    desc: 'Our engine simulates every mandatory break, fuel stop, 10h rest, and 34h restart per FMCSA rules.',
                    color: 'from-indigo-500 to-purple-500'
                  },
                  {
                    step: '03',
                    title: 'Review & Export',
                    desc: 'View the route map, stop timeline, and pixel-perfect ELD logs. Export individual or full-trip PDFs.',
                    color: 'from-orange-500 to-red-500'
                  },
                ].map(({ step, title, desc, color }) => (
                  <motion.div
                    key={step}
                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                    className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6"
                  >
                    <div className={`text-4xl font-black bg-gradient-to-r ${color} bg-clip-text text-transparent mb-4`}>
                      {step}
                    </div>
                    <h3 className="text-base font-bold text-white mb-2">{title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* ── Footer ────────────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-800/50 py-8 mt-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Truck size={10} className="text-white" />
            </div>
            <span>Spotter HOS Route Planner</span>
          </div>
          <p>Built per FMCSA Interstate Truck Driver's Guide · April 2022 · 49 CFR § 395</p>
          <p>Django 5.1 · React 19 · OSRM · OpenStreetMap</p>
        </div>
      </footer>
    </div>
  )
}
