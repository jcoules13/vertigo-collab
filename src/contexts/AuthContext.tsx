import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js'
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

  const fetchCollaborateur = useCallback(async (userId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('collaborateurs')
        .select('*')
        .eq('user_id', userId)
        .eq('actif', true)
        .single()

      if (error) {
        // Auth error (JWT expired, invalid) — session is stale
        if (error.code === 'PGRST301' || error.message?.includes('JWT')) {
          console.warn('Auth token invalid, attempting refresh...')
          return false
        }
        console.error('fetchCollaborateur error:', error)
      }

      setCollaborateur(data)
      return true
    } catch (err) {
      console.error('AuthContext fetchCollaborateur error:', err)
      return false
    }
  }, [])

  const handleSession = useCallback(async (newSession: Session | null, event?: AuthChangeEvent) => {
    setSession(newSession)
    setUser(newSession?.user ?? null)

    if (newSession?.user) {
      const success = await fetchCollaborateur(newSession.user.id)

      // If fetch failed due to auth, try refreshing the session once
      if (!success && event !== 'TOKEN_REFRESHED') {
        try {
          const { data } = await supabase.auth.refreshSession()
          if (data.session) {
            // The onAuthStateChange listener will handle the new session
            return
          }
        } catch {
          // Refresh failed — clear everything
        }
        // If we get here, session is unrecoverable
        setUser(null)
        setSession(null)
        setCollaborateur(null)
        await supabase.auth.signOut().catch(() => {})
      }
    } else {
      setCollaborateur(null)
    }
  }, [fetchCollaborateur])

  useEffect(() => {
    let mounted = true

    // Use onAuthStateChange as the SINGLE source of truth
    // It fires INITIAL_SESSION immediately, then TOKEN_REFRESHED when auto-refresh happens
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return

        if (event === 'INITIAL_SESSION') {
          // Check if the stored session token is expired
          if (session?.expires_at) {
            const expiresAt = session.expires_at * 1000 // Convert to ms
            const now = Date.now()
            if (expiresAt < now) {
              // Token expired — try to refresh before using it
              try {
                const { data } = await supabase.auth.refreshSession()
                if (data.session && mounted) {
                  // TOKEN_REFRESHED event will fire and handle this
                  setLoading(false)
                  return
                }
              } catch {
                // Refresh failed
              }
              // Unrecoverable — clear session
              if (mounted) {
                setUser(null)
                setSession(null)
                setCollaborateur(null)
                setLoading(false)
              }
              return
            }
          }
          // Token is valid — proceed normally
          await handleSession(session, event)
          if (mounted) setLoading(false)
        } else if (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') {
          await handleSession(session, event)
          if (mounted) setLoading(false)
        } else if (event === 'SIGNED_OUT') {
          if (mounted) {
            setUser(null)
            setSession(null)
            setCollaborateur(null)
            setLoading(false)
          }
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [handleSession])

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

  const refreshCollaborateur = async () => {
    if (user) {
      await fetchCollaborateur(user.id)
    }
  }

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
