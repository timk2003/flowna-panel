import { Badge } from "@/components/ui/badge"
import { ProjectStatus } from "@/types"

interface StatusBadgeProps {
  status: ProjectStatus
}

const statusColors: Record<ProjectStatus, string> = {
  Planning: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  Design: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  Build: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  Review: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  Done: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  OnHold: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
}

const statusLabels: Record<ProjectStatus, string> = {
  Planning: "Planung",
  Design: "Design",
  Build: "Umsetzung",
  Review: "Review",
  Done: "Abgeschlossen",
  OnHold: "Pausiert",
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <Badge className={statusColors[status]}>
      {statusLabels[status]}
    </Badge>
  )
}
