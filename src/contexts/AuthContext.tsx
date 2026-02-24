import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { Collaborateur } from '../types/database'

interface AuthContextType {
  user: User | null
  session: Session | null
  collaborateur: Collaborateur | null
  loading: boolean
  isAdmin: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  refreshCollaborateur: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [collaborateur, setCollaborateur] = useState<Collaborateur | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    // Safety timeout (8s) — guarantees loading=false if everything hangs
    const safetyTimeout = setTimeout(() => {
      if (mounted) {
        console.warn('[Auth] Safety timeout 8s — forcing loading=false')
        setLoading(false)
      }
    }, 8000)

    const done = () => {
      if (mounted) {
        setLoading(false)
        clearTimeout(safetyTimeout)
      }
    }

    const fetchCollab = async (userId: string): Promise<Collaborateur | null> => {
      // Promise.race with 5s timeout (more reliable than AbortController)
      const query = supabase
        .from('collaborateurs')
        .select('*')
        .eq('user_id', userId)
        .eq('actif', true)
        .single()

      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Query timeout')), 5000)
      )

      const { data, error } = await Promise.race([query, timeout])

      if (error) {
        console.error('[Auth] fetchCollaborateur error:', error)
        return null
      }
      return data as Collaborateur
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mounted) return

        try {
          setSession(newSession)
          setUser(newSession?.user ?? null)

          // No session — clear and finish
          if (!newSession?.user) {
            setCollaborateur(null)
            done()
            return
          }

          // INITIAL_SESSION with expired token — wait for auto-refresh
          if (event === 'INITIAL_SESSION' && newSession.expires_at) {
            const isExpired = newSession.expires_at * 1000 < Date.now()
            if (isExpired) {
              console.warn('[Auth] Expired token on init, waiting for auto-refresh...')
              // DON'T fetch, DON'T set loading=false — wait for TOKEN_REFRESHED
              // Safety timeout (8s) handles the case where refresh never comes
              return
            }
          }

          // Token is valid — fetch collaborateur
          const collab = await fetchCollab(newSession.user.id)
          if (!mounted) return

          if (collab) {
            setCollaborateur(collab)
          } else {
            setCollaborateur(null)
            if (event === 'TOKEN_REFRESHED') {
              console.warn('[Auth] Fetch failed after refresh — will retry via ProtectedRoute')
            }
          }
        } catch (err) {
          console.error('[Auth] callback error:', err)
          if (mounted) setCollaborateur(null)
        }

        done()
      }
    )

    return () => {
      mounted = false
      clearTimeout(safetyTimeout)
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
    } catch (err) {
      console.error('signOut error:', err)
    } finally {
      setUser(null)
      setSession(null)
      setCollaborateur(null)
    }
  }

  const refreshCollaborateur = useCallback(async () => {
    if (!user) return
    try {
      const { data, error } = await supabase
        .from('collaborateurs')
        .select('*')
        .eq('user_id', user.id)
        .eq('actif', true)
        .single()
      if (!error) setCollaborateur(data)
    } catch (err) {
      console.error('[Auth] refreshCollaborateur error:', err)
    }
  }, [user])

  const isAdmin = collaborateur?.role_asso === 'admin'

  return (
    <AuthContext.Provider value={{
      user, session, collaborateur, loading, isAdmin,
      signIn, signOut, refreshCollaborateur
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
