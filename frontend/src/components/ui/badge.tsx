import * as React from "react"
import { cn } from "../../lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "amber" | "teal" | "lavender"
}

function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  const variants = {
    default: "bg-primary/20 text-primary border border-primary/30",
    secondary: "bg-secondary/20 text-secondary border border-secondary/30",
    destructive: "bg-destructive/20 text-destructive border border-destructive/30",
    outline: "text-foreground border border-white/20",
    success: "bg-success/20 text-success border border-success/30",
    amber: "bg-accent/20 text-accent border border-accent/30",
    teal: "bg-[#00D4C7]/20 text-[#00D4C7] border border-[#00D4C7]/30",
    lavender: "bg-[#A78BFA]/20 text-[#A78BFA] border border-[#A78BFA]/30",
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors",
        variants[variant],
        className
      )}
      {...props}
    />
  )
}

export { Badge }
