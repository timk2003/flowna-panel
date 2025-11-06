"use client"

import { AdminLayout } from "@/components/layouts/AdminLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProgressBar } from "@/components/ProgressBar"
import { TrendingUp, Calendar, Clock } from "lucide-react"
import { useEffect, useState } from "react"
import { db } from "@/lib/firebase"
import { collection, getDocs } from "firebase/firestore"
import { Project } from "@/types"

export default function AdminReportsPage() {
  const [stats, setStats] = useState({
    activeProjects: 0,
    totalProjects: 0,
    averageDuration: 0,
    completionRate: 0,
  })

  useEffect(() => {
    const load = async () => {
      const snap = await getDocs(collection(db, "projects"))
      const projects = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as any[]

      const totalProjects = projects.length
      const activeProjects = projects.filter((p) => p.status !== "Done").length

      // Durchschnittliche Dauer in Tagen basierend auf createdAt/updatedAt
      const durations: number[] = projects
        .map((p) => {
          const created = p.createdAt?.toDate ? p.createdAt.toDate() : p.createdAt
          const updated = p.updatedAt?.toDate ? p.updatedAt.toDate() : p.updatedAt
          if (!created || !updated) return null
          const ms = Math.max(0, new Date(updated).getTime() - new Date(created).getTime())
          return ms / (1000 * 60 * 60 * 24)
        })
        .filter((v): v is number => typeof v === "number")
      const averageDuration = durations.length
        ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
        : 0

      // Completion-Rate als Durchschnitt des Fortschritts
      const progresses: number[] = projects
        .map((p) => typeof p.progress === "number" ? p.progress : 0)
      const completionRate = progresses.length
        ? Math.round(progresses.reduce((a, b) => a + b, 0) / progresses.length)
        : 0

      setStats({ totalProjects, activeProjects, averageDuration, completionRate })
    }
    load()
  }, [])

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Berichte</h1>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Laufende Projekte
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <p className="text-2xl font-bold">{stats.activeProjects}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Gesamt Projekte
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <p className="text-2xl font-bold">{stats.totalProjects}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Durchschnittliche Dauer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <p className="text-2xl font-bold">{stats.averageDuration}</p>
                <span className="text-sm text-muted-foreground">Tage</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Abschlussrate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-2xl font-bold">{stats.completionRate}%</p>
                <ProgressBar value={stats.completionRate} showLabel={false} />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Projekt-Übersicht</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Detaillierte Projekt-Statistiken und Auslastungsdiagramme würden hier angezeigt werden.
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
