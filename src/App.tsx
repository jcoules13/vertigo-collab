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
import ProfilPage from './pages/ProfilPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, collaborateur, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  if (!collaborateur) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Accès non autorisé</h2>
          <p className="text-gray-500 dark:text-gray-400">
            Votre compte n'est pas associé à un profil collaborateur.
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
