import { useState } from 'react'
import { Loader2, Download, BarChart3, Search } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { DossierSuivi, STATUT_DOSSIER_LABELS } from '../types/database'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

type FieldGroup = {
  key: string
  label: string
  columns: { key: string; label: string; render: (d: DossierSuivi) => string }[]
}

const FIELD_GROUPS: FieldGroup[] = [
  {
    key: 'identite',
    label: 'Identité',
    columns: [
      { key: 'usager_nom', label: 'Nom', render: d => d.usager_nom || '' },
      { key: 'usager_prenom', label: 'Prénom', render: d => d.usager_prenom || '' },
      { key: 'code_postal', label: 'Code postal', render: d => d.code_postal || '' },
      { key: 'departement', label: 'Département', render: d => {
        const cp = d.code_postal
        if (!cp || cp.length < 2) return ''
        return cp.startsWith('97') && cp.length >= 3 ? cp.slice(0, 3) : cp.slice(0, 2)
      }},
    ],
  },
  {
    key: 'statut',
    label: 'Statut / Motif',
    columns: [
      { key: 'statut', label: 'Statut', render: d => STATUT_DOSSIER_LABELS[d.statut] || d.statut },
      { key: 'motif', label: 'Motif', render: d => d.motif || '' },
      { key: 'created_at', label: 'Date création', render: d => d.created_at ? format(new Date(d.created_at), 'dd/MM/yyyy', { locale: fr }) : '' },
    ],
  },
  {
    key: 'droits',
    label: 'Droits',
    columns: [
      { key: 'droits_medecin_traitant', label: 'Médecin traitant', render: d => d.droits_medecin_traitant ? 'Oui' : 'Non' },
      { key: 'droits_ald', label: 'ALD', render: d => d.droits_ald ? 'Oui' : 'Non' },
      { key: 'droits_rqth', label: 'RQTH', render: d => d.droits_rqth ? 'Oui' : 'Non' },
      { key: 'droits_mdph_en_cours', label: 'MDPH en cours', render: d => d.droits_mdph_en_cours ? 'Oui' : 'Non' },
      { key: 'droits_aah', label: 'AAH', render: d => d.droits_aah ? 'Oui' : 'Non' },
      { key: 'droits_complementaire_sante', label: 'Complémentaire', render: d => d.droits_complementaire_sante ? 'Oui' : 'Non' },
      { key: 'droits_medecine_travail', label: 'Méd. travail', render: d => d.droits_medecine_travail ? 'Oui' : 'Non' },
      { key: 'droits_accident_travail', label: 'AT', render: d => d.droits_accident_travail ? 'Oui' : 'Non' },
      { key: 'droits_invalidite', label: 'Invalidité', render: d => d.droits_invalidite ? 'Oui' : 'Non' },
    ],
  },
  {
    key: 'situations',
    label: 'Situations',
    columns: [
      { key: 'situation_personnelle', label: 'Personnelle', render: d => (d.situation_personnelle || []).join(', ') },
      { key: 'situation_familiale', label: 'Familiale', render: d => (d.situation_familiale || []).join(', ') },
      { key: 'situation_financiere', label: 'Financière', render: d => (d.situation_financiere || []).join(', ') },
      { key: 'situation_professionnelle', label: 'Professionnelle', render: d => (d.situation_professionnelle || []).join(', ') },
      { key: 'situation_medicale', label: 'Médicale', render: d => (d.situation_medicale || []).join(', ') },
      { key: 'situation_sante_parcours', label: 'Santé/Parcours', render: d => (d.situation_sante_parcours || []).join(', ') },
    ],
  },
  {
    key: 'objectifs',
    label: 'Objectifs',
    columns: [
      { key: 'objectifs_count', label: 'Nb objectifs', render: d => String((d.objectifs || []).filter(Boolean).length) },
    ],
  },
  {
    key: 'piliers',
    label: 'Piliers',
    columns: [
      { key: 'pilier_communication', label: 'Communication', render: d => formatPilier(d.piliers?.communication) },
      { key: 'pilier_administratif', label: 'Administratif', render: d => formatPilier(d.piliers?.administratif) },
      { key: 'pilier_social', label: 'Social', render: d => formatPilier(d.piliers?.social) },
      { key: 'pilier_bien_etre', label: 'Bien-être', render: d => formatPilier(d.piliers?.bien_etre) },
    ],
  },
  {
    key: 'evaluations',
    label: 'Évaluations',
    columns: [
      { key: 'eval_douleur', label: 'Douleur', render: d => d.eval_douleur !== null ? `${d.eval_douleur}/10` : '' },
      { key: 'eval_energie', label: 'Énergie', render: d => d.eval_energie !== null ? `${d.eval_energie}/10` : '' },
      { key: 'eval_stress', label: 'Stress', render: d => d.eval_stress !== null ? `${d.eval_stress}/10` : '' },
      { key: 'eval_soutien', label: 'Soutien', render: d => d.eval_soutien !== null ? `${d.eval_soutien}/10` : '' },
    ],
  },
  {
    key: 'seances',
    label: 'Séances',
    columns: [
      { key: 'seances_count', label: 'Nb séances', render: d => String((d.seances || []).length) },
    ],
  },
]

function formatPilier(p: any): string {
  if (!p) return ''
  const parts: string[] = []
  if (p.niveau) parts.push(`N${p.niveau}`)
  if (p.besoin?.trim()) parts.push('besoin')
  if (p.actions?.trim()) parts.push('actions')
  return parts.join(', ') || ''
}

export default function StatistiquesPage() {
  const { collaborateur } = useAuth()
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')
  const [selectedGroups, setSelectedGroups] = useState<string[]>(['identite', 'statut'])
  const [dossiers, setDossiers] = useState<DossierSuivi[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searched, setSearched] = useState(false)

  const toggleGroup = (key: string) => {
    setSelectedGroups(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    )
  }

  const activeColumns = FIELD_GROUPS
    .filter(g => selectedGroups.includes(g.key))
    .flatMap(g => g.columns)

  const handleSearch = async () => {
    setLoading(true)
    setError('')
    try {
      let query = supabase
        .from('dossiers_suivi')
        .select('*, seances(id)')
        .order('created_at', { ascending: false })

      if (dateDebut) query = query.gte('created_at', new Date(dateDebut).toISOString())
      if (dateFin) {
        const fin = new Date(dateFin)
        fin.setHours(23, 59, 59, 999)
        query = query.lte('created_at', fin.toISOString())
      }

      const { data, error: err } = await query
      if (err) throw err
      setDossiers(data || [])
      setSearched(true)
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la recherche')
    } finally {
      setLoading(false)
    }
  }

  const exportPDF = () => {
    const doc = new jsPDF({ orientation: activeColumns.length > 6 ? 'landscape' : 'portrait' })

    doc.setFontSize(14)
    doc.text('Statistiques — Vertigo Com Handicap', 14, 15)
    doc.setFontSize(9)
    doc.setTextColor(100)

    const subtitle = [
      dateDebut ? `Du ${format(new Date(dateDebut), 'dd/MM/yyyy')}` : '',
      dateFin ? `au ${format(new Date(dateFin), 'dd/MM/yyyy')}` : '',
    ].filter(Boolean).join(' ') || 'Toutes dates'
    doc.text(`${subtitle} — ${dossiers.length} dossier(s) — Généré le ${format(new Date(), 'dd/MM/yyyy à HH:mm', { locale: fr })}`, 14, 22)
    doc.text(`Généré par ${collaborateur?.prenom} ${collaborateur?.nom}`, 14, 27)

    const headers = activeColumns.map(c => c.label)
    const rows = dossiers.map(d => activeColumns.map(c => c.render(d)))

    autoTable(doc, {
      startY: 32,
      head: [headers],
      body: rows,
      styles: { fontSize: 7, cellPadding: 2 },
      headStyles: { fillColor: [20, 184, 166], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    })

    const filename = `statistiques_${dateDebut || 'all'}_${dateFin || 'all'}.pdf`
    doc.save(filename)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-primary-600" />
          Statistiques avancées
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Générez des tableaux personnalisés exportables en PDF pour vos rapports d'activité.
        </p>
      </div>

      {/* Filtres */}
      <div className="card">
        <div className="card-body space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date de début</label>
              <input type="date" value={dateDebut} onChange={e => setDateDebut(e.target.value)} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date de fin</label>
              <input type="date" value={dateFin} onChange={e => setDateFin(e.target.value)} className="input" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Champs à inclure</label>
            <div className="flex flex-wrap gap-2">
              {FIELD_GROUPS.map(g => (
                <button
                  key={g.key}
                  onClick={() => toggleGroup(g.key)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    selectedGroups.includes(g.key)
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSearch}
              disabled={loading || selectedGroups.length === 0}
              className="btn-primary"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Search className="w-4 h-4 mr-2" />}
              Générer
            </button>
            {searched && dossiers.length > 0 && (
              <button onClick={exportPDF} className="btn-secondary">
                <Download className="w-4 h-4 mr-2" /> Exporter PDF
              </button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm rounded-lg">{error}</div>
      )}

      {/* Résultats */}
      {searched && (
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 dark:text-white">
              {dossiers.length} dossier{dossiers.length !== 1 ? 's' : ''} trouvé{dossiers.length !== 1 ? 's' : ''}
            </h2>
          </div>
          <div className="overflow-x-auto">
            {dossiers.length === 0 ? (
              <div className="card-body">
                <p className="text-gray-500 dark:text-gray-400 text-sm">Aucun dossier ne correspond aux critères.</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">#</th>
                    {activeColumns.map(col => (
                      <th key={col.key} className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase whitespace-nowrap">
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dossiers.map((d, idx) => (
                    <tr key={d.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-3 py-2 text-gray-400">{idx + 1}</td>
                      {activeColumns.map(col => (
                        <td key={col.key} className="px-3 py-2 text-gray-700 dark:text-gray-300 whitespace-nowrap max-w-[200px] truncate">
                          {col.render(d)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
