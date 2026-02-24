import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Plus, Loader2, MapPin, Clock, Users } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { RendezVous, Collaborateur } from '../types/database'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export default function RendezVousPage() {
  const { isAdmin, collaborateur } = useAuth()
  const [loading, setLoading] = useState(true)
  const [rdvs, setRdvs] = useState<RendezVous[]>([])
  const [filter, setFilter] = useState<'avenir' | 'passes' | 'tous'>('avenir')
  const [allCollaborateurs, setAllCollaborateurs] = useState<Collaborateur[]>([])

  // Form
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [formTitre, setFormTitre] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formDate, setFormDate] = useState('')
  const [formDebut, setFormDebut] = useState('10:00')
  const [formFin, setFormFin] = useState('11:00')
  const [formLieu, setFormLieu] = useState('')
  const [formParticipants, setFormParticipants] = useState<string[]>([])

  const fetchRdvs = async () => {
    try {
      const today = format(new Date(), 'yyyy-MM-dd')
      let query = supabase
        .from('rendez_vous')
        .select('*, rdv_participants(id, statut, collaborateur_id, collaborateurs(id, prenom, nom))')
        .order('date', { ascending: true })

      if (filter === 'avenir') query = query.gte('date', today)
      if (filter === 'passes') query = query.lt('date', today)

      const { data, error: fetchErr } = await query
      if (fetchErr) throw fetchErr
      setRdvs(data || [])
    } catch (err: any) {
      console.error('RendezVousPage fetch error:', err)
      setError(err.message || 'Erreur lors du chargement des rendez-vous')
    } finally {
      setLoading(false)
    }
  }

  const fetchCollaborateurs = async () => {
    try {
      const { data, error: err } = await supabase.from('collaborateurs').select('*').eq('actif', true).order('nom')
      if (err) throw err
      setAllCollaborateurs(data || [])
    } catch (err) {
      console.error('fetchCollaborateurs error:', err)
    }
  }

  useEffect(() => { fetchRdvs() }, [filter])
  useEffect(() => { fetchCollaborateurs() }, [])

  const resetForm = () => {
    setFormTitre('')
    setFormDescription('')
    setFormDate('')
    setFormDebut('10:00')
    setFormFin('11:00')
    setFormLieu('')
    setFormParticipants([])
    setShowForm(false)
    setError('')
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!collaborateur) return
    setSaving(true)
    setError('')

    try {
      const { data: rdv, error: err } = await supabase
        .from('rendez_vous')
        .insert({
          titre: formTitre,
          description: formDescription || null,
          date: formDate,
          heure_debut: formDebut,
          heure_fin: formFin,
          lieu: formLieu || null,
          cree_par: collaborateur.id,
        })
        .select('id')
        .single()

      if (err) throw err

      // Add participants
      if (formParticipants.length > 0) {
        const { error: partErr } = await supabase.from('rdv_participants').insert(
          formParticipants.map(cid => ({ rdv_id: rdv.id, collaborateur_id: cid }))
        )
        if (partErr) throw partErr
      }

      // Notify via n8n (non-blocking)
      try {
        const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL
        fetch(`${webhookUrl}/collab-rdv-create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            rdv_id: rdv.id,
            titre: formTitre,
            description: formDescription,
            date: formDate,
            heure_debut: formDebut,
            heure_fin: formFin,
            lieu: formLieu,
            collaborateur_ids: formParticipants,
          }),
        }).catch(err => console.warn('[Webhook] non-blocking error:', err))
      } catch (err) { console.warn('[Webhook] non-blocking error:', err) }

      await fetchRdvs()
      resetForm()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary-600" /></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Rendez-vous</h1>
        {isAdmin && (
          <button onClick={() => { resetForm(); setShowForm(true) }} className="btn-primary">
            <Plus className="w-4 h-4 mr-2" /> Nouveau RDV
          </button>
        )}
      </div>

      {error && !showForm && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm rounded-lg">{error}</div>
      )}

      {/* Filters */}
      <div className="flex gap-2">
        {(['avenir', 'passes', 'tous'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === f ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200'
            }`}
          >
            {f === 'avenir' ? 'À venir' : f === 'passes' ? 'Passés' : 'Tous'}
          </button>
        ))}
      </div>

      {/* Create form */}
      {showForm && (
        <div className="card">
          <div className="card-header">
            <h2 className="font-semibold text-gray-900 dark:text-white">Nouveau rendez-vous</h2>
          </div>
          <div className="card-body">
            <form onSubmit={handleCreate} className="space-y-4">
              {error && <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm rounded-lg">{error}</div>}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Titre</label>
                <input type="text" value={formTitre} onChange={e => setFormTitre(e.target.value)} className="input" required placeholder="Réunion d'équipe" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea value={formDescription} onChange={e => setFormDescription(e.target.value)} className="input" rows={3} placeholder="Ordre du jour..." />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                  <input type="date" value={formDate} onChange={e => setFormDate(e.target.value)} className="input" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Début</label>
                  <input type="time" value={formDebut} onChange={e => setFormDebut(e.target.value)} className="input" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fin</label>
                  <input type="time" value={formFin} onChange={e => setFormFin(e.target.value)} className="input" required />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Lieu</label>
                <input type="text" value={formLieu} onChange={e => setFormLieu(e.target.value)} className="input" placeholder="Bureau, visio..." />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Participants</label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border rounded-lg dark:border-gray-600">
                  {allCollaborateurs.map(c => (
                    <label key={c.id} className="flex items-center gap-2 p-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formParticipants.includes(c.id)}
                        onChange={e => {
                          if (e.target.checked) setFormParticipants(prev => [...prev, c.id])
                          else setFormParticipants(prev => prev.filter(id => id !== c.id))
                        }}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">{c.prenom} {c.nom}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button type="button" onClick={resetForm} className="btn-secondary">Annuler</button>
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* List */}
      {rdvs.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Aucun rendez-vous {filter === 'avenir' ? 'à venir' : filter === 'passes' ? 'passé' : ''}.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rdvs.map(rdv => {
            const confirmedCount = rdv.rdv_participants?.filter(p => p.statut === 'confirme').length || 0
            const totalCount = rdv.rdv_participants?.length || 0

            return (
              <Link key={rdv.id} to={`/rendez-vous/${rdv.id}`} className="card block hover:shadow-md transition-shadow">
                <div className="card-body flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <Calendar className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{rdv.titre}</h3>
                      <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {format(new Date(rdv.date), 'd MMM', { locale: fr })} {rdv.heure_debut.slice(0, 5)} - {rdv.heure_fin.slice(0, 5)}
                        </span>
                        {rdv.lieu && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" /> {rdv.lieu}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" /> {confirmedCount}/{totalCount}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
