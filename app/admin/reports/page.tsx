"use client"

import { AdminLayout } from "@/components/layouts/AdminLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProgressBar } from "@/components/ProgressBar"
import { TrendingUp, Calendar, Clock } from "lucide-react"

export default function AdminReportsPage() {
  // Beispiel-Daten - sollten aus Firestore kommen
  const stats = {
    activeProjects: 12,
    totalProjects: 45,
    averageDuration: 42, // Tage
    completionRate: 78,
  }

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
