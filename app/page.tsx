"use client"

import { useEffect, useState } from "react"
import { collection, query, where, getDocs, limit, doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/hooks/useAuth"
import { ClientLayout } from "@/components/layouts/ClientLayout"
import { StatusBadge } from "@/components/StatusBadge"
import { ProgressBar } from "@/components/ProgressBar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Project, Task, ProjectUpdate, Appointment } from "@/types"
import { format } from "date-fns"
import { de } from "date-fns/locale"
import { Calendar, CheckCircle2, Clock } from "lucide-react"

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const [project, setProject] = useState<Project | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [updates, setUpdates] = useState<ProjectUpdate[]>([])
  const [appointment, setAppointment] = useState<Appointment | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Warte auf Auth-Loading
    if (authLoading) return
    if (!user?.clientId) return

    const loadData = async () => {
      try {
        // Sicherstellen, dass das User-Dokument existiert (Regelabhängigkeit)
        const userDoc = await getDoc(doc(db, "users", user.id))
        if (!userDoc.exists()) {
          // User-Dokument noch nicht erstellt → später erneut versuchen
          return
        }
        // Projekt laden
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

          const projectId = projectsSnapshot.docs[0].id

          // Aufgaben laden
          const tasksQuery = query(
            collection(db, "tasks"),
            where("projectId", "==", projectId),
            where("for", "==", "client"),
            where("done", "==", false),
            limit(7)
          )
          const tasksSnapshot = await getDocs(tasksQuery)
          setTasks(
            tasksSnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
              createdAt: doc.data().createdAt?.toDate() || new Date(),
              dueAt: doc.data().dueAt?.toDate(),
            })) as Task[]
          )

          // Letztes Update laden
          const updatesQuery = query(
            collection(db, "projectUpdates"),
            where("projectId", "==", projectId),
            limit(1)
          )
          const updatesSnapshot = await getDocs(updatesQuery)
          if (!updatesSnapshot.empty) {
            const updateData = updatesSnapshot.docs[0].data()
            setUpdates([{
              id: updatesSnapshot.docs[0].id,
              ...updateData,
              createdAt: updateData.createdAt?.toDate() || new Date(),
            } as ProjectUpdate])
          }

          // Nächsten Termin laden (falls vorhanden)
          // appointments collection
        }
      } catch (error) {
        console.error("Error loading dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user])

  if (loading) {
    return (
      <ClientLayout>
        <div className="flex items-center justify-center py-12">
          <p>Lädt Dashboard...</p>
        </div>
      </ClientLayout>
    )
  }

  if (!project) {
    return (
      <ClientLayout>
        <div className="flex items-center justify-center py-12">
          <p>Kein Projekt gefunden.</p>
        </div>
      </ClientLayout>
    )
  }

  return (
    <ClientLayout>
      <div className="space-y-6">
        {/* Projekt-Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">{project.title}</CardTitle>
                <CardDescription className="mt-1">{project.type}</CardDescription>
              </div>
              <StatusBadge status={project.status} />
            </div>
          </CardHeader>
          <CardContent>
            <ProgressBar value={project.progress} />
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Nächste Schritte */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                Nächste Schritte
              </CardTitle>
            </CardHeader>
            <CardContent>
              {tasks.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Keine offenen Aufgaben
                </p>
              ) : (
                <ul className="space-y-2">
                  {tasks.slice(0, 5).map((task) => (
                    <li key={task.id} className="flex items-center gap-2 text-sm">
                      <div className="h-2 w-2 rounded-full bg-muted-foreground" />
                      <span>{task.title}</span>
                      {task.dueAt && (
                        <span className="ml-auto text-xs text-muted-foreground">
                          {format(task.dueAt, "PP", { locale: de })}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Nächste Termine & Updates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Aktivitäten
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {appointment && (
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Termin: {appointment.topic}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(appointment.when, "PPP 'um' HH:mm", { locale: de })}
                      </p>
                    </div>
                  </div>
                )}
                {updates[0] && (
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{updates[0].title}</p>
                      <p className="text-xs text-muted-foreground">
                        Letztes Update: {format(updates[0].createdAt, "PPP", { locale: de })}
                      </p>
                    </div>
                  </div>
                )}
                {!appointment && !updates[0] && (
                  <p className="text-sm text-muted-foreground">
                    Keine aktuellen Aktivitäten
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ClientLayout>
  )
}