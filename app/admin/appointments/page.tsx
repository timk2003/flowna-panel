"use client"

import { useEffect, useState } from "react"
import { collection, query, getDocs, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { AdminLayout } from "@/components/layouts/AdminLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Appointment } from "@/types"
import { format } from "date-fns"
import { de } from "date-fns/locale"
import { Calendar, Mail, Clock } from "lucide-react"

// Force dynamic rendering to avoid SSR issues with Firebase
export const dynamic = 'force-dynamic'

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadAppointments = async () => {
      try {
        const appointmentsQuery = query(
          collection(db, "appointments"),
          orderBy("when", "desc")
        )
        const appointmentsSnapshot = await getDocs(appointmentsQuery)
        const appointmentsData = appointmentsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          when: doc.data().when?.toDate() || new Date(),
        })) as Appointment[]
        setAppointments(appointmentsData)
      } catch (error) {
        console.error("Error loading appointments:", error)
      } finally {
        setLoading(false)
      }
    }

    loadAppointments()
  }, [])

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <p>Lädt Termine...</p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Termine</h1>

        <div className="grid gap-4">
          {appointments.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">
              Keine Termine gefunden
            </p>
          ) : (
            appointments.map((appointment) => (
              <Card key={appointment.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{appointment.topic}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {appointment.name}
                      </p>
                    </div>
                    <Badge variant="outline">{appointment.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{format(appointment.when, "PPP 'um' HH:mm", { locale: de })}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{appointment.duration} Minuten</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={`mailto:${appointment.email}`}
                        className="text-primary hover:underline"
                      >
                        {appointment.email}
                      </a>
                    </div>
                    {appointment.projectId && (
                      <p className="text-xs text-muted-foreground">
                        Projekt: {appointment.projectId}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
