import { useEffect, useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft, Loader2, User,
  UserCircle, ShieldCheck, ClipboardList, Scale, Target,
  Layers, ListChecks, Activity, FileText, CalendarClock, BookOpen
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { DossierSuivi, Collaborateur, Piliers, STATUT_DOSSIER_LABELS } from '../types/database'

import TabIdentite from '../components/dossier/TabIdentite'
import TabConsentement from '../components/dossier/TabConsentement'
import TabSituation from '../components/dossier/TabSituation'
import TabDroits from '../components/dossier/TabDroits'
import TabObjectifs from '../components/dossier/TabObjectifs'
import TabPiliers from '../components/dossier/TabPiliers'
import TabPlanActions from '../components/dossier/TabPlanActions'
import TabEvaluation from '../components/dossier/TabEvaluation'
import TabObservations from '../components/dossier/TabObservations'
import TabSuivi from '../components/dossier/TabSuivi'
import TabSeances from '../components/dossier/TabSeances'

const STATUT_COLORS: Record<DossierSuivi['statut'], string> = {
  ouvert: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  en_cours: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  clos: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
}

const TABS = [
  { id: 'identite', label: 'Identité', icon: UserCircle },
  { id: 'consentement', label: 'RGPD', icon: ShieldCheck },
  { id: 'situation', label: 'Situation', icon: ClipboardList },
  { id: 'droits', label: 'Droits', icon: Scale },
  { id: 'objectifs', label: 'Objectifs', icon: Target },
  { id: 'piliers', label: 'Piliers', icon: Layers },
  { id: 'plan', label: 'Plan', icon: ListChecks },
  { id: 'evaluation', label: 'Évaluation', icon: Activity },
  { id: 'observations', label: 'Observations', icon: FileText },
  { id: 'suivi', label: 'Suivi', icon: CalendarClock },
  { id: 'seances', label: 'Séances', icon: BookOpen },
] as const

type TabId = typeof TABS[number]['id']

function getCompletionIndicator(dossier: DossierSuivi, tabId: TabId): 'empty' | 'partial' | 'done' {
  switch (tabId) {
    case 'identite':
      return dossier.usager_nom ? 'done' : 'empty'
    case 'consentement':
      return (dossier.consent_conservation || dossier.consent_contact) ? 'done' : 'empty'
    case 'situation': {
      const has = [dossier.situation_personnelle, dossier.situation_familiale, dossier.situation_financiere, dossier.situation_professionnelle, dossier.situation_medicale, dossier.situation_sante_parcours]
        .filter(a => a && a.length > 0).length
      return has === 0 ? 'empty' : has === 6 ? 'done' : 'partial'
    }
    case 'droits': {
      const any = dossier.droits_medecin_traitant || dossier.droits_ald || dossier.droits_rqth ||
        dossier.droits_mdph_en_cours || dossier.droits_aah || dossier.droits_complementaire_sante
      return any ? 'done' : 'empty'
    }
    case 'objectifs': {
      const filled = [dossier.objectif_1, dossier.objectif_2, dossier.objectif_3].filter(Boolean).length
      return filled === 0 ? 'empty' : filled >= 2 ? 'done' : 'partial'
    }
    case 'piliers': {
      const p = dossier.piliers
      if (!p) return 'empty'
      const pilierKeys: Array<keyof Piliers> = ['communication', 'administratif', 'social', 'bien_etre']
      const filled = pilierKeys.filter(k => p[k]?.niveau !== null).length
      return filled === 0 ? 'empty' : filled === 4 ? 'done' : 'partial'
    }
    case 'plan':
      return Array.isArray(dossier.plan_actions) && dossier.plan_actions.length > 0 && dossier.plan_actions.some(a => a.action) ? 'done' : 'empty'
    case 'evaluation': {
      const filled = [dossier.eval_douleur, dossier.eval_energie, dossier.eval_stress, dossier.eval_soutien]
        .filter(v => v !== null && v !== undefined).length
      return filled === 0 ? 'empty' : filled === 4 ? 'done' : 'partial'
    }
    case 'observations':
      return dossier.observations ? 'done' : 'empty'
    case 'suivi':
      return 'empty' // dynamic — managed by TabSuivi
    case 'seances':
      return 'empty' // dynamic — managed by TabSeances
  }
}

const INDICATOR_STYLES = {
  empty: '',
  partial: 'ring-2 ring-yellow-400',
  done: 'ring-2 ring-green-400',
}

export default function DossierDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { collaborateur } = useAuth()
  const [loading, setLoading] = useState(true)
  const [dossier, setDossier] = useState<DossierSuivi | null>(null)
  const [collaborateurs, setCollaborateurs] = useState<Collaborateur[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const activeTab = (searchParams.get('tab') as TabId) || 'identite'
  const setActiveTab = (tab: TabId) => setSearchParams({ tab })

  const fetchDossier = async () => {
    if (!id) return
    try {
      const { data, error: fetchErr } = await supabase
        .from('dossiers_suivi')
        .select('*, collaborateurs!cree_par(prenom, nom), responsable:collaborateurs!responsable_id(id, prenom, nom)')
        .eq('id', id)
        .single()
      if (fetchErr) throw fetchErr
      setDossier(data)
    } catch (err: any) {
      console.error('fetchDossier error:', err)
      setError(err.message || 'Erreur lors du chargement du dossier')
    } finally {
      setLoading(false)
    }
  }

  const fetchCollaborateurs = async () => {
    try {
      const { data, error: fetchErr } = await supabase.from('collaborateurs').select('*').eq('actif', true).order('nom')
      if (fetchErr) throw fetchErr
      setCollaborateurs(data || [])
    } catch (err: any) {
      console.error('fetchCollaborateurs error:', err)
    }
  }

  useEffect(() => {
    fetchDossier()
    fetchCollaborateurs()
  }, [id])

  const handleTabSave = async (updates: Partial<DossierSuivi>) => {
    if (!id) return
    setSaving(true)
    try {
      const { error: updateErr } = await supabase.from('dossiers_suivi').update({
        ...updates,
        updated_at: new Date().toISOString(),
      } as any).eq('id', id)
      if (updateErr) throw updateErr
      await fetchDossier()
    } catch (err: any) {
      console.error('handleTabSave error:', err)
      setError(err.message || 'Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const handleChangeStatut = async (newStatut: DossierSuivi['statut']) => {
    if (!id) return
    try {
      const { error: updateErr } = await supabase.from('dossiers_suivi').update({
        statut: newStatut,
        updated_at: new Date().toISOString(),
      }).eq('id', id)
      if (updateErr) throw updateErr
      await fetchDossier()
    } catch (err: any) {
      console.error('handleChangeStatut error:', err)
      setError(err.message || 'Erreur lors du changement de statut')
    }
  }

  const handleAttribuer = async () => {
    if (!id || !collaborateur) return
    try {
      const { error: updateErr } = await supabase.from('dossiers_suivi').update({
        responsable_id: collaborateur.id,
        updated_at: new Date().toISOString(),
      }).eq('id', id)
      if (updateErr) throw updateErr
      await fetchDossier()
    } catch (err: any) {
      console.error('handleAttribuer error:', err)
      setError(err.message || 'Erreur lors de l\'attribution')
    }
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
  const collabNom = collaborateur ? `${collaborateur.prenom} ${collaborateur.nom}` : ''

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm rounded-lg">{error}</div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/dossiers')} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {dossier.usager_prenom && `${dossier.usager_prenom} `}{dossier.usager_nom}
            </h1>
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
          <button onClick={() => handleChangeStatut('en_cours')} className="btn-secondary text-sm">Passer en cours</button>
        )}
        {dossier.statut !== 'clos' && (
          <button onClick={() => handleChangeStatut('clos')} className="btn-secondary text-sm">Clore le dossier</button>
        )}
        {dossier.statut === 'clos' && (
          <button onClick={() => handleChangeStatut('ouvert')} className="btn-secondary text-sm">Réouvrir</button>
        )}
      </div>

      {/* Tab bar */}
      <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex gap-1 min-w-max border-b border-gray-200 dark:border-gray-700">
          {TABS.map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            const indicator = getCompletionIndicator(dossier, tab.id)
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  isActive
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                } ${INDICATOR_STYLES[indicator]}`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab content */}
      <div className="card">
        <div className="card-body">
          {activeTab === 'identite' && <TabIdentite dossier={dossier} onSave={handleTabSave} saving={saving} />}
          {activeTab === 'consentement' && <TabConsentement dossier={dossier} onSave={handleTabSave} saving={saving} />}
          {activeTab === 'situation' && <TabSituation dossier={dossier} onSave={handleTabSave} saving={saving} />}
          {activeTab === 'droits' && <TabDroits dossier={dossier} onSave={handleTabSave} saving={saving} />}
          {activeTab === 'objectifs' && <TabObjectifs dossier={dossier} onSave={handleTabSave} saving={saving} />}
          {activeTab === 'piliers' && <TabPiliers dossier={dossier} onSave={handleTabSave} saving={saving} />}
          {activeTab === 'plan' && <TabPlanActions dossier={dossier} onSave={handleTabSave} saving={saving} collaborateurs={collaborateurs} />}
          {activeTab === 'evaluation' && <TabEvaluation dossier={dossier} onSave={handleTabSave} saving={saving} />}
          {activeTab === 'observations' && <TabObservations dossier={dossier} onSave={handleTabSave} saving={saving} collaborateurNom={collabNom} />}
          {activeTab === 'suivi' && <TabSuivi dossier={dossier} collaborateurNom={collabNom} />}
          {activeTab === 'seances' && collaborateur && <TabSeances dossier={dossier} collaborateurId={collaborateur.id} onDossierUpdated={fetchDossier} />}
        </div>
      </div>
    </div>
  )
}
