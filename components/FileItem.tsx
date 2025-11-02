import { File } from "@/types"
import { format } from "date-fns"
import { de } from "date-fns/locale"
import { 
  FileIcon, 
  Image as ImageIcon, 
  FileText, 
  Download,
  Eye 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface FileItemProps {
  file: File
  onDownload?: (file: File) => void
  onPreview?: (file: File) => void
}

const getFileIcon = (contentType: string) => {
  if (contentType.startsWith("image/")) return ImageIcon
  if (contentType.includes("pdf") || contentType.includes("document")) return FileText
  return FileIcon
}

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + " B"
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
  return (bytes / (1024 * 1024)).toFixed(1) + " MB"
}

export function FileItem({ file, onDownload, onPreview }: FileItemProps) {
  const Icon = getFileIcon(file.contentType)

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="rounded-lg bg-muted p-3">
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{file.label}</p>
            <p className="text-sm text-muted-foreground">
              {formatFileSize(file.size)} • {format(file.createdAt, "PPP", { locale: de })}
            </p>
          </div>
          <div className="flex gap-2">
            {onPreview && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onPreview(file)}
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
            {onDownload && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDownload(file)}
              >
                <Download className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
