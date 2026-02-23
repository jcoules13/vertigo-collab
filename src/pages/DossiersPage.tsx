import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FolderOpen, Plus, Loader2, User, FileText, Phone, Mail } from 'lucide-react'
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
  const [dossiers, setDossiers] = useState<(DossierSuivi & { seances_count: number })[]>([])
  const [statutFilter, setStatutFilter] = useState<DossierSuivi['statut'] | 'tous'>('tous')
  const [mesDossiers, setMesDossiers] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)

  // Form fields
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

      const { data } = await query
      const mapped = (data || []).map((d: any) => ({
        ...d,
        seances_count: d.seances?.length || 0,
      }))
      setDossiers(mapped)
    } catch (err) {
      console.error('DossiersPage fetchDossiers error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchDossiers() }, [statutFilter, mesDossiers, collaborateur])

  const handleCreate = async () => {
    if (!collaborateur || !formNom.trim()) return
    setSaving(true)

    await supabase.from('dossiers_suivi').insert({
      usager_nom: formNom.trim(),
      usager_email: formEmail.trim() || null,
      usager_telephone: formTelephone.trim() || null,
      motif: formMotif.trim() || null,
      cree_par: collaborateur.id,
      responsable_id: collaborateur.id,
    })

    setFormNom('')
    setFormEmail('')
    setFormTelephone('')
    setFormMotif('')
    setShowForm(false)
    setSaving(false)
    await fetchDossiers()
  }

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

      {/* Create form */}
      {showForm && (
        <div className="card">
          <div className="card-body space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Nouveau dossier de suivi</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom de l'usager *</label>
                <input value={formNom} onChange={e => setFormNom(e.target.value)} className="input" placeholder="Nom complet" />
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
      </div>

      {/* List */}
      {dossiers.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Aucun dossier {statutFilter !== 'tous' ? STATUT_DOSSIER_LABELS[statutFilter].toLowerCase() : ''}.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {dossiers.map(dossier => (
            <Link key={dossier.id} to={`/dossiers/${dossier.id}`} className="card hover:shadow-md transition-shadow block">
              <div className="card-body">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg shrink-0">
                      <FolderOpen className="w-6 h-6 text-primary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{dossier.usager_nom}</h3>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUT_COLORS[dossier.statut]}`}>
                          {STATUT_DOSSIER_LABELS[dossier.statut]}
                        </span>
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
