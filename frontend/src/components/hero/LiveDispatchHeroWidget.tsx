import React, { useState, useEffect } from 'react'
import { ShieldCheck, CheckCircle2, Activity, Sparkles } from 'lucide-react'

interface LiveDispatchHeroWidgetProps {
  onLoadPreset: (preset: any) => void
}

export const LiveDispatchHeroWidget: React.FC<LiveDispatchHeroWidgetProps> = ({ onLoadPreset }) => {
  const [elapsedTime, setElapsedTime] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(prev => (prev + 1) % 60)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const sampleRoute = {
    origin: 'Chicago, IL',
    pickup: 'Gary, IN',
    dropoff: 'Dallas, TX',
    miles: 920,
    cycleUsed: 14.0,
    driver: 'Marcus Vance',
    carrier: 'Apex Freight Systems',
    truck: 'TRK-9021',
    doc: 'BOL-84920'
  }

  const handleApply = () => {
    onLoadPreset({
      current_location: sampleRoute.origin,
      pickup_location: sampleRoute.pickup,
      dropoff_location: sampleRoute.dropoff,
      current_cycle_used: sampleRoute.cycleUsed,
      driver_name: sampleRoute.driver,
      carrier_name: sampleRoute.carrier,
      truck_number: sampleRoute.truck,
      shipping_doc_number: sampleRoute.doc
    })
  }

  return (
    <div className="w-full h-full flex flex-col justify-between p-5 sm:p-6 select-none bg-[#0B120E]/90 backdrop-blur-2xl border border-white/[0.08] rounded-3xl shadow-2xl relative overflow-hidden">
      
      {/* ── Terminal Header ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <span className="text-[11px] font-mono text-neutral-400 font-medium">
            terminal://fmcsa-scheduler-v2.4
          </span>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#8AE922]/10 border border-[#8AE922]/25 text-[10px] font-mono font-bold text-[#8AE922]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#8AE922] animate-pulse" />
          <span>ENGINE ONLINE</span>
        </div>
      </div>

      {/* ── Active Dispatch Preview Card ─────────────────────────────────────── */}
      <div className="my-3 space-y-3">
        
        {/* Route Header Banner */}
        <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 flex items-center gap-1">
              <Activity size={12} className="text-[#8AE922]" /> Active Schedule Simulation
            </div>
            <div className="text-sm font-bold text-white flex items-center gap-1.5 font-heading">
              <span>{sampleRoute.pickup}</span>
              <span className="text-[#8AE922]">→</span>
              <span>{sampleRoute.dropoff}</span>
            </div>
          </div>

          <div className="text-right font-mono">
            <div className="text-xs font-bold text-[#8AE922]">{sampleRoute.miles} mi</div>
            <div className="text-[10px] text-neutral-400">2 Shifts · 1 Rest</div>
          </div>
        </div>

        {/* 3 Real-time HOS Gauges */}
        <div className="grid grid-cols-3 gap-2 font-mono text-center">
          <div className="p-2.5 rounded-xl bg-black/40 border border-white/[0.06]">
            <span className="text-[9px] uppercase tracking-wider text-neutral-400 block mb-0.5">
              11h Drive Limit
            </span>
            <span className="text-xs font-bold text-white">8.5h <span className="text-neutral-400 font-normal">/ 11h</span></span>
            <div className="w-full bg-white/10 h-1 rounded-full mt-1.5 overflow-hidden">
              <div className="bg-[#8AE922] h-full rounded-full" style={{ width: '77%' }} />
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-black/40 border border-white/[0.06]">
            <span className="text-[9px] uppercase tracking-wider text-neutral-400 block mb-0.5">
              14h Duty Window
            </span>
            <span className="text-xs font-bold text-white">10.5h <span className="text-neutral-400 font-normal">/ 14h</span></span>
            <div className="w-full bg-white/10 h-1 rounded-full mt-1.5 overflow-hidden">
              <div className="bg-emerald-400 h-full rounded-full" style={{ width: '75%' }} />
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-black/40 border border-white/[0.06]">
            <span className="text-[9px] uppercase tracking-wider text-neutral-400 block mb-0.5">
              70h / 8-Day Cycle
            </span>
            <span className="text-xs font-bold text-white">24.5h <span className="text-neutral-400 font-normal">/ 70h</span></span>
            <div className="w-full bg-white/10 h-1 rounded-full mt-1.5 overflow-hidden">
              <div className="bg-cyan-400 h-full rounded-full" style={{ width: '35%' }} />
            </div>
          </div>
        </div>

        {/* Live Event Stream */}
        <div className="p-3 rounded-2xl bg-black/50 border border-white/[0.06] text-[11px] font-mono space-y-1.5">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="flex items-center gap-1 text-[#8AE922] font-semibold">
              <CheckCircle2 size={12} /> Legal Stop Sequence Verified
            </span>
            <span className="text-[10px]">T+{elapsedTime}s</span>
          </div>
          <div className="text-neutral-300 flex items-center justify-between">
            <span>Stop 01: Fuel + Mandatory 30m Break</span>
            <span className="text-neutral-400">Effingham, IL</span>
          </div>
          <div className="text-neutral-300 flex items-center justify-between">
            <span>Stop 02: 10h Consecutive Sleeper Rest</span>
            <span className="text-neutral-400">Mt. Vernon, IL</span>
          </div>
        </div>

      </div>

      {/* ── Action Footer ────────────────────────────────────────────────────── */}
      <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-xs text-neutral-300 font-medium">
          <ShieldCheck size={14} className="text-[#8AE922]" />
          <span>FMCSA 49 CFR Part 395 Ready</span>
        </div>

        <button
          type="button"
          onClick={handleApply}
          className="px-4 py-2 rounded-xl bg-[#8AE922] text-[#070C09] font-extrabold text-xs flex items-center gap-1.5 hover:bg-[#9EF538] transition-all font-heading shadow-sm active:scale-95"
        >
          <Sparkles size={13} />
          <span>Load This Route</span>
        </button>
      </div>

    </div>
  )
}
