"use client"

import { useEffect, useState } from "react"
import { AdminLayout } from "@/components/layouts/AdminLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { db, storage } from "@/lib/firebase"
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"

export default function AdminSettingsPage() {
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoUrl, setLogoUrl] = useState("")
  const [primaryColor, setPrimaryColor] = useState("#0ea5e9")
  const [senderName, setSenderName] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [updateTemplate, setUpdateTemplate] = useState("")
  const [approvalTemplate, setApprovalTemplate] = useState("")
  const [imprintUrl, setImprintUrl] = useState("")
  const [privacyUrl, setPrivacyUrl] = useState("")
  const [termsUrl, setTermsUrl] = useState("")
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const settingsRef = doc(db, "settings", "app")
        const snap = await getDoc(settingsRef)
        if (snap.exists()) {
          const s = snap.data() as any
          setLogoUrl(s.logoUrl || "")
          setPrimaryColor(s.primaryColor || "#0ea5e9")
          setSenderName(s.senderName || "")
          setStartTime(s.workingHours?.startTime || "")
          setEndTime(s.workingHours?.endTime || "")
          setUpdateTemplate(s.templates?.update || "")
          setApprovalTemplate(s.templates?.approval || "")
          setImprintUrl(s.legal?.imprintUrl || "")
          setPrivacyUrl(s.legal?.privacyUrl || "")
          setTermsUrl(s.legal?.termsUrl || "")
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleSaveBrand = async () => {
    setSaving(true)
    try {
      let uploadedLogoUrl = logoUrl
      if (logoFile) {
        const storageRef = ref(storage, "settings/logo.png")
        await uploadBytes(storageRef, logoFile)
        uploadedLogoUrl = await getDownloadURL(storageRef)
        setLogoUrl(uploadedLogoUrl)
      }
      await setDoc(doc(db, "settings", "app"), {
        logoUrl: uploadedLogoUrl,
        primaryColor,
        senderName,
        updatedAt: serverTimestamp(),
      }, { merge: true })
      alert("Einstellungen gespeichert")
    } catch (e) {
      alert("Fehler beim Speichern")
    } finally {
      setSaving(false)
    }
  }

  const handleSaveHours = async () => {
    setSaving(true)
    try {
      await setDoc(doc(db, "settings", "app"), {
        workingHours: { startTime, endTime },
        updatedAt: serverTimestamp(),
      }, { merge: true })
      alert("Arbeitszeiten gespeichert")
    } catch (e) {
      alert("Fehler beim Speichern")
    } finally {
      setSaving(false)
    }
  }

  const handleSaveTemplates = async () => {
    setSaving(true)
    try {
      await setDoc(doc(db, "settings", "app"), {
        templates: { update: updateTemplate, approval: approvalTemplate },
        updatedAt: serverTimestamp(),
      }, { merge: true })
      alert("Vorlagen gespeichert")
    } catch (e) {
      alert("Fehler beim Speichern")
    } finally {
      setSaving(false)
    }
  }

  const handleSaveLegal = async () => {
    setSaving(true)
    try {
      await setDoc(doc(db, "settings", "app"), {
        legal: { imprintUrl, privacyUrl, termsUrl },
        updatedAt: serverTimestamp(),
      }, { merge: true })
      alert("Rechtliches gespeichert")
    } catch (e) {
      alert("Fehler beim Speichern")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <p>Lädt Einstellungen...</p>
        </div>
      </AdminLayout>
    )
  }

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
              <div className="mt-2 flex items-center gap-4">
                {logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoUrl} alt="Logo" className="h-10 w-auto" />
                ) : null}
                <Input id="logo" type="file" accept="image/*" className="mt-2" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} />
              </div>
            </div>
            <div>
              <Label htmlFor="primaryColor">Primärfarbe</Label>
              <Input id="primaryColor" type="color" className="mt-2 h-10" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="senderName">Absender-Name</Label>
              <Input id="senderName" placeholder="Flowna Team" className="mt-2" value={senderName} onChange={(e) => setSenderName(e.target.value)} />
            </div>
            <Button onClick={handleSaveBrand} disabled={saving}>Speichern</Button>
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
                <Input id="startTime" type="time" className="mt-2" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="endTime">Endzeit</Label>
                <Input id="endTime" type="time" className="mt-2" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
              </div>
            </div>
            <Button onClick={handleSaveHours} disabled={saving}>Speichern</Button>
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
                value={updateTemplate}
                onChange={(e) => setUpdateTemplate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="approvalTemplate">Freigabe-Vorlage</Label>
              <Textarea
                id="approvalTemplate"
                placeholder="Vorlage für Freigabe-Anfragen..."
                className="mt-2 min-h-[120px]"
                value={approvalTemplate}
                onChange={(e) => setApprovalTemplate(e.target.value)}
              />
            </div>
            <Button onClick={handleSaveTemplates} disabled={saving}>Speichern</Button>
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
              <Input id="imprintUrl" placeholder="https://..." className="mt-2" value={imprintUrl} onChange={(e) => setImprintUrl(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="privacyUrl">Datenschutz URL</Label>
              <Input id="privacyUrl" placeholder="https://..." className="mt-2" value={privacyUrl} onChange={(e) => setPrivacyUrl(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="termsUrl">AGB URL</Label>
              <Input id="termsUrl" placeholder="https://..." className="mt-2" value={termsUrl} onChange={(e) => setTermsUrl(e.target.value)} />
            </div>
            <Button onClick={handleSaveLegal} disabled={saving}>Speichern</Button>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
