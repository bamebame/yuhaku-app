import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const posBadgeVariants = cva(
  "inline-flex items-center border-2 px-2.5 py-0.5 text-pos-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-pos-primary bg-pos-primary text-white",
        secondary:
          "border-pos-border bg-pos-background text-pos-foreground",
        destructive:
          "border-destructive bg-destructive text-destructive-foreground",
        outline: "text-pos-foreground border-pos-border",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface PosBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof posBadgeVariants> {}

function PosBadge({ className, variant, ...props }: PosBadgeProps) {
  return (
    <div className={cn(posBadgeVariants({ variant }), className)} {...props} />
  )
}

export { PosBadge, posBadgeVariants }