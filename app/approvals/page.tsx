"use client"

import { useEffect, useState } from "react"
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/hooks/useAuth"
import { ClientLayout } from "@/components/layouts/ClientLayout"
import { ApprovalCard } from "@/components/ApprovalCard"
import { Approval } from "@/types"

export default function ApprovalsPage() {
  const { user } = useAuth()
  const [approvals, setApprovals] = useState<Approval[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.clientId) return

    const loadApprovals = async () => {
      try {
        const projectsQuery = query(
          collection(db, "projects"),
          where("clientId", "==", user.clientId),
          limit(1)
        )
        const projectsSnapshot = await getDocs(projectsQuery)
        if (!projectsSnapshot.empty) {
          const projectId = projectsSnapshot.docs[0].id
          const approvalsQuery = query(
            collection(db, "approvals"),
            where("projectId", "==", projectId)
          )
          const approvalsSnapshot = await getDocs(approvalsQuery)
          const approvalsData = approvalsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            requestedAt: doc.data().requestedAt?.toDate() || new Date(),
            decidedAt: doc.data().decidedAt?.toDate(),
          })) as Approval[]
          setApprovals(approvalsData)
        }
      } catch (error) {
        console.error("Error loading approvals:", error)
      } finally {
        setLoading(false)
      }
    }

    loadApprovals()
  }, [user])

  const handleApprove = async (id: string) => {
    try {
      await updateDoc(doc(db, "approvals", id), {
        status: "approved",
        decidedAt: new Date(),
        decidedBy: user?.id,
      })
      setApprovals((prev) =>
        prev.map((a) =>
          a.id === id
            ? { ...a, status: "approved" as const, decidedAt: new Date(), decidedBy: user?.id }
            : a
        )
      )
    } catch (error) {
      console.error("Error approving:", error)
      alert("Fehler beim Freigeben. Bitte versuchen Sie es erneut.")
    }
  }

  const handleRequestChanges = async (id: string, comment: string) => {
    try {
      await updateDoc(doc(db, "approvals", id), {
        status: "changes",
        comment,
        decidedAt: new Date(),
        decidedBy: user?.id,
      })
      setApprovals((prev) =>
        prev.map((a) =>
          a.id === id
            ? { ...a, status: "changes" as const, comment, decidedAt: new Date(), decidedBy: user?.id }
            : a
        )
      )
    } catch (error) {
      console.error("Error requesting changes:", error)
      alert("Fehler beim Senden der Änderungsanfrage. Bitte versuchen Sie es erneut.")
    }
  }

  if (loading) {
    return (
      <ClientLayout>
        <div className="flex items-center justify-center py-12">
          <p>Lädt Freigaben...</p>
        </div>
      </ClientLayout>
    )
  }

  return (
    <ClientLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Freigaben</h1>
        <div className="grid gap-4 md:grid-cols-2">
          {approvals.length === 0 ? (
            <p className="text-center text-muted-foreground col-span-2 py-12">
              Keine Freigaben gefunden
            </p>
          ) : (
            approvals.map((approval) => (
              <ApprovalCard
                key={approval.id}
                approval={approval}
                onApprove={handleApprove}
                onRequestChanges={handleRequestChanges}
              />
            ))
          )}
        </div>
      </div>
    </ClientLayout>
  )
}
