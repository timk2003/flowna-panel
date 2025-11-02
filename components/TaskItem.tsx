import { Task } from "@/types"
import { format, isPast, isToday } from "date-fns"
import { de } from "date-fns/locale"
import { Check } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface TaskItemProps {
  task: Task
  onToggle?: (taskId: string) => void
}

export function TaskItem({ task, onToggle }: TaskItemProps) {
  const isOverdue = task.dueAt && !task.done && isPast(task.dueAt) && !isToday(task.dueAt)

  return (
    <Card className={cn(
      task.done && "opacity-60",
      isOverdue && "border-destructive"
    )}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <button
            onClick={() => onToggle?.(task.id)}
            className={cn(
              "mt-0.5 flex h-5 w-5 items-center justify-center rounded border-2 transition-colors",
              task.done
                ? "border-primary bg-primary text-primary-foreground"
                : "border-muted-foreground/50"
            )}
          >
            {task.done && <Check className="h-3 w-3" />}
          </button>
          <div className="flex-1">
            <p className={cn(
              "font-medium",
              task.done && "line-through text-muted-foreground"
            )}>
              {task.title}
            </p>
            {task.dueAt && (
              <div className="mt-2 flex items-center gap-2">
                <Badge
                  variant={isOverdue ? "destructive" : isToday(task.dueAt) ? "default" : "outline"}
                  className="text-xs"
                >
                  {isOverdue && "Überfällig: "}
                  Fällig: {format(task.dueAt, "PPP", { locale: de })}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
