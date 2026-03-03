import { useState, useEffect } from 'react'
import { Save, Loader2, Target, Plus, X } from 'lucide-react'
import { DossierSuivi } from '../../types/database'

interface Props {
  dossier: DossierSuivi
  onSave: (updates: Partial<DossierSuivi>) => Promise<void>
  saving: boolean
}

const PLACEHOLDERS = [
  'Ex : Obtenir une reconnaissance RQTH d\'ici 3 mois...',
  'Ex : Participer à 2 ateliers collectifs par mois...',
  'Ex : Mettre en place une routine bien-être hebdomadaire...',
]

export default function TabObjectifs({ dossier, onSave, saving }: Props) {
  const [objectifs, setObjectifs] = useState<string[]>([''])

  useEffect(() => {
    const list = dossier.objectifs && dossier.objectifs.length > 0 ? [...dossier.objectifs] : ['']
    setObjectifs(list)
  }, [dossier])

  const isDirty =
    JSON.stringify(objectifs.map(o => o.trim()).filter(Boolean)) !==
    JSON.stringify((dossier.objectifs || []).filter(Boolean))

  const handleSave = () => {
    onSave({ objectifs: objectifs.map(o => o.trim()).filter(Boolean) })
  }

  const updateObjectif = (index: number, value: string) => {
    setObjectifs(prev => prev.map((o, i) => i === index ? value : o))
  }

  const addObjectif = () => {
    setObjectifs(prev => [...prev, ''])
  }

  const removeObjectif = (index: number) => {
    setObjectifs(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-900 dark:text-white">5. Objectifs SMART</h3>

      <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg text-sm text-amber-800 dark:text-amber-300">
        <Target className="w-5 h-5 inline mr-2" />
        Les objectifs doivent être <strong>S</strong>pécifiques, <strong>M</strong>esurables, <strong>A</strong>tteignables, <strong>R</strong>éalistes et <strong>T</strong>emporels.
      </div>

      <div className="space-y-4">
        {objectifs.map((obj, i) => (
          <div key={i}>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Objectif {i + 1}</label>
              {objectifs.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeObjectif(i)}
                  className="p-1 text-gray-400 hover:text-red-500 rounded"
                  title="Supprimer cet objectif"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <textarea
              value={obj}
              onChange={e => updateObjectif(i, e.target.value)}
              className="input"
              rows={3}
              placeholder={PLACEHOLDERS[i] || 'Décrivez un objectif SMART...'}
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addObjectif}
        className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
      >
        <Plus className="w-4 h-4" />
        Ajouter un objectif
      </button>

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
