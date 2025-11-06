# Flowna Panel

> Ein vollständiges Projektmanagement-Panel für Design- und Entwicklungsagenturen mit getrennten Bereichen für Admins und Kunden.

## 🎯 Überblick

Flowna Panel ist eine moderne Web-Anwendung, die die Kommunikation und Zusammenarbeit zwischen Agenturen und ihren Kunden vereinfacht. Mit zwei spezialisierten Interfaces – einem für Admins und einem für Kunden – ermöglicht es transparente Projektabwicklung, strukturierte Kommunikation und effizientes Feedback-Management.

## ✨ Features

### 👥 Client-Panel (Kundenseite)

Das Client-Panel bietet Kunden eine übersichtliche Oberfläche, um ihre Projekte zu verfolgen und mit der Agentur zu interagieren:

- **📊 Dashboard**  
  Projektübersicht mit aktuellem Status, Fortschrittsbalken und nächsten Schritten

- **📅 Timeline**  
  Chronologischer Projektverlauf mit filterbaren Update-Kategorien:
  - Meilensteine (wichtige Projektphasen)
  - Notizen (Kommunikation und Hinweise)
  - Lieferungen (fertige Assets und Deliverables)
  - Anfragen (Kundenfragen und Rückmeldungen)

- **🎨 Designs & Vorschau**  
  - Eingebettete Figma-Prototypen
  - Staging-Links für Live-Vorschauen
  - Versionshistorie für Design-Iterationen

- **✅ Freigaben**  
  Strukturierter Freigabe-Workflow:
  - Approve (Design/Feature freigeben)
  - Changes (Änderungen anfordern mit Kommentarfunktion)

- **📁 Dateien**  
  - Upload via Drag & Drop
  - Download von bereitgestellten Assets
  - Vorschau-Funktion für Bilder und Dokumente

- **✓ Aufgaben**  
  To-Do-Liste mit Fälligkeitsdaten für kundenspezifische Action Items

- **💬 Nachrichten**  
  Echtzeit-Chat-Funktion pro Projekt für direkte Kommunikation

- **👤 Profil & Support**  
  Kontaktinformationen, Support-Links und rechtliche Dokumente

**Login:** Passwortloser Zugang via Magic Link per E-Mail

### 🔧 Admin-Panel (Agenturseite)

Das Admin-Panel bietet umfassende Verwaltungs- und Steuerungsfunktionen:

- **📋 Projekte**  
  - Übersicht aller Projekte mit Status-Badges
  - Fortschrittsanzeige (0-100%)
  - Suchfunktion und Filteroptionen
  - Detailansicht mit allen Projektinformationen
  - Projekterstellung und -bearbeitung

- **🏢 Kunden**  
  - Kundendatenbank mit Kontaktinformationen
  - Notizfunktion für interne Anmerkungen
  - Zuordnung von Projekten zu Kunden
  - Anlegen neuer Kunden

- **📆 Termine**  
  - Terminverwaltung für Meetings und Calls
  - Synchronisierung mit Kalender-Systemen
  - Status-Tracking (geplant, bestätigt, abgeschlossen)

- **📥 Eingänge (Inbox)**  
  Zentrale Übersicht über alle neuen Aktivitäten:
  - Neue Datei-Uploads von Kunden
  - Ausstehende Freigaben
  - Ungelesene Nachrichten
  - Priorisierte Aufgabenliste

- **📊 Berichte**  
  - Projektstatistiken und KPIs
  - Auslastungsübersicht
  - Timeline-Analysen

- **⚙️ Einstellungen**  
  - Branding-Anpassungen (Logo, Farben)
  - Arbeitszeiten-Konfiguration
  - E-Mail-Vorlagen für automatisierte Kommunikation

- **👥 Benutzerverwaltung**  
  Erstellen neuer Admin- und Client-Accounts

**Login:** Klassische E-Mail + Passwort Authentifizierung

## 🏗️ Technologie-Stack

### Frontend

- **[Next.js 16](https://nextjs.org/)** - React-Framework mit App Router
- **[Tailwind CSS 4](https://tailwindcss.com/)** - Utility-First CSS Framework
- **[shadcn/ui](https://ui.shadcn.com/)** - Hochwertige UI-Komponenten basierend auf Radix UI
- **[react-hook-form](https://react-hook-form.com/)** - Performante Formular-Verwaltung
- **[Zod](https://zod.dev/)** - TypeScript-first Schema-Validierung
- **[Lucide Icons](https://lucide.dev/)** - Modernes Icon-Set
- **[date-fns](https://date-fns.org/)** - Moderne JavaScript-Date-Library
- **[react-dropzone](https://react-dropzone.js.org/)** - Drag & Drop Datei-Upload

### Backend & Services

- **[Firebase Authentication](https://firebase.google.com/products/auth)** - Benutzer-Authentifizierung
  - Magic Links für Kunden (passwortlos)
  - E-Mail/Passwort für Admins
- **[Cloud Firestore](https://firebase.google.com/products/firestore)** - NoSQL Echtzeit-Datenbank
- **[Firebase Storage](https://firebase.google.com/products/storage)** - Cloud-Speicher für Dateien
- **Firebase Functions** - Serverless Functions (geplant für E-Mail-Benachrichtigungen)

### Development

- **TypeScript** - Typsicherheit und bessere Developer Experience
- **ESLint** - Code-Quality und Best Practices
- **Vercel** - Hosting und Deployment-Plattform

## 📦 Datenmodell & Architektur

### Firestore Collections

Die Datenbank-Struktur ist vollständig in TypeScript typisiert (`types/index.ts`):

#### **users**
Benutzer-Accounts mit Rollenverwaltung
```typescript
{
  id: string
  name: string
  email: string
  role: "admin" | "client"
  clientId?: string  // Referenz auf clients-Collection
  photoURL?: string
  createdAt: Date
}
```

#### **clients**
Kunden-Informationen
```typescript
{
  id: string
  name: string
  contactEmail: string
  phone?: string
  notes?: string  // Interne Admin-Notizen
  createdAt: Date
}
```

#### **projects**
Projekte mit Status-Tracking
```typescript
{
  id: string
  clientId: string
  title: string
  type: "Website" | "Branding" | "Shopify" | "App" | "Other"
  status: "Planning" | "Design" | "Build" | "Review" | "Done" | "OnHold"
  progress: number  // 0-100
  ownerId: string  // Admin, der das Projekt betreut
  budgetRange?: string
  goals: string[]
  createdAt: Date
  updatedAt: Date
}
```

#### **projectUpdates**
Timeline-Einträge für Projektverlauf
```typescript
{
  id: string
  projectId: string
  kind: "milestone" | "note" | "delivery" | "request"
  title: string
  body: string
  createdBy: string  // User-ID
  createdAt: Date
  pinned: boolean  // Wichtige Updates anpinnen
}
```

#### **approvals**
Freigabe-Management
```typescript
{
  id: string
  projectId: string
  itemTitle: string
  status: "pending" | "approved" | "changes"
  comment?: string
  requestedAt: Date
  decidedAt?: Date
  decidedBy?: string  // Client User-ID
}
```

#### **tasks**
Aufgaben für Kunden oder interne Teams
```typescript
{
  id: string
  projectId: string
  for: "client" | "internal"
  title: string
  dueAt?: Date
  done: boolean
  createdAt: Date
}
```

#### **files**
Datei-Metadaten (Dateien selbst in Firebase Storage)
```typescript
{
  id: string
  projectId: string
  path: string  // Storage-Pfad
  label: string
  size: number
  contentType: string
  uploadedBy: string  // User-ID
  createdAt: Date
}
```

#### **messages**
Echtzeit-Nachrichten pro Projekt
```typescript
{
  id: string
  projectId: string
  senderId: string  // User-ID
  text: string
  attachments?: string[]  // Optional: Datei-Referenzen
  createdAt: Date
}
```

#### **appointments**
Terminverwaltung
```typescript
{
  id: string
  projectId?: string
  name: string
  email: string
  topic: string
  duration: number  // in Minuten
  when: Date
  status: string
}
```

### Security & Zugriffsrechte

Firebase Security Rules sorgen für rollenbasierte Zugriffskontrolle:

- **Admins**: Vollzugriff auf alle Daten
- **Clients**: Nur Zugriff auf eigene Projekte (via `clientId`-Verknüpfung)
- **Storage**: Projekt-spezifische Ordnerstruktur mit entsprechenden Rechten

Details siehe `FIREBASE_RULES.md`

## 🔄 Workflow & User Journey

### Typischer Projekt-Ablauf:

1. **Admin erstellt neuen Kunden**
   - Eingabe von Kontaktdaten
   - System generiert Client-Account

2. **Admin legt Projekt an**
   - Projektdetails, Typ, Budget-Range
   - Zuordnung zum Kunden
   - Projekt erscheint automatisch im Client-Dashboard

3. **Kunde erhält Magic Link**
   - Passwortloser Login per E-Mail
   - Direkter Zugriff auf Projekt-Dashboard

4. **Admin postet Updates**
   - Meilensteine: "Design-Phase abgeschlossen"
   - Lieferungen: "Erste Wireframes verfügbar"
   - Anfragen: "Feedback zu Logo-Entwürfen benötigt"
   - Updates erscheinen in Echtzeit in der Kunden-Timeline

5. **Kunde interagiert**
   - Designs freigeben oder Änderungen anfordern
   - Dateien hochladen (Fotos, Texte, etc.)
   - Nachrichten senden
   - Aufgaben abhaken

6. **Admin sieht alles zentral**
   - Inbox zeigt alle neuen Aktivitäten
   - Direkte Navigation zu relevanten Projekten
   - Echtzeit-Updates bei neuen Nachrichten

7. **Projekt-Abschluss**
   - Status auf "Done" setzen
   - Finale Lieferungen hochladen
   - Projekt bleibt zur Referenz zugänglich

## 🚀 Setup & Installation

### Voraussetzungen

- Node.js 18+ und npm
- Firebase-Account (kostenlos)
- Git

### 1. Repository klonen

```bash
git clone <repository-url>
cd flowna-panel
```

### 2. Dependencies installieren

```bash
npm install
```

### 3. Firebase-Projekt erstellen

1. Gehe zu [Firebase Console](https://console.firebase.google.com/)
2. Erstelle ein neues Projekt
3. Aktiviere:
   - **Authentication** (E-Mail/Password + E-Mail-Link)
   - **Firestore Database** (Production Mode)
   - **Storage** (Production Mode)

### 4. Umgebungsvariablen konfigurieren

Erstelle eine `.env.local` Datei im Root-Verzeichnis:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=deine-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=dein-projekt.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=dein-projekt-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=dein-projekt.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=deine-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=deine-app-id
```

> Firebase-Config findest du in: Firebase Console → Projekteinstellungen → Deine Apps

### 5. Firebase Security Rules einrichten

Kopiere die Rules aus `FIREBASE_RULES.md` in die Firebase Console:

- **Firestore Rules**: Firestore Database → Rules
- **Storage Rules**: Storage → Rules
- **Composite Indexes**: Firestore Database → Indexes (automatisch erstellt bei erster Nutzung)

### 6. Entwicklungsserver starten

```bash
npm run dev
```

Die Anwendung läuft auf [http://localhost:3000](http://localhost:3000)

### 7. Ersten Admin-User erstellen

Da noch keine Benutzer existieren, musst du den ersten Admin manuell anlegen:

1. Registriere einen User über Firebase Console (Authentication → Users → Add user)
2. Erstelle ein Dokument in der `users` Collection:
   ```json
   {
     "id": "<firebase-user-id>",
     "name": "Admin Name",
     "email": "admin@example.com",
     "role": "admin",
     "createdAt": "<current-timestamp>"
   }
   ```

Alternativ kannst du das Setup-Script nutzen (siehe `scripts/` Ordner)

## 🌐 Deployment auf Vercel

### Vorbereitung

1. **Build lokal testen**:
   ```bash
   npm run build
   npm run start  # Production-Server lokal testen
   ```

2. **Repository committen**:
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push
   ```

### Deployment-Optionen

#### 👍 Option 1: Vercel Dashboard (Empfohlen)

1. Gehe zu [vercel.com](https://vercel.com) und melde dich an
2. **"Add New Project"** → Repository auswählen
3. Framework Preset: **Next.js** (automatisch erkannt)
4. **Environment Variables** hinzufügen:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
   NEXT_PUBLIC_FIREBASE_PROJECT_ID
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
   NEXT_PUBLIC_FIREBASE_APP_ID
   ```
   > Tipp: Wähle "Production, Preview, Development" für alle Variablen

5. **Deploy** klicken → Fertig! 🎉

#### ⌨️ Option 2: Vercel CLI

```bash
# CLI installieren
npm i -g vercel

# Deploy starten
vercel

# Umgebungsvariablen setzen
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
# ... etc.

# Production Deployment
vercel --prod
```

### Post-Deployment Setup

#### 1. Firebase Auth Domain autorisieren

Fire Console → Authentication → Settings → Authorized domains:
- Füge hinzu: `deine-app.vercel.app`
- Bei Custom Domain: `deine-domain.de`

#### 2. Custom Domain einrichten (optional)

Vercel Dashboard → Project Settings → Domains:
1. Domain hinzufügen
2. DNS-Records konfigurieren (A/CNAME)
3. SSL wird automatisch bereitgestellt

#### 3. Performance optimieren

- **Image Optimization**: Funktioniert automatisch auf Vercel
- **Caching**: Next.js Static Generation wird genutzt
- **Edge Functions**: Für globale Performance

### 🔧 Troubleshooting

| Problem | Lösung |
|---------|--------|
| Build-Fehler | Build-Logs in Vercel Dashboard prüfen |
| Firebase Auth Error | Authorized Domains in Firebase prüfen |
| Umgebungsvariablen fehlen | Alle `NEXT_PUBLIC_*` Variablen setzen |
| Storage Upload Error | CORS-Konfiguration in Firebase Storage |
| TypeScript Errors | `npm run build` lokal ausführen |

## 📚 Weitere Dokumentation

- **`FIREBASE_RULES.md`** - Security Rules für Firestore und Storage
- **`DEPLOYMENT.md`** - Erweiterte Deployment-Anleitung
- **`README_ADMIN_SETUP.md`** - Admin-Setup und erste Schritte
- **`types/index.ts`** - Vollständige TypeScript-Typdefinitionen

## 🛠️ Entwicklung

### Projekt-Struktur

```
flowna-panel/
├── app/                    # Next.js App Router
│   ├── (client-routes)/    # Kunden-Seiten
│   │   ├── page.tsx        # Dashboard
│   │   ├── timeline/       # Projektverlauf
│   │   ├── designs/        # Design-Vorschauen
│   │   ├── approvals/      # Freigaben
│   │   ├── files/          # Dateiverwaltung
│   │   ├── tasks/          # Aufgaben
│   │   └── messages/       # Nachrichten
│   └── admin/              # Admin-Panel
│       ├── projects/       # Projektverwaltung
│       ├── clients/        # Kundenverwaltung
│       ├── inbox/          # Eingangsverwaltung
│       ├── appointments/   # Terminverwaltung
│       ├── reports/        # Berichte
│       └── settings/       # Einstellungen
├── components/            # Wiederverwendbare UI-Komponenten
├── lib/                   # Utilities und Firebase-Config
├── types/                 # TypeScript-Typdefinitionen
├── hooks/                 # Custom React Hooks
└── public/                # Statische Assets
```

### Scripts

```bash
npm run dev      # Entwicklungsserver (localhost:3000)
npm run build    # Production Build
npm run start    # Production Server lokal
npm run lint     # ESLint prüfen
```

### Code-Standards

- **TypeScript**: Strikte Typisierung für alle Komponenten
- **ESLint**: Next.js-Konfiguration
- **Tailwind**: Utility-First CSS mit konsistenten Design-Tokens
- **Komponenten**: shadcn/ui für konsistente UI

## 🚀 Roadmap & geplante Features

### Version 2.0
- [ ] **E-Mail-Benachrichtigungen** via Firebase Functions
- [ ] **Figma-Embed** direkt in Design-Ansicht
- [ ] **Erweiterte Berichte** mit Grafiken und Analysen
- [ ] **Webhook-Integration** für externe Tools
- [ ] **Multi-Projekt-Support** für Kunden mit mehreren Projekten

### Version 2.1
- [ ] **Kanban-Board** für Admin-Projektansicht
- [ ] **Erweiterte Rollen** (z.B. Projektmanager, Designer)
- [ ] **Kommentar-Funktion** in Dateien und Designs
- [ ] **Invoice-Integration** für Rechnungsstellung
- [ ] **Mobile App** (React Native)

### Version 3.0
- [ ] **White-Label** Anpassungen für verschiedene Agenturen
- [ ] **API** für externe Integrationen
- [ ] **Time-Tracking** für Projektzeit-Erfassung
- [ ] **Resource-Planning** für Team-Auslastung

## ❓ FAQ

**Q: Kann ich das Panel für mehrere Agenturen nutzen?**  
A: Aktuell ist es für eine Agentur optimiert. White-Label-Support ist für v3.0 geplant.

**Q: Werden E-Mails automatisch versendet?**  
A: Noch nicht. E-Mail-Benachrichtigungen via Firebase Functions sind in Entwicklung.

**Q: Ist Multi-Tenant-Support verfügbar?**  
A: Nein, aber durch Firebase-Isolation könnten mehrere Instanzen parallel laufen.

**Q: Kann ich eigene Branding-Farben nutzen?**  
A: Ja, über die Admin-Einstellungen (Branding-Sektion).

**Q: Wie skaliert die Anwendung?**  
A: Durch Firebase und Vercel automatisch. Bei sehr hohen Nutzerzahlen ggf. Firebase-Plan upgraden.

## 👥 Support & Contribution

Dieses Projekt ist privat für Flowna entwickelt. Bei Fragen oder Feature-Requests:

- 📧 E-Mail: support@flowna.de
- 🐛 Issues: GitHub Issues (falls Repository public)
- 📝 Dokumentation: Siehe `/docs` Ordner

## 📜 Lizenz

**Privat © 2025 Flowna**  
Alle Rechte vorbehalten. Nicht zur kommerziellen Weiterverbreitung geeignet.

---

**Gebaut mit ❤️ von Flowna**
