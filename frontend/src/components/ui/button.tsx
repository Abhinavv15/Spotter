import * as React from "react"
import { cn } from "../../lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "glow" | "amber"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]"
    
    const variants = {
      default: "bg-primary text-background hover:bg-primary/90 font-semibold shadow-glow-teal",
      destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-md",
      outline: "border border-white/20 bg-background/50 hover:bg-white/10 hover:text-white text-slate-200",
      secondary: "bg-secondary text-background hover:bg-secondary/90 font-semibold shadow-glow-lavender",
      ghost: "hover:bg-white/10 hover:text-white text-slate-300",
      link: "text-primary underline-offset-4 hover:underline",
      glow: "bg-gradient-to-r from-primary via-[#00f2e2] to-primary text-background font-bold shadow-glow-teal hover:brightness-110",
      amber: "bg-accent text-background font-semibold hover:bg-accent/90 shadow-glow-amber",
    }

    const sizes = {
      default: "h-10 px-4 py-2",
      sm: "h-8 rounded-md px-3 text-xs",
      lg: "h-12 rounded-lg px-8 text-base",
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
