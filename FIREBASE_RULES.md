# Firebase Security Rules

## Firestore Rules

Kopiere diese Rules in die Firebase Console unter Firestore Database → Rules:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper-Funktionen
    function isAdmin() {
      return request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    function isClientOf(projectId) {
      return request.auth != null &&
        let u = get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
        let p = get(/databases/$(database)/documents/projects/$(projectId)).data;
        return u.role == 'client' && u.clientId == p.clientId;
    }
    
    function canAccessProject(projectId) {
      return isAdmin() || isClientOf(projectId);
    }

    // Projekte
    match /projects/{projectId} {
      allow read: if isAdmin() || isClientOf(projectId);
      allow write: if isAdmin();
    }
    
    // Projekt-Updates
    match /projectUpdates/{updateId} {
      allow read: if canAccessProject(resource.data.projectId);
      allow create: if isAdmin();
      allow update, delete: if isAdmin();
    }
    
    // Freigaben
    match /approvals/{approvalId} {
      allow read: if canAccessProject(resource.data.projectId);
      allow create: if isAdmin();
      allow update: if canAccessProject(resource.data.projectId) && 
        (isAdmin() || (request.auth.uid == request.resource.data.decidedBy));
    }
    
    // Aufgaben
    match /tasks/{taskId} {
      allow read: if canAccessProject(resource.data.projectId);
      allow create, update, delete: if isAdmin();
    }
    
    // Dateien
    match /files/{fileId} {
      allow read: if canAccessProject(resource.data.projectId);
      allow create: if canAccessProject(resource.data.projectId);
      allow update, delete: if isAdmin();
    }
    
    // Nachrichten
    match /messages/{messageId} {
      allow read: if canAccessProject(resource.data.projectId);
      allow create: if canAccessProject(resource.data.projectId);
      allow update, delete: if isAdmin();
    }
    
    // Benutzer
    match /users/{userId} {
      allow read: if isAdmin() || request.auth.uid == userId;
      allow write: if isAdmin() || request.auth.uid == userId;
    }
    
    // Kunden
    match /clients/{clientId} {
      allow read: if isAdmin();
      allow write: if isAdmin();
    }
    
    // Termine
    match /appointments/{appointmentId} {
      allow read: if isAdmin();
      allow write: if isAdmin();
    }
  }
}
```

## Storage Rules

Kopiere diese Rules in die Firebase Console unter Storage → Rules:

```javascript
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    
    function isAdmin() {
      return request.auth != null && 
        firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    function canAccessProject(projectId) {
      return request.auth != null &&
        (isAdmin() ||
         (let u = firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data;
          let p = firestore.get(/databases/(default)/documents/projects/$(projectId)).data;
          u.role == 'client' && u.clientId == p.clientId));
    }
    
    match /projects/{projectId}/{allPaths=**} {
      allow read: if canAccessProject(projectId);
      allow write: if canAccessProject(projectId);
    }
  }
}
```

## Firestore Indexe

Erstelle folgende Composite Indexe in der Firebase Console unter Firestore Database → Indexes:

1. **projects**
   - Collection: `projects`
   - Fields:
     - `clientId` (Ascending)
     - `updatedAt` (Descending)

2. **projectUpdates**
   - Collection: `projectUpdates`
   - Fields:
     - `projectId` (Ascending)
     - `createdAt` (Descending)

3. **approvals**
   - Collection: `approvals`
   - Fields:
     - `projectId` (Ascending)
     - `requestedAt` (Descending)

4. **files**
   - Collection: `files`
   - Fields:
     - `projectId` (Ascending)
     - `createdAt` (Descending)

5. **tasks**
   - Collection: `tasks`
   - Fields:
     - `projectId` (Ascending)
     - `dueAt` (Ascending)

6. **messages**
   - Collection: `messages`
   - Fields:
     - `projectId` (Ascending)
     - `createdAt` (Descending)
