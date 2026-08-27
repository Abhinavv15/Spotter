import React, { useState } from 'react'
import { BookOpen, Route, Sparkles, Menu, X, ArrowRight } from 'lucide-react'
import { Badge } from '../ui/badge'
import { SpotterLogo } from '../ui/SpotterLogo'

interface NavbarProps {
  onOpenHOSModal?: () => void
  onOpenPresets?: () => void
  onResetTrip?: () => void
  isPlanningMode?: boolean
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenHOSModal,
  onOpenPresets,
  onResetTrip,
  isPlanningMode = false
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-[#070C09]/85 backdrop-blur-xl transition-all">
      <div className="w-full px-6 sm:px-10 lg:px-14 xl:px-16 h-18 flex items-center justify-between">
        
        {/* Spotter Brand Logo */}
        <div onClick={onResetTrip}>
          <SpotterLogo size={36} showText={true} showTagline={true} />
        </div>

        {/* Center Navigation Links (Enterprise Clean SaaS Layout) */}
        <nav className="hidden lg:flex items-center space-x-7 text-xs font-semibold text-neutral-300 tracking-normal">
          <a
            href="#planner"
            className="hover:text-white transition-colors"
          >
            <span>Trip Dispatcher</span>
          </a>

          {onOpenPresets && (
            <button
              type="button"
              onClick={onOpenPresets}
              className="hover:text-[#8AE922] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles size={13} className="text-[#8AE922]" />
              <span>Demo Routes</span>
            </button>
          )}

          <a
            href="#compliance-architecture"
            className="hover:text-white transition-colors"
          >
            <span>HOS Rules Engine</span>
          </a>

          {onOpenHOSModal && (
            <button
              type="button"
              onClick={onOpenHOSModal}
              className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <BookOpen size={13} className="text-neutral-400" />
              <span>49 CFR § 395 Guide</span>
            </button>
          )}

          <a
            href="https://www.fmcsa.dot.gov/regulations/hours-service/hours-service-drivers"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#8AE922] transition-colors flex items-center gap-1"
          >
            <span>DOT Portal</span>
          </a>
        </nav>

        {/* Right CTA Actions */}
        <div className="hidden sm:flex items-center space-x-3.5">
          <div className="hidden xl:flex items-center gap-1.5 text-[11px] font-mono text-neutral-400 border border-white/[0.08] px-3 py-1.5 rounded-full bg-white/[0.02]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8AE922]" />
            <span>FMCSA v2.4 Active</span>
          </div>

          {isPlanningMode ? (
            <button
              type="button"
              onClick={onResetTrip}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#8AE922] text-[#070C09] font-bold text-xs uppercase tracking-wider hover:bg-[#9EF538] transition-all font-heading active:scale-95"
            >
              <Route size={13} />
              <span>New Route</span>
            </button>
          ) : (
            <a
              href="#planner"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#8AE922] text-[#070C09] font-bold text-xs uppercase tracking-wider hover:bg-[#9EF538] transition-all font-heading active:scale-95 shadow-sm"
            >
              <span>Launch Planner</span>
              <ArrowRight size={13} />
            </a>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex sm:hidden items-center gap-2">
          {isPlanningMode && (
            <button
              type="button"
              onClick={onResetTrip}
              className="px-3 py-1.5 rounded-full bg-[#8AE922] text-[#070C09] text-xs font-bold"
            >
              New Plan
            </button>
          )}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-neutral-300 hover:text-white"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-white/[0.08] bg-[#070C09]/95 backdrop-blur-2xl px-6 py-5 space-y-3">
          <a
            href="#planner"
            onClick={() => setMobileMenuOpen(false)}
            className="w-full flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-xs font-bold text-white hover:border-[#8AE922]/50"
          >
            <div className="flex items-center gap-2">
              <Route className="h-4 w-4 text-[#8AE922]" />
              <span>Trip Dispatch Planner</span>
            </div>
            <ArrowRight size={14} className="text-[#8AE922]" />
          </a>

          {onOpenPresets && (
            <button
              type="button"
              onClick={() => {
                onOpenPresets()
                setMobileMenuOpen(false)
              }}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-xs font-semibold text-neutral-200"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#8AE922]" />
                <span>Load Demo Route Presets</span>
              </div>
              <Badge variant="lime" className="text-[9px]">Demo</Badge>
            </button>
          )}

          {onOpenHOSModal && (
            <button
              type="button"
              onClick={() => {
                onOpenHOSModal()
                setMobileMenuOpen(false)
              }}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-xs font-semibold text-neutral-200"
            >
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-emerald-400" />
                <span>FMCSA 49 CFR § 395 Guide</span>
              </div>
              <Badge variant="emerald" className="text-[9px]">Rules</Badge>
            </button>
          )}
        </div>
      )}
    </header>
  )
}
