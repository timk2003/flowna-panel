import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Approval, ApprovalStatus } from "@/types"
import { Check, X, Edit } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

interface ApprovalCardProps {
  approval: Approval
  onApprove: (id: string) => void
  onRequestChanges: (id: string, comment: string) => void
}

const changeSchema = z.object({
  comment: z.string().min(10, "Bitte geben Sie einen Kommentar mit mindestens 10 Zeichen ein"),
})

export function ApprovalCard({ approval, onApprove, onRequestChanges }: ApprovalCardProps) {
  const [showChangeModal, setShowChangeModal] = useState(false)
  const { register, handleSubmit, formState: { errors }, reset } = useForm<{ comment: string }>({
    resolver: zodResolver(changeSchema),
  })

  const statusColors: Record<ApprovalStatus, string> = {
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    approved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    changes: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  }

  const statusLabels: Record<ApprovalStatus, string> = {
    pending: "Ausstehend",
    approved: "Freigegeben",
    changes: "Änderungen gewünscht",
  }

  const onSubmit = (data: { comment: string }) => {
    onRequestChanges(approval.id, data.comment)
    setShowChangeModal(false)
    reset()
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{approval.itemTitle}</CardTitle>
            <Badge className={statusColors[approval.status]}>
              {statusLabels[approval.status]}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {approval.comment && (
            <p className="text-sm text-muted-foreground mb-4">
              {approval.comment}
            </p>
          )}
          {approval.status === "pending" && (
            <div className="flex gap-2">
              <Button
                onClick={() => onApprove(approval.id)}
                className="flex-1"
                variant="default"
              >
                <Check className="mr-2 h-4 w-4" />
                Freigeben
              </Button>
              <Button
                onClick={() => setShowChangeModal(true)}
                className="flex-1"
                variant="outline"
              >
                <Edit className="mr-2 h-4 w-4" />
                Änderungen
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showChangeModal} onOpenChange={setShowChangeModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Änderungen anfordern</DialogTitle>
            <DialogDescription>
              Bitte beschreiben Sie die gewünschten Änderungen für "{approval.itemTitle}".
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <Label htmlFor="comment">Kommentar *</Label>
                <Textarea
                  id="comment"
                  {...register("comment")}
                  placeholder="Beschreiben Sie die gewünschten Änderungen..."
                  className="mt-2 min-h-[160px]"
                />
                {errors.comment && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.comment.message}
                  </p>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowChangeModal(false)
                  reset()
                }}
              >
                Abbrechen
              </Button>
              <Button type="submit">
                Änderungen anfordern
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
