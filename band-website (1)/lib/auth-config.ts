import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  type User,
} from "firebase/auth"
import { auth } from "./firebase-config"
import { ENV_CONFIG, validateAdminConfig } from "./env-config"

/* ---------- Types ---------- */

export interface AdminUser {
  uid: string
  email: string
  name: string
  picture: string
  isAuthorized: boolean
}

/* ---------- Helpers ---------- */

/**
 * Convert a Firebase User to our AdminUser shape
 */
function mapFirebaseUser(user: User | null): AdminUser | null {
  if (!user) return null

  const email = user.email ?? ""
  const isAuthorized = isAuthorizedAdmin(email)

  return {
    uid: user.uid,
    email,
    name: user.displayName ?? email,
    picture: user.photoURL ?? "/placeholder.svg",
    isAuthorized,
  }
}

/**
 * Check if the supplied e-mail is in the whitelist
 */
export function isAuthorizedAdmin(email: string): boolean {
  if (!validateAdminConfig()) return false
  return ENV_CONFIG.admin.authorizedEmails.map((e) => e.toLowerCase()).includes(email.toLowerCase())
}

/* ---------- Public API ---------- */

/**
 * Google sign-in (popup). Falls back to redirect if popup blocked.
 */
export async function signInWithGoogle(): Promise<AdminUser> {
  const provider = new GoogleAuthProvider()
  const { user } = await signInWithPopup(auth, provider)
  const adminUser = mapFirebaseUser(user)

  if (!adminUser) throw new Error("Failed to obtain user information from Google")

  return adminUser
}

/**
 * Sign the current user out.
 */
export async function signOut(): Promise<void> {
  await firebaseSignOut(auth)
}

/**
 * Subscribe to auth-state changes. Returns an unsubscribe fn.
 */
export function onAuthStateChange(callback: (user: AdminUser | null) => void) {
  return firebaseOnAuthStateChanged(auth, (fbUser) => {
    callback(mapFirebaseUser(fbUser))
  })
}

/**
 * Returns a status object for the configuration panel.
 */
export function getAuthStatus() {
  const firebaseReady = !!auth.app?.name // truthy if Firebase initialised

  return {
    firebaseReady,
    adminEmails: validateAdminConfig(),
    config: {
      firebaseAuth: firebaseReady ? "✓ Firebase initialised" : "✗ Firebase not initialised",
      authorizedEmails:
        ENV_CONFIG.admin.authorizedEmails.length > 0
          ? `✓ ${ENV_CONFIG.admin.authorizedEmails.length} authorised`
          : "✗ No authorised emails",
    },
  }
}
