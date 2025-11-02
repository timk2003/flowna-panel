"use client"

import { useEffect, useState, useRef } from "react"
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, getDoc, doc } from "firebase/firestore"
import { getDocs, limit } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/hooks/useAuth"
import { ClientLayout } from "@/components/layouts/ClientLayout"
import { MessageBubble } from "@/components/MessageBubble"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Message } from "@/types"
import { Send } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const messageSchema = z.object({
  text: z.string().min(1, "Nachricht darf nicht leer sein"),
})

export default function MessagesPage() {
  const { user } = useAuth()
  const [projectId, setProjectId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [userNames, setUserNames] = useState<Record<string, string>>({})
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { register, handleSubmit, formState: { errors }, reset } = useForm<{ text: string }>({
    resolver: zodResolver(messageSchema),
  })

  useEffect(() => {
    if (!user?.clientId) return

    const loadProject = async () => {
      try {
        const projectsQuery = query(
          collection(db, "projects"),
          where("clientId", "==", user.clientId),
          limit(1)
        )
        const projectsSnapshot = await getDocs(projectsQuery)
        if (!projectsSnapshot.empty) {
          const pid = projectsSnapshot.docs[0].id
          setProjectId(pid)
        }
      } catch (error) {
        console.error("Error loading project:", error)
      }
    }

    loadProject()
  }, [user])

  useEffect(() => {
    if (!projectId) return

    const messagesQuery = query(
      collection(db, "messages"),
      where("projectId", "==", projectId),
      orderBy("createdAt", "asc")
    )

    const unsubscribe = onSnapshot(messagesQuery, async (snapshot) => {
      const messagesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as Message[]

      // User-Namen laden
      const userIds = [...new Set(messagesData.map((m) => m.senderId))]
      const names: Record<string, string> = {}
      for (const userId of userIds) {
        try {
          const userDoc = await getDoc(doc(db, "users", userId))
          if (userDoc.exists()) {
            names[userId] = userDoc.data().name
          }
        } catch (error) {
          names[userId] = "Unbekannt"
        }
      }
      setUserNames(names)
      setMessages(messagesData)
    })

    return unsubscribe
  }, [projectId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const onSubmit = async (data: { text: string }) => {
    if (!projectId || !user) return

    try {
      await addDoc(collection(db, "messages"), {
        projectId,
        senderId: user.id,
        text: data.text,
        attachments: [],
        createdAt: serverTimestamp(),
      })
      reset()
    } catch (error) {
      console.error("Error sending message:", error)
      alert("Fehler beim Senden der Nachricht. Bitte versuchen Sie es erneut.")
    }
  }

  if (!projectId) {
    return (
      <ClientLayout>
        <div className="flex items-center justify-center py-12">
          <p>Kein Projekt gefunden</p>
        </div>
      </ClientLayout>
    )
  }

  return (
    <ClientLayout>
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        <h1 className="text-2xl font-bold mb-6">Nachrichten</h1>
        
        <Card className="flex-1 flex flex-col">
          <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">
                Noch keine Nachrichten. Starten Sie die Unterhaltung!
              </p>
            ) : (
              <>
                {messages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    senderName={userNames[message.senderId] || "Unbekannt"}
                    isOwnMessage={message.senderId === user?.id}
                  />
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </CardContent>
          
          <div className="border-t p-4">
            <form onSubmit={handleSubmit(onSubmit)} className="flex gap-2">
              <Input
                {...register("text")}
                placeholder="Nachricht schreiben..."
                className="flex-1"
              />
              <Button type="submit">
                <Send className="h-4 w-4" />
              </Button>
            </form>
            {errors.text && (
              <p className="text-sm text-destructive mt-1">
                {errors.text.message}
              </p>
            )}
          </div>
        </Card>
      </div>
    </ClientLayout>
  )
}
