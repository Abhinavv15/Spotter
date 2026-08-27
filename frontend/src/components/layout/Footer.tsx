import React from 'react'
import { Shield, FileCheck2, Cpu, CheckCircle2 } from 'lucide-react'

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-white/10 bg-spotter-ink/95 mt-20 py-12 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center space-x-2 font-mono font-bold text-white text-base">
              <span>SPOTTER HOS & ELD PLATFORM</span>
            </div>
            <p className="text-slate-400 text-sm max-w-md leading-relaxed">
              Engineered for property carriers and CMV drivers operating under FMCSA 49 CFR Part 395 regulations. Calculates legal route plans, rest schedules, fuel intervals, and generates audit-ready driver daily logs.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="inline-flex items-center text-[11px] bg-white/5 border border-white/10 px-2.5 py-1 rounded-md text-slate-300">
                <CheckCircle2 className="h-3 w-3 mr-1 text-primary" /> 11-Hour Driving Rule
              </span>
              <span className="inline-flex items-center text-[11px] bg-white/5 border border-white/10 px-2.5 py-1 rounded-md text-slate-300">
                <CheckCircle2 className="h-3 w-3 mr-1 text-primary" /> 14-Hour Duty Window
              </span>
              <span className="inline-flex items-center text-[11px] bg-white/5 border border-white/10 px-2.5 py-1 rounded-md text-slate-300">
                <CheckCircle2 className="h-3 w-3 mr-1 text-primary" /> 70-Hour / 8-Day Cycle
              </span>
              <span className="inline-flex items-center text-[11px] bg-white/5 border border-white/10 px-2.5 py-1 rounded-md text-slate-300">
                <CheckCircle2 className="h-3 w-3 mr-1 text-primary" /> ≤1,000 mi Fueling
              </span>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-white uppercase tracking-wider text-xs mb-3">Regulatory Source</h4>
            <ul className="space-y-2">
              <li>
                <span className="text-slate-300">FMCSA HOS Property Carriers</span>
                <p className="text-[11px] text-slate-500">April 2022 Official Guidance</p>
              </li>
              <li>
                <span className="text-slate-300">49 CFR § 395.8</span>
                <p className="text-[11px] text-slate-500">Driver's Record of Duty Status</p>
              </li>
              <li>
                <span className="text-slate-300">34-Hour Restart Provision</span>
                <p className="text-[11px] text-slate-500">§ 395.3(c)(1) & (c)(2)</p>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white uppercase tracking-wider text-xs mb-3">System Verification</h4>
            <ul className="space-y-2">
              <li className="flex items-center space-x-2">
                <Shield className="h-3.5 w-3.5 text-primary" />
                <span>Deterministic Scheduling</span>
              </li>
              <li className="flex items-center space-x-2">
                <FileCheck2 className="h-3.5 w-3.5 text-secondary" />
                <span>Vector SVG Daily Log Sheets</span>
              </li>
              <li className="flex items-center space-x-2">
                <Cpu className="h-3.5 w-3.5 text-accent" />
                <span>OSRM Routing Engine</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between text-slate-500 text-[11px]">
          <p>© {new Date().getFullYear()} Spotter Logistics Systems. All calculations strictly follow FMCSA rules.</p>
          <p className="mt-2 sm:mt-0">Production Full-Stack Assessment</p>
        </div>
      </div>
    </footer>
  )
}
