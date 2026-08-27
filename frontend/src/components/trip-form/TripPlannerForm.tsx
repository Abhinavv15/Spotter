/**
 * TripPlannerForm.tsx
 * Premium trip planning form with advanced driver/carrier options.
 */
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Clock, ChevronDown, ChevronUp,
  Truck, User, Building2, FileText, AlertCircle, Loader2,
  MapPin, Package, Navigation2
} from 'lucide-react'
import { LocationInput } from './LocationInput'
import type { TripPlanRequest } from '../../types/trip'

interface TripPlannerFormProps {
  onSubmit: (data: TripPlanRequest) => Promise<void>
  loading: boolean
  error: string | null
}

export default function TripPlannerForm({ onSubmit, loading, error }: TripPlannerFormProps) {
  const [currentLoc, setCurrentLoc] = useState('')
  const [pickupLoc, setPickupLoc] = useState('')
  const [dropoffLoc, setDropoffLoc] = useState('')
  const [form, setForm] = useState<Omit<TripPlanRequest, 'current_location' | 'pickup_location' | 'dropoff_location'>>({
    current_cycle_used: 0,
    driver_name: '',
    carrier_name: '',
    carrier_address: '',
    home_terminal_address: '',
    truck_number: '',
    trailer_number: '',
    shipping_doc_number: '',
    commodity: '',
    home_terminal_tz: 'America/Chicago',
  })
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [cycleSlider, setCycleSlider] = useState(0)

  const setField = (key: keyof typeof form, value: string | number) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit({
      ...form,
      current_location: currentLoc,
      pickup_location: pickupLoc,
      dropoff_location: dropoffLoc,
      current_cycle_used: cycleSlider
    })
  }

  const cyclePercent = (cycleSlider / 70) * 100
  const cycleColor = cyclePercent > 80 ? '#ef4444' : cyclePercent > 60 ? '#f97316' : '#4ade80'

  return (
    <motion.form
      id="trip-planner-form"
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-5"
    >
      {/* ── Location Inputs ─────────────────────────────────────────────────── */}
      <div className="grid gap-3">
        <LocationInput
          id="input-current-location"
          label="Current Location"
          placeholder="Where are you now? (city, state)"
          value={currentLoc}
          onChange={setCurrentLoc}
          iconColor="text-blue-400"
        />
        <LocationInput
          id="input-pickup-location"
          label="Pickup Location"
          placeholder="Pickup address or city"
          value={pickupLoc}
          onChange={setPickupLoc}
          iconColor="text-green-400"
        />
        <LocationInput
          id="input-dropoff-location"
          label="Dropoff Location"
          placeholder="Final delivery address or city"
          value={dropoffLoc}
          onChange={setDropoffLoc}
          iconColor="text-orange-400"
        />
      </div>

      {/* ── Cycle Hours Slider ──────────────────────────────────────────────── */}
      <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-slate-400" />
            <span className="text-sm font-medium text-slate-300">Current Cycle Hours Used</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold" style={{ color: cycleColor }}>
              {cycleSlider.toFixed(1)}
            </span>
            <span className="text-slate-500 text-sm">/ 70h</span>
          </div>
        </div>
        <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="absolute left-0 top-0 h-full rounded-full transition-all"
            style={{ width: `${cyclePercent}%`, background: cycleColor }}
          />
        </div>
        <input
          id="slider-cycle-hours"
          type="range"
          min={0}
          max={70}
          step={0.5}
          value={cycleSlider}
          onChange={e => setCycleSlider(Number(e.target.value))}
          className="w-full mt-2 accent-blue-500 opacity-0 absolute"
          style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
        />
        {/* Custom clickable track */}
        <div
          className="w-full h-8 -mt-5 cursor-pointer"
          onMouseDown={(e) => {
            const rect = e.currentTarget.getBoundingClientRect()
            const updateVal = (clientX: number) => {
              const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
              setCycleSlider(Math.round(pct * 70 * 2) / 2)
            }
            updateVal(e.clientX)
            const onMove = (ev: MouseEvent) => updateVal(ev.clientX)
            const onUp = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
            window.addEventListener('mousemove', onMove)
            window.addEventListener('mouseup', onUp)
          }}
        />
        <div className="flex justify-between text-[10px] text-slate-600 mt-1">
          <span>0h</span>
          <span>17.5h</span>
          <span>35h</span>
          <span>52.5h</span>
          <span>70h</span>
        </div>
        {cycleSlider > 60 && (
          <p className="text-xs text-orange-400 mt-2 flex items-center gap-1">
            <AlertCircle size={12} />
            High cycle usage may require a 34h restart before completing this trip.
          </p>
        )}
      </div>

      {/* ── Advanced Options Toggle ─────────────────────────────────────────── */}
      <button
        type="button"
        id="btn-toggle-advanced"
        onClick={() => setShowAdvanced(v => !v)}
        className="flex items-center justify-between w-full text-sm text-slate-400 hover:text-slate-200 transition-colors"
      >
        <span className="font-medium">Driver &amp; Carrier Details (Optional)</span>
        {showAdvanced ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
      </button>

      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-900/60 border border-slate-800 p-4">
              {[
                { id: 'inp-driver-name', key: 'driver_name', label: 'Driver Name', icon: User, placeholder: 'John Doe' },
                { id: 'inp-carrier-name', key: 'carrier_name', label: 'Carrier Name', icon: Building2, placeholder: 'ACME Freight LLC' },
                { id: 'inp-carrier-addr', key: 'carrier_address', label: 'Main Office Address', icon: MapPin, placeholder: '123 Main St, Chicago, IL' },
                { id: 'inp-home-terminal', key: 'home_terminal_address', label: 'Home Terminal', icon: MapPin, placeholder: 'Terminal address' },
                { id: 'inp-truck-num', key: 'truck_number', label: 'Truck Number', icon: Truck, placeholder: 'T-4821' },
                { id: 'inp-trailer-num', key: 'trailer_number', label: 'Trailer Number', icon: Truck, placeholder: 'TR-992' },
                { id: 'inp-shipping-doc', key: 'shipping_doc_number', label: 'Shipping Document', icon: FileText, placeholder: 'BOL-20240101' },
                { id: 'inp-commodity', key: 'commodity', label: 'Commodity', icon: Package, placeholder: 'General freight' },
              ].map(({ id, key, label, icon: Icon, placeholder }) => (
                <div key={key}>
                  <label htmlFor={id} className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                    <Icon size={11} />
                    {label}
                  </label>
                  <input
                    id={id}
                    type="text"
                    placeholder={placeholder}
                    value={String(form[key as keyof typeof form] || '')}
                    onChange={e => setField(key as keyof typeof form, e.target.value)}
                    className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              ))}

              <div className="col-span-2">
                <label htmlFor="inp-departure-time" className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                  <Clock size={11} />
                  Departure Time (optional, defaults to tomorrow 06:00 UTC)
                </label>
                <input
                  id="inp-departure-time"
                  type="datetime-local"
                  value={form.departure_time || ''}
                  onChange={e => setField('departure_time', e.target.value)}
                  className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Error ──────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-start gap-2 text-sm text-red-400 bg-red-950/40 border border-red-900/50 rounded-xl px-4 py-3"
          >
            <AlertCircle size={15} className="mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Submit Button ─────────────────────────────────────────────────── */}
      <button
        id="btn-plan-trip"
        type="submit"
        disabled={loading || !currentLoc || !pickupLoc || !dropoffLoc}
        className="relative w-full py-3.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500 transition-all shadow-lg shadow-blue-900/30 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group"
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Planning Route…
            </>
          ) : (
            <>
              <Navigation2 size={16} />
              Plan HOS Route
            </>
          )}
        </span>
        {!loading && (
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
        )}
      </button>
    </motion.form>
  )
}
