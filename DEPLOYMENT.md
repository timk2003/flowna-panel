# Vercel Deployment Guide

## Schnellstart

### 1. Repository vorbereiten

```bash
# Stelle sicher, dass alle Änderungen committed sind
git status
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2. Build lokal testen

```bash
npm run build
```

Wenn der Build erfolgreich ist, kannst du fortfahren.

### 3. Vercel Account erstellen

1. Gehe zu [vercel.com](https://vercel.com)
2. Melde dich mit GitHub/GitLab/Bitbucket an
3. Importiere dein Repository

### 4. Umgebungsvariablen konfigurieren

In den Vercel Project Settings → Environment Variables:

Füge folgende Variablen hinzu (für Production, Preview und Development):

```
NEXT_PUBLIC_FIREBASE_API_KEY=your-value
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-value
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-value
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-value
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-value
NEXT_PUBLIC_FIREBASE_APP_ID=your-value
```

### 5. Deploy!

Klicke auf **Deploy** - Vercel wird automatisch:
- Dependencies installieren (`npm install`)
- Projekt builden (`npm run build`)
- Deployen

## Firebase-Konfiguration nach Deployment

### Auth Domains

1. Firebase Console → Authentication → Settings → Authorized domains
2. Füge deine Vercel-URL hinzu:
   - `your-project.vercel.app`
   - Deine Custom Domain (falls vorhanden)

### Firestore & Storage Rules

Die Rules müssen bereits in Firebase Console konfiguriert sein (siehe `FIREBASE_RULES.md`).

## Custom Domain

1. In Vercel: Project Settings → Domains
2. Domain hinzufügen
3. DNS-Einstellungen konfigurieren (A/AAAA Records)
4. Warte auf DNS-Propagation
5. SSL-Zertifikat wird automatisch erstellt

## CI/CD

Bei jedem Push zu `main` wird automatisch ein neues Deployment erstellt.

- **Production**: `main` Branch
- **Preview**: Alle anderen Branches (mit automatischem Preview-Link)

## Monitoring

- **Logs**: Vercel Dashboard → Deployments → Logs
- **Analytics**: Automatisch verfügbar in Vercel Dashboard
- **Performance**: Lighthouse-Scores werden automatisch generiert

## Rollback

1. Gehe zu Deployments
2. Finde das funktionierende Deployment
3. Klicke auf "..." → "Promote to Production"

## Wichtige Hinweise

- ✅ `.env.local` wird **nicht** committed (ist in `.gitignore`)
- ✅ Alle Umgebungsvariablen müssen in Vercel konfiguriert sein
- ✅ Firebase Auth Domains müssen angepasst werden
- ✅ `NEXT_PUBLIC_*` Variablen sind öffentlich sichtbar (das ist bei Firebase OK)
