import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Clock, MapPin, Loader2, ArrowLeft, UserPlus, CheckCircle,
  XCircle, AlertCircle, Ban
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { PermanenceOccurrence, Collaborateur } from '../types/database'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export default function PermanenceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { collaborateur, isAdmin } = useAuth()
  const [loading, setLoading] = useState(true)
  const [occurrence, setOccurrence] = useState<PermanenceOccurrence | null>(null)
  const [allCollaborateurs, setAllCollaborateurs] = useState<Collaborateur[]>([])
  const [showAssignForm, setShowAssignForm] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  const fetchOccurrence = async () => {
    if (!id) return
    const { data } = await supabase
      .from('permanence_occurrences')
      .select('*, permanences(nom, lieu), permanence_assignments(id, statut, collaborateur_id, notifie_at, confirme_at, collaborateurs(id, prenom, nom, email))')
      .eq('id', id)
      .single()
    setOccurrence(data)
    setLoading(false)
  }

  const fetchCollaborateurs = async () => {
    const { data } = await supabase
      .from('collaborateurs')
      .select('*')
      .eq('actif', true)
      .order('nom')
    setAllCollaborateurs(data || [])
  }

  useEffect(() => {
    fetchOccurrence()
    fetchCollaborateurs()
  }, [id])

  const handleConfirm = async (statut: 'confirme' | 'refuse') => {
    if (!collaborateur || !occurrence) return
    const assignment = occurrence.permanence_assignments?.find(a => a.collaborateur_id === collaborateur.id)
    if (!assignment) return

    await supabase
      .from('permanence_assignments')
      .update({ statut, confirme_at: new Date().toISOString() })
      .eq('id', assignment.id)

    // Sync to Google Calendar (non-blocking)
    try {
      const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL
      fetch(`${webhookUrl}/collab-gcal-sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'permanence',
          occurrence_id: occurrence.id,
          collaborateur_id: collaborateur.id,
          statut,
        }),
      })
    } catch {}

    await fetchOccurrence()
  }

  const handleAssign = async () => {
    if (!occurrence || selectedIds.length === 0) return
    setSaving(true)

    const existingIds = new Set(occurrence.permanence_assignments?.map(a => a.collaborateur_id) || [])
    const newIds = selectedIds.filter(id => !existingIds.has(id))

    if (newIds.length > 0) {
      await supabase.from('permanence_assignments').insert(
        newIds.map(cid => ({ occurrence_id: occurrence.id, collaborateur_id: cid }))
      )

      // Notify via n8n (non-blocking)
      try {
        const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL
        fetch(`${webhookUrl}/collab-permanence-assign`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            occurrence_id: occurrence.id,
            collaborateur_ids: newIds,
            date: occurrence.date,
            heure_debut: occurrence.heure_debut,
            heure_fin: occurrence.heure_fin,
            permanence_nom: occurrence.permanences?.nom,
            lieu: occurrence.permanences?.lieu,
          }),
        })
      } catch {}
    }

    setShowAssignForm(false)
    setSelectedIds([])
    setSaving(false)
    await fetchOccurrence()
  }

  const removeAssignment = async (assignmentId: string) => {
    if (!confirm('Retirer cette personne de la permanence ?')) return
    await supabase.from('permanence_assignments').delete().eq('id', assignmentId)
    await fetchOccurrence()
  }

  const cancelOccurrence = async () => {
    if (!occurrence || !confirm('Annuler cette permanence ?')) return
    await supabase.from('permanence_occurrences').update({ annulee: true }).eq('id', occurrence.id)
    await fetchOccurrence()
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary-600" /></div>
  }

  if (!occurrence) {
    return <div className="text-center text-gray-500 py-16">Permanence introuvable.</div>
  }

  const myAssignment = occurrence.permanence_assignments?.find(a => a.collaborateur_id === collaborateur?.id)

  return (
    <div className="max-w-3xl space-y-6">
      <button onClick={() => navigate('/permanences')} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
        <ArrowLeft className="w-4 h-4" /> Retour aux permanences
      </button>

      <div className="card">
        <div className="card-header flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {occurrence.permanences?.nom}
              {occurrence.annulee && <span className="badge-red ml-2">Annulée</span>}
            </h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {format(new Date(occurrence.date), 'EEEE d MMMM yyyy', { locale: fr })} &middot; {occurrence.heure_debut.slice(0, 5)} - {occurrence.heure_fin.slice(0, 5)}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" /> {occurrence.permanences?.lieu}
              </span>
            </div>
          </div>
          {isAdmin && !occurrence.annulee && (
            <button onClick={cancelOccurrence} className="btn-danger btn-sm">
              <Ban className="w-4 h-4 mr-1" /> Annuler
            </button>
          )}
        </div>

        <div className="card-body space-y-4">
          {/* My confirmation */}
          {myAssignment && myAssignment.statut === 'en_attente' && !occurrence.annulee && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300 mb-3">
                Vous êtes assigné(e) à cette permanence. Confirmez-vous votre présence ?
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

          {/* Assigned list */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 dark:text-white">Personnes assignées</h3>
              {isAdmin && !occurrence.annulee && (
                <button onClick={() => setShowAssignForm(true)} className="btn-secondary btn-sm">
                  <UserPlus className="w-4 h-4 mr-1" /> Assigner
                </button>
              )}
            </div>

            {(!occurrence.permanence_assignments || occurrence.permanence_assignments.length === 0) ? (
              <p className="text-sm text-gray-400">Personne n'est encore assigné.</p>
            ) : (
              <div className="space-y-2">
                {occurrence.permanence_assignments.map(a => (
                  <div key={a.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-bold">
                        {a.collaborateurs?.prenom?.[0]}{a.collaborateurs?.nom?.[0]}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">
                          {a.collaborateurs?.prenom} {a.collaborateurs?.nom}
                        </p>
                        <p className="text-xs text-gray-500">{a.collaborateurs?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {a.statut === 'confirme' && <span className="badge-green"><CheckCircle className="w-3 h-3 mr-1" />Confirmé</span>}
                      {a.statut === 'en_attente' && <span className="badge-yellow"><AlertCircle className="w-3 h-3 mr-1" />En attente</span>}
                      {a.statut === 'refuse' && <span className="badge-red"><XCircle className="w-3 h-3 mr-1" />Refusé</span>}
                      {a.statut === 'absent' && <span className="badge-gray">Absent</span>}
                      {isAdmin && (
                        <button onClick={() => removeAssignment(a.id)} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded" title="Retirer">
                          <XCircle className="w-4 h-4 text-red-400" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Assign form */}
          {showAssignForm && (
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-3">
              <h4 className="font-medium text-gray-900 dark:text-white text-sm">Sélectionner les collaborateurs</h4>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {allCollaborateurs
                  .filter(c => !occurrence.permanence_assignments?.some(a => a.collaborateur_id === c.id))
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
                <button onClick={() => { setShowAssignForm(false); setSelectedIds([]) }} className="btn-secondary btn-sm">Annuler</button>
                <button onClick={handleAssign} disabled={saving || selectedIds.length === 0} className="btn-primary btn-sm">
                  {saving && <Loader2 className="w-4 h-4 animate-spin mr-1" />}
                  Assigner ({selectedIds.length})
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
