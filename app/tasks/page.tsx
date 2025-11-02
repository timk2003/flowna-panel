"use client"

import { useEffect, useState } from "react"
import { collection, query, where, getDocs, doc, updateDoc, limit } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/hooks/useAuth"
import { ClientLayout } from "@/components/layouts/ClientLayout"
import { TaskItem } from "@/components/TaskItem"
import { Task } from "@/types"

export default function TasksPage() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.clientId) return

    const loadTasks = async () => {
      try {
        const projectsQuery = query(
          collection(db, "projects"),
          where("clientId", "==", user.clientId),
          limit(1)
        )
        const projectsSnapshot = await getDocs(projectsQuery)
        if (!projectsSnapshot.empty) {
          const projectId = projectsSnapshot.docs[0].id
          const tasksQuery = query(
            collection(db, "tasks"),
            where("projectId", "==", projectId),
            where("for", "==", "client")
          )
          const tasksSnapshot = await getDocs(tasksQuery)
          const tasksData = tasksSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
            dueAt: doc.data().dueAt?.toDate(),
          })) as Task[]
          // Sortiere: zuerst offene, dann nach Fälligkeitsdatum
          tasksData.sort((a, b) => {
            if (a.done !== b.done) return a.done ? 1 : -1
            if (!a.dueAt && !b.dueAt) return 0
            if (!a.dueAt) return 1
            if (!b.dueAt) return -1
            return a.dueAt.getTime() - b.dueAt.getTime()
          })
          setTasks(tasksData)
        }
      } catch (error) {
        console.error("Error loading tasks:", error)
      } finally {
        setLoading(false)
      }
    }

    loadTasks()
  }, [user])

  const handleToggle = async (taskId: string) => {
    try {
      const task = tasks.find((t) => t.id === taskId)
      if (!task) return

      await updateDoc(doc(db, "tasks", taskId), {
        done: !task.done,
      })
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, done: !t.done } : t))
      )
    } catch (error) {
      console.error("Error toggling task:", error)
      alert("Fehler beim Aktualisieren der Aufgabe. Bitte versuchen Sie es erneut.")
    }
  }

  if (loading) {
    return (
      <ClientLayout>
        <div className="flex items-center justify-center py-12">
          <p>Lädt Aufgaben...</p>
        </div>
      </ClientLayout>
    )
  }

  const openTasks = tasks.filter((t) => !t.done)
  const completedTasks = tasks.filter((t) => t.done)

  return (
    <ClientLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Aufgaben für dich</h1>

        {openTasks.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Offene Aufgaben</h2>
            {openTasks.map((task) => (
              <TaskItem key={task.id} task={task} onToggle={handleToggle} />
            ))}
          </div>
        )}

        {completedTasks.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Erledigte Aufgaben</h2>
            {completedTasks.map((task) => (
              <TaskItem key={task.id} task={task} onToggle={handleToggle} />
            ))}
          </div>
        )}

        {tasks.length === 0 && (
          <p className="text-center text-muted-foreground py-12">
            Keine Aufgaben gefunden
          </p>
        )}
      </div>
    </ClientLayout>
  )
}
