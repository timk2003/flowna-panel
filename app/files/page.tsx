"use client"

import { useEffect, useState, useRef } from "react"
import { collection, query, where, getDocs, addDoc } from "firebase/firestore"
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage"
import { db, storage } from "@/lib/firebase"
import { useAuth } from "@/hooks/useAuth"
import { ClientLayout } from "@/components/layouts/ClientLayout"
import { FileItem } from "@/components/FileItem"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { File } from "@/types"
import { Upload, FileIcon } from "lucide-react"
import { v4 as uuidv4 } from "uuid"

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
const ALLOWED_TYPES = ["image/*", "application/pdf", "application/vnd.openxmlformats-officedocument.*"]

export default function FilesPage() {
  const { user } = useAuth()
  const [projectId, setProjectId] = useState<string | null>(null)
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  useEffect(() => {
    if (!user?.clientId) return

    const loadFiles = async () => {
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
          const filesQuery = query(
            collection(db, "files"),
            where("projectId", "==", pid)
          )
          const filesSnapshot = await getDocs(filesQuery)
          const filesData = filesSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
          })) as File[]
          setFiles(filesData)
        }
      } catch (error) {
        console.error("Error loading files:", error)
      }
    }

    loadFiles()
  }, [user])

  const handleFileUpload = async (fileList: FileList | null) => {
    if (!fileList || !projectId || !user) return

    const file = fileList[0]
    if (file.size > MAX_FILE_SIZE) {
      alert(`Datei ist zu groß. Maximale Größe: ${MAX_FILE_SIZE / 1024 / 1024}MB`)
      return
    }

    setUploading(true)
    try {
      const fileId = uuidv4()
      const filePath = `projects/${projectId}/${fileId}-${file.name}`
      const storageRef = ref(storage, filePath)

      const uploadTask = uploadBytesResumable(storageRef, file)
      
      await uploadTask

      const downloadURL = await getDownloadURL(storageRef)

      await addDoc(collection(db, "files"), {
        projectId,
        path: filePath,
        label: file.name,
        size: file.size,
        contentType: file.type,
        uploadedBy: user.id,
        createdAt: new Date(),
      })

      // Datei zur Liste hinzufügen
      const newFile: File = {
        id: fileId,
        projectId,
        path: filePath,
        label: file.name,
        size: file.size,
        contentType: file.type,
        uploadedBy: user.id,
        createdAt: new Date(),
      }
      setFiles((prev) => [newFile, ...prev])
    } catch (error) {
      console.error("Error uploading file:", error)
      alert("Fehler beim Hochladen der Datei. Bitte versuchen Sie es erneut.")
    } finally {
      setUploading(false)
    }
  }

  const handleDownload = async (file: File) => {
    try {
      const storageRef = ref(storage, file.path)
      const url = await getDownloadURL(storageRef)
      window.open(url, "_blank")
    } catch (error) {
      console.error("Error downloading file:", error)
      alert("Fehler beim Herunterladen der Datei.")
    }
  }

  return (
    <ClientLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Dateien</h1>

        <Card>
          <CardHeader>
            <CardTitle>Datei hochladen</CardTitle>
            <CardDescription>
              Drag & Drop oder klicken Sie zum Auswählen. Max. Größe: 50MB
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              onDragEnter={(e) => {
                e.preventDefault()
                setDragActive(true)
              }}
              onDragLeave={(e) => {
                e.preventDefault()
                setDragActive(false)
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                setDragActive(false)
                handleFileUpload(e.dataTransfer.files)
              }}
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                dragActive ? "border-primary bg-primary/5" : "border-muted"
              }`}
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
              <p className="text-xs text-muted-foreground">
                Erlaubte Typen: Bilder, PDF, Office-Dokumente
              </p>
            </div>
            {uploading && (
              <p className="mt-4 text-sm text-muted-foreground">
                Wird hochgeladen...
              </p>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          {files.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Noch keine Dateien hochgeladen</p>
              </CardContent>
            </Card>
          ) : (
            files.map((file) => (
              <FileItem
                key={file.id}
                file={file}
                onDownload={handleDownload}
              />
            ))
          )}
        </div>
      </div>
    </ClientLayout>
  )
}
