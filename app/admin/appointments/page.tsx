"use client"

import { useEffect, useState } from "react"
import { collection, query, getDocs, orderBy, doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { AdminLayout } from "@/components/layouts/AdminLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Booking } from "@/types"
import { format } from "date-fns"
import { de } from "date-fns/locale"
import { Calendar, Phone, Clock, Mail, Edit, Save } from "lucide-react"

// Force dynamic rendering to avoid SSR issues with Firebase
export const dynamic = 'force-dynamic'

export default function AdminAppointmentsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)

  useEffect(() => {
    const loadBookings = async () => {
      try {
        const bookingsQuery = query(
          collection(db, "bookings"),
          orderBy("createdAt", "desc")
        )
        const bookingsSnapshot = await getDocs(bookingsQuery)
        const bookingsData = bookingsSnapshot.docs.map((doc) => {
          const data = doc.data()
          return {
            id: doc.id,
            type: data.type,
            contact: data.contact,
            date: data.date,
            time: data.time,
            duration: data.duration,
            status: data.status,
            description: data.description,
            notes: data.notes,
            createdAt: data.createdAt?.toDate() || new Date(),
          } as Booking
        })
        setBookings(bookingsData)
      } catch (error) {
        console.error("Error loading bookings:", error)
      } finally {
        setLoading(false)
      }
    }

    loadBookings()
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

  const formatBookingDateTime = (date: string, time: string) => {
    try {
      const dateObj = new Date(date + "T" + time)
      return format(dateObj, "PPP 'um' HH:mm", { locale: de })
    } catch {
      return `${date} um ${time}`
    }
  }

  const handleEdit = (booking: Booking) => {
    setEditingBooking(booking)
    setShowEditDialog(true)
  }

  const handleSaveEdit = async () => {
    if (!editingBooking) return

    try {
      await updateDoc(doc(db, "bookings", editingBooking.id), {
        status: editingBooking.status,
        notes: editingBooking.notes || null,
      })
      setBookings((prev) =>
        prev.map((b) => (b.id === editingBooking.id ? editingBooking : b))
      )
      setShowEditDialog(false)
      setEditingBooking(null)
    } catch (error) {
      console.error("Error updating booking:", error)
      alert("Fehler beim Aktualisieren des Termins.")
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Termine</h1>

        <div className="grid gap-4">
          {bookings.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">
              Keine Termine gefunden
            </p>
          ) : (
            bookings.map((booking) => (
              <Card key={booking.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>
                        {booking.description || "Terminanfrage"}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {booking.type === "phone" ? "Telefon" : "E-Mail"} Termin
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{booking.status}</Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(booking)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{formatBookingDateTime(booking.date, booking.time)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{booking.duration} Minuten</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      {booking.type === "phone" ? (
                        <>
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <a
                            href={`tel:${booking.contact}`}
                            className="text-primary hover:underline"
                          >
                            {booking.contact}
                          </a>
                        </>
                      ) : (
                        <>
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <a
                            href={`mailto:${booking.contact}`}
                            className="text-primary hover:underline"
                          >
                            {booking.contact}
                          </a>
                        </>
                      )}
                    </div>
                    {booking.notes && (
                      <div className="mt-3 p-3 bg-muted rounded-md">
                        <p className="text-sm font-medium mb-1">Notizen:</p>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{booking.notes}</p>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground pt-2">
                      Erstellt: {format(booking.createdAt, "PPP 'um' HH:mm", { locale: de })}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Termin bearbeiten</DialogTitle>
            </DialogHeader>
            {editingBooking && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    id="status"
                    value={editingBooking.status}
                    onChange={(e) =>
                      setEditingBooking({
                        ...editingBooking,
                        status: e.target.value,
                      })
                    }
                    className="mt-2"
                  >
                    <option value="pending">Ausstehend</option>
                    <option value="confirmed">Bestätigt</option>
                    <option value="completed">Abgeschlossen</option>
                    <option value="cancelled">Abgesagt</option>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="notes">Notizen</Label>
                  <Textarea
                    id="notes"
                    value={editingBooking.notes || ""}
                    onChange={(e) =>
                      setEditingBooking({
                        ...editingBooking,
                        notes: e.target.value,
                      })
                    }
                    className="mt-2 min-h-[120px]"
                    placeholder="Notizen zum Termin..."
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                    Abbrechen
                  </Button>
                  <Button onClick={handleSaveEdit}>
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
