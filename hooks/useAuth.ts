"use client"

import { useEffect, useState } from "react"
import { 
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut as firebaseSignOut,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink
} from "firebase/auth"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { User } from "@/types"

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser)
      
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, "users", firebaseUser.uid)
          const userDoc = await getDoc(userDocRef)
          
          if (userDoc.exists()) {
            // User-Dokument existiert bereits
            const userData = userDoc.data()
            setUser({
              id: firebaseUser.uid,
              name: userData.name,
              email: userData.email || firebaseUser.email || "",
              role: userData.role,
              clientId: userData.clientId,
              photoURL: userData.photoURL,
              createdAt: userData.createdAt?.toDate() || new Date(),
            })
          } else {
            // User-Dokument existiert nicht - erstelle es automatisch
            console.log("User document not found, creating new one for:", firebaseUser.uid)
            
            const newUserData = {
              name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User",
              email: firebaseUser.email || "",
              role: "client", // Default für Magic Link Login
              clientId: null, // Muss später vom Admin zugewiesen werden
              photoURL: firebaseUser.photoURL || null,
              createdAt: new Date(),
            }
            
            try {
              await setDoc(userDocRef, newUserData)
              console.log("User document created successfully")
              
              // Setze User-State mit neu erstellten Daten
              setUser({
                id: firebaseUser.uid,
                ...newUserData,
                photoURL: newUserData.photoURL || undefined,
              })
            } catch (createError) {
              console.error("Error creating user document:", createError)
              // Fallback: Verwende temporäre User-Daten
              setUser({
                id: firebaseUser.uid,
                name: newUserData.name,
                email: newUserData.email,
                role: "client",
                photoURL: newUserData.photoURL || undefined,
                createdAt: new Date(),
              })
            }
          }
        } catch (error) {
          console.error("Error fetching/creating user data:", error)
          // Fallback: Verwende Firebase User-Daten
          setUser({
            id: firebaseUser.uid,
            name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User",
            email: firebaseUser.email || "",
            role: "client",
            photoURL: firebaseUser.photoURL || undefined,
            createdAt: new Date(),
          })
        }
      } else {
        setUser(null)
      }
      
      setLoading(false)
    })

    return unsubscribe
  }, [])

  return { user, firebaseUser, loading }
}

export async function signIn(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password)
}

export async function sendMagicLink(email: string, continueUrl?: string) {
  // E-Mail in localStorage speichern (wird beim Magic Link benötigt)
  if (typeof window !== "undefined") {
    window.localStorage.setItem("emailForSignIn", email)
  }
  
  const actionCodeSettings = {
    url: continueUrl || `${window.location.origin}/auth/callback`,
    handleCodeInApp: true,
  }
  return sendSignInLinkToEmail(auth, email, actionCodeSettings)
}

export async function handleMagicLink(email: string) {
  if (isSignInWithEmailLink(auth, window.location.href)) {
    return signInWithEmailLink(auth, email, window.location.href)
  }
  throw new Error("Invalid magic link")
}

export async function resetPassword(email: string) {
  return sendPasswordResetEmail(auth, email)
}

export async function signOut() {
  return firebaseSignOut(auth)
}
