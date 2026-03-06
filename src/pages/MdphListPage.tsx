import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { FileCheck, Plus, Loader2, Search, FolderOpen } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import type { MdphFormulaire, MdphStatut } from '../types/mdph'
import { MDPH_STATUT_LABELS, MDPH_STATUT_COLORS } from '../types/mdph'
import { prefillFromDossier } from '../lib/mdph-prefill'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export default function MdphListPage() {
  const { collaborateur } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const fromDossier = searchParams.get('from_dossier')
  const [loading, setLoading] = useState(true)
  const [formulaires, setFormulaires] = useState<MdphFormulaire[]>([])
  const [statutFilter, setStatutFilter] = useState<MdphStatut | 'tous'>('tous')
  const [mesFormulaires, setMesFormulaires] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [saving, setSaving] = useState(false)
  const [dossiers, setDossiers] = useState<{ id: string; usager_nom: string; usager_prenom?: string }[]>([])
  const [selectedDossierId, setSelectedDossierId] = useState<string>('')
  const [formNom, setFormNom] = useState('')
  const [formPrenom, setFormPrenom] = useState('')
  const [error, setError] = useState('')

  const fetchFormulaires = async () => {
    if (!collaborateur) return
    try {
      let query = supabase
        .from('mdph_formulaires')
        .select('*')
        .order('updated_at', { ascending: false })

      if (statutFilter !== 'tous') query = query.eq('statut', statutFilter)
      if (mesFormulaires) query = query.eq('cree_par', collaborateur.id)

      const { data, error: err } = await query
      if (err) throw err
      setFormulaires(data || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchDossiers = async () => {
    const { data } = await supabase
      .from('dossiers_suivi')
      .select('id, usager_nom, usager_prenom')
      .order('usager_nom')
    setDossiers(data || [])
  }

  useEffect(() => { fetchFormulaires() }, [statutFilter, mesFormulaires, collaborateur])

  // Auto-open create form when coming from a dossier
  useEffect(() => {
    if (fromDossier) {
      setShowCreate(true)
      fetchDossiers().then(() => {
        setSelectedDossierId(fromDossier)
      })
      // Clear the query param
      setSearchParams({}, { replace: true })
    }
  }, [fromDossier])

  const handleCreate = async () => {
    if (!collaborateur || (!formNom.trim() && !selectedDossierId)) return
    setSaving(true)

    try {
      let insertData: Record<string, unknown> = {
        cree_par: collaborateur.id,
        responsable_id: collaborateur.id,
      }

      if (selectedDossierId) {
        const dossier = dossiers.find(d => d.id === selectedDossierId)
        if (dossier) {
          // Fetch full dossier for prefill
          const { data: fullDossier } = await supabase
            .from('dossiers_suivi')
            .select('*')
            .eq('id', selectedDossierId)
            .single()
          if (fullDossier) {
            const prefilled = prefillFromDossier(fullDossier)
            insertData = { ...insertData, ...prefilled }
          }
        }
      } else {
        insertData.usager_nom = formNom.trim()
        insertData.usager_prenom = formPrenom.trim() || null
      }

      const { data, error: err } = await supabase
        .from('mdph_formulaires')
        .insert(insertData)
        .select()
        .single()
      if (err) throw err
      navigate(`/mdph/${data.id}`)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const filtered = formulaires.filter(f => {
    if (!searchText) return true
    const search = searchText.toLowerCase()
    return f.usager_nom.toLowerCase().includes(search) ||
      (f.usager_prenom || '').toLowerCase().includes(search)
  })

  const statuts: (MdphStatut | 'tous')[] = ['tous', 'brouillon', 'en_cours', 'a_relire', 'pret', 'envoye']

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FileCheck className="w-7 h-7 text-primary-600" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Formulaires MDPH</h1>
        </div>
        <button
          onClick={() => { setShowCreate(!showCreate); if (!showCreate) fetchDossiers() }}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nouveau formulaire
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="font-medium text-gray-900 dark:text-white mb-3">Nouveau formulaire MDPH</h3>

          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Lier a un dossier existant (pre-remplissage automatique)
            </label>
            <select
              value={selectedDossierId}
              onChange={e => {
                setSelectedDossierId(e.target.value)
                if (e.target.value) { setFormNom(''); setFormPrenom('') }
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">-- Aucun dossier (saisie manuelle) --</option>
              {dossiers.map(d => (
                <option key={d.id} value={d.id}>
                  {d.usager_nom} {d.usager_prenom || ''}
                </option>
              ))}
            </select>
          </div>

          {!selectedDossierId && (
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom *</label>
                <input
                  type="text"
                  value={formNom}
                  onChange={e => setFormNom(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Nom de l'usager"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prenom</label>
                <input
                  type="text"
                  value={formPrenom}
                  onChange={e => setFormPrenom(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Prenom"
                />
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              disabled={saving || (!selectedDossierId && !formNom.trim())}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              Creer
            </button>
            <button
              onClick={() => setShowCreate(false)}
              className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {statuts.map(s => (
            <button
              key={s}
              onClick={() => setStatutFilter(s)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                statutFilter === s
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
              }`}
            >
              {s === 'tous' ? 'Tous' : MDPH_STATUT_LABELS[s]}
            </button>
          ))}
        </div>

        <button
          onClick={() => setMesFormulaires(!mesFormulaires)}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
            mesFormulaires
              ? 'border-primary-300 bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400 dark:border-primary-700'
              : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400'
          }`}
        >
          Mes formulaires
        </button>

        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            placeholder="Rechercher par nom..."
            className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <FileCheck className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Aucun formulaire MDPH</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(f => (
            <Link
              key={f.id}
              to={`/mdph/${f.id}`}
              className="block p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileCheck className="w-5 h-5 text-primary-500" />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {f.usager_nom} {f.usager_prenom || ''}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Cerfa 15692*01
                      {f.dossier_id && (
                        <span className="ml-2 inline-flex items-center gap-1">
                          <FolderOpen className="w-3 h-3" /> Dossier lie
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${MDPH_STATUT_COLORS[f.statut]}`}>
                    {MDPH_STATUT_LABELS[f.statut]}
                  </span>
                  <span className="text-xs text-gray-400">
                    {format(new Date(f.updated_at), 'dd MMM yyyy', { locale: fr })}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
