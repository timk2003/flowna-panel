"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { doc, setDoc, collection, query, getDocs } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { AdminLayout } from "@/components/layouts/AdminLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/hooks/useAuth"
import { Client } from "@/types"

const schema = z.object({
  name: z.string().min(2, "Name muss mindestens 2 Zeichen lang sein"),
  email: z.string().email("Ungültige E-Mail-Adresse"),
  password: z.string().min(6, "Passwort muss mindestens 6 Zeichen lang sein"),
  role: z.enum(["admin", "client"]),
  clientId: z.string().optional(),
}).refine((data) => {
  if (data.role === "client") {
    return !!data.clientId && data.clientId.length > 0
  }
  return true
}, {
  message: "Bitte wählen Sie einen Kunden aus",
  path: ["clientId"],
})

export default function NewUserPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const { register, handleSubmit, formState: { errors }, watch } = useForm<{
    name: string
    email: string
    password: string
    role: "admin" | "client"
    clientId?: string
  }>({
    resolver: zodResolver(schema),
    defaultValues: {
      role: "admin",
    },
  })

  const role = watch("role")

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
    name: string
    email: string
    password: string
    role: "admin" | "client"
    clientId?: string
  }) => {
    if (!user || user.role !== "admin") {
      setError("Nur Admins können neue Benutzer erstellen.")
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      // Firebase Auth User erstellen
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      )

      // Firestore User-Dokument erstellen
      await setDoc(doc(db, "users", userCredential.user.uid), {
        name: data.name,
        email: data.email,
        role: data.role,
        clientId: data.role === "client" ? data.clientId || null : null,
        createdAt: new Date(),
      })

      setSuccess(true)
      setTimeout(() => {
        router.push("/admin/clients")
      }, 2000)
    } catch (error: any) {
      console.error("Error creating user:", error)
      if (error.code === "auth/email-already-in-use") {
        setError("Diese E-Mail-Adresse wird bereits verwendet.")
      } else {
        setError("Fehler beim Erstellen des Benutzers. Bitte versuchen Sie es erneut.")
      }
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
        <div>
          <h1 className="text-2xl font-bold">Neuer Benutzer</h1>
          <p className="text-muted-foreground mt-1">
            Erstellen Sie einen neuen Admin- oder Kunden-Benutzer
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Benutzerdaten</CardTitle>
            <CardDescription>
              Geben Sie die Daten für den neuen Benutzer ein.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  {...register("name")}
                  className="mt-2"
                  placeholder="Max Mustermann"
                />
                {errors.name && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="email">E-Mail-Adresse *</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  className="mt-2"
                  placeholder="user@example.com"
                />
                {errors.email && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="password">Passwort *</Label>
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                  className="mt-2"
                  placeholder="••••••••"
                />
                {errors.password && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="role">Rolle *</Label>
                <Select
                  id="role"
                  {...register("role")}
                  className="mt-2"
                >
                  <option value="admin">Admin</option>
                  <option value="client">Kunde</option>
                </Select>
                {errors.role && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.role.message}
                  </p>
                )}
              </div>

              {role === "client" && (
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
                  <p className="text-xs text-muted-foreground mt-1">
                    Der Benutzer wird diesem Kunden zugeordnet.
                  </p>
                </div>
              )}

              {error && (
                <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              {success && (
                <div className="p-3 rounded-md bg-green-500/10 border border-green-500/20">
                  <p className="text-sm text-green-600 dark:text-green-400">
                    Benutzer erfolgreich erstellt! Weiterleitung...
                  </p>
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
                  {loading ? "Wird erstellt..." : "Benutzer erstellen"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
