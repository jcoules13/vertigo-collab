import { useState, useEffect } from 'react'
import { Plus, Edit2, Save, Loader2, CheckCircle, Mic, Mail } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { DossierSuivi, Seance, TRANSCRIPTION_STATUS_LABELS } from '../../types/database'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import AudioRecorder from './AudioRecorder'

interface Props {
  dossier: DossierSuivi
  collaborateurId: string
  onDossierUpdated: () => void
}

export default function TabSeances({ dossier, collaborateurId, onDossierUpdated }: Props) {
  const [seances, setSeances] = useState<Seance[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // New seance form
  const [showForm, setShowForm] = useState(false)
  const [seanceDate, setSeanceDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [seanceResume, setSeanceResume] = useState('')
  const [seanceActions, setSeanceActions] = useState('')
  const [newSeance, setNewSeance] = useState<Seance | null>(null)

  // Email
  const [sendingEmailId, setSendingEmailId] = useState<string | null>(null)
  const [emailSentId, setEmailSentId] = useState<string | null>(null)

  // Edit seance
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editResume, setEditResume] = useState('')
  const [editActions, setEditActions] = useState('')

  const fetchSeances = async () => {
    try {
      const { data, error: fetchErr } = await supabase
        .from('seances')
        .select('*, collaborateurs!redige_par(prenom, nom)')
        .eq('dossier_id', dossier.id)
        .order('date', { ascending: false })
      if (fetchErr) throw fetchErr
      setSeances(data || [])
    } catch (err: any) {
      console.error('fetchSeances error:', err)
      setError(err.message || 'Erreur lors du chargement des séances')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchSeances() }, [dossier.id])

  const handleAdd = async () => {
    setSaving(true)
    try {
      const { data: created, error: insertErr } = await supabase.from('seances').insert({
        dossier_id: dossier.id,
        date: seanceDate,
        resume: seanceResume.trim() || '',
        actions_prevues: seanceActions.trim() || null,
        redige_par: collaborateurId,
      }).select('*').single()
      if (insertErr) throw insertErr
      const updates: Record<string, any> = { updated_at: new Date().toISOString() }
      if (dossier.statut === 'ouvert') updates.statut = 'en_cours'
      const { error: updateErr } = await supabase.from('dossiers_suivi').update(updates).eq('id', dossier.id)
      if (updateErr) throw updateErr
      setSeanceResume('')
      setSeanceActions('')
      setNewSeance(created)
      await fetchSeances()
      onDossierUpdated()
    } catch (err: any) {
      console.error('handleAdd error:', err)
      setError(err.message || 'Erreur lors de l\'ajout de la séance')
    } finally {
      setSaving(false)
    }
  }

  const handleCloseNewSeance = () => {
    setNewSeance(null)
    setShowForm(false)
    fetchSeances()
  }

  const handleUpdate = async (seanceId: string) => {
    if (!editResume.trim()) return
    setSaving(true)
    try {
      const { error: updateErr } = await supabase.from('seances').update({
        resume: editResume.trim(),
        actions_prevues: editActions.trim() || null,
        updated_at: new Date().toISOString(),
      }).eq('id', seanceId)
      if (updateErr) throw updateErr
      setEditingId(null)
      await fetchSeances()
    } catch (err: any) {
      console.error('handleUpdate error:', err)
      setError(err.message || 'Erreur lors de la modification')
    } finally {
      setSaving(false)
    }
  }

  const handleSendEmail = async (seance: Seance) => {
    if (!dossier.usager_email || !seance.resume) return
    setSendingEmailId(seance.id)
    const auteur = seance.collaborateurs as any as { prenom: string; nom: string } | null
    try {
      const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL
      const res = await fetch(`${webhookUrl}/collab-seance-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usager_email: dossier.usager_email,
          usager_nom: dossier.usager_nom,
          usager_prenom: dossier.usager_prenom || '',
          seance_date: seance.date,
          resume: seance.resume,
          actions_prevues: seance.actions_prevues || '',
          referent_nom: auteur ? `${auteur.prenom} ${auteur.nom}` : '',
        }),
      })
      if (res.ok) setEmailSentId(seance.id)
    } catch (err) {
      console.warn('[Webhook] email error:', err)
      setError('Erreur lors de l\'envoi de l\'email')
    } finally {
      setSendingEmailId(null)
    }
  }

  if (loading) {
    return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary-600" /></div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 dark:text-white">Séances ({seances.length})</h3>
        {dossier.statut !== 'clos' && (
          <button onClick={() => setShowForm(!showForm)} className="text-sm text-primary-600 hover:underline flex items-center gap-1">
            <Plus className="w-4 h-4" /> Ajouter une séance
          </button>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm rounded-lg">{error}</div>
      )}

      {/* New seance form */}
      {showForm && !newSeance && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
            <input type="date" value={seanceDate} onChange={e => setSeanceDate(e.target.value)} className="input w-auto" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Résumé de la séance</label>
            <textarea value={seanceResume} onChange={e => setSeanceResume(e.target.value)} className="input" rows={4} placeholder="Résumé de ce qui a été abordé..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Actions prévues</label>
            <textarea value={seanceActions} onChange={e => setSeanceActions(e.target.value)} className="input" rows={2} placeholder="Prochaines étapes..." />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            <Mic className="w-3.5 h-3.5 inline mr-1" />
            Vous pouvez enregistrer sans résumé : l'audio remplira le résumé automatiquement.
          </p>
          <div className="flex gap-2">
            <button onClick={handleAdd} disabled={saving} className="btn-primary text-sm">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Créer la séance'}
            </button>
            <button onClick={() => setShowForm(false)} className="btn-secondary text-sm">Annuler</button>
          </div>
        </div>
      )}

      {/* Post-creation: AudioRecorder inline */}
      {showForm && newSeance && (
        <div className="p-4 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-primary-700 dark:text-primary-300">
            <CheckCircle className="w-4 h-4" />
            Séance du {format(new Date(newSeance.date), 'd MMMM yyyy', { locale: fr })} créée
          </div>
          <AudioRecorder
            seance={newSeance}
            dossierId={dossier.id}
            onStatusChange={() => { fetchSeances(); setNewSeance(prev => prev ? { ...prev } : null) }}
          />
          <div className="flex justify-end">
            <button onClick={handleCloseNewSeance} className="btn-secondary text-sm">Fermer</button>
          </div>
        </div>
      )}

      {/* Timeline */}
      {seances.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-sm">Aucune séance enregistrée.</p>
      ) : (
        <div className="space-y-4">
          {seances.map(seance => {
            const auteur = seance.collaborateurs as any as { prenom: string; nom: string } | null
            const isEditing = editingId === seance.id

            return (
              <div key={seance.id} className="relative pl-6 border-l-2 border-primary-200 dark:border-primary-800">
                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-primary-600 border-2 border-white dark:border-gray-900" />
                <div className="pb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 flex-wrap">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {format(new Date(seance.date), 'd MMMM yyyy', { locale: fr })}
                    </span>
                    {auteur && <span>par {auteur.prenom} {auteur.nom}</span>}
                    {seance.transcription_status && seance.transcription_status !== 'none' && (
                      <span className={`badge ${
                        seance.transcription_status === 'validated' ? 'badge-green' :
                        seance.transcription_status === 'ready' ? 'badge-teal' :
                        seance.transcription_status === 'error' ? 'badge-red' :
                        'badge-blue'
                      }`}>
                        <Mic className="w-3 h-3 mr-0.5 inline" />
                        {TRANSCRIPTION_STATUS_LABELS[seance.transcription_status]}
                      </span>
                    )}
                    {seance.redige_par === collaborateurId && !isEditing && (
                      <button
                        onClick={() => { setEditingId(seance.id); setEditResume(seance.resume); setEditActions(seance.actions_prevues || '') }}
                        className="text-primary-600 hover:underline flex items-center gap-1 text-xs"
                      >
                        <Edit2 className="w-3.5 h-3.5" /> Modifier le résumé
                      </button>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="mt-2 space-y-2">
                      <textarea value={editResume} onChange={e => setEditResume(e.target.value)} className="input" rows={3} />
                      <textarea value={editActions} onChange={e => setEditActions(e.target.value)} className="input" rows={2} placeholder="Actions prévues..." />
                      <div className="flex gap-2">
                        <button onClick={() => handleUpdate(seance.id)} disabled={saving} className="btn-primary text-sm">
                          <Save className="w-3.5 h-3.5 mr-1" /> Enregistrer
                        </button>
                        <button onClick={() => setEditingId(null)} className="btn-secondary text-sm">Annuler</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 whitespace-pre-wrap">{seance.resume}</p>
                      {seance.actions_prevues && (
                        <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/10 rounded text-sm text-yellow-800 dark:text-yellow-300">
                          <CheckCircle className="w-3.5 h-3.5 inline mr-1" />
                          <strong>Actions prévues :</strong> {seance.actions_prevues}
                        </div>
                      )}
                      {/* Send email button */}
                      {dossier.usager_email && seance.resume && (
                        <div className="mt-2">
                          {emailSentId === seance.id ? (
                            <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                              <CheckCircle className="w-3.5 h-3.5" /> Email envoyé
                            </span>
                          ) : (
                            <button
                              onClick={() => handleSendEmail(seance)}
                              disabled={sendingEmailId === seance.id}
                              className="inline-flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 hover:underline"
                            >
                              {sendingEmailId === seance.id ? (
                                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Envoi...</>
                              ) : (
                                <><Mail className="w-3.5 h-3.5" /> Envoyer par email</>
                              )}
                            </button>
                          )}
                        </div>
                      )}
                      {/* Audio transcription */}
                      {dossier.statut !== 'clos' && (
                        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                          <AudioRecorder
                            seance={seance}
                            dossierId={dossier.id}
                            onStatusChange={fetchSeances}
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
