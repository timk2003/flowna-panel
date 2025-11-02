import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { UpdateKind, ProjectUpdate } from "@/types"
import { format } from "date-fns"
import { de } from "date-fns/locale"
import { 
  Flag, 
  FileText, 
  Package, 
  MessageSquare 
} from "lucide-react"

interface TimelineItemProps {
  update: ProjectUpdate
  userName?: string
}

const kindIcons = {
  milestone: Flag,
  note: FileText,
  delivery: Package,
  request: MessageSquare,
}

const kindLabels: Record<UpdateKind, string> = {
  milestone: "Meilenstein",
  note: "Notiz",
  delivery: "Lieferung",
  request: "Anfrage",
}

const kindColors: Record<UpdateKind, string> = {
  milestone: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  note: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  delivery: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  request: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
}

export function TimelineItem({ update, userName }: TimelineItemProps) {
  const Icon = kindIcons[update.kind]

  return (
    <Card className="relative">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-muted p-2">
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-base">{update.title}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={kindColors[update.kind]}>
                  {kindLabels[update.kind]}
                </Badge>
                {update.pinned && (
                  <Badge variant="outline">Angepinnt</Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
          {update.body}
        </p>
        <div className="mt-4 text-xs text-muted-foreground">
          {userName && <span>{userName} • </span>}
          {format(update.createdAt, "PPP 'um' HH:mm", { locale: de })}
        </div>
      </CardContent>
    </Card>
  )
}
