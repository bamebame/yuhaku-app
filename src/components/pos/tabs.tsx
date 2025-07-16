"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cn } from "@/lib/utils"

const PosTabs = TabsPrimitive.Root

const PosTabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center justify-center border-2 border-pos-border bg-pos-background p-0",
      className
    )}
    {...props}
  />
))
PosTabsList.displayName = TabsPrimitive.List.displayName

const PosTabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap px-4 py-2",
      "text-pos-base font-medium ring-offset-background transition-all",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      "focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      "data-[state=active]:bg-pos-primary data-[state=active]:text-white data-[state=active]:border-pos-primary",
      "data-[state=inactive]:hover:bg-pos-hover",
      "border-r-2 border-pos-border last:border-r-0",
      className
    )}
    {...props}
  />
))
PosTabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const PosTabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "ring-offset-background focus-visible:outline-none focus-visible:ring-2",
      "focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
))
PosTabsContent.displayName = TabsPrimitive.Content.displayName

export { PosTabs, PosTabsList, PosTabsTrigger, PosTabsContent }
