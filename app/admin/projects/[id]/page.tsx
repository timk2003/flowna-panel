"use client"

import { useEffect, useState } from "react"
import { doc, getDoc, collection, query, where, getDocs, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useParams, useRouter } from "next/navigation"
import { AdminLayout } from "@/components/layouts/AdminLayout"
import { StatusBadge } from "@/components/StatusBadge"
import { ProgressBar } from "@/components/ProgressBar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Project, ProjectStatus, ProjectType } from "@/types"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const loadProject = async () => {
      try {
        const projectDoc = await getDoc(doc(db, "projects", projectId))
        if (projectDoc.exists()) {
          const projectData = projectDoc.data()
          setProject({
            id: projectDoc.id,
            ...projectData,
            createdAt: projectData.createdAt?.toDate() || new Date(),
            updatedAt: projectData.updatedAt?.toDate() || new Date(),
          } as Project)
        }
      } catch (error) {
        console.error("Error loading project:", error)
      } finally {
        setLoading(false)
      }
    }

    if (projectId) {
      loadProject()
    }
  }, [projectId])

  const handleSave = async () => {
    if (!project) return

    setSaving(true)
    try {
      await updateDoc(doc(db, "projects", projectId), {
        title: project.title,
        status: project.status,
        progress: project.progress,
        updatedAt: new Date(),
      })
      alert("Projekt gespeichert!")
    } catch (error) {
      console.error("Error saving project:", error)
      alert("Fehler beim Speichern. Bitte versuchen Sie es erneut.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <p>Lädt Projekt...</p>
        </div>
      </AdminLayout>
    )
  }

  if (!project) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <p>Projekt nicht gefunden</p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Projekt-Detail</h1>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Projektdaten</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Titel</Label>
                  <Input
                    id="title"
                    value={project.title}
                    onChange={(e) =>
                      setProject({ ...project, title: e.target.value })
                    }
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="type">Typ</Label>
                  <Select
                    id="type"
                    value={project.type}
                    onChange={(e) =>
                      setProject({ ...project, type: e.target.value as ProjectType })
                    }
                    className="mt-2"
                  >
                    <option value="Website">Website</option>
                    <option value="Branding">Branding</option>
                    <option value="Shopify">Shopify</option>
                    <option value="App">App</option>
                    <option value="Other">Anderes</option>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    id="status"
                    value={project.status}
                    onChange={(e) =>
                      setProject({
                        ...project,
                        status: e.target.value as ProjectStatus,
                      })
                    }
                    className="mt-2"
                  >
                    <option value="Planning">Planung</option>
                    <option value="Design">Design</option>
                    <option value="Build">Umsetzung</option>
                    <option value="Review">Review</option>
                    <option value="Done">Abgeschlossen</option>
                    <option value="OnHold">Pausiert</option>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="progress">Fortschritt: {project.progress}%</Label>
                  <input
                    id="progress"
                    type="range"
                    min="0"
                    max="100"
                    value={project.progress}
                    onChange={(e) =>
                      setProject({
                        ...project,
                        progress: parseInt(e.target.value),
                      })
                    }
                    className="mt-2 w-full"
                  />
                  <ProgressBar value={project.progress} className="mt-2" />
                </div>
                <Button onClick={handleSave} disabled={saving}>
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? "Wird gespeichert..." : "Speichern"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tabs</CardTitle>
                <CardDescription>
                  Timeline, Freigaben, Dateien, Aufgaben, Nachrichten
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Die Detail-Tabs (Timeline, Freigaben, etc.) würden hier angezeigt werden.
                  Diese können als separate Komponenten oder Tabs implementiert werden.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Projektinfo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <div className="mt-1">
                    <StatusBadge status={project.status} />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Typ</p>
                  <p className="mt-1">{project.type}</p>
                </div>
                {project.budgetRange && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Budgetrahmen
                    </p>
                    <p className="mt-1">{project.budgetRange}</p>
                  </div>
                )}
                {project.goals && project.goals.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Ziele</p>
                    <ul className="mt-1 list-disc list-inside space-y-1">
                      {project.goals.map((goal, idx) => (
                        <li key={idx} className="text-sm">
                          {goal}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
