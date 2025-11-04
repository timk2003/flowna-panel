"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { collection, addDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { AdminLayout } from "@/components/layouts/AdminLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/hooks/useAuth"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

const schema = z.object({
  name: z.string().min(2, "Name muss mindestens 2 Zeichen lang sein"),
  contactEmail: z.string().email("Ungültige E-Mail-Adresse"),
  phone: z.string().optional(),
  notes: z.string().optional(),
})

export default function NewClientPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { register, handleSubmit, formState: { errors } } = useForm<{
    name: string
    contactEmail: string
    phone?: string
    notes?: string
  }>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: {
    name: string
    contactEmail: string
    phone?: string
    notes?: string
  }) => {
    if (!user || user.role !== "admin") {
      setError("Nur Admins können neue Kunden erstellen.")
      return
    }

    setLoading(true)
    setError(null)

    try {
      await addDoc(collection(db, "clients"), {
        name: data.name,
        contactEmail: data.contactEmail,
        phone: data.phone || null,
        notes: data.notes || null,
        createdAt: new Date(),
      })

      router.push("/admin/clients")
    } catch (error: any) {
      console.error("Error creating client:", error)
      setError("Fehler beim Erstellen des Kunden. Bitte versuchen Sie es erneut.")
    } finally {
      setLoading(false)
    }
  }

  if (!user || user.role !== "admin") {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <p>Zugriff verweigert</p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/clients">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Neuer Kunde</h1>
            <p className="text-muted-foreground mt-1">
              Erstellen Sie einen neuen Kunden
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Kundendaten</CardTitle>
            <CardDescription>
              Geben Sie die Daten für den neuen Kunden ein.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="name">Firmenname *</Label>
                <Input
                  id="name"
                  {...register("name")}
                  className="mt-2"
                  placeholder="Firma GmbH"
                />
                {errors.name && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="contactEmail">Kontakt-E-Mail *</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  {...register("contactEmail")}
                  className="mt-2"
                  placeholder="kontakt@firma.de"
                />
                {errors.contactEmail && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.contactEmail.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="phone">Telefon</Label>
                <Input
                  id="phone"
                  type="tel"
                  {...register("phone")}
                  className="mt-2"
                  placeholder="+49 123 456789"
                />
                {errors.phone && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="notes">Notizen</Label>
                <Textarea
                  id="notes"
                  {...register("notes")}
                  className="mt-2"
                  placeholder="Zusätzliche Informationen zum Kunden..."
                  rows={4}
                />
                {errors.notes && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.notes.message}
                  </p>
                )}
              </div>

              {error && (
                <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Abbrechen
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Wird erstellt..." : "Kunde erstellen"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
