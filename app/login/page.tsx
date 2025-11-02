"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Image from "next/image"
import { sendMagicLink } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const schema = z.object({
  email: z.string().email("Ungültige E-Mail-Adresse"),
})

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<{ email: string }>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: { email: string }) => {
    setLoading(true)
    try {
      await sendMagicLink(data.email)
      setSent(true)
    } catch (error) {
      console.error("Error sending magic link:", error)
      alert("Fehler beim Senden des Login-Links. Bitte versuchen Sie es erneut.")
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
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
            <CardTitle>E-Mail gesendet</CardTitle>
            <CardDescription>
              Wir haben Ihnen einen Login-Link per E-Mail gesendet. Bitte überprüfen Sie Ihr Postfach.
            </CardDescription>
          </CardHeader>
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
          <CardTitle>Anmelden</CardTitle>
          <CardDescription>
            Geben Sie Ihre E-Mail-Adresse ein, um einen Login-Link zu erhalten.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="email">E-Mail-Adresse</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                className="mt-2"
                placeholder="ihre@email.de"
              />
              {errors.email && (
                <p className="text-sm text-destructive mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Wird gesendet..." : "Login-Link senden"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
