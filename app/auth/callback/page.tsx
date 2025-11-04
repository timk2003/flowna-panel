"use client"

import { Suspense, useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { handleMagicLink, useAuth } from "@/hooks/useAuth"
import { isSignInWithEmailLink } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

function AuthCallbackForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading: authLoading } = useAuth()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [attempted, setAttempted] = useState(false)

  // E-Mail aus localStorage lesen (wird von Firebase beim Senden gespeichert)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedEmail = window.localStorage.getItem("emailForSignIn")
      if (savedEmail) {
        setEmail(savedEmail)
      }
    }
  }, [])

  // Prüfe ob bereits eingeloggt - warte auf User-Dokument
  useEffect(() => {
    if (user && !authLoading) {
      console.log("User logged in, redirecting to dashboard", user)
      // Warte etwas länger, damit alles initialisiert ist
      const timer = setTimeout(() => {
        window.location.href = "/"
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [user, authLoading])

  // Automatisch versuchen, wenn E-Mail vorhanden und Magic Link erkannt
  useEffect(() => {
    const attemptAutoLogin = async () => {
      if (!email || attempted || !auth) return
      
      const isMagicLinkUrl = isSignInWithEmailLink(auth, window.location.href)
      if (!isMagicLinkUrl) {
        return // Kein Magic Link in URL
      }

      setAttempted(true)
      setLoading(true)
      setError(null)
      
      try {
        await handleMagicLink(email)
        // E-Mail aus localStorage entfernen nach erfolgreichem Login
        if (typeof window !== "undefined") {
          window.localStorage.removeItem("emailForSignIn")
        }
        // Warte nicht auf Timeout, sondern auf Auth-State Update
        // Der useEffect für user wird automatisch ausgelöst
      } catch (error: any) {
        console.error("Error handling magic link:", error)
        setError("Fehler beim Anmelden. Bitte versuchen Sie es erneut.")
        setLoading(false)
        setAttempted(false) // Erlaube erneuten Versuch
      }
    }

    if (email && !attempted && typeof window !== "undefined") {
      attemptAutoLogin()
    }
  }, [email, attempted, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setLoading(true)
    setError(null)
    try {
      await handleMagicLink(email)
      // E-Mail aus localStorage entfernen nach erfolgreichem Login
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("emailForSignIn")
      }
      // Der useEffect für user wird automatisch ausgelöst und leitet weiter
      // Setze loading nicht auf false, damit der Ladebildschirm angezeigt wird
    } catch (error: any) {
      console.error("Error handling magic link:", error)
      setError("Fehler beim Anmelden. Bitte versuchen Sie es erneut.")
      setLoading(false)
    }
  }

  // Wenn bereits eingeloggt ODER beim Laden, zeige Ladebildschirm
  if (authLoading || user || loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <div className="mb-8">
          <Image
            src="/flownalogo.png"
            alt="Flowna"
            width={160}
            height={42}
            className="brightness-0 invert"
          />
        </div>
        <Card className="w-full max-w-md">
          <CardContent className="py-12">
            <p className="text-center text-muted-foreground">
              {user ? "Weiterleitung..." : loading ? "Wird angemeldet..." : "Lädt..."}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="mb-8">
        <Image
          src="/flownalogo.png"
          alt="Flowna"
          width={160}
          height={42}
          className="brightness-0 invert"
        />
      </div>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Anmeldung abschließen</CardTitle>
          <CardDescription>
            Bitte geben Sie Ihre E-Mail-Adresse ein, um die Anmeldung abzuschließen.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">E-Mail-Adresse</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2"
                placeholder="ihre@email.de"
                required
              />
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Wird angemeldet..." : "Anmelden"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <div className="mb-8">
          <Image
            src="/flownalogo.png"
            alt="Flowna"
            width={160}
            height={42}
            className="brightness-0 invert"
          />
        </div>
        <Card className="w-full max-w-md">
          <CardContent className="py-12">
            <p className="text-center text-muted-foreground">Lädt...</p>
          </CardContent>
        </Card>
      </div>
    }>
      <AuthCallbackForm />
    </Suspense>
  )
}
