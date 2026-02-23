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

    // SAFETY TIMEOUT (8s) — guarantees loading=false even if everything hangs
    const safetyTimeout = setTimeout(() => {
      if (mounted) {
        console.warn('[Auth] Safety timeout 8s — forcing loading=false')
        setLoading(false)
      }
    }, 8000)

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        if (!mounted) return

        try {
          setSession(newSession)
          setUser(newSession?.user ?? null)

          if (newSession?.user) {
            // Query timeout (5s) via AbortController
            const controller = new AbortController()
            const queryTimeout = setTimeout(() => controller.abort(), 5000)

            try {
              const { data, error } = await supabase
                .from('collaborateurs')
                .select('*')
                .eq('user_id', newSession.user.id)
                .eq('actif', true)
                .abortSignal(controller.signal)
                .single()

              clearTimeout(queryTimeout)
              if (!mounted) return

              if (error) {
                console.error('[Auth] fetchCollaborateur error:', error)
                setCollaborateur(null)

                // Stale JWT — session is dead, sign out cleanly
                if (error.code === 'PGRST301' || error.message?.includes('JWT')) {
                  console.warn('[Auth] Stale session detected, signing out')
                  setUser(null)
                  setSession(null)
                  supabase.auth.signOut().catch(() => {})
                }
              } else {
                setCollaborateur(data)
              }
            } catch (err) {
              clearTimeout(queryTimeout)
              if (mounted) {
                console.error('[Auth] fetchCollaborateur exception:', err)
                setCollaborateur(null)
              }
            }
          } else {
            setCollaborateur(null)
          }
        } catch (outerErr) {
          // Catch-all — nothing can escape
          console.error('[Auth] Unexpected error in auth callback:', outerErr)
          if (mounted) setCollaborateur(null)
        }

        // ALWAYS set loading false after processing any event
        if (mounted) {
          setLoading(false)
          clearTimeout(safetyTimeout)
        }
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
