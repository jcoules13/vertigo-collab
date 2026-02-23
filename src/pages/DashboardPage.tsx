import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Clock, Calendar, CalendarPlus, AlertCircle, Loader2, CheckCircle, XCircle, FolderOpen, BarChart3, Activity } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { PermanenceOccurrence, RendezVous, ReservationExterne, DossierSuivi, STATUT_RESERVATION_LABELS, CANAL_LABELS, STATUT_DOSSIER_LABELS } from '../types/database'
import { format, addDays } from 'date-fns'
import { fr } from 'date-fns/locale'

export default function DashboardPage() {
  const { collaborateur, isAdmin } = useAuth()
  const [loading, setLoading] = useState(true)
  const [myPermanences, setMyPermanences] = useState<PermanenceOccurrence[]>([])
  const [myRdvs, setMyRdvs] = useState<RendezVous[]>([])
  const [reservations, setReservations] = useState<ReservationExterne[]>([])
  const [pendingCount, setPendingCount] = useState(0)
  const [myDossiersCount, setMyDossiersCount] = useState(0)
  const [myDossiers, setMyDossiers] = useState<DossierSuivi[]>([])

  // Admin stats
  const [adminStats, setAdminStats] = useState<{
    dossiersMonth: number
    dossiersWeek: number
    avgSeances: number
    avgDouleur: number | null
    avgEnergie: number | null
    avgStress: number | null
    avgSoutien: number | null
  } | null>(null)

  useEffect(() => {
    if (!collaborateur) return

    const fetchData = async () => {
      try {
        const today = format(new Date(), 'yyyy-MM-dd')
        const nextWeek = format(addDays(new Date(), 7), 'yyyy-MM-dd')

        const [permRes, rdvRes, pendingPermRes, pendingRdvRes, resExtRes, dossierCountRes, dossierRecentRes] = await Promise.all([
          supabase
            .from('permanence_occurrences')
            .select('*, permanences(nom, lieu), permanence_assignments!inner(statut, collaborateur_id, collaborateurs(prenom, nom))')
            .gte('date', today)
            .lte('date', nextWeek)
            .eq('annulee', false)
            .eq('permanence_assignments.collaborateur_id', collaborateur.id)
            .order('date', { ascending: true }),
          supabase
            .from('rendez_vous')
            .select('*, rdv_participants!inner(statut, collaborateur_id, collaborateurs(prenom, nom))')
            .gte('date', today)
            .lte('date', nextWeek)
            .eq('rdv_participants.collaborateur_id', collaborateur.id)
            .order('date', { ascending: true }),
          supabase
            .from('permanence_assignments')
            .select('id', { count: 'exact', head: true })
            .eq('collaborateur_id', collaborateur.id)
            .eq('statut', 'en_attente'),
          supabase
            .from('rdv_participants')
            .select('id', { count: 'exact', head: true })
            .eq('collaborateur_id', collaborateur.id)
            .eq('statut', 'en_attente'),
          supabase
            .from('reservations_externes')
            .select('*')
            .gte('date', today)
            .lte('date', nextWeek)
            .in('statut', ['nouvelle', 'confirmee'])
            .order('date', { ascending: true }),
          supabase
            .from('dossiers_suivi')
            .select('id', { count: 'exact', head: true })
            .eq('responsable_id', collaborateur.id)
            .neq('statut', 'clos'),
          supabase
            .from('dossiers_suivi')
            .select('*, responsable:collaborateurs!responsable_id(prenom, nom)')
            .eq('responsable_id', collaborateur.id)
            .neq('statut', 'clos')
            .order('updated_at', { ascending: false })
            .limit(5),
        ])

        setMyPermanences(permRes.data || [])
        setMyRdvs(rdvRes.data || [])
        setReservations(resExtRes.data || [])
        setPendingCount((pendingPermRes.count || 0) + (pendingRdvRes.count || 0))
        setMyDossiersCount(dossierCountRes.count || 0)
        setMyDossiers(dossierRecentRes.data || [])

        // Admin stats
        if (collaborateur.role_asso === 'admin') {
          try {
            const now = new Date()
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
            const startOfWeek = new Date(now.getTime() - now.getDay() * 86400000).toISOString()

            const [monthRes, weekRes, allDossiersRes] = await Promise.all([
              supabase.from('dossiers_suivi').select('id', { count: 'exact', head: true }).gte('created_at', startOfMonth),
              supabase.from('dossiers_suivi').select('id', { count: 'exact', head: true }).gte('updated_at', startOfWeek).in('statut', ['en_cours', 'clos']),
              supabase.from('dossiers_suivi').select('id, eval_douleur, eval_energie, eval_stress, eval_soutien, seances(id)'),
            ])

            const allDossiers = allDossiersRes.data || []
            const totalSeances = allDossiers.reduce((sum: number, d: any) => sum + (d.seances?.length || 0), 0)
            const avgSeances = allDossiers.length > 0 ? Math.round((totalSeances / allDossiers.length) * 10) / 10 : 0

            const avg = (field: string) => {
              const vals = allDossiers.filter((d: any) => d[field] !== null).map((d: any) => d[field])
              return vals.length > 0 ? Math.round((vals.reduce((a: number, b: number) => a + b, 0) / vals.length) * 10) / 10 : null
            }

            setAdminStats({
              dossiersMonth: monthRes.count || 0,
              dossiersWeek: weekRes.count || 0,
              avgSeances,
              avgDouleur: avg('eval_douleur'),
              avgEnergie: avg('eval_energie'),
              avgStress: avg('eval_stress'),
              avgSoutien: avg('eval_soutien'),
            })
          } catch (err) {
            console.error('Admin stats error:', err)
          }
        }
      } catch (err) {
        console.error('DashboardPage fetchData error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [collaborateur])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  const stats = [
    { label: 'Permanences (7j)', value: myPermanences.length, icon: Clock, color: 'text-primary-600', bg: 'bg-primary-50 dark:bg-primary-900/20', href: '/permanences' },
    { label: 'Rendez-vous (7j)', value: myRdvs.length, icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20', href: '/rendez-vous' },
    { label: 'Réservations (7j)', value: reservations.length, icon: CalendarPlus, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20', href: '/reservations' },
    { label: 'En attente', value: pendingCount, icon: AlertCircle, color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20', href: '/permanences' },
    { label: 'Mes dossiers', value: myDossiersCount, icon: FolderOpen, color: 'text-teal-600', bg: 'bg-teal-50 dark:bg-teal-900/20', href: '/dossiers' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Bonjour, {collaborateur?.prenom} !
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {format(new Date(), "EEEE d MMMM yyyy", { locale: fr })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map(stat => (
          <Link key={stat.label} to={stat.href} className="card hover:shadow-md transition-shadow">
            <div className="card-body flex items-center gap-4">
              <div className={`p-3 rounded-lg ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Mes prochaines permanences */}
      <div className="card">
        <div className="card-header flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 dark:text-white">Mes prochaines permanences</h2>
          <Link to="/permanences" className="text-sm text-primary-600 hover:underline">Voir tout</Link>
        </div>
        <div className="card-body">
          {myPermanences.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm">Aucune permanence cette semaine.</p>
          ) : (
            <div className="space-y-3">
              {myPermanences.map(occ => {
                const assignment = occ.permanence_assignments?.[0]
                return (
                  <Link
                    key={occ.id}
                    to={`/permanences/${occ.id}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-primary-600" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {occ.permanences?.nom}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {format(new Date(occ.date), 'EEEE d MMM', { locale: fr })} &middot; {occ.heure_debut.slice(0, 5)} - {occ.heure_fin.slice(0, 5)}
                        </p>
                      </div>
                    </div>
                    {assignment?.statut === 'confirme' && <span className="badge-green"><CheckCircle className="w-3 h-3 mr-1" />Confirmé</span>}
                    {assignment?.statut === 'en_attente' && <span className="badge-yellow"><AlertCircle className="w-3 h-3 mr-1" />En attente</span>}
                    {assignment?.statut === 'refuse' && <span className="badge-red"><XCircle className="w-3 h-3 mr-1" />Refusé</span>}
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Mes prochains RDV */}
      <div className="card">
        <div className="card-header flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 dark:text-white">Mes prochains rendez-vous</h2>
          <Link to="/rendez-vous" className="text-sm text-primary-600 hover:underline">Voir tout</Link>
        </div>
        <div className="card-body">
          {myRdvs.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm">Aucun rendez-vous cette semaine.</p>
          ) : (
            <div className="space-y-3">
              {myRdvs.map(rdv => {
                const participant = rdv.rdv_participants?.[0]
                return (
                  <Link
                    key={rdv.id}
                    to={`/rendez-vous/${rdv.id}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{rdv.titre}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {format(new Date(rdv.date), 'EEEE d MMM', { locale: fr })} &middot; {rdv.heure_debut.slice(0, 5)} - {rdv.heure_fin.slice(0, 5)}
                        </p>
                      </div>
                    </div>
                    {participant?.statut === 'confirme' && <span className="badge-green"><CheckCircle className="w-3 h-3 mr-1" />Confirmé</span>}
                    {participant?.statut === 'en_attente' && <span className="badge-yellow"><AlertCircle className="w-3 h-3 mr-1" />En attente</span>}
                    {participant?.statut === 'refuse' && <span className="badge-red"><XCircle className="w-3 h-3 mr-1" />Refusé</span>}
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Prochaines réservations usagers */}
      <div className="card">
        <div className="card-header flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 dark:text-white">Réservations usagers</h2>
          <Link to="/reservations" className="text-sm text-primary-600 hover:underline">Voir tout</Link>
        </div>
        <div className="card-body">
          {reservations.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm">Aucune réservation cette semaine.</p>
          ) : (
            <div className="space-y-3">
              {reservations.slice(0, 5).map(res => (
                <Link
                  key={res.id}
                  to="/reservations"
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <CalendarPlus className="w-5 h-5 text-orange-600" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{res.usager_nom}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {format(new Date(res.date), 'EEEE d MMM', { locale: fr })} &middot; {res.heure_debut.slice(0, 5)} - {res.heure_fin.slice(0, 5)}
                        {' '}&middot; {CANAL_LABELS[res.canal]}
                      </p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    res.statut === 'nouvelle' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  }`}>
                    {STATUT_RESERVATION_LABELS[res.statut]}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* Admin stats */}
      {isAdmin && adminStats && (
        <div className="card">
          <div className="card-header">
            <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary-600" /> Statistiques anonymes
            </h2>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{adminStats.dossiersMonth}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Dossiers ce mois</p>
              </div>
              <div className="text-center p-3 bg-green-50 dark:bg-green-900/10 rounded-lg">
                <p className="text-2xl font-bold text-green-700 dark:text-green-400">{adminStats.dossiersWeek}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Traités cette semaine</p>
              </div>
              <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/10 rounded-lg">
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">{adminStats.avgSeances}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Séances / dossier</p>
              </div>
              <div className="text-center p-3 bg-teal-50 dark:bg-teal-900/10 rounded-lg">
                <div className="flex items-center justify-center gap-1">
                  <Activity className="w-4 h-4 text-teal-600" />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Auto-évaluation</p>
              </div>
            </div>
            {(adminStats.avgDouleur !== null || adminStats.avgEnergie !== null) && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                {adminStats.avgDouleur !== null && (
                  <div className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <span className="text-gray-600 dark:text-gray-400">Douleur</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{adminStats.avgDouleur}/10</span>
                  </div>
                )}
                {adminStats.avgEnergie !== null && (
                  <div className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <span className="text-gray-600 dark:text-gray-400">Énergie</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{adminStats.avgEnergie}/10</span>
                  </div>
                )}
                {adminStats.avgStress !== null && (
                  <div className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <span className="text-gray-600 dark:text-gray-400">Stress</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{adminStats.avgStress}/10</span>
                  </div>
                )}
                {adminStats.avgSoutien !== null && (
                  <div className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <span className="text-gray-600 dark:text-gray-400">Soutien</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{adminStats.avgSoutien}/10</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mes dossiers récents */}
      <div className="card">
        <div className="card-header flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 dark:text-white">Mes dossiers de suivi</h2>
          <Link to="/dossiers" className="text-sm text-primary-600 hover:underline">Voir tout</Link>
        </div>
        <div className="card-body">
          {myDossiers.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm">Aucun dossier actif.</p>
          ) : (
            <div className="space-y-3">
              {myDossiers.map(dossier => (
                <Link
                  key={dossier.id}
                  to={`/dossiers/${dossier.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FolderOpen className="w-5 h-5 text-teal-600" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{dossier.usager_nom}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {dossier.motif || 'Sans motif'}
                      </p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    dossier.statut === 'ouvert' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                  }`}>
                    {STATUT_DOSSIER_LABELS[dossier.statut]}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
