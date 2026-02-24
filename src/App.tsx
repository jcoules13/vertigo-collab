import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import DashboardLayout from './layouts/DashboardLayout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import PermanencesPage from './pages/PermanencesPage'
import PermanenceDetailPage from './pages/PermanenceDetailPage'
import RendezVousPage from './pages/RendezVousPage'
import RendezVousDetailPage from './pages/RendezVousDetailPage'
import CollaborateursPage from './pages/CollaborateursPage'
import ReservationsPage from './pages/ReservationsPage'
import DossiersPage from './pages/DossiersPage'
import DossierDetailPage from './pages/DossierDetailPage'
import ProfilPage from './pages/ProfilPage'

const MAX_RETRIES = 3

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, collaborateur, loading, refreshCollaborateur, signOut } = useAuth()
  const [retryCount, setRetryCount] = useState(0)
  const [retrying, setRetrying] = useState(false)

  // Reset retry counter when collaborateur becomes available
  useEffect(() => {
    if (collaborateur) setRetryCount(0)
  }, [collaborateur])

  // Auto-retry when user exists but collaborateur is null
  useEffect(() => {
    if (!loading && user && !collaborateur && retryCount < MAX_RETRIES && !retrying) {
      setRetrying(true)
      const delay = 1000 * (retryCount + 1)
      const timer = setTimeout(async () => {
        await refreshCollaborateur()
        setRetryCount(prev => prev + 1)
        setRetrying(false)
      }, delay)
      return () => clearTimeout(timer)
    }
  }, [loading, user, collaborateur, retryCount, retrying, refreshCollaborateur])

  // Loading or retrying → spinner
  if (loading || retrying || (!collaborateur && user && retryCount < MAX_RETRIES)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  // After MAX_RETRIES failed → friendly error with retry button
  if (!collaborateur) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Connexion interrompue</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Impossible de charger votre profil. Vérifiez votre connexion internet.
          </p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => setRetryCount(0)} className="btn-primary">
              Réessayer
            </button>
            <button onClick={() => signOut()} className="btn-secondary">
              Se déconnecter
            </button>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAdmin } = useAuth()
  if (!isAdmin) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="permanences" element={<PermanencesPage />} />
              <Route path="permanences/:id" element={<PermanenceDetailPage />} />
              <Route path="rendez-vous" element={<RendezVousPage />} />
              <Route path="rendez-vous/:id" element={<RendezVousDetailPage />} />
              <Route path="reservations" element={<ReservationsPage />} />
              <Route path="dossiers" element={<DossiersPage />} />
              <Route path="dossiers/:id" element={<DossierDetailPage />} />
              <Route path="collaborateurs" element={<AdminRoute><CollaborateursPage /></AdminRoute>} />
              <Route path="profil" element={<ProfilPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
