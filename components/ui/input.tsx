import * as React from "react"

import { cn } from "@/lib/utils"

// Tipos que não devem ser convertidos para maiúsculas (senha, email, número, data etc.)
const TIPOS_SEM_MAIUSCULA = new Set([
  "password",
  "email",
  "number",
  "date",
  "time",
  "datetime-local",
  "month",
  "week",
  "color",
  "file",
  "range",
  "checkbox",
  "radio",
  "hidden",
])

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, onChange, ...props }, ref) => {
    const maiusculo = !TIPOS_SEM_MAIUSCULA.has(type ?? "text")

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (maiusculo) {
        const { selectionStart, selectionEnd } = e.target
        e.target.value = e.target.value.toUpperCase()
        e.target.setSelectionRange(selectionStart, selectionEnd)
      }
      onChange?.(e)
    }

    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        onChange={handleChange}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
