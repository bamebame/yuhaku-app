import * as React from "react"
import { cn } from "@/lib/utils"

const PosCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "bg-pos-background border-2 border-pos-border text-pos-foreground",
      className
    )}
    {...props}
  />
))
PosCard.displayName = "PosCard"

const PosCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-4 border-b-2 border-pos-border", className)}
    {...props}
  />
))
PosCardHeader.displayName = "PosCardHeader"

const PosCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-pos-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
PosCardTitle.displayName = "PosCardTitle"

const PosCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-pos-sm text-pos-muted", className)}
    {...props}
  />
))
PosCardDescription.displayName = "PosCardDescription"

const PosCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-4", className)} {...props} />
))
PosCardContent.displayName = "PosCardContent"

const PosCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-4 border-t-2 border-pos-border", className)}
    {...props}
  />
))
PosCardFooter.displayName = "PosCardFooter"

export { PosCard, PosCardHeader, PosCardFooter, PosCardTitle, PosCardDescription, PosCardContent }