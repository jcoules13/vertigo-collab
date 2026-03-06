import { useEffect, useState } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { ArrowLeft, Loader2, FileCheck } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { MdphFormulaire, MdphStatut } from '../types/mdph'
import {
  MDPH_TABS,
  MDPH_STATUT_LABELS,
  MDPH_STATUT_COLORS,
  mergeWithDefaults,
  DEFAULT_PAGE_GARDE,
  DEFAULT_A1_IDENTITE,
  DEFAULT_A2_AUTORITE_PARENTALE,
  DEFAULT_A3_AIDE_DEMARCHES,
  DEFAULT_A4_MESURE_PROTECTION,
  DEFAULT_A5_URGENCE,
  DEFAULT_A_DOCUMENTS,
  DEFAULT_A_SIGNATURE,
  DEFAULT_B1_VIE_QUOTIDIENNE,
  DEFAULT_B2_BESOINS_QUOTIDIENS,
  DEFAULT_B3_BESOINS_DEPLACEMENT_SOCIAL,
  DEFAULT_C1_SITUATION_SCOLAIRE,
  DEFAULT_C2_BESOINS_SCOLAIRES,
  DEFAULT_C3_ATTENTES_SCOLAIRES,
  DEFAULT_D1_SITUATION_PRO,
  DEFAULT_D2_PARCOURS_PRO,
  DEFAULT_D3_PROJET_PRO,
  DEFAULT_E_DEMANDES,
  DEFAULT_F1_SITUATION_AIDANT,
  DEFAULT_F2_ATTENTES_AIDANT,
} from '../types/mdph'
import MdphTabDemande from '../components/mdph/MdphTabDemande'
import MdphTabIdentite from '../components/mdph/MdphTabIdentite'
import MdphTabAccompagnement from '../components/mdph/MdphTabAccompagnement'
import MdphTabVieQuotidienne from '../components/mdph/MdphTabVieQuotidienne'
import MdphTabVieScolaire from '../components/mdph/MdphTabVieScolaire'
import MdphTabSituationPro from '../components/mdph/MdphTabSituationPro'
import MdphTabDemandesDroits from '../components/mdph/MdphTabDemandesDroits'
import MdphTabAidant from '../components/mdph/MdphTabAidant'
import MdphTabRecap from '../components/mdph/MdphTabRecap'

function hydrateFormulaire(raw: any): MdphFormulaire {
  return {
    ...raw,
    section_page_garde: mergeWithDefaults(raw.section_page_garde, DEFAULT_PAGE_GARDE),
    section_a1_identite: mergeWithDefaults(raw.section_a1_identite, DEFAULT_A1_IDENTITE),
    section_a2_autorite_parentale: mergeWithDefaults(raw.section_a2_autorite_parentale, DEFAULT_A2_AUTORITE_PARENTALE),
    section_a3_aide_demarches: mergeWithDefaults(raw.section_a3_aide_demarches, DEFAULT_A3_AIDE_DEMARCHES),
    section_a4_mesure_protection: mergeWithDefaults(raw.section_a4_mesure_protection, DEFAULT_A4_MESURE_PROTECTION),
    section_a5_urgence: mergeWithDefaults(raw.section_a5_urgence, DEFAULT_A5_URGENCE),
    section_a_documents: mergeWithDefaults(raw.section_a_documents, DEFAULT_A_DOCUMENTS),
    section_a_signature: mergeWithDefaults(raw.section_a_signature, DEFAULT_A_SIGNATURE),
    section_b1_vie_quotidienne: mergeWithDefaults(raw.section_b1_vie_quotidienne, DEFAULT_B1_VIE_QUOTIDIENNE),
    section_b2_besoins_quotidiens: mergeWithDefaults(raw.section_b2_besoins_quotidiens, DEFAULT_B2_BESOINS_QUOTIDIENS),
    section_b3_besoins_deplacement_social: mergeWithDefaults(raw.section_b3_besoins_deplacement_social, DEFAULT_B3_BESOINS_DEPLACEMENT_SOCIAL),
    section_b_texte_libre: raw.section_b_texte_libre || '',
    section_c1_situation_scolaire: mergeWithDefaults(raw.section_c1_situation_scolaire, DEFAULT_C1_SITUATION_SCOLAIRE),
    section_c2_besoins_scolaires: mergeWithDefaults(raw.section_c2_besoins_scolaires, DEFAULT_C2_BESOINS_SCOLAIRES),
    section_c3_attentes_scolaires: mergeWithDefaults(raw.section_c3_attentes_scolaires, DEFAULT_C3_ATTENTES_SCOLAIRES),
    section_d1_situation_pro: mergeWithDefaults(raw.section_d1_situation_pro, DEFAULT_D1_SITUATION_PRO),
    section_d2_parcours_pro: mergeWithDefaults(raw.section_d2_parcours_pro, DEFAULT_D2_PARCOURS_PRO),
    section_d3_projet_pro: mergeWithDefaults(raw.section_d3_projet_pro, DEFAULT_D3_PROJET_PRO),
    section_e_demandes: mergeWithDefaults(raw.section_e_demandes, DEFAULT_E_DEMANDES),
    section_f1_situation_aidant: mergeWithDefaults(raw.section_f1_situation_aidant, DEFAULT_F1_SITUATION_AIDANT),
    section_f2_attentes_aidant: mergeWithDefaults(raw.section_f2_attentes_aidant, DEFAULT_F2_ATTENTES_AIDANT),
    ai_suggestions: raw.ai_suggestions || {},
  }
}

export default function MdphFormPage() {
  const { id } = useParams<{ id: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formulaire, setFormulaire] = useState<MdphFormulaire | null>(null)
  const [error, setError] = useState('')

  const activeTab = searchParams.get('tab') || 'demande'

  const fetchFormulaire = async () => {
    try {
      const { data, error: err } = await supabase
        .from('mdph_formulaires')
        .select('*')
        .eq('id', id)
        .single()
      if (err) throw err
      setFormulaire(hydrateFormulaire(data))
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchFormulaire() }, [id])

  const handleSave = async (updates: Partial<MdphFormulaire>) => {
    if (!formulaire) return
    setSaving(true)
    try {
      const { error: err } = await supabase
        .from('mdph_formulaires')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', formulaire.id)
      if (err) throw err
      setFormulaire(prev => prev ? { ...prev, ...updates } : prev)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleStatutChange = async (statut: MdphStatut) => {
    await handleSave({ statut })
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  if (!formulaire) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error || 'Formulaire introuvable'}</p>
        <Link to="/mdph" className="text-primary-600 hover:underline mt-2 inline-block">Retour</Link>
      </div>
    )
  }

  const tabProps = { formulaire, onSave: handleSave, saving }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link to="/mdph" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <FileCheck className="w-6 h-6 text-primary-600" />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {formulaire.usager_nom} {formulaire.usager_prenom || ''}
            </h1>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${MDPH_STATUT_COLORS[formulaire.statut]}`}>
              {MDPH_STATUT_LABELS[formulaire.statut]}
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Cerfa 15692*01 — Demande a la MDPH
          </p>
        </div>
        <select
          value={formulaire.statut}
          onChange={e => handleStatutChange(e.target.value as MdphStatut)}
          className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          {Object.entries(MDPH_STATUT_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {/* Tab bar */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        <div className="flex gap-0 min-w-max">
          {MDPH_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setSearchParams({ tab: tab.id })}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              <span>{tab.label}</span>
              {tab.conditionnel && (
                <span className="ml-1 text-xs text-gray-400">(opt.)</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      {activeTab === 'demande' && <MdphTabDemande {...tabProps} />}
      {activeTab === 'identite' && <MdphTabIdentite {...tabProps} />}
      {activeTab === 'accompagnement' && <MdphTabAccompagnement {...tabProps} />}
      {activeTab === 'vie-quotidienne' && <MdphTabVieQuotidienne {...tabProps} />}
      {activeTab === 'vie-scolaire' && <MdphTabVieScolaire {...tabProps} />}
      {activeTab === 'situation-pro' && <MdphTabSituationPro {...tabProps} />}
      {activeTab === 'demandes-droits' && <MdphTabDemandesDroits {...tabProps} />}
      {activeTab === 'aidant' && <MdphTabAidant {...tabProps} />}
      {activeTab === 'recap' && <MdphTabRecap {...tabProps} />}
    </div>
  )
}
