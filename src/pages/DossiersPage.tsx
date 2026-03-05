import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FolderOpen, Plus, Loader2, User, FileText, Phone, Mail, ClipboardCheck, Search } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { DossierSuivi, STATUT_DOSSIER_LABELS } from '../types/database'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

const STATUT_COLORS: Record<DossierSuivi['statut'], string> = {
  ouvert: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  en_cours: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  clos: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
}

export default function DossiersPage() {
  const { collaborateur } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [dossiers, setDossiers] = useState<(DossierSuivi & { seances_count: number })[]>([])
  const [statutFilter, setStatutFilter] = useState<DossierSuivi['statut'] | 'tous'>('tous')
  const [mesDossiers, setMesDossiers] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)

  // Form fields
  const [formPrenom, setFormPrenom] = useState('')
  const [formNom, setFormNom] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formTelephone, setFormTelephone] = useState('')
  const [formMotif, setFormMotif] = useState('')

  const fetchDossiers = async () => {
    if (!collaborateur) return

    try {
      let query = supabase
        .from('dossiers_suivi')
        .select('*, collaborateurs!cree_par(prenom, nom), responsable:collaborateurs!responsable_id(prenom, nom), seances(id)')
        .order('updated_at', { ascending: false })

      if (statutFilter !== 'tous') query = query.eq('statut', statutFilter)
      if (mesDossiers) query = query.eq('responsable_id', collaborateur.id)

      const { data, error: err } = await query
      if (err) throw err
      const mapped = (data || []).map((d: any) => ({
        ...d,
        seances_count: d.seances?.length || 0,
      }))
      setDossiers(mapped)
    } catch (err: any) {
      console.error('DossiersPage fetchDossiers error:', err)
      setError(err.message || 'Erreur lors du chargement des dossiers')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchDossiers() }, [statutFilter, mesDossiers, collaborateur])

  const handleCreate = async () => {
    if (!collaborateur || !formNom.trim()) return
    setSaving(true)

    try {
      const { error: insertErr } = await supabase.from('dossiers_suivi').insert({
        usager_prenom: formPrenom.trim() || null,
        usager_nom: formNom.trim(),
        usager_email: formEmail.trim() || null,
        usager_telephone: formTelephone.trim() || null,
        motif: formMotif.trim() || null,
        cree_par: collaborateur.id,
        responsable_id: collaborateur.id,
      })
      if (insertErr) throw insertErr

      setFormPrenom('')
      setFormNom('')
      setFormEmail('')
      setFormTelephone('')
      setFormMotif('')
      setShowForm(false)
      await fetchDossiers()
    } catch (err: any) {
      console.error('handleCreate error:', err)
      setError(err.message || 'Erreur lors de la création du dossier')
    } finally {
      setSaving(false)
    }
  }

  const filteredDossiers = dossiers.filter(d => {
    if (!searchText.trim()) return true
    const q = searchText.toLowerCase()
    const fullName = `${d.usager_prenom || ''} ${d.usager_nom || ''}`.toLowerCase()
    return fullName.includes(q)
  })

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary-600" /></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dossiers de suivi</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm">
          <Plus className="w-4 h-4 mr-2" /> Nouveau dossier
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm rounded-lg">{error}</div>
      )}

      {/* Create form */}
      {showForm && (
        <div className="card">
          <div className="card-body space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Nouveau dossier de suivi</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prénom</label>
                <input value={formPrenom} onChange={e => setFormPrenom(e.target.value)} className="input" placeholder="Prénom" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom *</label>
                <input value={formNom} onChange={e => setFormNom(e.target.value)} className="input" placeholder="Nom de famille" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input value={formEmail} onChange={e => setFormEmail(e.target.value)} className="input" type="email" placeholder="email@exemple.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Telephone</label>
                <input value={formTelephone} onChange={e => setFormTelephone(e.target.value)} className="input" placeholder="06 12 34 56 78" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Motif</label>
                <input value={formMotif} onChange={e => setFormMotif(e.target.value)} className="input" placeholder="Motif de la demande" />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleCreate} disabled={saving || !formNom.trim()} className="btn-primary text-sm">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Créer le dossier'}
              </button>
              <button onClick={() => setShowForm(false)} className="btn-secondary text-sm">Annuler</button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="flex gap-2">
          {(['tous', 'ouvert', 'en_cours', 'clos'] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatutFilter(s)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                statutFilter === s ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200'
              }`}
            >
              {s === 'tous' ? 'Tous' : STATUT_DOSSIER_LABELS[s]}
            </button>
          ))}
        </div>
        <div className="w-px bg-gray-200 dark:bg-gray-700 mx-1" />
        <button
          onClick={() => setMesDossiers(!mesDossiers)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            mesDossiers ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200'
          }`}
        >
          Mes dossiers
        </button>
        <div className="w-px bg-gray-200 dark:bg-gray-700 mx-1" />
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            placeholder="Rechercher..."
            className="pl-9 pr-3 py-1.5 rounded-full text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent w-48"
          />
        </div>
      </div>

      {/* List */}
      {filteredDossiers.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Aucun dossier {statutFilter !== 'tous' ? STATUT_DOSSIER_LABELS[statutFilter].toLowerCase() : ''}.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredDossiers.map(dossier => (
            <Link key={dossier.id} to={`/dossiers/${dossier.id}`} className="card hover:shadow-md transition-shadow block">
              <div className="card-body">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg shrink-0">
                      <FolderOpen className="w-6 h-6 text-primary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {dossier.usager_prenom && `${dossier.usager_prenom} `}{dossier.usager_nom}
                        </h3>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUT_COLORS[dossier.statut]}`}>
                          {STATUT_DOSSIER_LABELS[dossier.statut]}
                        </span>
                        {(() => {
                          const p = dossier.piliers
                          const hasObj = Boolean(dossier.objectifs && dossier.objectifs.filter(Boolean).length > 0)
                          const hasPiliers = p && typeof p === 'object' && ['communication', 'administratif', 'social', 'bien_etre'].some(k => (p as any)[k]?.niveau !== null)
                          const hasEval = dossier.eval_douleur !== null || dossier.eval_energie !== null
                          const ppvStarted = hasObj || hasPiliers || hasEval
                          const ppvComplete = hasObj && hasPiliers && hasEval && dossier.consent_conservation
                          if (ppvComplete) return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"><ClipboardCheck className="w-3 h-3" />PPV</span>
                          if (ppvStarted) return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"><ClipboardCheck className="w-3 h-3" />PPV</span>
                          return null
                        })()}
                      </div>
                      {dossier.motif && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-0.5">{dossier.motif}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-2 flex-wrap">
                        {dossier.usager_email && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5" /> {dossier.usager_email}
                          </span>
                        )}
                        {dossier.usager_telephone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5" /> {dossier.usager_telephone}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5" /> {dossier.seances_count} séance{dossier.seances_count !== 1 ? 's' : ''}
                        </span>
                        {dossier.responsable && (
                          <span className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5" /> {(dossier.responsable as any).prenom} {(dossier.responsable as any).nom}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        Créé le {format(new Date(dossier.created_at), 'd MMM yyyy', { locale: fr })}
                        {dossier.updated_at !== dossier.created_at && ` · Mis à jour ${format(new Date(dossier.updated_at), 'd MMM yyyy', { locale: fr })}`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
