/**
 * TripPlannerForm.tsx
 * High-tech trip planning form with FMCSA cycle slider, quick demo presets, and carrier options.
 * Nexterra styling with signature lime buttons and clean frosted moss cards.
 */
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Clock, ChevronDown, ChevronUp,
  Truck, User, Building2, FileText, AlertCircle, Loader2,
  MapPin, Package, Navigation2, Sparkles
} from 'lucide-react'
import { LocationInput } from './LocationInput'
import type { TripPlanRequest } from '../../types/trip'

interface TripPlannerFormProps {
  onSubmit: (data: TripPlanRequest) => Promise<void>
  loading: boolean
  error: string | null
  initialValues?: Partial<TripPlanRequest>
}

const PRESET_TRIPS = [
  {
    name: 'Chicago → Dallas',
    desc: '920 mi · Long-haul with mandatory breaks',
    current: 'Chicago, IL',
    pickup: 'Gary, IN',
    dropoff: 'Dallas, TX',
    cycle: 12,
    driver: 'Marcus Vance',
    carrier: 'Apex Logistics LLC',
    truck: 'VOLVO-780-V',
    commodity: 'Auto Parts (Palletized)'
  },
  {
    name: 'Atlanta → Los Angeles',
    desc: '2,170 mi · Cross-country with 34h restart',
    current: 'Atlanta, GA',
    pickup: 'Birmingham, AL',
    dropoff: 'Los Angeles, CA',
    cycle: 48,
    driver: 'Elena Rostova',
    carrier: 'Pacific Freight Express',
    truck: 'KW-T680-99',
    commodity: 'Refrigerated Produce'
  },
  {
    name: 'NYC → Boston',
    desc: '215 mi · Regional shift',
    current: 'New York, NY',
    pickup: 'Newark, NJ',
    dropoff: 'Boston, MA',
    cycle: 5,
    driver: 'David Chen',
    carrier: 'Metro Cargo Lines',
    truck: 'FRT-CASC-11',
    commodity: 'Retail Goods'
  }
]

export default function TripPlannerForm({ onSubmit, loading, error, initialValues }: TripPlannerFormProps) {
  const [currentLoc, setCurrentLoc] = useState(initialValues?.current_location || '')
  const [pickupLoc, setPickupLoc] = useState(initialValues?.pickup_location || '')
  const [dropoffLoc, setDropoffLoc] = useState(initialValues?.dropoff_location || '')
  const [form, setForm] = useState<Omit<TripPlanRequest, 'current_location' | 'pickup_location' | 'dropoff_location'>>({
    current_cycle_used: initialValues?.current_cycle_used || 0,
    driver_name: initialValues?.driver_name || '',
    carrier_name: initialValues?.carrier_name || '',
    carrier_address: initialValues?.carrier_address || '',
    home_terminal_address: initialValues?.home_terminal_address || '',
    truck_number: initialValues?.truck_number || '',
    trailer_number: initialValues?.trailer_number || '',
    shipping_doc_number: initialValues?.shipping_doc_number || '',
    commodity: initialValues?.commodity || '',
    home_terminal_tz: initialValues?.home_terminal_tz || 'America/Chicago',
  })
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [cycleSlider, setCycleSlider] = useState(initialValues?.current_cycle_used || 0)

  const applyPreset = (preset: typeof PRESET_TRIPS[0]) => {
    setCurrentLoc(preset.current)
    setPickupLoc(preset.pickup)
    setDropoffLoc(preset.dropoff)
    setCycleSlider(preset.cycle)
    setForm(prev => ({
      ...prev,
      driver_name: preset.driver,
      carrier_name: preset.carrier,
      truck_number: preset.truck,
      commodity: preset.commodity,
    }))
  }

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
  const cycleColor = cyclePercent > 80 ? '#F43F5E' : cyclePercent > 60 ? '#FACC15' : '#8AE922'

  return (
    <motion.form
      id="trip-planner-form"
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-4"
    >
      {/* ── Demo Presets Chips ──────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-extrabold tracking-wider text-slate-300 uppercase flex items-center gap-1.5 font-heading">
            <Sparkles size={13} className="text-[#8AE922]" />
            Quick Route Presets
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {PRESET_TRIPS.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => applyPreset(p)}
              className="text-left p-2.5 rounded-2xl bg-[#0C140F] border border-white/10 hover:border-[#8AE922]/60 hover:bg-[#8AE922]/10 transition-all group"
            >
              <div className="text-xs font-bold text-slate-200 group-hover:text-[#8AE922] transition-colors">
                {p.name}
              </div>
              <div className="text-[10px] text-slate-400 truncate mt-0.5 font-medium">
                {p.desc}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Location Inputs ─────────────────────────────────────────────────── */}
      <div className="grid gap-3">
        <LocationInput
          id="input-current-location"
          label="Current Location"
          placeholder="Where are you now? (city, state)"
          value={currentLoc}
          onChange={setCurrentLoc}
          iconColor="text-[#8AE922]"
          required
        />
        <LocationInput
          id="input-pickup-location"
          label="Pickup Location (Shipper)"
          placeholder="Pickup address or city"
          value={pickupLoc}
          onChange={setPickupLoc}
          iconColor="text-emerald-400"
          required
        />
        <LocationInput
          id="input-dropoff-location"
          label="Dropoff Location (Receiver)"
          placeholder="Final delivery address or city"
          value={dropoffLoc}
          onChange={setDropoffLoc}
          iconColor="text-[#8AE922]"
          required
        />
      </div>

      {/* ── Cycle Hours Slider ──────────────────────────────────────────────── */}
      <div className="rounded-2xl bg-[#0C140F] border border-white/10 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-[#8AE922]" />
            <span className="text-xs sm:text-sm font-bold text-slate-200 font-heading">70h / 8-Day Cycle Used</span>
          </div>
          <div className="flex items-center gap-1.5 font-mono">
            <span className="text-lg font-extrabold" style={{ color: cycleColor }}>
              {cycleSlider.toFixed(1)}h
            </span>
            <span className="text-slate-500 text-xs">/ 70h</span>
          </div>
        </div>

        <div className="relative h-2 bg-[#080D0A] rounded-full overflow-hidden border border-white/5 my-2">
          <div
            className="absolute left-0 top-0 h-full rounded-full transition-all duration-300 shadow-sm"
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
          className="w-full accent-[#8AE922] cursor-pointer"
        />

        <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono font-medium">
          <span>0h (Fresh)</span>
          <span>35h (Half)</span>
          <span>60h (Critical)</span>
          <span>70h (Max)</span>
        </div>

        {cycleSlider > 60 && (
          <p className="text-xs text-amber-400 mt-2 flex items-center gap-1.5">
            <AlertCircle size={13} className="shrink-0" />
            High cycle usage: A 34h restart will be scheduled before completing this route.
          </p>
        )}
      </div>

      {/* ── Advanced Options Toggle ─────────────────────────────────────────── */}
      <button
        type="button"
        id="btn-toggle-advanced"
        onClick={() => setShowAdvanced(v => !v)}
        className="flex items-center justify-between w-full py-2 px-1 text-xs text-slate-400 hover:text-[#8AE922] transition-colors font-medium"
      >
        <span>Driver, Carrier &amp; Log Metadata (Optional)</span>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-2xl bg-[#0C140F]/80 border border-white/10 p-4">
              {[
                { id: 'inp-driver-name', key: 'driver_name', label: 'Driver Name', icon: User, placeholder: 'John Doe' },
                { id: 'inp-carrier-name', key: 'carrier_name', label: 'Carrier Name', icon: Building2, placeholder: 'Nexterra Freight LLC' },
                { id: 'inp-carrier-addr', key: 'carrier_address', label: 'Main Office Address', icon: MapPin, placeholder: '123 Logistics Blvd, Chicago, IL' },
                { id: 'inp-home-terminal', key: 'home_terminal_address', label: 'Home Terminal', icon: MapPin, placeholder: 'Terminal address' },
                { id: 'inp-truck-num', key: 'truck_number', label: 'Truck Number', icon: Truck, placeholder: 'TRK-4821' },
                { id: 'inp-trailer-num', key: 'trailer_number', label: 'Trailer Number', icon: Truck, placeholder: 'TRL-9920' },
                { id: 'inp-shipping-doc', key: 'shipping_doc_number', label: 'Shipping Document #', icon: FileText, placeholder: 'BOL-884920' },
                { id: 'inp-commodity', key: 'commodity', label: 'Commodity', icon: Package, placeholder: 'Eco Materials & Cargo' },
              ].map(({ id, key, label, icon: Icon, placeholder }) => (
                <div key={key}>
                  <label htmlFor={id} className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-1 font-medium">
                    <Icon size={11} className="text-[#8AE922]" />
                    {label}
                  </label>
                  <input
                    id={id}
                    type="text"
                    placeholder={placeholder}
                    value={String(form[key as keyof typeof form] || '')}
                    onChange={e => setField(key as keyof typeof form, e.target.value)}
                    className="w-full bg-[#080D0A] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-[#8AE922] transition-colors"
                  />
                </div>
              ))}

              <div className="col-span-1 sm:col-span-2">
                <label htmlFor="inp-departure-time" className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-1 font-medium">
                  <Clock size={11} className="text-[#8AE922]" />
                  Departure Time (defaults to tomorrow 06:00 UTC)
                </label>
                <input
                  id="inp-departure-time"
                  type="datetime-local"
                  value={form.departure_time || ''}
                  onChange={e => setField('departure_time', e.target.value)}
                  className="w-full bg-[#080D0A] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-[#8AE922] transition-colors"
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
            className="flex items-start gap-2 text-xs text-rose-300 bg-rose-950/40 border border-rose-800/40 rounded-2xl px-4 py-3"
          >
            <AlertCircle size={15} className="mt-0.5 shrink-0 text-rose-400" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Submit Button ─────────────────────────────────────────────────── */}
      <button
        id="btn-plan-trip"
        type="submit"
        disabled={loading || !currentLoc || !pickupLoc || !dropoffLoc}
        className="relative w-full py-4 rounded-2xl font-extrabold text-sm sm:text-base bg-[#8AE922] text-[#080D0A] hover:bg-[#9EF538] transition-all shadow-glow-lime disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none overflow-hidden group tracking-wide"
      >
        <span className="relative z-10 flex items-center justify-center gap-2 font-black uppercase font-heading">
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Computing HOS Schedule…
            </>
          ) : (
            <>
              <Navigation2 size={18} className="fill-[#080D0A]" />
              Generate Compliant Route
            </>
          )}
        </span>
      </button>
    </motion.form>
  )
}
