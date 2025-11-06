"use client"

import { useEffect, useState } from "react"
import { collection, query, where, getDocs, limit } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/hooks/useAuth"
import { ClientLayout } from "@/components/layouts/ClientLayout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Project } from "@/types"
import { ExternalLink } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const requestSchema = z.object({
  comment: z.string().min(10, "Bitte geben Sie einen Kommentar mit mindestens 10 Zeichen ein"),
})

export default function DesignsPage() {
  const { user } = useAuth()
  const [project, setProject] = useState<Project | null>(null)
  const [showRequestModal, setShowRequestModal] = useState(false)
  const { register, handleSubmit, formState: { errors }, reset } = useForm<{ comment: string }>({
    resolver: zodResolver(requestSchema),
  })

  useEffect(() => {
    if (!user?.clientId) return

    const loadProject = async () => {
      try {
        const projectsQuery = query(
          collection(db, "projects"),
          where("clientId", "==", user.clientId),
          limit(1)
        )
        const projectsSnapshot = await getDocs(projectsQuery)
        if (!projectsSnapshot.empty) {
          const projectData = projectsSnapshot.docs[0].data()
          setProject({
            id: projectsSnapshot.docs[0].id,
            ...projectData,
            createdAt: projectData.createdAt?.toDate() || new Date(),
            updatedAt: projectData.updatedAt?.toDate() || new Date(),
          } as Project)
        }
      } catch (error) {
        console.error("Error loading project:", error)
      }
    }

    loadProject()
  }, [user])

  const onSubmit = async (data: { comment: string }) => {
    // Hier würde die Anfrage an Firestore gesendet werden
    console.log("Change request:", data.comment)
    setShowRequestModal(false)
    reset()
    alert("Änderungswunsch wurde gesendet!")
  }

  // Beispiel-Daten - sollten aus Firestore kommen
  const figmaUrl = project ? `https://www.figma.com/design/example/${project.id}` : null
  const stagingUrl = project ? `https://staging.example.com/${project.id}` : null

  return (
    <ClientLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Designs & Vorschau</h1>

        {figmaUrl && (
          <Card>
            <CardHeader>
              <CardTitle>Figma Design</CardTitle>
              <CardDescription>
                Aktuelle Design-Version im Figma-Embed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video rounded-lg border bg-muted flex items-center justify-center">
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Figma Embed würde hier angezeigt
                  </p>
                  <Button asChild variant="outline">
                    <a href={figmaUrl} target="_blank" rel="noopener noreferrer">
                      In Figma öffnen <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {stagingUrl && (
          <Card>
            <CardHeader>
              <CardTitle>Staging-Vorschau</CardTitle>
              <CardDescription>
                Aktuelle Version zum Testen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <a href={stagingUrl} target="_blank" rel="noopener noreferrer">
                  Staging öffnen <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Versionen</CardTitle>
            <CardDescription>
              Versionshistorie der Designs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Version 1.0</p>
                  <p className="text-sm text-muted-foreground">Aktuell</p>
                </div>
                <Button variant="outline" size="sm">Ansehen</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Änderungswunsch senden</CardTitle>
            <CardDescription>
              Haben Sie Feedback oder Wünsche für Änderungen? Lassen Sie es uns wissen!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setShowRequestModal(true)}>
              Änderungswunsch senden
            </Button>
          </CardContent>
        </Card>

        <Dialog open={showRequestModal} onOpenChange={setShowRequestModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Änderungswunsch senden</DialogTitle>
              <DialogDescription>
                Bitte beschreiben Sie Ihre gewünschten Änderungen im Detail.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <Label htmlFor="comment">Kommentar *</Label>
                  <Textarea
                    id="comment"
                    {...register("comment")}
                    placeholder="Beschreiben Sie Ihre Änderungswünsche..."
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
                    setShowRequestModal(false)
                    reset()
                  }}
                >
                  Abbrechen
                </Button>
                <Button type="submit">
                  Senden
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </ClientLayout>
  )
}
