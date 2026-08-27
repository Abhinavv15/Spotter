import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog'
import { Share2, Copy, Check, MessageSquare, Mail, Link as LinkIcon, FileText, Truck, ExternalLink, Send } from 'lucide-react'
import { Badge } from '../ui/badge'
import type { TripPlanResponse } from '../../types/trip'

interface ShareModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  trip: TripPlanResponse
}

// Resilient clipboard helper with document.execCommand fallback
const copyToClipboard = async (text: string): Promise<boolean> => {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {}
  }

  // Fallback for non-https / restricted browser environments
  try {
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    textArea.style.top = '-999999px'
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    const successful = document.execCommand('copy')
    document.body.removeChild(textArea)
    return successful
  } catch {
    return false
  }
}

export const ShareModal: React.FC<ShareModalProps> = ({ open, onOpenChange, trip }) => {
  const [copiedLink, setCopiedLink] = useState(false)
  const [copiedText, setCopiedText] = useState(false)
  const [copyStatus, setCopyStatus] = useState<string | null>(null)

  // Generate robust shareable URL with complete query parameters
  const getShareUrl = () => {
    const origin = window.location.origin
    const pathname = window.location.pathname
    const params = new URLSearchParams()
    
    if (trip.current_location_name) params.set('origin', trip.current_location_name)
    if (trip.pickup_location_name) params.set('pickup', trip.pickup_location_name)
    if (trip.dropoff_location_name) params.set('dropoff', trip.dropoff_location_name)
    if (trip.current_cycle_used !== undefined) params.set('cycle', String(trip.current_cycle_used))
    if (trip.driver_name) params.set('driver', trip.driver_name)
    if (trip.carrier_name) params.set('carrier', trip.carrier_name)
    if (trip.truck_number) params.set('truck', trip.truck_number)
    if (trip.shipping_doc_number) params.set('doc', trip.shipping_doc_number)
    if (trip.commodity) params.set('commodity', trip.commodity)

    return `${origin}${pathname}?${params.toString()}#planner`
  }

  const shareUrl = getShareUrl()

  // Generate formatted text summary for dispatchers
  const getDispatchSummary = () => {
    return `📋 SPOTTER HOS DISPATCH PLAN
Route: ${trip.pickup_location_name} ➔ ${trip.dropoff_location_name}
Total Miles: ${trip.total_distance_miles.toFixed(0)} mi (${trip.total_trip_days} Day${trip.total_trip_days > 1 ? 's' : ''})
Driving Time: ${trip.driving_time_hours.toFixed(1)}h | Total Duration: ${trip.total_duration_hours.toFixed(1)}h
Compliance: ${trip.is_legal ? '✓ FMCSA 49 CFR § 395 LEGAL' : '⚠ REQUIRES ADJUSTMENT'}
70h Cycle Consumed: ${trip.hos_summary?.total_cycle_hours_consumed?.toFixed(1) || '0.0'}h / 70.0h
Driver: ${trip.driver_name || 'N/A'} | Truck: ${trip.truck_number || 'N/A'}
Carrier: ${trip.carrier_name || 'N/A'}

View Live Interactive Route & ELD Logs:
${shareUrl}`
  }

  const handleCopyLink = async () => {
    const success = await copyToClipboard(shareUrl)
    if (success) {
      setCopiedLink(true)
      setCopyStatus('Link copied to clipboard!')
      setTimeout(() => {
        setCopiedLink(false)
        setCopyStatus(null)
      }, 2500)
    }
  }

  const handleCopyText = async () => {
    const success = await copyToClipboard(getDispatchSummary())
    if (success) {
      setCopiedText(true)
      setCopyStatus('Dispatch briefing copied to clipboard!')
      setTimeout(() => {
        setCopiedText(false)
        setCopyStatus(null)
      }, 2500)
    }
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Spotter HOS Route Plan: ${trip.pickup_location_name} to ${trip.dropoff_location_name}`,
          text: getDispatchSummary(),
          url: shareUrl,
        })
        return
      } catch {}
    }
    // Fallback to copy link
    handleCopyLink()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl border-white/15 bg-[#080D0A]/95 backdrop-blur-2xl rounded-3xl p-6 sm:p-7 shadow-2xl">
        <DialogHeader>
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-[#8AE922]/20 text-[#8AE922]">
              <Share2 className="h-5 w-5" />
            </div>
            <DialogTitle className="text-xl font-extrabold text-white font-heading">
              Share Trip Dispatch Plan
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-slate-400">
            Share this interactive route plan, stop schedule, and ELD logs with drivers or dispatchers.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          
          {/* Status Alert Banner */}
          {copyStatus && (
            <div className="p-3 rounded-2xl bg-[#8AE922]/20 border border-[#8AE922]/50 text-[#8AE922] text-xs font-bold flex items-center gap-2 animate-in fade-in zoom-in-95">
              <Check size={16} />
              <span>{copyStatus}</span>
            </div>
          )}

          {/* Trip Snapshot Badge */}
          <div className="p-4 rounded-2xl bg-[#0C140F] border border-white/10 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Truck size={15} className="text-[#8AE922]" />
                <span className="text-sm font-bold text-white font-heading">
                  {trip.pickup_location_name} ➔ {trip.dropoff_location_name}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                {trip.total_distance_miles.toFixed(0)} mi · {trip.total_trip_days} Day{trip.total_trip_days > 1 ? 's' : ''} · {trip.stops.length} Stops
              </p>
            </div>
            <Badge variant="lime" className="font-mono text-[10px]">
              {trip.is_legal ? 'FMCSA LEGAL' : 'ADJUSTMENT'}
            </Badge>
          </div>

          {/* Shareable URL with 1-Click Copy & Test Buttons */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 font-heading">
                <LinkIcon size={12} className="text-[#8AE922]" />
                Direct Interactive Route Link
              </label>
              <a
                href={shareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#8AE922] hover:underline font-bold flex items-center gap-1"
              >
                <span>Test in New Tab</span>
                <ExternalLink size={12} />
              </a>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                onClick={(e) => (e.target as HTMLInputElement).select()}
                className="w-full bg-[#080D0A] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-300 font-mono focus:outline-none focus:border-[#8AE922]/50 select-all cursor-pointer"
                title="Click to select all"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-4 py-2.5 rounded-xl bg-[#8AE922] text-[#070C09] hover:bg-[#9EF538] font-bold text-xs shrink-0 flex items-center gap-1.5 shadow-glow-lime transition-all font-heading active:scale-95"
              >
                {copiedLink ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>

          {/* Dispatch Summary Preview & Copy */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 font-heading">
                <FileText size={12} className="text-[#8AE922]" />
                Formatted Dispatch Text (SMS / Email)
              </label>
              <button
                type="button"
                onClick={handleCopyText}
                className="text-xs text-[#8AE922] hover:underline font-bold flex items-center gap-1 active:scale-95 transition-transform"
              >
                {copiedText ? <Check size={12} /> : <Copy size={12} />}
                <span>{copiedText ? 'Copied Summary!' : 'Copy Summary'}</span>
              </button>
            </div>
            <textarea
              readOnly
              rows={4}
              value={getDispatchSummary()}
              onClick={(e) => (e.target as HTMLTextAreaElement).select()}
              className="w-full bg-[#080D0A] border border-white/10 rounded-xl p-3 text-[11px] text-slate-300 font-mono leading-relaxed focus:outline-none select-all custom-scrollbar resize-none cursor-pointer"
              title="Click to select all"
            />
          </div>

          {/* Quick Share Buttons (WhatsApp, Mail, Native Share) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
            <button
              type="button"
              onClick={handleNativeShare}
              className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all font-heading"
            >
              <MessageSquare size={13} className="text-[#8AE922]" />
              <span>Share Apps</span>
            </button>

            <a
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Spotter HOS Trip Dispatch (${trip.pickup_location_name} to ${trip.dropoff_location_name}):\n\n${shareUrl}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 rounded-xl bg-[#25D366]/20 hover:bg-[#25D366]/30 border border-[#25D366]/40 text-[#25D366] font-bold text-xs flex items-center justify-center gap-1.5 transition-all font-heading"
            >
              <Send size={13} />
              <span>WhatsApp</span>
            </a>

            <a
              href={`mailto:?subject=${encodeURIComponent(`Spotter Trip Dispatch: ${trip.pickup_location_name} to ${trip.dropoff_location_name}`)}&body=${encodeURIComponent(getDispatchSummary())}`}
              className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all font-heading"
            >
              <Mail size={13} className="text-amber-400" />
              <span>Email Plan</span>
            </a>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  )
}
