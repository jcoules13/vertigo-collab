import { useState, useEffect } from 'react'
import { Save, Loader2 } from 'lucide-react'
import { DossierSuivi } from '../../types/database'

interface Props {
  dossier: DossierSuivi
  onSave: (updates: Partial<DossierSuivi>) => Promise<void>
  saving: boolean
}

const EVAL_FIELDS = [
  { key: 'eval_douleur' as const, label: 'Douleur', low: 'Aucune', high: 'Maximale', color: 'red' },
  { key: 'eval_energie' as const, label: 'Énergie', low: 'Épuisé(e)', high: 'Plein(e) d\'énergie', color: 'green' },
  { key: 'eval_stress' as const, label: 'Stress', low: 'Serein(e)', high: 'Très stressé(e)', color: 'orange' },
  { key: 'eval_soutien' as const, label: 'Soutien ressenti', low: 'Isolé(e)', high: 'Très soutenu(e)', color: 'blue' },
]

const COLOR_MAP: Record<string, string> = {
  red: 'accent-red-500',
  green: 'accent-green-500',
  orange: 'accent-orange-500',
  blue: 'accent-blue-500',
}

export default function TabEvaluation({ dossier, onSave, saving }: Props) {
  const [values, setValues] = useState<Record<string, number | null>>({})

  useEffect(() => {
    const v: Record<string, number | null> = {}
    for (const f of EVAL_FIELDS) {
      v[f.key] = dossier[f.key]
    }
    setValues(v)
  }, [dossier])

  const isDirty = EVAL_FIELDS.some(f => (values[f.key] ?? null) !== (dossier[f.key] ?? null))

  const handleSave = () => {
    onSave(values as any)
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-900 dark:text-white">8. Auto-évaluation</h3>

      <p className="text-sm text-gray-500 dark:text-gray-400">
        Demandez à l'usager d'évaluer son ressenti sur une échelle de 0 à 10.
      </p>

      <div className="space-y-6">
        {EVAL_FIELDS.map(f => {
          const val = values[f.key]
          return (
            <div key={f.key} className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{f.label}</label>
                <span className="text-lg font-bold text-gray-900 dark:text-white">{val !== null && val !== undefined ? val : '—'}</span>
              </div>
              <input
                type="range"
                min={0}
                max={10}
                step={1}
                value={val ?? 5}
                onChange={e => setValues(prev => ({ ...prev, [f.key]: parseInt(e.target.value) }))}
                className={`w-full h-2 rounded-lg cursor-pointer ${COLOR_MAP[f.color] || ''}`}
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>0 — {f.low}</span>
                <span>{f.high} — 10</span>
              </div>
            </div>
          )
        })}
      </div>

      {isDirty && (
        <div className="flex justify-end pt-2">
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Mettre à jour
          </button>
        </div>
      )}
    </div>
  )
}
