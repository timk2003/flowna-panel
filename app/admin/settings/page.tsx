"use client"

import { AdminLayout } from "@/components/layouts/AdminLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function AdminSettingsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Einstellungen</h1>

        <Card>
          <CardHeader>
            <CardTitle>Brand Settings</CardTitle>
            <CardDescription>
              Logo, Farben und Absender-Informationen für E-Mails
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="logo">Logo</Label>
              <Input id="logo" type="file" accept="image/*" className="mt-2" />
            </div>
            <div>
              <Label htmlFor="primaryColor">Primärfarbe</Label>
              <Input id="primaryColor" type="color" className="mt-2 h-10" />
            </div>
            <div>
              <Label htmlFor="senderName">Absender-Name</Label>
              <Input id="senderName" placeholder="Flowna Team" className="mt-2" />
            </div>
            <Button>Speichern</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Working Hours</CardTitle>
            <CardDescription>
              Verfügbare Zeiten für Terminbuchungen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startTime">Startzeit</Label>
                <Input id="startTime" type="time" className="mt-2" />
              </div>
              <div>
                <Label htmlFor="endTime">Endzeit</Label>
                <Input id="endTime" type="time" className="mt-2" />
              </div>
            </div>
            <Button>Speichern</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mail-Vorlagen</CardTitle>
            <CardDescription>
              E-Mail-Vorlagen für Updates, Freigaben und Entscheidungen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="updateTemplate">Update-Vorlage</Label>
              <Textarea
                id="updateTemplate"
                placeholder="Vorlage für Projekt-Updates..."
                className="mt-2 min-h-[120px]"
              />
            </div>
            <div>
              <Label htmlFor="approvalTemplate">Freigabe-Vorlage</Label>
              <Textarea
                id="approvalTemplate"
                placeholder="Vorlage für Freigabe-Anfragen..."
                className="mt-2 min-h-[120px]"
              />
            </div>
            <Button>Speichern</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rechtliches</CardTitle>
            <CardDescription>
              Links zu Impressum, Datenschutz und AGB
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="imprintUrl">Impressum URL</Label>
              <Input id="imprintUrl" placeholder="https://..." className="mt-2" />
            </div>
            <div>
              <Label htmlFor="privacyUrl">Datenschutz URL</Label>
              <Input id="privacyUrl" placeholder="https://..." className="mt-2" />
            </div>
            <div>
              <Label htmlFor="termsUrl">AGB URL</Label>
              <Input id="termsUrl" placeholder="https://..." className="mt-2" />
            </div>
            <Button>Speichern</Button>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
