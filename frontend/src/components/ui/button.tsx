import * as React from "react"
import { cn } from "../../lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "glow" | "amber" | "lime"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]"
    
    const variants = {
      default: "bg-[#8AE922] text-[#080D0A] hover:bg-[#9EF538] font-extrabold shadow-glow-lime",
      lime: "bg-[#8AE922] text-[#080D0A] hover:bg-[#9EF538] font-extrabold shadow-glow-lime",
      destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-md font-semibold",
      outline: "border border-white/15 bg-spotter-panel/75 hover:bg-white/10 hover:text-white text-slate-200 backdrop-blur-md",
      secondary: "bg-secondary text-[#080D0A] hover:bg-emerald-400 font-extrabold shadow-glow-leaf",
      ghost: "hover:bg-white/10 hover:text-white text-slate-300",
      link: "text-[#8AE922] underline-offset-4 hover:underline",
      glow: "bg-gradient-to-r from-[#8AE922] via-[#A8F84A] to-[#8AE922] text-[#080D0A] font-extrabold shadow-glow-lime hover:brightness-110",
      amber: "bg-accent text-[#080D0A] font-extrabold hover:bg-accent/90 shadow-sm",
    }

    const sizes = {
      default: "h-10 px-4 py-2",
      sm: "h-8 rounded-lg px-3 text-xs",
      lg: "h-12 rounded-xl px-7 text-base",
      icon: "h-10 w-10",
    }

    return (
      <button
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
