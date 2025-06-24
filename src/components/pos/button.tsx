import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const posButtonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-pos-primary !text-white border-2 border-pos-border hover:bg-pos-primary-dark hover:!text-white disabled:bg-pos-muted disabled:!text-white",
        secondary: "bg-pos-background text-black border-2 border-pos-border hover:bg-pos-hover disabled:bg-pos-light disabled:text-pos-muted",
        ghost: "hover:bg-pos-hover hover:text-black",
        destructive: "bg-destructive text-destructive-foreground border-2 border-destructive hover:bg-destructive/90",
        outline: "border-2 border-pos-border bg-transparent hover:bg-pos-hover",
        link: "text-black underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2 text-pos-base",
        sm: "h-8 px-3 text-pos-sm",
        lg: "h-12 px-6 text-pos-lg",
        xl: "h-14 px-8 text-pos-xl",
        icon: "h-10 w-10",
      },
      rounded: {
        none: "rounded-pos",
        sm: "rounded-sm",
        md: "rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      rounded: "none",
    },
  }
)

export interface PosButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof posButtonVariants> {
  asChild?: boolean
}

const PosButton = React.forwardRef<HTMLButtonElement, PosButtonProps>(
  ({ className, variant, size, rounded, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(posButtonVariants({ variant, size, rounded, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
PosButton.displayName = "PosButton"

export { PosButton, posButtonVariants }
