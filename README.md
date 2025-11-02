# Flowna Panel

Ein umfassendes Kunden- und Admin-Panel für Projektmanagement, gebaut mit Next.js, Firebase und Tailwind CSS.

## Features

### Kunden-Panel
- **Dashboard**: Projektübersicht, Status, Fortschritt, nächste Schritte
- **Projektverlauf**: Timeline mit Filtern (Meilensteine, Notizen, Lieferungen, Anfragen)
- **Designs & Vorschau**: Figma-Embed, Staging-Links, Versionshistorie
- **Freigaben**: Freigabe-Items mit Approve/Änderungen-Workflow
- **Dateien**: Upload via Drag & Drop, Download, Vorschau
- **Aufgaben**: Kundenaufgaben mit Fälligkeitsdaten
- **Nachrichten**: Echtzeit-Kommunikation pro Projekt
- **Profil & Support**: Kontaktinformationen und rechtliche Links

### Admin-Panel
- **Projekte**: Übersicht mit Status, Fortschritt, Suche
- **Kunden**: Kundenverwaltung mit Kontaktdaten
- **Termine**: Terminverwaltung und -synchronisierung
- **Eingänge**: Neue Uploads, Freigaben, Nachrichten
- **Berichte**: Statistiken und Auslastungsübersicht
- **Einstellungen**: Branding, Working Hours, Mail-Vorlagen

## Technologie-Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS 4
- **UI-Komponenten**: shadcn/ui
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Forms**: react-hook-form + zod
- **Daten**: date-fns für Datumsformate

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