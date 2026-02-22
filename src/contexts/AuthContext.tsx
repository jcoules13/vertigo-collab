import { createContext, useContext, useEffect, useState } from 'react'
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

  const fetchCollaborateur = async (userId: string) => {
    const { data } = await supabase
      .from('collaborateurs')
      .select('*')
      .eq('user_id', userId)
      .eq('actif', true)
      .single()
    setCollaborateur(data)
  }

  const refreshCollaborateur = async () => {
    if (user) {
      await fetchCollaborateur(user.id)
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchCollaborateur(session.user.id).finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        if (session?.user) {
          await fetchCollaborateur(session.user.id)
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
    await supabase.auth.signOut()
    setCollaborateur(null)
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
