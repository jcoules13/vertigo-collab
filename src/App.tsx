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
import MdphListPage from './pages/MdphListPage'
import MdphFormPage from './pages/MdphFormPage'
import ProfilPage from './pages/ProfilPage'
import StatistiquesPage from './pages/StatistiquesPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, collaborateur, loading, refreshCollaborateur } = useAuth()
  const [retried, setRetried] = useState(false)

  // One retry after 2s if collaborateur hasn't loaded yet (fire-and-forget still in flight)
  useEffect(() => {
    if (!loading && user && !collaborateur && !retried) {
      const timer = setTimeout(async () => {
        await refreshCollaborateur()
        setRetried(true)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [loading, user, collaborateur, retried, refreshCollaborateur])

  // Reset when collaborateur arrives
  useEffect(() => {
    if (collaborateur) setRetried(false)
  }, [collaborateur])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  // Collaborateur not loaded yet — brief spinner while fire-and-forget completes
  if (!collaborateur && !retried) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  // After retry, still null → genuine missing profile
  if (!collaborateur) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Profil introuvable</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Votre compte n'est pas associé à un profil collaborateur.
            Contactez l'administrateur.
          </p>
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
              <Route path="mdph" element={<MdphListPage />} />
              <Route path="mdph/:id" element={<MdphFormPage />} />
              <Route path="collaborateurs" element={<AdminRoute><CollaborateursPage /></AdminRoute>} />
              <Route path="statistiques" element={<AdminRoute><StatistiquesPage /></AdminRoute>} />
              <Route path="profil" element={<ProfilPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
