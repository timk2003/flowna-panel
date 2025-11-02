import { Message } from "@/types"
import { format } from "date-fns"
import { de } from "date-fns/locale"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface MessageBubbleProps {
  message: Message
  senderName: string
  senderAvatar?: string
  isOwnMessage: boolean
}

export function MessageBubble({ 
  message, 
  senderName, 
  senderAvatar,
  isOwnMessage 
}: MessageBubbleProps) {
  return (
    <div className={cn(
      "flex gap-3",
      isOwnMessage && "flex-row-reverse"
    )}>
      {senderAvatar ? (
        <img
          src={senderAvatar}
          alt={senderName}
          className="h-8 w-8 rounded-full"
        />
      ) : (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
          {senderName.charAt(0).toUpperCase()}
        </div>
      )}
      <div className={cn(
        "flex flex-col gap-1",
        isOwnMessage ? "items-end" : "items-start"
      )}>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium">{senderName}</span>
          <span className="text-xs text-muted-foreground">
            {format(message.createdAt, "HH:mm", { locale: de })}
          </span>
        </div>
        <Card className={cn(
          "max-w-[80%]",
          isOwnMessage && "bg-primary text-primary-foreground"
        )}>
          <CardContent className="p-3">
            <p className="text-sm whitespace-pre-wrap">{message.text}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
