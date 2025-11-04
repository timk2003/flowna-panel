"use client"

import { useEffect, useState } from "react"
import { doc, getDoc, collection, query, where, getDocs, updateDoc, addDoc, deleteDoc, orderBy, serverTimestamp } from "firebase/firestore"
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage"
import { db, storage } from "@/lib/firebase"
import { useParams, useRouter } from "next/navigation"
import { AdminLayout } from "@/components/layouts/AdminLayout"
import { StatusBadge } from "@/components/StatusBadge"
import { ProgressBar } from "@/components/ProgressBar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Project, ProjectStatus, ProjectType, ProjectUpdate, UpdateKind, Approval, Task, File, Message, User, Client } from "@/types"
import { ArrowLeft, Save, Plus, Pin, Trash2, Upload, Download, Eye, Send, X, Check } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { de } from "date-fns/locale"
import { useAuth } from "@/hooks/useAuth"
import { TimelineItem } from "@/components/TimelineItem"
import { ApprovalCard } from "@/components/ApprovalCard"
import { FileItem } from "@/components/FileItem"
import { TaskItem } from "@/components/TaskItem"
import { MessageBubble } from "@/components/MessageBubble"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { v4 as uuidv4 } from "uuid"

type Tab = "dashboard" | "updates" | "designs" | "approvals" | "files" | "tasks" | "messages"

const updateSchema = z.object({
  kind: z.enum(["milestone", "note", "delivery", "request"]),
  title: z.string().min(1, "Titel ist erforderlich"),
  body: z.string().min(1, "Beschreibung ist erforderlich"),
})

const approvalSchema = z.object({
  itemTitle: z.string().min(1, "Titel ist erforderlich"),
})

const taskSchema = z.object({
  title: z.string().min(1, "Titel ist erforderlich"),
  for: z.enum(["client", "internal"]),
  dueAt: z.string().optional(),
})

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const projectId = params.id as string
  const [project, setProject] = useState<Project | null>(null)
  const [client, setClient] = useState<Client | null>(null)
  const [owner, setOwner] = useState<User | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>("dashboard")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Tab-spezifische States
  const [updates, setUpdates] = useState<ProjectUpdate[]>([])
  const [approvals, setApprovals] = useState<Approval[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [files, setFiles] = useState<File[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [userNames, setUserNames] = useState<Record<string, string>>({})
  const [allUsers, setAllUsers] = useState<User[]>([])
  
  // Dialog States
  const [showUpdateDialog, setShowUpdateDialog] = useState(false)
  const [showApprovalDialog, setShowApprovalDialog] = useState(false)
  const [showTaskDialog, setShowTaskDialog] = useState(false)
  const [showFilePreview, setShowFilePreview] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const { register: registerUpdate, handleSubmit: handleSubmitUpdate, formState: { errors: errorsUpdate }, reset: resetUpdate } = useForm<{
    kind: UpdateKind
    title: string
    body: string
  }>({
    resolver: zodResolver(updateSchema),
  })

  const { register: registerApproval, handleSubmit: handleSubmitApproval, formState: { errors: errorsApproval }, reset: resetApproval } = useForm<{
    itemTitle: string
  }>({
    resolver: zodResolver(approvalSchema),
  })

  const { register: registerTask, handleSubmit: handleSubmitTask, formState: { errors: errorsTask }, reset: resetTask } = useForm<{
    title: string
    for: "client" | "internal"
    dueAt?: string
  }>({
    resolver: zodResolver(taskSchema),
  })

  const { register: registerMessage, handleSubmit: handleSubmitMessage, formState: { errors: errorsMessage }, reset: resetMessage } = useForm<{
    text: string
  }>({
    resolver: zodResolver(z.object({ text: z.string().min(1) })),
  })

  useEffect(() => {
    if (!projectId) return

    const loadProject = async () => {
      try {
        const projectDoc = await getDoc(doc(db, "projects", projectId))
        if (!projectDoc.exists()) {
          setLoading(false)
          return
        }

        const projectData = projectDoc.data()
        const projectObj: Project = {
          id: projectDoc.id,
          ...projectData,
          createdAt: projectData.createdAt?.toDate() || new Date(),
          updatedAt: projectData.updatedAt?.toDate() || new Date(),
        } as Project
        setProject(projectObj)

        // Client laden
        if (projectData.clientId) {
          const clientDoc = await getDoc(doc(db, "clients", projectData.clientId))
          if (clientDoc.exists()) {
            setClient({
              id: clientDoc.id,
              ...clientDoc.data(),
              createdAt: clientDoc.data().createdAt?.toDate() || new Date(),
            } as Client)
          }
        }

        // Owner laden
        if (projectData.ownerId) {
          const ownerDoc = await getDoc(doc(db, "users", projectData.ownerId))
          if (ownerDoc.exists()) {
            setOwner({
              id: ownerDoc.id,
              ...ownerDoc.data(),
              createdAt: ownerDoc.data().createdAt?.toDate() || new Date(),
            } as User)
          }
        }

        // Alle Updates laden
        const updatesQuery = query(
          collection(db, "projectUpdates"),
          where("projectId", "==", projectId),
          orderBy("createdAt", "desc")
        )
        const updatesSnapshot = await getDocs(updatesQuery)
        setUpdates(updatesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        })) as ProjectUpdate[])

        // Alle Freigaben laden
        const approvalsQuery = query(
          collection(db, "approvals"),
          where("projectId", "==", projectId),
          orderBy("requestedAt", "desc")
        )
        const approvalsSnapshot = await getDocs(approvalsQuery)
        setApprovals(approvalsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          requestedAt: doc.data().requestedAt?.toDate() || new Date(),
          decidedAt: doc.data().decidedAt?.toDate(),
        })) as Approval[])

        // Alle Aufgaben laden
        const tasksQuery = query(
          collection(db, "tasks"),
          where("projectId", "==", projectId),
          orderBy("createdAt", "desc")
        )
        const tasksSnapshot = await getDocs(tasksQuery)
        setTasks(tasksSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          dueAt: doc.data().dueAt?.toDate(),
        })) as Task[])

        // Alle Dateien laden
        const filesQuery = query(
          collection(db, "files"),
          where("projectId", "==", projectId),
          orderBy("createdAt", "desc")
        )
        const filesSnapshot = await getDocs(filesQuery)
        setFiles(filesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        })) as File[])

        // Alle Nachrichten laden
        const messagesQuery = query(
          collection(db, "messages"),
          where("projectId", "==", projectId),
          orderBy("createdAt", "asc")
        )
        const messagesSnapshot = await getDocs(messagesQuery)
        const messagesData = messagesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        })) as Message[]
        setMessages(messagesData)

        // User-Namen laden
        const userIds = [...new Set(messagesData.map((m) => m.senderId))]
        const names: Record<string, string> = {}
        for (const userId of userIds) {
          try {
            const userDoc = await getDoc(doc(db, "users", userId))
            if (userDoc.exists()) {
              names[userId] = userDoc.data().name
            }
          } catch {
            names[userId] = "Unbekannt"
          }
        }
        setUserNames(names)

        // Alle User für Owner-Auswahl laden
        const usersQuery = query(collection(db, "users"), where("role", "==", "admin"))
        const usersSnapshot = await getDocs(usersQuery)
        setAllUsers(usersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        })) as User[])
      } catch (error) {
        console.error("Error loading project:", error)
      } finally {
        setLoading(false)
      }
    }

    loadProject()
  }, [projectId])

  const handleSave = async () => {
    if (!project) return

    setSaving(true)
    try {
      await updateDoc(doc(db, "projects", projectId), {
        title: project.title,
        type: project.type,
        status: project.status,
        progress: project.progress,
        ownerId: project.ownerId,
        updatedAt: new Date(),
      })
      alert("Projekt gespeichert!")
    } catch (error) {
      console.error("Error saving project:", error)
      alert("Fehler beim Speichern. Bitte versuchen Sie es erneut.")
    } finally {
      setSaving(false)
    }
  }

  const onSubmitUpdate = async (data: { kind: UpdateKind; title: string; body: string }) => {
    if (!user) return

    try {
      await addDoc(collection(db, "projectUpdates"), {
        projectId,
        kind: data.kind,
        title: data.title,
        body: data.body,
        createdBy: user.id,
        createdAt: serverTimestamp(),
        pinned: false,
      })
      setShowUpdateDialog(false)
      resetUpdate()
      // Reload updates
      const updatesQuery = query(
        collection(db, "projectUpdates"),
        where("projectId", "==", projectId),
        orderBy("createdAt", "desc")
      )
      const updatesSnapshot = await getDocs(updatesQuery)
      setUpdates(updatesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as ProjectUpdate[])
    } catch (error) {
      console.error("Error creating update:", error)
      alert("Fehler beim Erstellen des Updates.")
    }
  }

  const handlePinUpdate = async (updateId: string, pinned: boolean) => {
    try {
      await updateDoc(doc(db, "projectUpdates", updateId), { pinned })
      setUpdates((prev) => prev.map((u) => (u.id === updateId ? { ...u, pinned } : u)))
    } catch (error) {
      console.error("Error pinning update:", error)
    }
  }

  const handleDeleteUpdate = async (updateId: string) => {
    if (!confirm("Möchten Sie dieses Update wirklich löschen?")) return

    try {
      await deleteDoc(doc(db, "projectUpdates", updateId))
      setUpdates((prev) => prev.filter((u) => u.id !== updateId))
    } catch (error) {
      console.error("Error deleting update:", error)
      alert("Fehler beim Löschen des Updates.")
    }
  }

  const onSubmitApproval = async (data: { itemTitle: string }) => {
    try {
      await addDoc(collection(db, "approvals"), {
        projectId,
        itemTitle: data.itemTitle,
        status: "pending",
        requestedAt: serverTimestamp(),
      })
      setShowApprovalDialog(false)
      resetApproval()
      // Reload approvals
      const approvalsQuery = query(
        collection(db, "approvals"),
        where("projectId", "==", projectId),
        orderBy("requestedAt", "desc")
      )
      const approvalsSnapshot = await getDocs(approvalsQuery)
      setApprovals(approvalsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        requestedAt: doc.data().requestedAt?.toDate() || new Date(),
        decidedAt: doc.data().decidedAt?.toDate(),
      })) as Approval[])
    } catch (error) {
      console.error("Error creating approval:", error)
      alert("Fehler beim Erstellen der Freigabe.")
    }
  }

  const handleResetApproval = async (approvalId: string) => {
    if (!confirm("Möchten Sie diese Freigabe wirklich zurücksetzen?")) return

    try {
      await updateDoc(doc(db, "approvals", approvalId), {
        status: "pending",
        comment: null,
        decidedAt: null,
        decidedBy: null,
      })
      setApprovals((prev) =>
        prev.map((a) =>
          a.id === approvalId
            ? { ...a, status: "pending" as const, comment: undefined, decidedAt: undefined, decidedBy: undefined }
            : a
        )
      )
    } catch (error) {
      console.error("Error resetting approval:", error)
      alert("Fehler beim Zurücksetzen der Freigabe.")
    }
  }

  const onSubmitTask = async (data: { title: string; for: "client" | "internal"; dueAt?: string }) => {
    try {
      await addDoc(collection(db, "tasks"), {
        projectId,
        title: data.title,
        for: data.for,
        dueAt: data.dueAt ? new Date(data.dueAt) : null,
        done: false,
        createdAt: serverTimestamp(),
      })
      setShowTaskDialog(false)
      resetTask()
      // Reload tasks
      const tasksQuery = query(
        collection(db, "tasks"),
        where("projectId", "==", projectId),
        orderBy("createdAt", "desc")
      )
      const tasksSnapshot = await getDocs(tasksQuery)
      setTasks(tasksSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        dueAt: doc.data().dueAt?.toDate(),
      })) as Task[])
    } catch (error) {
      console.error("Error creating task:", error)
      alert("Fehler beim Erstellen der Aufgabe.")
    }
  }

  const handleToggleTask = async (taskId: string) => {
    try {
      const task = tasks.find((t) => t.id === taskId)
      if (!task) return

      await updateDoc(doc(db, "tasks", taskId), {
        done: !task.done,
      })
      setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, done: !t.done } : t)))
    } catch (error) {
      console.error("Error toggling task:", error)
      alert("Fehler beim Aktualisieren der Aufgabe.")
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Möchten Sie diese Aufgabe wirklich löschen?")) return

    try {
      await deleteDoc(doc(db, "tasks", taskId))
      setTasks((prev) => prev.filter((t) => t.id !== taskId))
    } catch (error) {
      console.error("Error deleting task:", error)
      alert("Fehler beim Löschen der Aufgabe.")
    }
  }

  const handleFileUpload = async (fileList: FileList | null) => {
    if (!fileList || !projectId || !user) return

    const file = fileList[0]
    if (file.size > 50 * 1024 * 1024) {
      alert("Datei ist zu groß. Maximale Größe: 50MB")
      return
    }

    setUploading(true)
    setUploadProgress(0)
    try {
      const fileId = uuidv4()
      const filePath = `projects/${projectId}/${fileId}-${file.name}`
      const storageRef = ref(storage, filePath)

      const uploadTask = uploadBytesResumable(storageRef, file)
      
      uploadTask.on("state_changed", (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        setUploadProgress(progress)
      })

      await uploadTask
      const downloadURL = await getDownloadURL(storageRef)

      await addDoc(collection(db, "files"), {
        projectId,
        path: filePath,
        label: file.name,
        size: file.size,
        contentType: file.type,
        uploadedBy: user.id,
        createdAt: serverTimestamp(),
      })

      // Reload files
      const filesQuery = query(
        collection(db, "files"),
        where("projectId", "==", projectId),
        orderBy("createdAt", "desc")
      )
      const filesSnapshot = await getDocs(filesQuery)
      setFiles(filesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as File[])
    } catch (error) {
      console.error("Error uploading file:", error)
      alert("Fehler beim Hochladen der Datei.")
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const handleDeleteFile = async (fileId: string, filePath: string) => {
    if (!confirm("Möchten Sie diese Datei wirklich löschen?")) return

    try {
      await deleteObject(ref(storage, filePath))
      await deleteDoc(doc(db, "files", fileId))
      setFiles((prev) => prev.filter((f) => f.id !== fileId))
    } catch (error) {
      console.error("Error deleting file:", error)
      alert("Fehler beim Löschen der Datei.")
    }
  }

  const handleDownloadFile = async (file: File) => {
    try {
      const storageRef = ref(storage, file.path)
      const url = await getDownloadURL(storageRef)
      window.open(url, "_blank")
    } catch (error) {
      console.error("Error downloading file:", error)
      alert("Fehler beim Herunterladen der Datei.")
    }
  }

  const handlePreviewFile = async (file: File) => {
    try {
      const storageRef = ref(storage, file.path)
      const url = await getDownloadURL(storageRef)
      setShowFilePreview({ ...file, path: url } as any)
    } catch (error) {
      console.error("Error loading preview:", error)
      alert("Fehler beim Laden der Vorschau.")
    }
  }

  const onSubmitMessage = async (data: { text: string }) => {
    if (!user) return

    try {
      await addDoc(collection(db, "messages"), {
        projectId,
        senderId: user.id,
        text: data.text,
        attachments: [],
        createdAt: serverTimestamp(),
      })
      resetMessage()
      // Reload messages
      const messagesQuery = query(
        collection(db, "messages"),
        where("projectId", "==", projectId),
        orderBy("createdAt", "asc")
      )
      const messagesSnapshot = await getDocs(messagesQuery)
      const messagesData = messagesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as Message[]
      setMessages(messagesData)

      // Update user names
      const userIds = [...new Set(messagesData.map((m) => m.senderId))]
      const names: Record<string, string> = {}
      for (const userId of userIds) {
        try {
          const userDoc = await getDoc(doc(db, "users", userId))
          if (userDoc.exists()) {
            names[userId] = userDoc.data().name
          }
        } catch {
          names[userId] = "Unbekannt"
        }
      }
      setUserNames(names)
    } catch (error) {
      console.error("Error sending message:", error)
      alert("Fehler beim Senden der Nachricht.")
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <p>Lädt Projekt...</p>
        </div>
      </AdminLayout>
    )
  }

  if (!project) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <p>Projekt nicht gefunden</p>
        </div>
      </AdminLayout>
    )
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "dashboard", label: "Dashboard" },
    { id: "updates", label: "Updates" },
    { id: "designs", label: "Designs" },
    { id: "approvals", label: "Freigaben" },
    { id: "files", label: "Dateien" },
    { id: "tasks", label: "Aufgaben" },
    { id: "messages", label: "Nachrichten" },
  ]

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{project.title}</h1>
            <p className="text-muted-foreground">{client?.name || "Kein Kunde"}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b">
          <div className="flex gap-2 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "dashboard" && (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Projektdaten</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">Titel</Label>
                    <Input
                      id="title"
                      value={project.title}
                      onChange={(e) => setProject({ ...project, title: e.target.value })}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Typ</Label>
                    <Select
                      id="type"
                      value={project.type}
                      onChange={(e) => setProject({ ...project, type: e.target.value as ProjectType })}
                      className="mt-2"
                    >
                      <option value="Website">Website</option>
                      <option value="Branding">Branding</option>
                      <option value="Shopify">Shopify</option>
                      <option value="App">App</option>
                      <option value="Other">Anderes</option>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select
                      id="status"
                      value={project.status}
                      onChange={(e) => setProject({ ...project, status: e.target.value as ProjectStatus })}
                      className="mt-2"
                    >
                      <option value="Planning">Planung</option>
                      <option value="Design">Design</option>
                      <option value="Build">Umsetzung</option>
                      <option value="Review">Review</option>
                      <option value="Done">Abgeschlossen</option>
                      <option value="OnHold">Pausiert</option>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="progress">Fortschritt: {project.progress}%</Label>
                    <input
                      id="progress"
                      type="range"
                      min="0"
                      max="100"
                      value={project.progress}
                      onChange={(e) => setProject({ ...project, progress: parseInt(e.target.value) })}
                      className="mt-2 w-full"
                    />
                    <ProgressBar value={project.progress} className="mt-2" />
                  </div>
                  <div>
                    <Label htmlFor="owner">Owner</Label>
                    <Select
                      id="owner"
                      value={project.ownerId}
                      onChange={(e) => setProject({ ...project, ownerId: e.target.value })}
                      className="mt-2"
                    >
                      <option value="">Kein Owner</option>
                      {allUsers.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <Button onClick={handleSave} disabled={saving}>
                    <Save className="mr-2 h-4 w-4" />
                    {saving ? "Wird gespeichert..." : "Speichern"}
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Projektinfo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                    <div className="mt-1">
                      <StatusBadge status={project.status} />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Kunde</p>
                    <p className="mt-1">{client?.name || "Kein Kunde"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Owner</p>
                    <p className="mt-1">{owner?.name || "Kein Owner"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Typ</p>
                    <p className="mt-1">{project.type}</p>
                  </div>
                  {project.budgetRange && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Budgetrahmen</p>
                      <p className="mt-1">{project.budgetRange}</p>
                    </div>
                  )}
                  {project.goals && project.goals.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Ziele</p>
                      <ul className="mt-1 list-disc list-inside space-y-1">
                        {project.goals.map((goal, idx) => (
                          <li key={idx} className="text-sm">
                            {goal}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "updates" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Timeline Updates</h2>
              <Button onClick={() => setShowUpdateDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Update erstellen
              </Button>
            </div>

            <div className="space-y-4">
              {updates.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">Noch keine Updates</p>
                  </CardContent>
                </Card>
              ) : (
                updates.map((update) => (
                  <Card key={update.id} className={update.pinned ? "border-primary" : ""}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-base">{update.title}</CardTitle>
                            {update.pinned && <Badge variant="outline">Angepinnt</Badge>}
                          </div>
                          <TimelineItem update={update} userName={userNames[update.createdBy] || "Unbekannt"} />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handlePinUpdate(update.id, !update.pinned)}
                          >
                            <Pin className={`h-4 w-4 ${update.pinned ? "fill-current" : ""}`} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteUpdate(update.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === "designs" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Designs & Vorschau</CardTitle>
                <CardDescription>
                  Figma-Links und Staging-URLs verwalten
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="figmaUrl">Figma URL</Label>
                  <Input id="figmaUrl" placeholder="https://www.figma.com/design/..." className="mt-2" />
                </div>
                <div>
                  <Label htmlFor="stagingUrl">Staging URL</Label>
                  <Input id="stagingUrl" placeholder="https://staging.example.com" className="mt-2" />
                </div>
                <Button>Speichern</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Versionshistorie</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Versionshistorie wird hier angezeigt. (Feature noch nicht implementiert)
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "approvals" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Freigaben</h2>
              <Button onClick={() => setShowApprovalDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Freigabe-Item erstellen
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {approvals.length === 0 ? (
                <p className="text-center text-muted-foreground col-span-2 py-12">
                  Keine Freigaben gefunden
                </p>
              ) : (
                approvals.map((approval) => (
                  <Card key={approval.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>{approval.itemTitle}</CardTitle>
                        <Badge variant={approval.status === "approved" ? "default" : approval.status === "changes" ? "destructive" : "outline"}>
                          {approval.status === "pending" ? "Ausstehend" : approval.status === "approved" ? "Freigegeben" : "Änderungen"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {approval.comment && (
                        <p className="text-sm text-muted-foreground mb-4">{approval.comment}</p>
                      )}
                      {approval.status !== "pending" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResetApproval(approval.id)}
                          className="w-full"
                        >
                          Zurücksetzen
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === "files" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Datei hochladen</CardTitle>
                <CardDescription>Drag & Drop oder klicken Sie zum Auswählen</CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  onDragEnter={(e) => {
                    e.preventDefault()
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault()
                    handleFileUpload(e.dataTransfer.files)
                  }}
                  className="border-2 border-dashed rounded-lg p-12 text-center"
                >
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Drag & Drop oder{" "}
                    <label className="text-primary cursor-pointer hover:underline">
                      Datei auswählen
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e.target.files)}
                        disabled={uploading}
                      />
                    </label>
                  </p>
                  {uploading && (
                    <div className="mt-4">
                      <ProgressBar value={uploadProgress} />
                      <p className="text-sm text-muted-foreground mt-2">
                        {Math.round(uploadProgress)}% hochgeladen
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              {files.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">Noch keine Dateien</p>
                  </CardContent>
                </Card>
              ) : (
                files.map((file) => (
                  <Card key={file.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <FileItem file={file} onDownload={handleDownloadFile} onPreview={handlePreviewFile} />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteFile(file.id, file.path)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === "tasks" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Aufgaben</h2>
              <Button onClick={() => setShowTaskDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Aufgabe erstellen
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Kunden-Aufgaben</h3>
                {tasks.filter((t) => t.for === "client").length === 0 ? (
                  <p className="text-sm text-muted-foreground">Keine Kunden-Aufgaben</p>
                ) : (
                  tasks
                    .filter((t) => t.for === "client")
                    .map((task) => (
                      <div key={task.id} className="flex items-center gap-2">
                        <div className="flex-1">
                          <TaskItem task={task} onToggle={handleToggleTask} />
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteTask(task.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                )}
              </div>

              <div>
                <h3 className="font-semibold mb-2">Interne Aufgaben</h3>
                {tasks.filter((t) => t.for === "internal").length === 0 ? (
                  <p className="text-sm text-muted-foreground">Keine internen Aufgaben</p>
                ) : (
                  tasks
                    .filter((t) => t.for === "internal")
                    .map((task) => (
                      <div key={task.id} className="flex items-center gap-2">
                        <div className="flex-1">
                          <TaskItem task={task} onToggle={handleToggleTask} />
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteTask(task.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "messages" && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Nachrichten</h2>
            
            <Card className="flex flex-col h-[600px]">
              <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 ? (
                  <p className="text-center text-muted-foreground py-12">
                    Noch keine Nachrichten
                  </p>
                ) : (
                  messages.map((message) => (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      senderName={userNames[message.senderId] || "Unbekannt"}
                      isOwnMessage={message.senderId === user?.id}
                    />
                  ))
                )}
              </CardContent>
              
              <div className="border-t p-4">
                <form onSubmit={handleSubmitMessage(onSubmitMessage)} className="flex gap-2">
                  <Input
                    {...registerMessage("text")}
                    placeholder="Nachricht schreiben..."
                    className="flex-1"
                  />
                  <Button type="submit">
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
                {errorsMessage.text && (
                  <p className="text-sm text-destructive mt-1">
                    {errorsMessage.text.message}
                  </p>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* Dialogs */}
        <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update erstellen</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmitUpdate(onSubmitUpdate)} className="space-y-4">
              <div>
                <Label htmlFor="kind">Art</Label>
                <Select {...registerUpdate("kind")} className="mt-2">
                  <option value="milestone">Meilenstein</option>
                  <option value="note">Notiz</option>
                  <option value="delivery">Lieferung</option>
                  <option value="request">Anfrage</option>
                </Select>
              </div>
              <div>
                <Label htmlFor="title">Titel</Label>
                <Input {...registerUpdate("title")} className="mt-2" />
                {errorsUpdate.title && (
                  <p className="text-sm text-destructive mt-1">{errorsUpdate.title.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="body">Beschreibung</Label>
                <Textarea {...registerUpdate("body")} className="mt-2 min-h-[120px]" />
                {errorsUpdate.body && (
                  <p className="text-sm text-destructive mt-1">{errorsUpdate.body.message}</p>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowUpdateDialog(false)}>
                  Abbrechen
                </Button>
                <Button type="submit">Erstellen</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Freigabe-Item erstellen</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmitApproval(onSubmitApproval)} className="space-y-4">
              <div>
                <Label htmlFor="itemTitle">Item-Titel</Label>
                <Input {...registerApproval("itemTitle")} className="mt-2" />
                {errorsApproval.itemTitle && (
                  <p className="text-sm text-destructive mt-1">{errorsApproval.itemTitle.message}</p>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowApprovalDialog(false)}>
                  Abbrechen
                </Button>
                <Button type="submit">Erstellen</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Aufgabe erstellen</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmitTask(onSubmitTask)} className="space-y-4">
              <div>
                <Label htmlFor="title">Titel</Label>
                <Input {...registerTask("title")} className="mt-2" />
                {errorsTask.title && (
                  <p className="text-sm text-destructive mt-1">{errorsTask.title.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="for">Für</Label>
                <Select {...registerTask("for")} className="mt-2">
                  <option value="client">Kunde</option>
                  <option value="internal">Intern</option>
                </Select>
              </div>
              <div>
                <Label htmlFor="dueAt">Fälligkeitsdatum (optional)</Label>
                <Input {...registerTask("dueAt")} type="date" className="mt-2" />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowTaskDialog(false)}>
                  Abbrechen
                </Button>
                <Button type="submit">Erstellen</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={!!showFilePreview} onOpenChange={() => setShowFilePreview(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{showFilePreview?.label}</DialogTitle>
            </DialogHeader>
            {showFilePreview && (
              <div className="mt-4">
                {showFilePreview.contentType?.startsWith("image/") ? (
                  <img src={showFilePreview.path} alt={showFilePreview.label} className="max-w-full h-auto" />
                ) : showFilePreview.contentType?.includes("pdf") ? (
                  <iframe src={showFilePreview.path} className="w-full h-[600px]" />
                ) : (
                  <p className="text-muted-foreground">Vorschau nicht verfügbar</p>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  )
}
