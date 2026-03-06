import { useState, useEffect } from 'react'
import { Plus, CalendarPlus, Loader2, Mail, Save, Check, FileText } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { DossierSuivi, DossierReservation, ReservationExterne, CANAL_LABELS, STATUT_RESERVATION_LABELS } from '../../types/database'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface Props {
  dossier: DossierSuivi
  collaborateurNom: string
  onSave?: (updates: Partial<DossierSuivi>) => Promise<void>
  saving?: boolean
}

export default function TabSuivi({ dossier, collaborateurNom, onSave, saving: savingProp }: Props) {
  const [linkedReservations, setLinkedReservations] = useState<(DossierReservation & { reservations_externes: ReservationExterne })[]>([])
  const [availableReservations, setAvailableReservations] = useState<ReservationExterne[]>([])
  const [loading, setLoading] = useState(true)
  const [showLinkForm, setShowLinkForm] = useState(false)

  // New RDV form
  const [showNewRdv, setShowNewRdv] = useState(false)
  const [rdvDate, setRdvDate] = useState('')
  const [rdvHeureDebut, setRdvHeureDebut] = useState('09:00')
  const [rdvHeureFin, setRdvHeureFin] = useState('10:00')
  const [rdvCanal, setRdvCanal] = useState<'visio' | 'presentiel' | 'telephone' | 'autre'>('presentiel')
  const [rdvLieu, setRdvLieu] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [emailSent, setEmailSent] = useState(false)
  const [docsRdv, setDocsRdv] = useState(dossier.documents_prochain_rdv || '')
  const [docsSaved, setDocsSaved] = useState(false)
  const docsIsDirty = docsRdv !== (dossier.documents_prochain_rdv || '')

  const fetchLinked = async () => {
    try {
      const { data, error: fetchErr } = await supabase
        .from('dossier_reservations')
        .select('*, reservations_externes(*)')
        .eq('dossier_id', dossier.id)
        .order('linked_at', { ascending: false })
      if (fetchErr) throw fetchErr
      setLinkedReservations((data || []) as any)
    } catch (err: any) {
      console.error('fetchLinked error:', err)
      setError(err.message || 'Erreur lors du chargement des rendez-vous liés')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchLinked() }, [dossier.id])

  const handleShowLink = async () => {
    try {
      let query = supabase.from('reservations_externes').select('*').order('date', { ascending: false })
      if (dossier.usager_email) {
        query = query.eq('usager_email', dossier.usager_email)
      }
      const { data, error: queryErr } = await query
      if (queryErr) throw queryErr
      const linkedIds = new Set(linkedReservations.map(lr => lr.reservation_id))
      setAvailableReservations((data || []).filter(r => !linkedIds.has(r.id)))
      setShowLinkForm(true)
    } catch (err: any) {
      console.error('handleShowLink error:', err)
      setError(err.message || 'Erreur lors de la recherche des réservations')
    }
  }

  const handleLink = async (reservationId: string) => {
    try {
      const { error: linkErr } = await supabase.from('dossier_reservations').insert({
        dossier_id: dossier.id,
        reservation_id: reservationId,
      })
      if (linkErr) throw linkErr
      setShowLinkForm(false)
      await fetchLinked()
    } catch (err: any) {
      console.error('handleLink error:', err)
      setError(err.message || 'Erreur lors de la liaison')
    }
  }

  const handleCreateRdv = async () => {
    if (!rdvDate || !dossier.usager_nom) return
    setSaving(true)
    setEmailSent(false)
    try {
      const titre = `Suivi PPV — ${dossier.usager_nom}`
      const { data: reservation, error: insertErr } = await supabase.from('reservations_externes').insert({
        usager_nom: dossier.usager_nom,
        usager_email: dossier.usager_email,
        usager_telephone: dossier.usager_telephone,
        canal: rdvCanal,
        titre,
        date: rdvDate,
        heure_debut: rdvHeureDebut,
        heure_fin: rdvHeureFin,
        lieu: rdvLieu.trim() || null,
        statut: 'confirmee',
        google_calendar_event_id: `ppv-${dossier.id}-${Date.now()}`,
      }).select().single()
      if (insertErr) throw insertErr

      if (reservation) {
        const { error: linkErr } = await supabase.from('dossier_reservations').insert({
          dossier_id: dossier.id,
          reservation_id: reservation.id,
        })
        if (linkErr && linkErr.code !== '23505') throw linkErr

        // Send confirmation email via n8n (non-blocking)
        if (dossier.usager_email) {
          const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL
          try {
            const res = await fetch(`${webhookUrl}/collab-rdv-confirm`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                usager_email: dossier.usager_email,
                usager_nom: dossier.usager_nom,
                date: rdvDate,
                heure: rdvHeureDebut,
                lieu: rdvLieu.trim() || CANAL_LABELS[rdvCanal],
                canal: CANAL_LABELS[rdvCanal],
                referent_nom: collaborateurNom,
              }),
            })
            if (res.ok) setEmailSent(true)
          } catch (err) {
            console.warn('[Webhook] non-blocking error:', err)
          }
        }
      }

      setShowNewRdv(false)
      setRdvDate('')
      setRdvLieu('')
      await fetchLinked()
    } catch (err: any) {
      console.error('handleCreateRdv error:', err)
      setError(err.message || 'Erreur lors de la création du RDV')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary-600" /></div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 dark:text-white">10. Suivi & Rendez-vous</h3>
        <div className="flex gap-2">
          <button onClick={() => setShowNewRdv(!showNewRdv)} className="text-sm text-primary-600 hover:underline flex items-center gap-1">
            <CalendarPlus className="w-4 h-4" /> Programmer un RDV
          </button>
          <button onClick={handleShowLink} className="text-sm text-gray-500 hover:underline flex items-center gap-1">
            <Plus className="w-4 h-4" /> Lier existant
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm rounded-lg">{error}</div>
      )}

      {emailSent && (
        <div className="p-3 bg-green-50 dark:bg-green-900/10 text-green-700 dark:text-green-400 text-sm rounded-lg flex items-center gap-2">
          <Mail className="w-4 h-4" /> Email de confirmation envoyé à {dossier.usager_email}
        </div>
      )}

      {/* Documents prochain RDV */}
      <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="w-4 h-4 text-amber-600" />
          <h4 className="text-sm font-medium text-amber-800 dark:text-amber-300">Documents à apporter au prochain RDV</h4>
        </div>
        <p className="text-xs text-amber-600 dark:text-amber-400 mb-2">
          Ces informations sont visibles par l'usager sur la page de suivi public.
        </p>
        <textarea
          value={docsRdv}
          onChange={e => { setDocsRdv(e.target.value); setDocsSaved(false) }}
          rows={3}
          placeholder="Ex: Certificat médical récent, justificatif de domicile, dernier avis d'imposition..."
          className="w-full px-3 py-2 border border-amber-300 dark:border-amber-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
        />
        {(docsIsDirty || docsSaved) && onSave && (
          <button
            onClick={async () => {
              await onSave({ documents_prochain_rdv: docsRdv.trim() || null } as any)
              setDocsSaved(true)
              setTimeout(() => setDocsSaved(false), 2000)
            }}
            disabled={savingProp || !docsIsDirty}
            className={`mt-2 flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg text-white transition-colors ${docsSaved ? 'bg-green-500' : 'bg-primary-600 hover:bg-primary-700'} disabled:opacity-50`}
          >
            {docsSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {docsSaved ? 'Enregistré' : 'Enregistrer'}
          </button>
        )}
      </div>

      {/* New RDV form */}
      {showNewRdv && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-3">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Programmer le prochain rendez-vous</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Date *</label>
              <input type="date" value={rdvDate} onChange={e => setRdvDate(e.target.value)} className="input" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Canal</label>
              <select value={rdvCanal} onChange={e => setRdvCanal(e.target.value as any)} className="input">
                <option value="presentiel">Présentiel</option>
                <option value="visio">Visio</option>
                <option value="telephone">Téléphone</option>
                <option value="autre">Autre</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Heure début</label>
              <input type="time" value={rdvHeureDebut} onChange={e => setRdvHeureDebut(e.target.value)} className="input" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Heure fin</label>
              <input type="time" value={rdvHeureFin} onChange={e => setRdvHeureFin(e.target.value)} className="input" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Lieu</label>
              <input value={rdvLieu} onChange={e => setRdvLieu(e.target.value)} className="input" placeholder="Adresse ou lien visio" />
            </div>
          </div>
          {dossier.usager_email && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              <Mail className="w-3 h-3 inline mr-1" />
              Un email de confirmation sera envoyé à {dossier.usager_email}
            </p>
          )}
          <div className="flex gap-2">
            <button onClick={handleCreateRdv} disabled={saving || !rdvDate} className="btn-primary text-sm">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Créer le RDV'}
            </button>
            <button onClick={() => setShowNewRdv(false)} className="btn-secondary text-sm">Annuler</button>
          </div>
        </div>
      )}

      {/* Link existing */}
      {showLinkForm && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          {availableReservations.length === 0 ? (
            <p className="text-sm text-gray-500">Aucune réservation disponible à lier{dossier.usager_email ? ` pour ${dossier.usager_email}` : ''}.</p>
          ) : (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sélectionner une réservation :</p>
              {availableReservations.map(res => (
                <button
                  key={res.id}
                  onClick={() => handleLink(res.id)}
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

      {/* Linked reservations list */}
      {linkedReservations.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-sm">Aucun rendez-vous de suivi programmé.</p>
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
  )
}
