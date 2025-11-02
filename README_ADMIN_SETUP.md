# Admin-User erstellen

Es gibt mehrere Möglichkeiten, einen neuen Admin-User zu erstellen:

## Methode 1: Über das Admin-Panel (Empfohlen)

1. Melde dich als Admin an (`/admin/login`)
2. Gehe zu `/admin/users/new` (oder füge einen Link in der Navigation hinzu)
3. Fülle das Formular aus:
   - Name
   - E-Mail-Adresse
   - Passwort (mind. 6 Zeichen)
   - Rolle: **Admin** auswählen
4. Klicke auf "Benutzer erstellen"

## Methode 2: Über Firebase Console (Manuell)

### Schritt 1: Firebase Auth User erstellen

1. Gehe zur [Firebase Console](https://console.firebase.google.com/)
2. Wähle dein Projekt
3. Gehe zu **Authentication** → **Users**
4. Klicke auf **Add user**
5. Gib E-Mail und Passwort ein
6. Speichere die **User UID** (wird angezeigt)

### Schritt 2: Firestore User-Dokument erstellen

1. Gehe zu **Firestore Database**
2. Klicke auf **users** Collection (oder erstelle sie)
3. Klicke auf **Add document**
4. Setze die Document ID auf die **User UID** aus Schritt 1
5. Füge folgende Felder hinzu:
   ```
   name: "Admin Name" (string)
   email: "admin@example.com" (string)
   role: "admin" (string)
   createdAt: (timestamp - wähle "Set timestamp" → "Server timestamp")
   ```
6. Speichere

## Methode 3: Über ein Script (Für Entwickler)

### Voraussetzungen

1. Installiere Firebase Admin SDK:
   ```bash
   npm install firebase-admin
   ```

2. Erstelle einen Service Account:
   - Gehe zur Firebase Console → Projekt-Einstellungen → Service Accounts
   - Klicke auf "Generate new private key"
   - Speichere die JSON-Datei als `service-account-key.json` im Projekt-Root
   - **WICHTIG**: Füge `service-account-key.json` zur `.gitignore` hinzu!

### Script ausführen

```bash
node scripts/create-admin-user.js "admin@example.com" "securePassword123" "Admin Name"
```

## Methode 4: Direkt über Firebase CLI

Wenn du die Firebase CLI installiert hast:

```bash
firebase auth:import users.json --project your-project-id
```

Erstelle eine `users.json` Datei:
```json
{
  "users": [
    {
      "localId": "auto-generated",
      "email": "admin@example.com",
      "passwordHash": "base64-encoded-hash",
      "emailVerified": true
    }
  ]
}
```

Danach musst du noch das Firestore-Dokument manuell erstellen (siehe Methode 2, Schritt 2).

## Erster Admin-User

Für den **ersten** Admin-User, wenn noch kein Admin existiert:

1. Verwende **Methode 2** (Firebase Console) - das ist am einfachsten
2. Oder nutze **Methode 3** (Script) mit einem Service Account

Sobald der erste Admin existiert, können weitere Admins über **Methode 1** (Admin-Panel) erstellt werden.

## Sicherheitshinweise

- Verwende starke Passwörter (mind. 12 Zeichen, Groß-/Kleinbuchstaben, Zahlen, Sonderzeichen)
- Service Account Keys sind vertraulich - niemals committen!
- Aktiviere 2FA für Admin-Accounts in Firebase Auth
- Prüfe regelmäßig die Admin-User Liste
