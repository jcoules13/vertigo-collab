import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Clock, MapPin, Loader2, ArrowLeft, UserPlus,
  CheckCircle, XCircle, AlertCircle, Trash2
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { RendezVous, Collaborateur } from '../types/database'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export default function RendezVousDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { collaborateur, isAdmin } = useAuth()
  const [loading, setLoading] = useState(true)
  const [rdv, setRdv] = useState<RendezVous | null>(null)
  const [allCollaborateurs, setAllCollaborateurs] = useState<Collaborateur[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  const fetchRdv = async () => {
    if (!id) return
    try {
      const { data } = await supabase
        .from('rendez_vous')
        .select('*, collaborateurs:cree_par(prenom, nom), rdv_participants(id, statut, collaborateur_id, notifie_at, confirme_at, collaborateurs(id, prenom, nom, email))')
        .eq('id', id)
        .single()
      setRdv(data)
    } catch (err) {
      console.error('RendezVousDetailPage fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRdv()
    supabase.from('collaborateurs').select('*').eq('actif', true).order('nom')
      .then(({ data }) => setAllCollaborateurs(data || []))
  }, [id])

  const handleConfirm = async (statut: 'confirme' | 'refuse') => {
    if (!collaborateur || !rdv) return
    const participant = rdv.rdv_participants?.find(p => p.collaborateur_id === collaborateur.id)
    if (!participant) return

    try {
      await supabase
        .from('rdv_participants')
        .update({ statut, confirme_at: new Date().toISOString() })
        .eq('id', participant.id)

      try {
        const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL
        fetch(`${webhookUrl}/collab-gcal-sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'rdv', rdv_id: rdv.id, collaborateur_id: collaborateur.id, statut }),
        })
      } catch {}

      await fetchRdv()
    } catch (err) {
      console.error('handleConfirm error:', err)
    }
  }

  const addParticipants = async () => {
    if (!rdv || selectedIds.length === 0) return
    setSaving(true)

    try {
      const existingIds = new Set(rdv.rdv_participants?.map(p => p.collaborateur_id) || [])
      const newIds = selectedIds.filter(id => !existingIds.has(id))

      if (newIds.length > 0) {
        await supabase.from('rdv_participants').insert(
          newIds.map(cid => ({
            rdv_id: rdv.id,
            collaborateur_id: cid,
            statut: 'confirme',
            confirme_at: new Date().toISOString(),
          }))
        )
      }

      setShowAddForm(false)
      setSelectedIds([])
      await fetchRdv()
    } catch (err) {
      console.error('addParticipants error:', err)
    } finally {
      setSaving(false)
    }
  }

  const removeParticipant = async (participantId: string) => {
    if (!confirm('Retirer ce participant ?')) return
    try {
      await supabase.from('rdv_participants').delete().eq('id', participantId)
      await fetchRdv()
    } catch (err) {
      console.error('removeParticipant error:', err)
    }
  }

  const deleteRdv = async () => {
    if (!confirm('Supprimer ce rendez-vous ?')) return
    try {
      await supabase.from('rendez_vous').delete().eq('id', id)
      navigate('/rendez-vous')
    } catch (err) {
      console.error('deleteRdv error:', err)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary-600" /></div>
  }

  if (!rdv) {
    return <div className="text-center text-gray-500 py-16">Rendez-vous introuvable.</div>
  }

  const myParticipation = rdv.rdv_participants?.find(p => p.collaborateur_id === collaborateur?.id)

  return (
    <div className="max-w-3xl space-y-6">
      <button onClick={() => navigate('/rendez-vous')} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
        <ArrowLeft className="w-4 h-4" /> Retour aux rendez-vous
      </button>

      <div className="card">
        <div className="card-header flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{rdv.titre}</h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {format(new Date(rdv.date), 'EEEE d MMMM yyyy', { locale: fr })} &middot; {rdv.heure_debut.slice(0, 5)} - {rdv.heure_fin.slice(0, 5)}
              </span>
              {rdv.lieu && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" /> {rdv.lieu}
                </span>
              )}
            </div>
          </div>
          {isAdmin && (
            <button onClick={deleteRdv} className="btn-danger btn-sm">
              <Trash2 className="w-4 h-4 mr-1" /> Supprimer
            </button>
          )}
        </div>

        <div className="card-body space-y-4">
          {rdv.description && (
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-sm text-gray-700 dark:text-gray-300">
              {rdv.description}
            </div>
          )}

          {/* My confirmation */}
          {myParticipation && myParticipation.statut === 'en_attente' && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300 mb-3">
                Vous êtes invité(e) à ce rendez-vous. Confirmez-vous votre présence ?
              </p>
              <div className="flex gap-3">
                <button onClick={() => handleConfirm('confirme')} className="btn-primary btn-sm">
                  <CheckCircle className="w-4 h-4 mr-1" /> Je confirme
                </button>
                <button onClick={() => handleConfirm('refuse')} className="btn-danger btn-sm">
                  <XCircle className="w-4 h-4 mr-1" /> Je refuse
                </button>
              </div>
            </div>
          )}

          {/* Participants */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 dark:text-white">Participants</h3>
              {isAdmin && (
                <button onClick={() => setShowAddForm(true)} className="btn-secondary btn-sm">
                  <UserPlus className="w-4 h-4 mr-1" /> Ajouter
                </button>
              )}
            </div>

            {(!rdv.rdv_participants || rdv.rdv_participants.length === 0) ? (
              <p className="text-sm text-gray-400">Aucun participant.</p>
            ) : (
              <div className="space-y-2">
                {rdv.rdv_participants.map(p => (
                  <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-bold">
                        {p.collaborateurs?.prenom?.[0]}{p.collaborateurs?.nom?.[0]}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">
                          {p.collaborateurs?.prenom} {p.collaborateurs?.nom}
                        </p>
                        <p className="text-xs text-gray-500">{p.collaborateurs?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {p.statut === 'confirme' && <span className="badge-green"><CheckCircle className="w-3 h-3 mr-1" />Confirmé</span>}
                      {p.statut === 'en_attente' && <span className="badge-yellow"><AlertCircle className="w-3 h-3 mr-1" />En attente</span>}
                      {p.statut === 'refuse' && <span className="badge-red"><XCircle className="w-3 h-3 mr-1" />Refusé</span>}
                      {isAdmin && (
                        <button onClick={() => removeParticipant(p.id)} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded" title="Retirer">
                          <XCircle className="w-4 h-4 text-red-400" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add participants form */}
          {showAddForm && (
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-3">
              <h4 className="font-medium text-gray-900 dark:text-white text-sm">Ajouter des participants</h4>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {allCollaborateurs
                  .filter(c => !rdv.rdv_participants?.some(p => p.collaborateur_id === c.id))
                  .map(c => (
                    <label key={c.id} className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(c.id)}
                        onChange={e => {
                          if (e.target.checked) setSelectedIds(prev => [...prev, c.id])
                          else setSelectedIds(prev => prev.filter(id => id !== c.id))
                        }}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">{c.prenom} {c.nom}</span>
                    </label>
                  ))}
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={() => { setShowAddForm(false); setSelectedIds([]) }} className="btn-secondary btn-sm">Annuler</button>
                <button onClick={addParticipants} disabled={saving || selectedIds.length === 0} className="btn-primary btn-sm">
                  {saving && <Loader2 className="w-4 h-4 animate-spin mr-1" />}
                  Ajouter ({selectedIds.length})
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
