import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CalendarPlus, Loader2, Clock, Mail, Phone, MapPin, Check, X, MessageSquare, ExternalLink, User, FolderOpen, Trash2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { ReservationExterne, CANAL_LABELS, STATUT_RESERVATION_LABELS } from '../types/database'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

const STATUT_COLORS: Record<ReservationExterne['statut'], string> = {
  nouvelle: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  confirmee: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  annulee: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  terminee: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
}

const CANAL_COLORS: Record<ReservationExterne['canal'], string> = {
  visio: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  presentiel: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  telephone: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  autre: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
}

type ReservationWithGerePar = ReservationExterne & {
  collaborateurs?: { prenom: string; nom: string } | null
  dossier_reservations?: { dossier_id: string }[]
}

export default function ReservationsPage() {
  const { collaborateur } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reservations, setReservations] = useState<ReservationWithGerePar[]>([])
  const [filter, setFilter] = useState<'avenir' | 'passes' | 'tous'>('avenir')
  const [statutFilter, setStatutFilter] = useState<ReservationExterne['statut'] | 'tous'>('tous')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [notesEdit, setNotesEdit] = useState<{ id: string; notes: string } | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const fetchReservations = async () => {
    try {
      const today = format(new Date(), 'yyyy-MM-dd')
      let query = supabase
        .from('reservations_externes')
        .select('*, collaborateurs!gere_par(prenom, nom), dossier_reservations(dossier_id)')
        .order('date', { ascending: true })

      if (filter === 'avenir') query = query.gte('date', today)
      if (filter === 'passes') query = query.lt('date', today)
      if (statutFilter !== 'tous') query = query.eq('statut', statutFilter)

      const { data, error: err } = await query
      if (err) throw err
      setReservations((data || []) as ReservationWithGerePar[])
    } catch (err: any) {
      console.error('ReservationsPage fetchReservations error:', err)
      setError(err.message || 'Erreur lors du chargement des réservations')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchReservations() }, [filter, statutFilter])

  const handleAction = async (reservationId: string, action: 'confirmer' | 'annuler' | 'terminer') => {
    if (!collaborateur) return
    setActionLoading(reservationId)

    try {
      const update: Record<string, any> = { updated_at: new Date().toISOString(), gere_par: collaborateur.id }
      if (action === 'confirmer') { update.statut = 'confirmee'; update.confirmed_at = new Date().toISOString() }
      else if (action === 'annuler') { update.statut = 'annulee'; update.cancelled_at = new Date().toISOString() }
      else if (action === 'terminer') { update.statut = 'terminee' }

      const { error: updateErr } = await supabase.from('reservations_externes').update(update).eq('id', reservationId)
      if (updateErr) throw updateErr

      // Sync to Google Calendar via n8n (non-blocking)
      try {
        const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL
        fetch(`${webhookUrl}/collab-reservation-manage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            reservation_id: reservationId,
            action: action,
            notes: null,
            collaborateur_id: collaborateur.id,
          }),
        }).catch(err => console.warn('[Webhook] non-blocking error:', err))
      } catch (err) { console.warn('[Webhook] non-blocking error:', err) }

      await fetchReservations()
    } catch (err: any) {
      console.error('handleAction error:', err)
      setError(err.message || 'Erreur lors de la mise à jour')
    } finally {
      setActionLoading(null)
    }
  }

  const handleClaim = async (res: ReservationWithGerePar) => {
    if (!collaborateur) return
    setActionLoading(res.id)

    try {
      const { error: claimErr } = await supabase.from('reservations_externes').update({
        gere_par: collaborateur.id,
        statut: 'confirmee',
        confirmed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }).eq('id', res.id)
      if (claimErr) throw claimErr

      // Sync to Google Calendar
      try {
        const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL
        fetch(`${webhookUrl}/collab-reservation-manage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            reservation_id: res.id,
            action: 'confirmer',
            notes: null,
            collaborateur_id: collaborateur.id,
          }),
        }).catch(err => console.warn('[Webhook] non-blocking error:', err))
      } catch (err) { console.warn('[Webhook] non-blocking error:', err) }

      await fetchReservations()

      // Check if dossier exists for this usager, if not propose creation
      if (res.usager_email) {
        const { data: existingDossiers, error: dossierErr } = await supabase
          .from('dossiers_suivi')
          .select('id')
          .eq('usager_email', res.usager_email)
          .neq('statut', 'clos')
          .limit(1)
        if (dossierErr) throw dossierErr

        if (!existingDossiers || existingDossiers.length === 0) {
          // Create dossier automatically
          const { data: newDossier, error: insertErr } = await supabase.from('dossiers_suivi').insert({
            usager_nom: res.usager_nom,
            usager_email: res.usager_email,
            usager_telephone: res.usager_telephone,
            motif: res.titre,
            cree_par: collaborateur.id,
            responsable_id: collaborateur.id,
          }).select('id').single()
          if (insertErr) throw insertErr

          if (newDossier) {
            // Link reservation to dossier
            await supabase.from('dossier_reservations').insert({
              dossier_id: newDossier.id,
              reservation_id: res.id,
            })
            navigate(`/dossiers/${newDossier.id}`)
            return
          }
        } else {
          // Link to existing dossier
          await supabase.from('dossier_reservations').insert({
            dossier_id: existingDossiers[0].id,
            reservation_id: res.id,
          }) // ignore if already linked (UNIQUE constraint)
          navigate(`/dossiers/${existingDossiers[0].id}`)
          return
        }
      }
    } catch (err: any) {
      console.error('handleClaim error:', err)
      setError(err.message || 'Erreur lors de la prise en charge')
    } finally {
      setActionLoading(null)
    }
  }

  const handleSaveNotes = async () => {
    if (!notesEdit || !collaborateur) return
    setActionLoading(notesEdit.id)

    try {
      const { error: updateErr } = await supabase
        .from('reservations_externes')
        .update({ notes_admin: notesEdit.notes, gere_par: collaborateur.id, updated_at: new Date().toISOString() })
        .eq('id', notesEdit.id)
      if (updateErr) throw updateErr

      setNotesEdit(null)
      await fetchReservations()
    } catch (err: any) {
      console.error('handleSaveNotes error:', err)
      setError(err.message || 'Erreur lors de la sauvegarde des notes')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (reservationId: string) => {
    setActionLoading(reservationId)
    try {
      const { error: delErr } = await supabase
        .from('reservations_externes')
        .delete()
        .eq('id', reservationId)
      if (delErr) throw delErr
      setDeleteConfirm(null)
      await fetchReservations()
    } catch (err: any) {
      console.error('handleDelete error:', err)
      setError(err.message || 'Erreur lors de la suppression')
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary-600" /></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Réservations usagers</h1>
        <a
          href="https://calendar.app.google/xpCAPyKuJiNU4wdS8"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary text-sm"
        >
          <ExternalLink className="w-4 h-4 mr-2" /> Page de réservation
        </a>
      </div>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm rounded-lg">{error}</div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="flex gap-2">
          {(['avenir', 'passes', 'tous'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === f ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200'
              }`}
            >
              {f === 'avenir' ? 'À venir' : f === 'passes' ? 'Passées' : 'Toutes'}
            </button>
          ))}
        </div>
        <div className="w-px bg-gray-200 dark:bg-gray-700 mx-1" />
        <div className="flex gap-2">
          {(['tous', 'nouvelle', 'confirmee', 'annulee', 'terminee'] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatutFilter(s)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                statutFilter === s ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200'
              }`}
            >
              {s === 'tous' ? 'Tous statuts' : STATUT_RESERVATION_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {reservations.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <CalendarPlus className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Aucune réservation {filter === 'avenir' ? 'à venir' : filter === 'passes' ? 'passée' : ''}.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reservations.map(res => {
            const gerePar = res.collaborateurs
            const dossierId = res.dossier_reservations?.[0]?.dossier_id

            return (
              <div key={res.id} className="card">
                <div className="card-body">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg shrink-0">
                        <CalendarPlus className="w-6 h-6 text-orange-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-gray-900 dark:text-white">{res.usager_nom}</h3>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUT_COLORS[res.statut]}`}>
                            {STATUT_RESERVATION_LABELS[res.statut]}
                          </span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${CANAL_COLORS[res.canal]}`}>
                            {CANAL_LABELS[res.canal]}
                          </span>
                          {gerePar && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400">
                              <User className="w-3 h-3 mr-1" /> {gerePar.prenom} {gerePar.nom}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-0.5">{res.titre}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-2 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {format(new Date(res.date), 'EEE d MMM', { locale: fr })} {res.heure_debut.slice(0, 5)} - {res.heure_fin.slice(0, 5)}
                          </span>
                          {res.usager_email && (
                            <a href={`mailto:${res.usager_email}`} className="flex items-center gap-1 hover:text-primary-600">
                              <Mail className="w-3.5 h-3.5" /> {res.usager_email}
                            </a>
                          )}
                          {res.usager_telephone && (
                            <a href={`tel:${res.usager_telephone}`} className="flex items-center gap-1 hover:text-primary-600">
                              <Phone className="w-3.5 h-3.5" /> {res.usager_telephone}
                            </a>
                          )}
                          {res.lieu && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" /> {res.lieu}
                            </span>
                          )}
                        </div>
                        {res.notes_admin && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 italic">
                            <MessageSquare className="w-3.5 h-3.5 inline mr-1" />
                            {res.notes_admin}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions — all collaborators */}
                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
                      {res.statut === 'nouvelle' && !res.gere_par && (
                        <button
                          onClick={() => handleClaim(res)}
                          disabled={actionLoading === res.id}
                          className="inline-flex items-center px-3 py-1.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50"
                        >
                          {actionLoading === res.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><User className="w-4 h-4 mr-1" /> S'approprier</>}
                        </button>
                      )}
                      {res.statut === 'nouvelle' && (
                        <>
                          <button
                            onClick={() => handleAction(res.id, 'confirmer')}
                            disabled={actionLoading === res.id}
                            className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50"
                          >
                            <Check className="w-4 h-4 mr-1" /> Confirmer
                          </button>
                          <button
                            onClick={() => handleAction(res.id, 'annuler')}
                            disabled={actionLoading === res.id}
                            className="inline-flex items-center px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50"
                          >
                            <X className="w-4 h-4 mr-1" /> Annuler
                          </button>
                        </>
                      )}
                      {res.statut === 'confirmee' && (
                        <>
                          <button
                            onClick={() => handleAction(res.id, 'terminer')}
                            disabled={actionLoading === res.id}
                            className="inline-flex items-center px-3 py-1.5 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 disabled:opacity-50"
                          >
                            <Check className="w-4 h-4 mr-1" /> Terminer
                          </button>
                          <button
                            onClick={() => handleAction(res.id, 'annuler')}
                            disabled={actionLoading === res.id}
                            className="inline-flex items-center px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50"
                          >
                            <X className="w-4 h-4 mr-1" /> Annuler
                          </button>
                        </>
                      )}
                      {(res.statut === 'nouvelle' || res.statut === 'confirmee') && (
                        <button
                          onClick={() => setNotesEdit({ id: res.id, notes: res.notes_admin || '' })}
                          className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                        >
                          <MessageSquare className="w-4 h-4 mr-1" /> Notes
                        </button>
                      )}
                      {dossierId ? (
                        <Link
                          to={`/dossiers/${dossierId}`}
                          className="inline-flex items-center px-3 py-1.5 bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 text-sm font-medium rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/50"
                        >
                          <FolderOpen className="w-4 h-4 mr-1" /> Dossier
                        </Link>
                      ) : null}
                      {res.statut === 'annulee' && !dossierId && (
                        deleteConfirm === res.id ? (
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-red-500 mr-1">Confirmer ?</span>
                            <button
                              onClick={() => handleDelete(res.id)}
                              disabled={actionLoading === res.id}
                              className="inline-flex items-center px-2 py-1 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700 disabled:opacity-50"
                            >
                              {actionLoading === res.id ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Oui'}
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="inline-flex items-center px-2 py-1 bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 text-xs font-medium rounded hover:bg-gray-300"
                            >
                              Non
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(res.id)}
                            className="inline-flex items-center px-3 py-1.5 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 text-sm font-medium rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40"
                          >
                            <Trash2 className="w-4 h-4 mr-1" /> Supprimer
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  {/* Notes edit inline */}
                  {notesEdit?.id === res.id && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex gap-2">
                      <textarea
                        value={notesEdit.notes}
                        onChange={e => setNotesEdit({ ...notesEdit, notes: e.target.value })}
                        className="input flex-1"
                        rows={2}
                        placeholder="Notes administratives..."
                      />
                      <div className="flex flex-col gap-1">
                        <button onClick={handleSaveNotes} className="btn-primary text-sm px-3 py-1">Enregistrer</button>
                        <button onClick={() => setNotesEdit(null)} className="btn-secondary text-sm px-3 py-1">Annuler</button>
                      </div>
                    </div>
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
