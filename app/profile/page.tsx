"use client"

import { ClientLayout } from "@/components/layouts/ClientLayout"
import { useAuth } from "@/hooks/useAuth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useState } from "react"
import { Mail, Phone, ExternalLink } from "lucide-react"

export default function ProfilePage() {
  const { user } = useAuth()
  const [name, setName] = useState(user?.name || "")
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    try {
      await updateDoc(doc(db, "users", user.id), { name })
      alert("Name gespeichert")
    } catch (e) {
      alert("Fehler beim Speichern")
    } finally {
      setSaving(false)
    }
  }

  return (
    <ClientLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Profil & Support</h1>

        {user && (
          <Card>
            <CardHeader>
              <CardTitle>Mein Profil</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" className="mt-2" value={name} onChange={(e) => setName(e.target.value)} />
                  <Button className="mt-3" onClick={handleSave} disabled={saving || !name.trim()}>
                    Speichern
                  </Button>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">E-Mail</p>
                  <p className="text-lg">{user.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Kontakt & Support</CardTitle>
            <CardDescription>
              Haben Sie Fragen oder benötigen Sie Hilfe? Kontaktieren Sie uns gerne!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">E-Mail Support</p>
                  <a
                    href="mailto:support@flowna.de"
                    className="text-sm text-muted-foreground hover:text-primary"
                  >
                    support@flowna.de
                  </a>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rechtliches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <a
                href="/impressum"
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                Impressum <ExternalLink className="h-3 w-3" />
              </a>
              <a
                href="/datenschutz"
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                Datenschutzerklärung <ExternalLink className="h-3 w-3" />
              </a>
              <a
                href="/agb"
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                Allgemeine Geschäftsbedingungen <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </ClientLayout>
  )
}
