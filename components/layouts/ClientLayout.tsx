"use client"

import { useAuth } from "@/hooks/useAuth"
import { useRouter, usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"
import { 
  LayoutDashboard, 
  History, 
  Palette, 
  CheckCircle, 
  Folder, 
  ClipboardList,
  MessageSquare,
  User,
  LogOut
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { signOut } from "@/hooks/useAuth"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Projektverlauf", href: "/timeline", icon: History },
  { name: "Designs & Vorschau", href: "/designs", icon: Palette },
  { name: "Freigaben", href: "/approvals", icon: CheckCircle },
  { name: "Dateien", href: "/files", icon: Folder },
  { name: "Aufgaben für dich", href: "/tasks", icon: ClipboardList },
  { name: "Nachrichten", href: "/messages", icon: MessageSquare },
  { name: "Profil & Support", href: "/profile", icon: User },
]

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [logoUrl, setLogoUrl] = useState<string>("")

  useEffect(() => {
    // Nur weiterleiten wenn loading fertig UND wirklich kein User vorhanden
    // Verwende replace statt push um History-Stack zu vermeiden
    if (!loading && !user) {
      router.replace("/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const snap = await getDoc(doc(db, "settings", "app"))
        if (snap.exists()) {
          setLogoUrl((snap.data() as any).logoUrl || "")
        }
      } catch {}
    }
    loadSettings()
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Lädt...</p>
      </div>
    )
  }

  if (!user) {
    return null // Wird zu /login weitergeleitet
  }

  if (user.role !== "client") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6">
            <p className="text-destructive">
              Sie haben keinen Zugriff auf das Kunden-Panel. Bitte melden Sie sich mit einem Kunden-Account an.
            </p>
            <Button 
              className="mt-4" 
              onClick={() => {
                signOut()
                router.push("/login")
              }}
            >
              Abmelden
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleSignOut = async () => {
    await signOut()
    router.push("/login")
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <aside className="w-64 border-r bg-card">
          <div className="flex h-16 items-center border-b px-6">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt="Logo" className="h-6 w-auto invert" />
            ) : (
              <Image
                src="/flownalogo.png"
                alt="Flowna"
                width={120}
                height={32}
                className="brightness-0 invert"
              />
            )}
          </div>
          <nav className="p-4 pb-20 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
          <div className="fixed bottom-0 w-64 border-t bg-card p-4">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Abmelden
            </Button>
          </div>
        </aside>
        <main className="flex-1">
          <header className="h-16 border-b bg-card">
            <div className="flex h-full items-center justify-between px-6">
              <h2 className="text-lg font-semibold">
                {navigation.find(item => item.href === pathname)?.name}
              </h2>
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">{user.name}</span>
              </div>
            </div>
          </header>
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  )
}
