import { useState } from 'react'
import { BookOpen, Route, Sparkles, Menu, X, ArrowRight, Search } from 'lucide-react'
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
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#070C09]/75 backdrop-blur-2xl transition-all">
      <div className="w-full px-6 sm:px-10 lg:px-14 xl:px-16 h-20 flex items-center justify-between">
        
        {/* Spotter Brand Logo */}
        <div onClick={onResetTrip}>
          <SpotterLogo size={42} showText={true} showTagline={true} />
        </div>

        {/* Center Navigation Links (Matching Nexterra Menu) */}
        <nav className="hidden lg:flex items-center space-x-8 text-xs font-semibold text-slate-300 tracking-wide">
          <a
            href="#planner"
            className="hover:text-white transition-colors flex items-center gap-1.5"
          >
            <span>Trip Planner</span>
          </a>

          {onOpenPresets && (
            <button
              onClick={onOpenPresets}
              className="hover:text-[#8AE922] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles size={13} className="text-[#8AE922]" />
              <span>Demo Routes</span>
            </button>
          )}

          {onOpenHOSModal && (
            <button
              onClick={onOpenHOSModal}
              className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <BookOpen size={13} className="text-slate-400" />
              <span>FMCSA Regulations</span>
            </button>
          )}

          <a
            href="#milestones"
            className="hover:text-white transition-colors"
          >
            <span>Milestones</span>
          </a>

          <a
            href="https://www.fmcsa.dot.gov/regulations/hours-service/hours-service-drivers"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#8AE922] transition-colors flex items-center gap-1"
          >
            <span>DOT Portal</span>
          </a>
        </nav>

        {/* Right CTA Actions (Nexterra Pill Button) */}
        <div className="hidden sm:flex items-center space-x-4">
          <button
            onClick={() => {
              const el = document.getElementById('input-current-location')
              el?.focus()
            }}
            className="p-2.5 rounded-full text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            title="Search locations"
          >
            <Search size={17} />
          </button>

          {isPlanningMode ? (
            <button
              onClick={onResetTrip}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#8AE922] text-[#070C09] font-black text-xs uppercase tracking-wider shadow-glow-lime hover:bg-[#9EF538] transition-all font-heading"
            >
              <Route size={14} />
              <span>New Route Plan</span>
            </button>
          ) : (
            <a
              href="#planner"
              className="group inline-flex items-center overflow-hidden rounded-full bg-[#8AE922] p-1 pr-5 text-[#070C09] font-black text-xs uppercase tracking-wider shadow-glow-lime hover:bg-[#9EF538] transition-all font-heading"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#070C09] text-[#8AE922] transition-transform duration-300 group-hover:translate-x-0.5 mr-2.5">
                <ArrowRight size={13} />
              </span>
              <span>Launch Planner</span>
            </a>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex sm:hidden items-center gap-2">
          {isPlanningMode && (
            <button
              onClick={onResetTrip}
              className="px-3 py-1.5 rounded-full bg-[#8AE922] text-[#070C09] text-xs font-black"
            >
              New Plan
            </button>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 rounded-2xl bg-spotter-panel border border-white/10 text-slate-300 hover:text-white focus:outline-none"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-white/10 bg-[#070C09]/95 backdrop-blur-2xl px-6 py-5 space-y-3.5">
          <a
            href="#planner"
            onClick={() => setMobileMenuOpen(false)}
            className="w-full flex items-center justify-between p-3 rounded-2xl bg-spotter-panel border border-white/10 text-sm font-bold text-white hover:border-[#8AE922]/50"
          >
            <div className="flex items-center gap-2">
              <Route className="h-4 w-4 text-[#8AE922]" />
              <span>Trip Dispatch Planner</span>
            </div>
            <ArrowRight size={14} className="text-[#8AE922]" />
          </a>

          {onOpenPresets && (
            <button
              onClick={() => {
                onOpenPresets()
                setMobileMenuOpen(false)
              }}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-spotter-panel border border-white/10 text-sm font-semibold text-slate-200 hover:border-[#8AE922]/50"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#8AE922]" />
                <span>Load Demo Route Presets</span>
              </div>
              <Badge variant="lime" className="text-[10px]">Instant</Badge>
            </button>
          )}

          {onOpenHOSModal && (
            <button
              onClick={() => {
                onOpenHOSModal()
                setMobileMenuOpen(false)
              }}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-spotter-panel border border-white/10 text-sm font-semibold text-slate-200 hover:border-emerald-400/50"
            >
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-emerald-400" />
                <span>FMCSA 49 CFR § 395 Guide</span>
              </div>
              <Badge variant="emerald" className="text-[10px]">Rules</Badge>
            </button>
          )}
        </div>
      )}
    </header>
  )
}
