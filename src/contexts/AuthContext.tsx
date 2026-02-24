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

  // Fire-and-forget fetch — NEVER called with await inside onAuthStateChange
  const fetchCollab = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('collaborateurs')
        .select('*')
        .eq('user_id', userId)
        .eq('actif', true)
        .single()
      if (!error && data) {
        setCollaborateur(data as Collaborateur)
      } else {
        console.warn('[Auth] fetchCollab:', error?.message || 'no data')
      }
    } catch (err) {
      console.error('[Auth] fetchCollab exception:', err)
    }
  }

  useEffect(() => {
    // 1) Initial session load — set loading=false IMMEDIATELY, fetch collab in background
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchCollab(session.user.id) // fire-and-forget — NO await
      }
      setLoading(false)
    })

    // 2) Auth state changes — sync state, fetch collab in background
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        if (session?.user) {
          fetchCollab(session.user.id) // fire-and-forget — NO await
        } else {
          setCollaborateur(null)
        }
      }
    )

    return () => subscription.unsubscribe()
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
