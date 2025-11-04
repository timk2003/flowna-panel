"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { collection, addDoc, query, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { AdminLayout } from "@/components/layouts/AdminLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/hooks/useAuth"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { ProjectType } from "@/types"
import { Client } from "@/types"

const schema = z.object({
  title: z.string().min(3, "Titel muss mindestens 3 Zeichen lang sein"),
  type: z.enum(["Website", "Branding", "Shopify", "App", "Other"]),
  clientId: z.string().min(1, "Bitte wählen Sie einen Kunden"),
  budgetRange: z.string().optional(),
  goals: z.string().optional(),
})

export default function NewProjectPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [clients, setClients] = useState<Client[]>([])

  const { register, handleSubmit, formState: { errors }, watch } = useForm<{
    title: string
    type: ProjectType
    clientId: string
    budgetRange?: string
    goals?: string
  }>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    const loadClients = async () => {
      try {
        const clientsQuery = query(collection(db, "clients"))
        const clientsSnapshot = await getDocs(clientsQuery)
        const clientsData = clientsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        })) as Client[]
        setClients(clientsData)
      } catch (error) {
        console.error("Error loading clients:", error)
      }
    }

    loadClients()
  }, [])

  const onSubmit = async (data: {
    title: string
    type: ProjectType
    clientId: string
    budgetRange?: string
    goals?: string
  }) => {
    if (!user || user.role !== "admin") {
      setError("Nur Admins können neue Projekte erstellen.")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const goalsArray = data.goals
        ? data.goals.split("\n").filter((g) => g.trim().length > 0)
        : []

      await addDoc(collection(db, "projects"), {
        title: data.title,
        type: data.type,
        clientId: data.clientId,
        status: "Planning",
        progress: 0,
        ownerId: user.id,
        budgetRange: data.budgetRange || null,
        goals: goalsArray,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      router.push("/admin")
    } catch (error: any) {
      console.error("Error creating project:", error)
      setError("Fehler beim Erstellen des Projekts. Bitte versuchen Sie es erneut.")
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
            <Link href="/admin">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Neues Projekt</h1>
            <p className="text-muted-foreground mt-1">
              Erstellen Sie ein neues Projekt
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Projektdaten</CardTitle>
            <CardDescription>
              Geben Sie die Daten für das neue Projekt ein.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="title">Projektname *</Label>
                <Input
                  id="title"
                  {...register("title")}
                  className="mt-2"
                  placeholder="Neue Website"
                />
                {errors.title && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="clientId">Kunde *</Label>
                <Select
                  id="clientId"
                  {...register("clientId")}
                  className="mt-2"
                >
                  <option value="">Bitte wählen...</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </Select>
                {errors.clientId && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.clientId.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="type">Typ *</Label>
                <Select
                  id="type"
                  {...register("type")}
                  className="mt-2"
                >
                  <option value="Website">Website</option>
                  <option value="Branding">Branding</option>
                  <option value="Shopify">Shopify</option>
                  <option value="App">App</option>
                  <option value="Other">Anderes</option>
                </Select>
                {errors.type && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.type.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="budgetRange">Budgetrahmen</Label>
                <Input
                  id="budgetRange"
                  {...register("budgetRange")}
                  className="mt-2"
                  placeholder="z.B. 5.000 - 10.000 €"
                />
              </div>

              <div>
                <Label htmlFor="goals">Ziele (eine pro Zeile)</Label>
                <Textarea
                  id="goals"
                  {...register("goals")}
                  className="mt-2"
                  placeholder="Ziel 1&#10;Ziel 2&#10;Ziel 3"
                  rows={4}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Jede Zeile wird als separates Ziel gespeichert
                </p>
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
                  {loading ? "Wird erstellt..." : "Projekt erstellen"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
