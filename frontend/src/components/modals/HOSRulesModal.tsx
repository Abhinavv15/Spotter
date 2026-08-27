import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog'
import { Shield, Clock, Fuel, RefreshCw, AlertTriangle, Coffee, PackageCheck } from 'lucide-react'
import { Badge } from '../ui/badge'

interface HOSRulesModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const HOSRulesModal: React.FC<HOSRulesModalProps> = ({ open, onOpenChange }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto custom-scrollbar border-white/10 bg-[#080D0A]/95 backdrop-blur-2xl rounded-3xl">
        <DialogHeader>
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-[#8AE922]/20 text-[#8AE922]">
              <Shield className="h-5 w-5" />
            </div>
            <DialogTitle className="text-xl font-extrabold text-white font-heading">
              FMCSA Hours of Service (HOS) Source of Truth
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-slate-400">
            Reference: Interstate Truck Driver's Guide to Hours of Service for Property Carriers (April 2022 / 49 CFR Part 395)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3.5 py-3">
          
          <div className="p-4 rounded-2xl bg-[#0C140F] border border-[#8AE922]/30 flex items-start space-x-3.5 shadow-sm">
            <div className="p-2 rounded-xl bg-[#8AE922]/15 text-[#8AE922] shrink-0 mt-0.5">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="text-sm font-bold text-white font-heading">11-Hour Driving Limit (§ 395.3(a)(3))</h4>
                <Badge variant="lime">Core Limit</Badge>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                During the 14-hour duty window, a property-carrying driver is permitted to drive a commercial motor vehicle (CMV) for a maximum of <strong>11 cumulative hours</strong> after 10 consecutive hours off duty.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#0C140F] border border-emerald-500/30 flex items-start space-x-3.5 shadow-sm">
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 shrink-0 mt-0.5">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="text-sm font-bold text-white font-heading">14-Hour Driving Window (§ 395.3(a)(2))</h4>
                <Badge variant="emerald">Consecutive Window</Badge>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Driving is not permitted after <strong>14 consecutive hours</strong> have passed since coming on duty following 10 consecutive hours off duty. Non-driving work may continue after hour 14, but no CMV driving on highways is allowed.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#0C140F] border border-amber-500/30 flex items-start space-x-3.5 shadow-sm">
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 shrink-0 mt-0.5">
              <Coffee className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="text-sm font-bold text-white font-heading">30-Minute Rest Break (§ 395.3(a)(3)(ii))</h4>
                <Badge variant="amber">Mandatory</Badge>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Driving is not permitted if more than <strong>8 cumulative driving hours</strong> have passed without a consecutive <strong>30-minute interruption</strong> in driving. Satisfied by Off-Duty, Sleeper Berth, or On-Duty Not Driving (fueling).
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#0C140F] border border-[#8AE922]/30 flex items-start space-x-3.5 shadow-sm">
            <div className="p-2 rounded-xl bg-[#8AE922]/15 text-[#8AE922] shrink-0 mt-0.5">
              <RefreshCw className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="text-sm font-bold text-white font-heading">70-Hour / 8-Day Rule & 34-Hour Restart (§ 395.3(b) & § 395.3(c))</h4>
                <Badge variant="lime">Cycle Clock</Badge>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Drivers may not drive after accumulating <strong>70 on-duty hours</strong> in any rolling 8 consecutive days. A driver may restart their 70-hour clock by taking at least <strong>34 consecutive hours</strong> Off Duty or in the Sleeper Berth.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="p-4 rounded-2xl bg-[#0C140F] border border-white/10 flex items-start space-x-3">
              <Fuel className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-white font-heading">Fueling Rule (Every ≤ 1,000 mi)</h4>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                  Stops every 1,000 miles (30 min On-Duty Not Driving). Spotter combines fueling stops with mandatory 30-min breaks when possible.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#0C140F] border border-white/10 flex items-start space-x-3">
              <PackageCheck className="h-5 w-5 text-[#8AE922] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-white font-heading">Pickup &amp; Drop-off (1h Each)</h4>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                  Both Shipper Pickup and Receiver Drop-off take exactly 1 hour of On-Duty (Not Driving) time and count against the 14-hour window and 70-hour cycle.
                </p>
              </div>
            </div>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  )
}
