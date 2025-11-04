"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { AdminLayout } from "@/components/layouts/AdminLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth, sendMagicLink } from "@/hooks/useAuth"
import { ArrowLeft, Mail, Copy, Check } from "lucide-react"
import Link from "next/link"
import { Client } from "@/types"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const schema = z.object({
  name: z.string().min(2, "Name muss mindestens 2 Zeichen lang sein"),
  contactEmail: z.string().email("Ungültige E-Mail-Adresse"),
  phone: z.string().optional(),
  notes: z.string().optional(),
})

export default function ClientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const clientId = params.id as string
  const { user } = useAuth()
  const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sendingInvite, setSendingInvite] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)

  const { register, handleSubmit, formState: { errors }, reset } = useForm<{
    name: string
    contactEmail: string
    phone?: string
    notes?: string
  }>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    const loadClient = async () => {
      try {
        const clientDoc = await getDoc(doc(db, "clients", clientId))
        if (clientDoc.exists()) {
          const clientData = clientDoc.data()
          const clientObj: Client = {
            id: clientDoc.id,
            name: clientData.name,
            contactEmail: clientData.contactEmail,
            phone: clientData.phone,
            notes: clientData.notes,
            createdAt: clientData.createdAt?.toDate() || new Date(),
          }
          setClient(clientObj)
          reset({
            name: clientObj.name,
            contactEmail: clientObj.contactEmail,
            phone: clientObj.phone || "",
            notes: clientObj.notes || "",
          })
        }
      } catch (error) {
        console.error("Error loading client:", error)
        setError("Fehler beim Laden des Kunden")
      } finally {
        setLoading(false)
      }
    }

    if (clientId) {
      loadClient()
    }
  }, [clientId, reset])

  const onSave = async (data: {
    name: string
    contactEmail: string
    phone?: string
    notes?: string
  }) => {
    if (!user || user.role !== "admin") {
      setError("Nur Admins können Kunden bearbeiten.")
      return
    }

    setSaving(true)
    setError(null)

    try {
      await updateDoc(doc(db, "clients", clientId), {
        name: data.name,
        contactEmail: data.contactEmail,
        phone: data.phone || null,
        notes: data.notes || null,
      })

      setClient((prev) => prev ? { ...prev, ...data } : null)
      alert("Kunde erfolgreich aktualisiert!")
    } catch (error) {
      console.error("Error updating client:", error)
      setError("Fehler beim Aktualisieren des Kunden.")
    } finally {
      setSaving(false)
    }
  }

  const handleSendInvite = async () => {
    if (!client) return

    setSendingInvite(true)
    try {
      await sendMagicLink(client.contactEmail, `${window.location.origin}/auth/callback?clientId=${clientId}`)
      alert("Einladungs-Link wurde per E-Mail gesendet!")
    } catch (error) {
      console.error("Error sending invite:", error)
      alert("Fehler beim Senden der Einladung. Bitte versuchen Sie es erneut.")
    } finally {
      setSendingInvite(false)
    }
  }

  const handleCopyPortalLink = () => {
    const portalLink = `${window.location.origin}/login?clientId=${clientId}`
    navigator.clipboard.writeText(portalLink)
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2000)
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

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <p>Lädt Kunde...</p>
        </div>
      </AdminLayout>
    )
  }

  if (!client) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <p>Kunde nicht gefunden</p>
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
            <h1 className="text-2xl font-bold">{client.name}</h1>
            <p className="text-muted-foreground mt-1">Kunde bearbeiten</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Kundendaten</CardTitle>
            <CardDescription>
              Bearbeiten Sie die Daten des Kunden
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSave)} className="space-y-4">
              <div>
                <Label htmlFor="name">Firmenname *</Label>
                <Input
                  id="name"
                  {...register("name")}
                  className="mt-2"
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
                />
              </div>

              <div>
                <Label htmlFor="notes">Notizen</Label>
                <Textarea
                  id="notes"
                  {...register("notes")}
                  className="mt-2"
                  rows={4}
                />
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
                <Button type="submit" disabled={saving}>
                  {saving ? "Wird gespeichert..." : "Speichern"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Einladung & Portal</CardTitle>
            <CardDescription>
              Laden Sie den Kunden ein oder kopieren Sie den Portal-Link
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Magic-Link Einladung</Label>
              <p className="text-sm text-muted-foreground mt-1 mb-2">
                Sendet einen Login-Link an {client.contactEmail}
              </p>
              <Button onClick={handleSendInvite} disabled={sendingInvite}>
                <Mail className="mr-2 h-4 w-4" />
                {sendingInvite ? "Wird gesendet..." : "Einladung senden"}
              </Button>
            </div>

            <div className="border-t pt-4">
              <Label>Portal-Link</Label>
              <p className="text-sm text-muted-foreground mt-1 mb-2">
                Direkter Link zum Kunden-Portal
              </p>
              <div className="flex gap-2">
                <Input
                  value={`${typeof window !== "undefined" ? window.location.origin : ""}/login?clientId=${clientId}`}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button variant="outline" onClick={handleCopyPortalLink}>
                  {linkCopied ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Kopiert!
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Kopieren
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
