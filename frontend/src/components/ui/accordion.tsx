import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "../../lib/utils"

interface AccordionContextValue {
  expandedItems: string[]
  toggleItem: (id: string) => void
}

const AccordionContext = React.createContext<AccordionContextValue | null>(null)

export function Accordion({
  type = "single",
  defaultValue,
  children,
  className,
}: {
  type?: "single" | "multiple"
  defaultValue?: string | string[]
  children: React.ReactNode
  className?: string
}) {
  const initial = Array.isArray(defaultValue)
    ? defaultValue
    : defaultValue
    ? [defaultValue]
    : []
  const [expandedItems, setExpandedItems] = React.useState<string[]>(initial)

  const toggleItem = React.useCallback(
    (id: string) => {
      setExpandedItems((prev) => {
        if (type === "single") {
          return prev.includes(id) ? [] : [id]
        }
        return prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
      })
    },
    [type]
  )

  return (
    <AccordionContext.Provider value={{ expandedItems, toggleItem }}>
      <div className={cn("space-y-2", className)}>{children}</div>
    </AccordionContext.Provider>
  )
}

const AccordionItemContext = React.createContext<{ value: string } | null>(null)

export function AccordionItem({
  value,
  children,
  className,
}: {
  value: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <AccordionItemContext.Provider value={{ value }}>
      <div className={cn("rounded-xl border border-white/10 bg-spotter-space/50 overflow-hidden", className)}>
        {children}
      </div>
    </AccordionItemContext.Provider>
  )
}

export function AccordionTrigger({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const root = React.useContext(AccordionContext)
  const item = React.useContext(AccordionItemContext)
  if (!root || !item) throw new Error("AccordionTrigger must be used inside AccordionItem")

  const isOpen = root.expandedItems.includes(item.value)

  return (
    <button
      type="button"
      onClick={() => root.toggleItem(item.value)}
      className={cn(
        "flex w-full items-center justify-between p-4 text-left text-sm font-semibold transition-all hover:bg-white/5 text-slate-200",
        className
      )}
    >
      {children}
      <ChevronDown
        className={cn("h-4 w-4 shrink-0 transition-transform duration-200 text-slate-400", isOpen && "rotate-180 text-primary")}
      />
    </button>
  )
}

export function AccordionContent({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const root = React.useContext(AccordionContext)
  const item = React.useContext(AccordionItemContext)
  if (!root || !item) throw new Error("AccordionContent must be used inside AccordionItem")

  const isOpen = root.expandedItems.includes(item.value)
  if (!isOpen) return null

  return (
    <div className={cn("px-4 pb-4 pt-1 text-sm text-slate-300 animate-in fade-in duration-150", className)}>
      {children}
    </div>
  )
}
