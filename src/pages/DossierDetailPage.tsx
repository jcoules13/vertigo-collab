import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Loader2, User, Mail, Phone,
  Plus, Edit2, Save, CalendarPlus, FileText, CheckCircle
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { DossierSuivi, Seance, DossierReservation, ReservationExterne, STATUT_DOSSIER_LABELS, CANAL_LABELS, STATUT_RESERVATION_LABELS } from '../types/database'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

const STATUT_COLORS: Record<DossierSuivi['statut'], string> = {
  ouvert: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  en_cours: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  clos: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
}

export default function DossierDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { collaborateur } = useAuth()
  const [loading, setLoading] = useState(true)
  const [dossier, setDossier] = useState<DossierSuivi | null>(null)
  const [seances, setSeances] = useState<Seance[]>([])
  const [linkedReservations, setLinkedReservations] = useState<(DossierReservation & { reservations_externes: ReservationExterne })[]>([])
  const [saving, setSaving] = useState(false)

  // Edit dossier info
  const [editingInfo, setEditingInfo] = useState(false)
  const [editNom, setEditNom] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editTelephone, setEditTelephone] = useState('')
  const [editMotif, setEditMotif] = useState('')
  const [editNotes, setEditNotes] = useState('')

  // New seance form
  const [showSeanceForm, setShowSeanceForm] = useState(false)
  const [seanceDate, setSeanceDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [seanceResume, setSeanceResume] = useState('')
  const [seanceActions, setSeanceActions] = useState('')

  // Edit seance
  const [editingSeanceId, setEditingSeanceId] = useState<string | null>(null)
  const [editSeanceResume, setEditSeanceResume] = useState('')
  const [editSeanceActions, setEditSeanceActions] = useState('')

  // Link reservation
  const [showLinkForm, setShowLinkForm] = useState(false)
  const [availableReservations, setAvailableReservations] = useState<ReservationExterne[]>([])

  const fetchDossier = async () => {
    if (!id) return
    try {
      const { data } = await supabase
        .from('dossiers_suivi')
        .select('*, collaborateurs!cree_par(prenom, nom), responsable:collaborateurs!responsable_id(id, prenom, nom)')
        .eq('id', id)
        .single()
      setDossier(data)
      if (data) {
        setEditNom(data.usager_nom)
        setEditEmail(data.usager_email || '')
        setEditTelephone(data.usager_telephone || '')
        setEditMotif(data.motif || '')
        setEditNotes(data.notes || '')
      }
    } catch (err) {
      console.error('DossierDetailPage fetchDossier error:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchSeances = async () => {
    if (!id) return
    const { data } = await supabase
      .from('seances')
      .select('*, collaborateurs!redige_par(prenom, nom)')
      .eq('dossier_id', id)
      .order('date', { ascending: false })
    setSeances(data || [])
  }

  const fetchLinkedReservations = async () => {
    if (!id) return
    const { data } = await supabase
      .from('dossier_reservations')
      .select('*, reservations_externes(*)')
      .eq('dossier_id', id)
      .order('linked_at', { ascending: false })
    setLinkedReservations((data || []) as any)
  }

  useEffect(() => {
    fetchDossier()
    fetchSeances()
    fetchLinkedReservations()
  }, [id])

  const handleSaveInfo = async () => {
    if (!id || !editNom.trim()) return
    setSaving(true)
    await supabase.from('dossiers_suivi').update({
      usager_nom: editNom.trim(),
      usager_email: editEmail.trim() || null,
      usager_telephone: editTelephone.trim() || null,
      motif: editMotif.trim() || null,
      notes: editNotes.trim() || null,
      updated_at: new Date().toISOString(),
    }).eq('id', id)
    setEditingInfo(false)
    setSaving(false)
    await fetchDossier()
  }

  const handleChangeStatut = async (newStatut: DossierSuivi['statut']) => {
    if (!id) return
    await supabase.from('dossiers_suivi').update({
      statut: newStatut,
      updated_at: new Date().toISOString(),
    }).eq('id', id)
    await fetchDossier()
  }

  const handleAttribuer = async () => {
    if (!id || !collaborateur) return
    await supabase.from('dossiers_suivi').update({
      responsable_id: collaborateur.id,
      updated_at: new Date().toISOString(),
    }).eq('id', id)
    await fetchDossier()
  }

  const handleAddSeance = async () => {
    if (!id || !collaborateur || !seanceResume.trim()) return
    setSaving(true)
    await supabase.from('seances').insert({
      dossier_id: id,
      date: seanceDate,
      resume: seanceResume.trim(),
      actions_prevues: seanceActions.trim() || null,
      redige_par: collaborateur.id,
    })
    // Also update dossier updated_at and set en_cours if still ouvert
    const updates: Record<string, any> = { updated_at: new Date().toISOString() }
    if (dossier?.statut === 'ouvert') updates.statut = 'en_cours'
    await supabase.from('dossiers_suivi').update(updates).eq('id', id)

    setSeanceResume('')
    setSeanceActions('')
    setShowSeanceForm(false)
    setSaving(false)
    await fetchSeances()
    await fetchDossier()
  }

  const handleUpdateSeance = async (seanceId: string) => {
    if (!editSeanceResume.trim()) return
    setSaving(true)
    await supabase.from('seances').update({
      resume: editSeanceResume.trim(),
      actions_prevues: editSeanceActions.trim() || null,
      updated_at: new Date().toISOString(),
    }).eq('id', seanceId)
    setEditingSeanceId(null)
    setSaving(false)
    await fetchSeances()
  }

  const handleShowLinkForm = async () => {
    if (!dossier) return
    // Fetch unlinked reservations matching the usager email
    let query = supabase.from('reservations_externes').select('*').order('date', { ascending: false })
    if (dossier.usager_email) {
      query = query.eq('usager_email', dossier.usager_email)
    }
    const { data } = await query
    // Filter out already linked
    const linkedIds = new Set(linkedReservations.map(lr => lr.reservation_id))
    setAvailableReservations((data || []).filter(r => !linkedIds.has(r.id)))
    setShowLinkForm(true)
  }

  const handleLinkReservation = async (reservationId: string) => {
    if (!id) return
    await supabase.from('dossier_reservations').insert({
      dossier_id: id,
      reservation_id: reservationId,
    })
    setShowLinkForm(false)
    await fetchLinkedReservations()
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary-600" /></div>
  }

  if (!dossier) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Dossier introuvable.</p>
        <button onClick={() => navigate('/dossiers')} className="btn-primary mt-4 text-sm">Retour aux dossiers</button>
      </div>
    )
  }

  const responsable = dossier.responsable as any as { id: string; prenom: string; nom: string } | null
  const isResponsable = responsable?.id === collaborateur?.id

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/dossiers')} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{dossier.usager_nom}</h1>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUT_COLORS[dossier.statut]}`}>
              {STATUT_DOSSIER_LABELS[dossier.statut]}
            </span>
          </div>
          {responsable && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Responsable : {responsable.prenom} {responsable.nom}
              {isResponsable && ' (vous)'}
            </p>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        {!isResponsable && (
          <button onClick={handleAttribuer} className="btn-primary text-sm">
            <User className="w-4 h-4 mr-1" /> S'attribuer
          </button>
        )}
        {dossier.statut === 'ouvert' && (
          <button onClick={() => handleChangeStatut('en_cours')} className="btn-secondary text-sm">
            Passer en cours
          </button>
        )}
        {dossier.statut !== 'clos' && (
          <button onClick={() => handleChangeStatut('clos')} className="btn-secondary text-sm">
            Clore le dossier
          </button>
        )}
        {dossier.statut === 'clos' && (
          <button onClick={() => handleChangeStatut('ouvert')} className="btn-secondary text-sm">
            Réouvrir
          </button>
        )}
        <button onClick={() => setEditingInfo(!editingInfo)} className="btn-secondary text-sm">
          <Edit2 className="w-4 h-4 mr-1" /> Modifier infos
        </button>
      </div>

      {/* Editable info card */}
      {editingInfo && (
        <div className="card">
          <div className="card-body space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Modifier les informations</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom *</label>
                <input value={editNom} onChange={e => setEditNom(e.target.value)} className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input value={editEmail} onChange={e => setEditEmail(e.target.value)} className="input" type="email" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Téléphone</label>
                <input value={editTelephone} onChange={e => setEditTelephone(e.target.value)} className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Motif</label>
                <input value={editMotif} onChange={e => setEditMotif(e.target.value)} className="input" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes générales</label>
              <textarea value={editNotes} onChange={e => setEditNotes(e.target.value)} className="input" rows={3} placeholder="Notes sur le dossier..." />
            </div>
            <div className="flex gap-2">
              <button onClick={handleSaveInfo} disabled={saving || !editNom.trim()} className="btn-primary text-sm">
                <Save className="w-4 h-4 mr-1" /> Enregistrer
              </button>
              <button onClick={() => setEditingInfo(false)} className="btn-secondary text-sm">Annuler</button>
            </div>
          </div>
        </div>
      )}

      {/* Info card (read-only) */}
      {!editingInfo && (
        <div className="card">
          <div className="card-body">
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300 flex-wrap">
              {dossier.usager_email && (
                <a href={`mailto:${dossier.usager_email}`} className="flex items-center gap-1 hover:text-primary-600">
                  <Mail className="w-4 h-4" /> {dossier.usager_email}
                </a>
              )}
              {dossier.usager_telephone && (
                <a href={`tel:${dossier.usager_telephone}`} className="flex items-center gap-1 hover:text-primary-600">
                  <Phone className="w-4 h-4" /> {dossier.usager_telephone}
                </a>
              )}
              {dossier.motif && (
                <span className="flex items-center gap-1">
                  <FileText className="w-4 h-4" /> {dossier.motif}
                </span>
              )}
            </div>
            {dossier.notes && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 italic">{dossier.notes}</p>
            )}
          </div>
        </div>
      )}

      {/* Seances timeline */}
      <div className="card">
        <div className="card-header flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 dark:text-white">Séances ({seances.length})</h2>
          {dossier.statut !== 'clos' && (
            <button onClick={() => setShowSeanceForm(!showSeanceForm)} className="text-sm text-primary-600 hover:underline flex items-center gap-1">
              <Plus className="w-4 h-4" /> Ajouter une séance
            </button>
          )}
        </div>
        <div className="card-body">
          {/* New seance form */}
          {showSeanceForm && (
            <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                  <input type="date" value={seanceDate} onChange={e => setSeanceDate(e.target.value)} className="input" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Résumé de la séance *</label>
                <textarea value={seanceResume} onChange={e => setSeanceResume(e.target.value)} className="input" rows={4} placeholder="Résumé de ce qui a été abordé, décisions prises..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Actions prévues</label>
                <textarea value={seanceActions} onChange={e => setSeanceActions(e.target.value)} className="input" rows={2} placeholder="Prochaines étapes, démarches à effectuer..." />
              </div>
              <div className="flex gap-2">
                <button onClick={handleAddSeance} disabled={saving || !seanceResume.trim()} className="btn-primary text-sm">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enregistrer la séance'}
                </button>
                <button onClick={() => setShowSeanceForm(false)} className="btn-secondary text-sm">Annuler</button>
              </div>
            </div>
          )}

          {seances.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm">Aucune séance enregistrée.</p>
          ) : (
            <div className="space-y-4">
              {seances.map(seance => {
                const auteur = seance.collaborateurs as any as { prenom: string; nom: string } | null
                const isEditing = editingSeanceId === seance.id

                return (
                  <div key={seance.id} className="relative pl-6 border-l-2 border-primary-200 dark:border-primary-800">
                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-primary-600 border-2 border-white dark:border-gray-900" />
                    <div className="pb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {format(new Date(seance.date), 'd MMMM yyyy', { locale: fr })}
                        </span>
                        {auteur && (
                          <span>par {auteur.prenom} {auteur.nom}</span>
                        )}
                        {seance.redige_par === collaborateur?.id && !isEditing && (
                          <button
                            onClick={() => {
                              setEditingSeanceId(seance.id)
                              setEditSeanceResume(seance.resume)
                              setEditSeanceActions(seance.actions_prevues || '')
                            }}
                            className="text-primary-600 hover:underline"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {isEditing ? (
                        <div className="mt-2 space-y-2">
                          <textarea value={editSeanceResume} onChange={e => setEditSeanceResume(e.target.value)} className="input" rows={3} />
                          <textarea value={editSeanceActions} onChange={e => setEditSeanceActions(e.target.value)} className="input" rows={2} placeholder="Actions prévues..." />
                          <div className="flex gap-2">
                            <button onClick={() => handleUpdateSeance(seance.id)} disabled={saving} className="btn-primary text-sm">
                              <Save className="w-3.5 h-3.5 mr-1" /> Enregistrer
                            </button>
                            <button onClick={() => setEditingSeanceId(null)} className="btn-secondary text-sm">Annuler</button>
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
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Linked reservations */}
      <div className="card">
        <div className="card-header flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 dark:text-white">Réservations liées ({linkedReservations.length})</h2>
          <button onClick={handleShowLinkForm} className="text-sm text-primary-600 hover:underline flex items-center gap-1">
            <Plus className="w-4 h-4" /> Lier une réservation
          </button>
        </div>
        <div className="card-body">
          {/* Link form */}
          {showLinkForm && (
            <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              {availableReservations.length === 0 ? (
                <p className="text-sm text-gray-500">Aucune réservation disponible à lier{dossier.usager_email ? ` pour ${dossier.usager_email}` : ''}.</p>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sélectionner une réservation :</p>
                  {availableReservations.map(res => (
                    <button
                      key={res.id}
                      onClick={() => handleLinkReservation(res.id)}
                      className="w-full text-left p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-between"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{res.titre}</p>
                        <p className="text-xs text-gray-500">{format(new Date(res.date), 'd MMM yyyy', { locale: fr })} · {res.heure_debut.slice(0, 5)} - {res.heure_fin.slice(0, 5)}</p>
                      </div>
                      <span className="text-xs text-gray-400">{STATUT_RESERVATION_LABELS[res.statut]}</span>
                    </button>
                  ))}
                </div>
              )}
              <button onClick={() => setShowLinkForm(false)} className="btn-secondary text-sm mt-2">Fermer</button>
            </div>
          )}

          {linkedReservations.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm">Aucune réservation liée.</p>
          ) : (
            <div className="space-y-2">
              {linkedReservations.map(lr => {
                const res = lr.reservations_externes
                if (!res) return null
                return (
                  <div key={lr.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center gap-3">
                      <CalendarPlus className="w-5 h-5 text-orange-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{res.titre}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {format(new Date(res.date), 'EEE d MMM yyyy', { locale: fr })} · {res.heure_debut.slice(0, 5)} - {res.heure_fin.slice(0, 5)} · {CANAL_LABELS[res.canal]}
                        </p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      res.statut === 'nouvelle' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      : res.statut === 'confirmee' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : res.statut === 'annulee' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                    }`}>
                      {STATUT_RESERVATION_LABELS[res.statut]}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
