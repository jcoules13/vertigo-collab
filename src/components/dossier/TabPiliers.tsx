import { useState, useEffect } from 'react'
import { Save, Loader2, Check } from 'lucide-react'
import { DossierSuivi, Piliers, Pilier, PILIER_LABELS, PILIER_NIVEAUX, PILIER_DESCRIPTIONS, DEFAULT_PILIERS } from '../../types/database'

interface Props {
  dossier: DossierSuivi
  onSave: (updates: Partial<DossierSuivi>) => Promise<void>
  saving: boolean
}

const PILIER_KEYS: (keyof Piliers)[] = ['communication', 'administratif', 'social', 'bien_etre']

const NIVEAU_COLORS = [
  'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/20 dark:text-green-400 dark:border-green-700',
  'bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-700',
  'bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-700',
]

function PilierSection({ pilierKey, pilier, labels, descriptions, onChange }: {
  pilierKey: keyof Piliers
  pilier: Pilier
  labels: [string, string, string]
  descriptions: [string, string, string]
  onChange: (p: Pilier) => void
}) {
  return (
    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-3">
      <h4 className="font-medium text-gray-900 dark:text-white">{PILIER_LABELS[pilierKey]}</h4>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Besoin identifié</label>
        <textarea
          value={pilier.besoin}
          onChange={e => onChange({ ...pilier, besoin: e.target.value })}
          className="input"
          rows={2}
          placeholder="Décrire le besoin de l'usager..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Niveau d'accompagnement</label>
        <div className="space-y-2">
          {([1, 2, 3] as const).map(n => (
            <label key={n} className={`flex items-start gap-3 p-2 rounded-lg border cursor-pointer transition-colors ${
              pilier.niveau === n ? NIVEAU_COLORS[n - 1] : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}>
              <input
                type="radio"
                name={`${pilierKey}-niveau`}
                checked={pilier.niveau === n}
                onChange={() => onChange({ ...pilier, niveau: n })}
                className="mt-0.5 h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
              />
              <div>
                <p className="text-sm font-medium">Niveau {n} — {labels[n - 1]}</p>
                <p className="text-xs opacity-75">{descriptions[n - 1]}</p>
              </div>
            </label>
          ))}
          {pilier.niveau !== null && (
            <button
              onClick={() => onChange({ ...pilier, niveau: null })}
              className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              Effacer la sélection
            </button>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Actions envisagées</label>
        <textarea
          value={pilier.actions}
          onChange={e => onChange({ ...pilier, actions: e.target.value })}
          className="input"
          rows={2}
          placeholder="Actions à mettre en place..."
        />
      </div>
    </div>
  )
}

export default function TabPiliers({ dossier, onSave, saving }: Props) {
  const [piliers, setPiliers] = useState<Piliers>(DEFAULT_PILIERS)
  const [justSaved, setJustSaved] = useState(false)

  useEffect(() => {
    const p = dossier.piliers
    if (p && typeof p === 'object') {
      setPiliers({
        communication: { ...DEFAULT_PILIERS.communication, ...p.communication },
        administratif: { ...DEFAULT_PILIERS.administratif, ...p.administratif },
        social: { ...DEFAULT_PILIERS.social, ...p.social },
        bien_etre: { ...DEFAULT_PILIERS.bien_etre, ...p.bien_etre },
      })
    } else {
      setPiliers(DEFAULT_PILIERS)
    }
  }, [dossier])

  const updatePilier = (key: keyof Piliers, pilier: Pilier) => {
    setPiliers(prev => ({ ...prev, [key]: pilier }))
  }

  const getOriginalPiliers = (): Piliers => {
    const p = dossier.piliers
    if (p && typeof p === 'object') {
      return {
        communication: { ...DEFAULT_PILIERS.communication, ...p.communication },
        administratif: { ...DEFAULT_PILIERS.administratif, ...p.administratif },
        social: { ...DEFAULT_PILIERS.social, ...p.social },
        bien_etre: { ...DEFAULT_PILIERS.bien_etre, ...p.bien_etre },
      }
    }
    return DEFAULT_PILIERS
  }

  const isDirty = JSON.stringify(piliers) !== JSON.stringify(getOriginalPiliers())

  const handleSave = async () => {
    await onSave({ piliers })
    setJustSaved(true)
    setTimeout(() => setJustSaved(false), 3000)
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-900 dark:text-white">6. Les 4 piliers d'accompagnement</h3>

      <div className="space-y-4">
        {PILIER_KEYS.map(key => (
          <PilierSection
            key={key}
            pilierKey={key}
            pilier={piliers[key]}
            labels={PILIER_NIVEAUX[key]}
            descriptions={PILIER_DESCRIPTIONS[key]}
            onChange={p => updatePilier(key, p)}
          />
        ))}
      </div>

      {(isDirty || justSaved) && (
        <div className="flex justify-end pt-2">
          <button
            onClick={handleSave}
            disabled={saving || justSaved}
            className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-white transition-all ${
              justSaved ? 'bg-green-600' : 'bg-red-500 animate-pulse-soft'
            }`}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" />
             : justSaved ? <Check className="w-4 h-4 mr-2" />
             : <Save className="w-4 h-4 mr-2" />}
            {justSaved ? 'Mis à jour !' : 'Mettre à jour'}
          </button>
        </div>
      )}
    </div>
  )
}
