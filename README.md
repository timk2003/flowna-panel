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

## Deployment

Das Projekt kann einfach auf Vercel deployed werden:

1. Verbinde dein Repository mit Vercel
2. Füge die Firebase-Umgebungsvariablen in den Vercel-Settings hinzu
3. Deploy!

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