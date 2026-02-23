import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Clock, Plus, Loader2, Settings, Calendar as CalendarIcon,
  MapPin, Trash2, Edit2
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Permanence, PermanenceOccurrence, JOURS_SEMAINE } from '../types/database'
import { format, addDays, startOfWeek, endOfWeek, addWeeks } from 'date-fns'
import { fr } from 'date-fns/locale'

export default function PermanencesPage() {
  const { isAdmin } = useAuth()
  const [tab, setTab] = useState<'calendrier' | 'definitions'>('calendrier')
  const [loading, setLoading] = useState(true)
  const [permanences, setPermanences] = useState<Permanence[]>([])
  const [occurrences, setOccurrences] = useState<PermanenceOccurrence[]>([])

  // Definition form
  const [showDefForm, setShowDefForm] = useState(false)
  const [editingDef, setEditingDef] = useState<Permanence | null>(null)
  const [defNom, setDefNom] = useState('')
  const [defLieu, setDefLieu] = useState('')
  const [defJour, setDefJour] = useState(0)
  const [defDebut, setDefDebut] = useState('09:00')
  const [defFin, setDefFin] = useState('12:00')
  const [savingDef, setSavingDef] = useState(false)

  // Generation
  const [generating, setGenerating] = useState(false)
  const genWeeks = 4

  // Current week navigation
  const [weekOffset, setWeekOffset] = useState(0)

  const fetchAll = async () => {
    try {
      const weekStart = format(startOfWeek(addWeeks(new Date(), weekOffset), { weekStartsOn: 1 }), 'yyyy-MM-dd')
      const weekEnd = format(endOfWeek(addWeeks(new Date(), weekOffset), { weekStartsOn: 1 }), 'yyyy-MM-dd')

      const [defRes, occRes] = await Promise.all([
        supabase.from('permanences').select('*').order('jour_semaine'),
        supabase
          .from('permanence_occurrences')
          .select('*, permanences(nom, lieu), permanence_assignments(id, statut, collaborateur_id, collaborateurs(id, prenom, nom))')
          .gte('date', weekStart)
          .lte('date', weekEnd)
          .order('date', { ascending: true }),
      ])
      setPermanences(defRes.data || [])
      setOccurrences(occRes.data || [])
    } catch (err) {
      console.error('PermanencesPage fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [weekOffset])

  const resetDefForm = () => {
    setDefNom('')
    setDefLieu('')
    setDefJour(0)
    setDefDebut('09:00')
    setDefFin('12:00')
    setEditingDef(null)
    setShowDefForm(false)
  }

  const startEditDef = (p: Permanence) => {
    setDefNom(p.nom)
    setDefLieu(p.lieu)
    setDefJour(p.jour_semaine)
    setDefDebut(p.heure_debut.slice(0, 5))
    setDefFin(p.heure_fin.slice(0, 5))
    setEditingDef(p)
    setShowDefForm(true)
  }

  const handleSaveDef = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingDef(true)
    const data = { nom: defNom, lieu: defLieu, jour_semaine: defJour, heure_debut: defDebut, heure_fin: defFin }

    if (editingDef) {
      await supabase.from('permanences').update({ ...data, updated_at: new Date().toISOString() }).eq('id', editingDef.id)
    } else {
      await supabase.from('permanences').insert(data)
    }

    await fetchAll()
    resetDefForm()
    setSavingDef(false)
  }

  const deleteDef = async (id: string) => {
    if (!confirm('Supprimer cette définition de permanence ?')) return
    await supabase.from('permanences').delete().eq('id', id)
    await fetchAll()
  }

  const generateOccurrences = async () => {
    if (!permanences.length) return
    setGenerating(true)

    const today = new Date()
    const inserts: { permanence_id: string; date: string; heure_debut: string; heure_fin: string }[] = []

    for (const perm of permanences.filter(p => p.actif)) {
      const currentDay = (today.getDay() + 6) % 7 // Mon=0
      let daysUntil = perm.jour_semaine - currentDay
      if (daysUntil <= 0) daysUntil += 7

      for (let w = 0; w < genWeeks; w++) {
        const date = addDays(today, daysUntil + w * 7)
        inserts.push({
          permanence_id: perm.id,
          date: format(date, 'yyyy-MM-dd'),
          heure_debut: perm.heure_debut,
          heure_fin: perm.heure_fin,
        })
      }
    }

    // Upsert — avoid duplicates by checking existing
    const existingRes = await supabase
      .from('permanence_occurrences')
      .select('permanence_id, date')
      .in('permanence_id', inserts.map(i => i.permanence_id))
      .in('date', [...new Set(inserts.map(i => i.date))])

    const existingKeys = new Set(
      (existingRes.data || []).map(e => `${e.permanence_id}_${e.date}`)
    )

    const newInserts = inserts.filter(i => !existingKeys.has(`${i.permanence_id}_${i.date}`))

    if (newInserts.length > 0) {
      await supabase.from('permanence_occurrences').insert(newInserts)
    }

    await fetchAll()
    setGenerating(false)
  }

  const weekStart = startOfWeek(addWeeks(new Date(), weekOffset), { weekStartsOn: 1 })

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary-600" /></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Permanences</h1>
        {isAdmin && (
          <div className="flex gap-2">
            <button onClick={generateOccurrences} disabled={generating} className="btn-secondary btn-sm">
              {generating ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <CalendarIcon className="w-4 h-4 mr-1" />}
              Générer {genWeeks} sem.
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-fit">
        <button
          onClick={() => setTab('calendrier')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${tab === 'calendrier' ? 'bg-white dark:bg-gray-700 shadow-sm' : 'text-gray-500'}`}
        >
          <CalendarIcon className="w-4 h-4 inline mr-1" /> Calendrier
        </button>
        <button
          onClick={() => setTab('definitions')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${tab === 'definitions' ? 'bg-white dark:bg-gray-700 shadow-sm' : 'text-gray-500'}`}
        >
          <Settings className="w-4 h-4 inline mr-1" /> Définitions
        </button>
      </div>

      {/* Calendar tab */}
      {tab === 'calendrier' && (
        <div className="space-y-4">
          {/* Week navigation */}
          <div className="flex items-center justify-between">
            <button onClick={() => setWeekOffset(w => w - 1)} className="btn-secondary btn-sm">&larr; Sem. préc.</button>
            <span className="font-medium text-gray-700 dark:text-gray-300">
              Semaine du {format(weekStart, 'd MMMM yyyy', { locale: fr })}
            </span>
            <button onClick={() => setWeekOffset(w => w + 1)} className="btn-secondary btn-sm">Sem. suiv. &rarr;</button>
          </div>

          {/* Week grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 7 }, (_, i) => {
              const day = addDays(weekStart, i)
              const dayStr = format(day, 'yyyy-MM-dd')
              const dayOccurrences = occurrences.filter(o => o.date === dayStr)

              return (
                <div key={i} className="card">
                  <div className="card-header py-2 px-4">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {format(day, 'EEEE d MMM', { locale: fr })}
                    </p>
                  </div>
                  <div className="card-body py-2 px-4">
                    {dayOccurrences.length === 0 ? (
                      <p className="text-xs text-gray-400">Aucune permanence</p>
                    ) : (
                      <div className="space-y-2">
                        {dayOccurrences.map(occ => (
                          <Link
                            key={occ.id}
                            to={`/permanences/${occ.id}`}
                            className={`block p-2 rounded-lg border transition-colors hover:shadow-sm ${
                              occ.annulee
                                ? 'border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-800 opacity-60'
                                : 'border-gray-200 dark:border-gray-600 hover:border-primary-300'
                            }`}
                          >
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {occ.permanences?.nom}
                            </p>
                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3" />
                              {occ.heure_debut.slice(0, 5)} - {occ.heure_fin.slice(0, 5)}
                            </p>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {occ.permanences?.lieu}
                            </p>
                            {/* Assigned people */}
                            {occ.permanence_assignments && occ.permanence_assignments.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1.5">
                                {occ.permanence_assignments.map(a => (
                                  <span
                                    key={a.id}
                                    className={`text-xs px-1.5 py-0.5 rounded ${
                                      a.statut === 'confirme' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                      a.statut === 'refuse' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                      'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                    }`}
                                  >
                                    {a.collaborateurs?.prenom}
                                  </span>
                                ))}
                              </div>
                            )}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Definitions tab */}
      {tab === 'definitions' && (
        <div className="space-y-4">
          {isAdmin && (
            <button onClick={() => { resetDefForm(); setShowDefForm(true) }} className="btn-primary">
              <Plus className="w-4 h-4 mr-2" /> Nouvelle permanence
            </button>
          )}

          {showDefForm && (
            <div className="card">
              <div className="card-header">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {editingDef ? 'Modifier la permanence' : 'Nouvelle permanence'}
                </h3>
              </div>
              <div className="card-body">
                <form onSubmit={handleSaveDef} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom</label>
                      <input type="text" value={defNom} onChange={e => setDefNom(e.target.value)} className="input" required placeholder="EHPAD" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Lieu</label>
                      <input type="text" value={defLieu} onChange={e => setDefLieu(e.target.value)} className="input" required placeholder="Adresse ou nom du lieu" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Jour</label>
                      <select value={defJour} onChange={e => setDefJour(Number(e.target.value))} className="input">
                        {JOURS_SEMAINE.map((j, i) => <option key={i} value={i}>{j}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Début</label>
                      <input type="time" value={defDebut} onChange={e => setDefDebut(e.target.value)} className="input" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fin</label>
                      <input type="time" value={defFin} onChange={e => setDefFin(e.target.value)} className="input" required />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <button type="button" onClick={resetDefForm} className="btn-secondary">Annuler</button>
                    <button type="submit" disabled={savingDef} className="btn-primary">
                      {savingDef && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                      {editingDef ? 'Enregistrer' : 'Créer'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            {permanences.map(p => (
              <div key={p.id} className={`card ${!p.actif ? 'opacity-50' : ''}`}>
                <div className="card-body flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{p.nom}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                      <MapPin className="w-4 h-4" /> {p.lieu}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Clock className="w-4 h-4" /> {JOURS_SEMAINE[p.jour_semaine]} {p.heure_debut.slice(0, 5)} - {p.heure_fin.slice(0, 5)}
                    </p>
                  </div>
                  {isAdmin && (
                    <div className="flex gap-1">
                      <button onClick={() => startEditDef(p)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                        <Edit2 className="w-4 h-4 text-gray-500" />
                      </button>
                      <button onClick={() => deleteDef(p.id)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
