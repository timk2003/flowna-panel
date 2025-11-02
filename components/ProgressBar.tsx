import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface ProgressBarProps {
  value: number
  className?: string
  showLabel?: boolean
}

export function ProgressBar({ value, className, showLabel = true }: ProgressBarProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {showLabel && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Fortschritt</span>
          <span className="font-medium">{value}%</span>
        </div>
      )}
      <Progress value={value} max={100} />
      {showLabel && (
        <p className="text-xs text-muted-foreground">
          {value} Prozent abgeschlossen
        </p>
      )}
    </div>
  )
}
