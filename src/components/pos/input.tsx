import * as React from "react"
import { cn } from "@/lib/utils"

export interface PosInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const PosInput = React.forwardRef<HTMLInputElement, PosInputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full bg-pos-background px-3 py-2 text-pos-base",
          "border-2 border-pos-border file:border-0 file:bg-transparent",
          "file:text-pos-base file:font-medium placeholder:text-pos-muted",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pos-border",
          "focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
PosInput.displayName = "PosInput"

export { PosInput }