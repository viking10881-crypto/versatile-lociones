"use client"

import { Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function QuantityStepper({
  value,
  max,
  onChange,
  size = "default",
  label,
  className,
}: {
  value: number
  max: number
  onChange: (value: number) => void
  size?: "default" | "sm"
  label: string
  className?: string
}) {
  const buttonSize = size === "sm" ? "icon-sm" : "icon-lg"
  return (
    <div
      role="group"
      aria-label={label}
      className={cn("inline-flex items-center rounded-full border border-border", className)}
    >
      <Button
        type="button"
        variant="ghost"
        size={buttonSize}
        className="rounded-full"
        onClick={() => onChange(value - 1)}
        disabled={value <= 1}
        aria-label="Quitar una unidad"
      >
        <Minus />
      </Button>
      <span
        aria-live="polite"
        className={cn("text-center tabular-nums", size === "sm" ? "w-6 text-sm" : "w-10")}
      >
        {value}
      </span>
      <Button
        type="button"
        variant="ghost"
        size={buttonSize}
        className="rounded-full"
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label="Agregar una unidad"
      >
        <Plus />
      </Button>
    </div>
  )
}
