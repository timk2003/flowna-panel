"use client"

import { useEffect, useState } from "react"
import { collection, query, getDocs, orderBy, doc, getDoc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { AdminLayout } from "@/components/layouts/AdminLayout"
import { StatusBadge } from "@/components/StatusBadge"
import { ProgressBar } from "@/components/ProgressBar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Project, ProjectStatus, Client } from "@/types"
import { format } from "date-fns"
import { de } from "date-fns/locale"
import { Plus, Search, MoreVertical, Edit, Save } from "lucide-react"
import Link from "next/link"

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<(Project & { clientName?: string })[]>([])
  const [filteredProjects, setFilteredProjects] = useState<(Project & { clientName?: string })[]>([])
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "all">("all")
  const [loading, setLoading] = useState(true)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const projectsQuery = query(
          collection(db, "projects"),
          orderBy("updatedAt", "desc")
        )
        const projectsSnapshot = await getDocs(projectsQuery)
        const projectsData = await Promise.all(
          projectsSnapshot.docs.map(async (projectDoc) => {
            const data = projectDoc.data()
            let clientName = ""
            if (data.clientId) {
              try {
                const clientDoc = await getDoc(doc(db, "clients", data.clientId))
                if (clientDoc.exists()) {
                  clientName = clientDoc.data().name
                }
              } catch {
                // Client nicht gefunden
              }
            }
            return {
              id: projectDoc.id,
              ...data,
              clientName,
              createdAt: data.createdAt?.toDate() || new Date(),
              updatedAt: data.updatedAt?.toDate() || new Date(),
            } as Project & { clientName?: string }
          })
        )
        setProjects(projectsData)
        setFilteredProjects(projectsData)
      } catch (error) {
        console.error("Error loading projects:", error)
      } finally {
        setLoading(false)
      }
    }

    loadProjects()
  }, [])

  useEffect(() => {
    let filtered = projects

    if (search) {
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(search.toLowerCase()) ||
          p.clientName?.toLowerCase().includes(search.toLowerCase()) ||
          p.clientId.toLowerCase().includes(search.toLowerCase())
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((p) => p.status === statusFilter)
    }

    setFilteredProjects(filtered)
  }, [search, statusFilter, projects])

  const handleQuickEdit = (project: Project) => {
    setEditingProject(project)
    setShowEditDialog(true)
  }

  const handleSaveQuickEdit = async () => {
    if (!editingProject) return

    try {
      await updateDoc(doc(db, "projects", editingProject.id), {
        status: editingProject.status,
        progress: editingProject.progress,
        updatedAt: new Date(),
      })
      setProjects((prev) =>
        prev.map((p) => (p.id === editingProject.id ? { ...p, ...editingProject } : p))
      )
      setShowEditDialog(false)
      setEditingProject(null)
    } catch (error) {
      console.error("Error updating project:", error)
      alert("Fehler beim Aktualisieren des Projekts.")
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <p>Lädt Projekte...</p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold">Projekte</h1>
          <Button asChild>
            <Link href="/admin/projects/new">
              <Plus className="mr-2 h-4 w-4" />
              Neues Projekt
            </Link>
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Projekte durchsuchen..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ProjectStatus | "all")}
            className="sm:w-48"
          >
            <option value="all">Alle Status</option>
            <option value="Planning">Planung</option>
            <option value="Design">Design</option>
            <option value="Build">Umsetzung</option>
            <option value="Review">Review</option>
            <option value="Done">Abgeschlossen</option>
            <option value="OnHold">Pausiert</option>
          </Select>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.length === 0 ? (
            <p className="col-span-full text-center text-muted-foreground py-12">
              Keine Projekte gefunden
            </p>
          ) : (
            filteredProjects.map((project) => (
              <Card key={project.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Link href={`/admin/projects/${project.id}`}>
                        <CardTitle className="text-lg hover:text-primary cursor-pointer">
                          {project.title}
                        </CardTitle>
                      </Link>
                      <p className="text-sm text-muted-foreground mt-1">{project.type}</p>
                      {project.clientName && (
                        <p className="text-xs text-muted-foreground mt-1">{project.clientName}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={project.status} />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleQuickEdit(project)
                        }}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ProgressBar value={project.progress} />
                  <p className="text-xs text-muted-foreground mt-2">
                    Zuletzt aktualisiert: {format(project.updatedAt, "PPP", { locale: de })}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Projekt schnell bearbeiten</DialogTitle>
            </DialogHeader>
            {editingProject && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="quick-status">Status</Label>
                  <Select
                    id="quick-status"
                    value={editingProject.status}
                    onChange={(e) =>
                      setEditingProject({
                        ...editingProject,
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
                  <Label htmlFor="quick-progress">Fortschritt: {editingProject.progress}%</Label>
                  <input
                    id="quick-progress"
                    type="range"
                    min="0"
                    max="100"
                    value={editingProject.progress}
                    onChange={(e) =>
                      setEditingProject({
                        ...editingProject,
                        progress: parseInt(e.target.value),
                      })
                    }
                    className="mt-2 w-full"
                  />
                  <ProgressBar value={editingProject.progress} className="mt-2" />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                    Abbrechen
                  </Button>
                  <Button onClick={handleSaveQuickEdit}>
                    <Save className="mr-2 h-4 w-4" />
                    Speichern
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  )
}
