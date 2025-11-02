import { initializeApp, getApps } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

// Firebase-Konfiguration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Initialisiere Firebase nur wenn wir im Browser sind oder alle Config-Werte vorhanden sind
let app
if (typeof window !== "undefined" || (firebaseConfig.apiKey && firebaseConfig.projectId)) {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig)
  } else {
    app = getApps()[0]
  }
} else {
  // Fallback für Build-Zeit ohne Config (sollte nicht passieren mit richtiger Config)
  console.warn("Firebase config missing, using placeholder values")
  app = initializeApp({
    apiKey: "placeholder",
    authDomain: "placeholder.firebaseapp.com",
    projectId: "placeholder",
    storageBucket: "placeholder.appspot.com",
    messagingSenderId: "000000000000",
    appId: "placeholder",
  })
}

export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
