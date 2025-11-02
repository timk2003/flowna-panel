"use client"

import { useEffect, useState } from "react"
import { collection, query, where, orderBy, getDocs, limit } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/hooks/useAuth"
import { ClientLayout } from "@/components/layouts/ClientLayout"
import { TimelineItem } from "@/components/TimelineItem"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { ProjectUpdate, UpdateKind } from "@/types"
import { Search } from "lucide-react"

export default function TimelinePage() {
  const { user } = useAuth()
  const [updates, setUpdates] = useState<ProjectUpdate[]>([])
  const [filteredUpdates, setFilteredUpdates] = useState<ProjectUpdate[]>([])
  const [filter, setFilter] = useState<UpdateKind | "all">("all")
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.clientId) return

    const loadUpdates = async () => {
      try {
        const projectsQuery = query(
          collection(db, "projects"),
          where("clientId", "==", user.clientId),
          limit(1)
        )
        const projectsSnapshot = await getDocs(projectsQuery)
        if (!projectsSnapshot.empty) {
          const projectId = projectsSnapshot.docs[0].id
          const updatesQuery = query(
            collection(db, "projectUpdates"),
            where("projectId", "==", projectId),
            orderBy("createdAt", "desc")
          )
          const updatesSnapshot = await getDocs(updatesQuery)
          const updatesData = updatesSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
          })) as ProjectUpdate[]
          setUpdates(updatesData)
          setFilteredUpdates(updatesData)
        }
      } catch (error) {
        console.error("Error loading updates:", error)
      } finally {
        setLoading(false)
      }
    }

    loadUpdates()
  }, [user])

  useEffect(() => {
    let filtered = updates

    if (filter !== "all") {
      filtered = filtered.filter((u) => u.kind === filter)
    }

    if (search) {
      filtered = filtered.filter(
        (u) =>
          u.title.toLowerCase().includes(search.toLowerCase()) ||
          u.body.toLowerCase().includes(search.toLowerCase())
      )
    }

    setFilteredUpdates(filtered)
  }, [updates, filter, search])

  if (loading) {
    return (
      <ClientLayout>
        <div className="flex items-center justify-center py-12">
          <p>Lädt Projektverlauf...</p>
        </div>
      </ClientLayout>
    )
  }

  return (
    <ClientLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold">Projektverlauf</h1>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Suchen..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select
              value={filter}
              onChange={(e) => setFilter(e.target.value as UpdateKind | "all")}
            >
              <option value="all">Alle</option>
              <option value="milestone">Meilensteine</option>
              <option value="note">Notizen</option>
              <option value="delivery">Lieferungen</option>
              <option value="request">Anfragen</option>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          {filteredUpdates.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">
              Keine Updates gefunden
            </p>
          ) : (
            filteredUpdates.map((update) => (
              <TimelineItem key={update.id} update={update} />
            ))
          )}
        </div>
      </div>
    </ClientLayout>
  )
}
