"use client"

import { ClientLayout } from "@/components/layouts/ClientLayout"
import { useAuth } from "@/hooks/useAuth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Phone, ExternalLink } from "lucide-react"

export default function ProfilePage() {
  const { user } = useAuth()

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
                  <p className="text-sm font-medium text-muted-foreground">Name</p>
                  <p className="text-lg">{user.name}</p>
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
