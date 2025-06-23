import { cn } from "@/lib/utils"

interface PosLayoutProps {
  children: React.ReactNode
  className?: string
}

export function PosLayout({ children, className }: PosLayoutProps) {
  return (
    <div className={cn("h-screen flex flex-col bg-pos-background", className)}>
      {children}
    </div>
  )
}

interface PosHeaderProps {
  children: React.ReactNode
  className?: string
}

export function PosHeader({ children, className }: PosHeaderProps) {
  return (
    <header
      className={cn(
        "border-b-3 border-pos-border bg-pos-background",
        className
      )}
    >
      {children}
    </header>
  )
}

interface PosTwoColumnLayoutProps {
  left: React.ReactNode
  right: React.ReactNode
  leftClassName?: string
  rightClassName?: string
  className?: string
}

export function PosTwoColumnLayout({
  left,
  right,
  leftClassName,
  rightClassName,
  className,
}: PosTwoColumnLayoutProps) {
  return (
    <div className={cn("flex h-full overflow-hidden", className)}>
      <div
        className={cn(
          "flex-1 border-r-3 border-pos-border overflow-hidden",
          leftClassName
        )}
      >
        {left}
      </div>
      <div
        className={cn(
          "w-96 flex flex-col bg-pos-light overflow-hidden",
          rightClassName
        )}
      >
        {right}
      </div>
    </div>
  )
}

interface PosMainProps {
  children: React.ReactNode
  className?: string
}

export function PosMain({ children, className }: PosMainProps) {
  return (
    <main className={cn("flex-1 overflow-hidden", className)}>
      {children}
    </main>
  )
}