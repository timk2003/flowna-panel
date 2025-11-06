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

## Setup

### 1. Dependencies installieren

```bash
npm install
```

### 2. Firebase-Konfiguration

Erstelle eine `.env.local` Datei im Root-Verzeichnis mit folgenden Variablen:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=deine-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=dein-projekt.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=dein-projekt-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=dein-projekt.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=deine-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=deine-app-id
```

### 3. Firebase Security Rules

Kopiere die Rules aus `FIREBASE_RULES.md` in die Firebase Console:

- **Firestore Rules**: Firestore Database → Rules
- **Storage Rules**: Storage → Rules
- **Indexe erstellen**: Firestore Database → Indexes

### 4. Entwicklungsserver starten

```bash
npm run dev
```

Die Anwendung läuft dann auf [http://localhost:3000](http://localhost:3000).

## Datenmodell

Die Firestore-Struktur ist in `types/index.ts` definiert. Hauptsammlungen:

- `users` - Benutzer mit Rollen (admin/client)
- `clients` - Kundeninformationen
- `projects` - Projekte mit Status und Fortschritt
- `projectUpdates` - Timeline-Updates
- `approvals` - Freigabe-Items
- `tasks` - Aufgaben für Kunden oder intern
- `files` - Datei-Metadaten
- `messages` - Nachrichten pro Projekt
- `appointments` - Terminbuchungen

## Authentifizierung

- **Kunden**: E-Mail-Link-Login (Magic Link)
- **Admin**: Klassisches E-Mail-Passwort-Login

Der Invite-Flow sollte über eine Cloud Function oder Admin-Interface implementiert werden.

## Deployment auf Vercel

### Vorbereitung

1. **Repository vorbereiten**:
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push
   ```

2. **Build lokal testen**:
   ```bash
   npm run build
   ```
   Stelle sicher, dass der Build ohne Fehler durchläuft.

### Vercel Deployment

#### Option 1: Via Vercel Dashboard (Empfohlen)

1. Gehe zu [vercel.com](https://vercel.com) und melde dich an
2. Klicke auf **"Add New Project"**
3. Verbinde dein GitHub/GitLab/Bitbucket Repository
4. Wähle das `flowna-panel` Repository aus
5. Vercel erkennt automatisch Next.js - keine zusätzliche Konfiguration nötig
6. **Wichtig**: Füge die Umgebungsvariablen hinzu:
   - Klicke auf **"Environment Variables"**
   - Füge alle Firebase-Variablen hinzu:
     - `NEXT_PUBLIC_FIREBASE_API_KEY`
     - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
     - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
     - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
     - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
     - `NEXT_PUBLIC_FIREBASE_APP_ID`
   - Wähle **Production, Preview, Development** für alle
7. Klicke auf **"Deploy"**

#### Option 2: Via Vercel CLI

1. Installiere Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Folge den Anweisungen und füge Umgebungsvariablen hinzu:
   ```bash
   vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
   vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
   # ... für alle weiteren Variablen
   ```

### Nach dem Deployment

1. **Firebase Auth Domain konfigurieren**:
   - Gehe zur Firebase Console → Authentication → Settings
   - Füge deine Vercel-URL zu den **Authorized domains** hinzu
   - Beispiel: `flowna-panel.vercel.app` oder deine Custom Domain

2. **Firebase Storage CORS konfigurieren** (falls nötig):
   - Firebase Storage sollte automatisch funktionieren
   - Bei Problemen: Firebase Console → Storage → Rules → CORS konfigurieren

3. **Custom Domain (optional)**:
   - In Vercel: Project Settings → Domains
   - Füge deine Domain hinzu
   - Folge den DNS-Anweisungen

### Troubleshooting

- **Build-Fehler**: Prüfe die Build-Logs in Vercel Dashboard
- **Umgebungsvariablen**: Stelle sicher, dass alle `NEXT_PUBLIC_*` Variablen gesetzt sind
- **Firebase-Verbindung**: Prüfe die Browser-Konsole auf Firebase-Fehler
- **Images**: Next.js Image-Optimierung funktioniert automatisch auf Vercel

## Nächste Schritte / V2 Features

- [ ] Cloud Functions für E-Mail-Benachrichtigungen
- [ ] Figma-Embed Integration
- [ ] Erweiterte Berichte und Statistiken
- [ ] Webhook-Integration
- [ ] Erweiterte Rollen & Rechte
- [ ] Multi-Projekt-Support pro Kunde
- [ ] Kanban-Board für Admin-Projektübersicht

## Lizenz

Privat - Flowna