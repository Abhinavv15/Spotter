import * as React from "react"
import { cn } from "../../lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "amber" | "teal" | "lime" | "emerald" | "cyan"
}

function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  const variants = {
    default: "bg-[#8AE922]/20 text-[#8AE922] border border-[#8AE922]/40",
    lime: "bg-[#8AE922]/20 text-[#8AE922] border border-[#8AE922]/40",
    emerald: "bg-[#8AE922]/20 text-[#8AE922] border border-[#8AE922]/40",
    secondary: "bg-secondary/20 text-secondary border border-secondary/40",
    cyan: "bg-teal-500/20 text-teal-300 border border-teal-500/40",
    destructive: "bg-destructive/20 text-destructive border border-destructive/40",
    outline: "text-foreground border border-white/20",
    success: "bg-[#8AE922]/20 text-[#8AE922] border border-[#8AE922]/40",
    amber: "bg-accent/20 text-accent border border-accent/40",
    teal: "bg-[#8AE922]/20 text-[#8AE922] border border-[#8AE922]/40",
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-3 py-0.5 text-xs font-bold tracking-wide transition-colors",
        variants[variant],
        className
      )}
      {...props}
    />
  )
}

export { Badge }
