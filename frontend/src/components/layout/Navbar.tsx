import React from 'react'
import { Truck, ShieldCheck, BookOpen, Route, Sparkles } from 'lucide-react'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'

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
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-spotter-ink/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand */}
        <div 
          onClick={onResetTrip}
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary via-primary/80 to-[#009e94] p-0.5 shadow-glow-teal flex items-center justify-center transition-transform group-hover:scale-105">
            <div className="h-full w-full bg-spotter-ink rounded-[10px] flex items-center justify-center">
              <Truck className="h-5 w-5 text-primary animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-xl tracking-tight text-white font-mono">
                SPOTTER<span className="text-primary">.ai</span>
              </span>
              <Badge variant="teal" className="hidden sm:inline-flex text-[10px] py-0 px-2 uppercase font-mono">
                FMCSA §395
              </Badge>
            </div>
            <p className="text-[11px] text-slate-400 font-medium tracking-wide">
              HOS Route Planner & ELD Generator
            </p>
          </div>
        </div>

        {/* Navigation & Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {onOpenPresets && (
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenPresets}
              className="hidden md:inline-flex border-white/15 hover:border-primary/50 text-xs"
            >
              <Sparkles className="h-3.5 w-3.5 mr-1.5 text-accent" />
              Demo Routes
            </Button>
          )}

          {onOpenHOSModal && (
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenHOSModal}
              className="text-xs border-white/15 hover:border-secondary/50 text-slate-300"
            >
              <BookOpen className="h-3.5 w-3.5 mr-1.5 text-secondary" />
              <span className="hidden sm:inline">FMCSA</span> Rules
            </Button>
          )}

          <div className="hidden lg:flex items-center space-x-2 pl-3 border-l border-white/10 text-xs text-muted-mint">
            <ShieldCheck className="h-4 w-4 text-success" />
            <span className="text-slate-300 font-medium">70h/8-Day Cycle</span>
          </div>

          {isPlanningMode && (
            <Button
              variant="glow"
              size="sm"
              onClick={onResetTrip}
              className="text-xs font-semibold"
            >
              <Route className="h-3.5 w-3.5 mr-1.5" />
              New Trip
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
