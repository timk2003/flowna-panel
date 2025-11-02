"use client"

import { AdminLayout } from "@/components/layouts/AdminLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, Upload, MessageSquare, CheckCircle2 } from "lucide-react"

export default function AdminInboxPage() {
  // Beispiel-Daten - sollten aus Firestore kommen
  const items = [
    {
      id: "1",
      type: "upload" as const,
      title: "Neue Datei hochgeladen",
      description: "Kunde hat eine neue Datei hochgeladen",
      project: "Website Redesign",
      time: "vor 2 Stunden",
      read: false,
    },
    {
      id: "2",
      type: "approval" as const,
      title: "Freigabe-Entscheidung",
      description: "Kunde hat ein Item freigegeben",
      project: "Branding Package",
      time: "vor 5 Stunden",
      read: false,
    },
    {
      id: "3",
      type: "message" as const,
      title: "Neue Nachricht",
      description: "Kunde hat eine Nachricht gesendet",
      project: "Website Redesign",
      time: "vor 1 Tag",
      read: true,
    },
  ]

  const typeIcons = {
    upload: Upload,
    approval: CheckCircle2,
    message: MessageSquare,
  }

  const typeLabels = {
    upload: "Upload",
    approval: "Freigabe",
    message: "Nachricht",
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Eingänge</h1>
          <Button variant="outline" size="sm">
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
                        <Icon className="h-5 w-5" />
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
                            {typeLabels[item.type]}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {item.project} • {item.time}
                          </span>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon">
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
