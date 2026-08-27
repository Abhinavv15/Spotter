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
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <div className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-primary" />
            <DialogTitle>FMCSA Hours of Service (HOS) Source of Truth</DialogTitle>
          </div>
          <DialogDescription>
            Reference: Interstate Truck Driver's Guide to Hours of Service for Property Carriers (April 2022 / 49 CFR Part 395)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          
          <div className="p-4 rounded-xl bg-spotter-ink border border-primary/20 flex items-start space-x-3.5">
            <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0 mt-0.5">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="text-sm font-bold text-white">11-Hour Driving Limit (§ 395.3(a)(3))</h4>
                <Badge variant="teal">Core Limit</Badge>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                During the 14-hour duty window, a property-carrying driver is permitted to drive a commercial motor vehicle (CMV) for a maximum of <strong>11 cumulative hours</strong> after 10 consecutive hours off duty.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-spotter-ink border border-secondary/20 flex items-start space-x-3.5">
            <div className="p-2 rounded-lg bg-secondary/10 text-secondary shrink-0 mt-0.5">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="text-sm font-bold text-white">14-Hour Driving Window (§ 395.3(a)(2))</h4>
                <Badge variant="lavender">Consecutive</Badge>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Driving is not permitted after <strong>14 consecutive hours</strong> have passed since coming on duty following 10 consecutive hours off duty. Non-driving work may continue after hour 14, but no CMV driving on highways is allowed.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-spotter-ink border border-accent/20 flex items-start space-x-3.5">
            <div className="p-2 rounded-lg bg-accent/10 text-accent shrink-0 mt-0.5">
              <Coffee className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="text-sm font-bold text-white">30-Minute Rest Break (§ 395.3(a)(3)(ii))</h4>
                <Badge variant="amber">Mandatory</Badge>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Driving is not permitted if more than <strong>8 cumulative driving hours</strong> have passed without a consecutive <strong>30-minute interruption</strong> in driving. This can be satisfied by Off-Duty, Sleeper Berth, or On-Duty Not Driving (such as fueling).
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-spotter-ink border border-muted-mint/20 flex items-start space-x-3.5">
            <div className="p-2 rounded-lg bg-success/10 text-success shrink-0 mt-0.5">
              <RefreshCw className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="text-sm font-bold text-white">70-Hour / 8-Day Rule & 34-Hour Restart (§ 395.3(b) & § 395.3(c))</h4>
                <Badge variant="success">Cycle Limit</Badge>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Drivers may not drive after accumulating <strong>70 on-duty hours</strong> in any rolling 8 consecutive days. A driver may restart their 70-hour clock by taking at least <strong>34 consecutive hours</strong> Off Duty or in the Sleeper Berth.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-spotter-ink border border-white/10 flex items-start space-x-3">
              <Fuel className="h-5 w-5 text-accent shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-white">Fueling Rule (Every ≤ 1,000 mi)</h4>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                  Stops every 1,000 miles (30 min On-Duty Not Driving). The engine automatically optimizes stops by combining fueling with mandatory 30-min breaks.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-spotter-ink border border-white/10 flex items-start space-x-3">
              <PackageCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-white">Pickup & Drop-off (1 Hour Each)</h4>
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
