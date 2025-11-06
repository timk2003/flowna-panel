"use client"

import { useEffect, useState } from "react"
import { AdminLayout } from "@/components/layouts/AdminLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, Upload, MessageSquare, CheckCircle2, FilePlus2, ListChecks, StickyNote } from "lucide-react"
import { db } from "@/lib/firebase"
import { collection, getDocs, orderBy, query, limit, writeBatch, doc, updateDoc } from "firebase/firestore"

export default function AdminInboxPage() {
  const [items, setItems] = useState<Array<{
    id: string
    type: string
    title: string
    description?: string
    projectTitle?: string
    projectId: string
    read?: boolean
    createdAt?: Date
  }>>([])

  useEffect(() => {
    const load = async () => {
      const q = query(collection(db, "events"), orderBy("createdAt", "desc"), limit(100))
      const snap = await getDocs(q)
      setItems(snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as any),
        createdAt: d.data().createdAt?.toDate() || new Date(),
      })))
    }
    load()
  }, [])

  const typeIcons: Record<string, any> = {
    upload: Upload,
    message: MessageSquare,
    approval_created: FilePlus2,
    approval_decided: CheckCircle2,
    task_created: ListChecks,
    update_created: StickyNote,
  }

  const typeLabels: Record<string, string> = {
    upload: "Upload",
    message: "Nachricht",
    approval_created: "Freigabe angelegt",
    approval_decided: "Freigabe entschieden",
    task_created: "Aufgabe angelegt",
    update_created: "Update erstellt",
  }

  const markAllRead = async () => {
    try {
      const batch = writeBatch(db)
      const toUpdate = items.filter((i) => !i.read)
      toUpdate.forEach((i) => {
        batch.update(doc(db, "events", i.id), { read: true })
      })
      if (toUpdate.length > 0) {
        await batch.commit()
      }
      setItems((prev) => prev.map((i) => ({ ...i, read: true })))
    } catch (e) {
      // Fallback: UI trotzdem aktualisieren
      setItems((prev) => prev.map((i) => ({ ...i, read: true })))
    }
  }

  const markOneRead = async (id: string) => {
    try {
      await updateDoc(doc(db, "events", id), { read: true })
    } catch {}
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, read: true } : i)))
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Eingänge</h1>
          <Button variant="outline" size="sm" onClick={markAllRead}>
            Alle als erledigt markieren
          </Button>
        </div>

        <div className="space-y-4">
          {items.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">Keine neuen Eingänge</p>
              </CardContent>
            </Card>
          ) : (
            items.map((item) => {
              const Icon = typeIcons[item.type]
              return (
                <Card key={item.id} className={!item.read ? "border-primary" : ""}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="rounded-full bg-muted p-2">
                        {Icon ? <Icon className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">{item.title}</p>
                          {!item.read && (
                            <Badge variant="default" className="h-5">
                              Neu
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {item.description}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {typeLabels[item.type] || item.type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {item.projectTitle || item.projectId} • {item.createdAt?.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => markOneRead(item.id)}>
                        <CheckCircle className="h-5 w-5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
