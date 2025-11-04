export type UserRole = "admin" | "client"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  clientId?: string
  photoURL?: string
  createdAt: Date
}

export interface Client {
  id: string
  name: string
  contactEmail: string
  phone?: string
  notes?: string
  createdAt: Date
}

export type ProjectType = "Website" | "Branding" | "Shopify" | "App" | "Other"
export type ProjectStatus = "Planning" | "Design" | "Build" | "Review" | "Done" | "OnHold"

export interface Project {
  id: string
  clientId: string
  title: string
  type: ProjectType
  status: ProjectStatus
  progress: number // 0-100
  ownerId: string
  budgetRange?: string
  goals: string[]
  createdAt: Date
  updatedAt: Date
}

export type UpdateKind = "milestone" | "note" | "delivery" | "request"

export interface ProjectUpdate {
  id: string
  projectId: string
  kind: UpdateKind
  title: string
  body: string
  createdBy: string
  createdAt: Date
  pinned: boolean
}

export type ApprovalStatus = "pending" | "approved" | "changes"

export interface Approval {
  id: string
  projectId: string
  itemTitle: string
  status: ApprovalStatus
  comment?: string
  requestedAt: Date
  decidedAt?: Date
  decidedBy?: string
}

export interface Task {
  id: string
  projectId: string
  for: "client" | "internal"
  title: string
  dueAt?: Date
  done: boolean
  createdAt: Date
}

export interface File {
  id: string
  projectId: string
  path: string
  label: string
  size: number
  contentType: string
  uploadedBy: string
  createdAt: Date
}

export interface Message {
  id: string
  projectId: string
  senderId: string
  text: string
  attachments?: string[]
  createdAt: Date
}

export interface Appointment {
  id: string
  projectId?: string
  name: string
  email: string
  topic: string
  duration: number
  when: Date
  status: string
}

export interface Booking {
  id: string
  type: "phone" | "email"
  contact: string
  date: string
  time: string
  duration: number
  status: string
  description?: string
  notes?: string
  createdAt: Date
}
