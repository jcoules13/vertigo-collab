import { useState, useEffect } from 'react'
import { Save, Loader2, Target } from 'lucide-react'
import { DossierSuivi } from '../../types/database'

interface Props {
  dossier: DossierSuivi
  onSave: (updates: Partial<DossierSuivi>) => Promise<void>
  saving: boolean
}

export default function TabObjectifs({ dossier, onSave, saving }: Props) {
  const [obj1, setObj1] = useState('')
  const [obj2, setObj2] = useState('')
  const [obj3, setObj3] = useState('')

  useEffect(() => {
    setObj1(dossier.objectif_1 || '')
    setObj2(dossier.objectif_2 || '')
    setObj3(dossier.objectif_3 || '')
  }, [dossier])

  const isDirty =
    obj1 !== (dossier.objectif_1 || '') ||
    obj2 !== (dossier.objectif_2 || '') ||
    obj3 !== (dossier.objectif_3 || '')

  const handleSave = () => {
    onSave({
      objectif_1: obj1.trim() || null,
      objectif_2: obj2.trim() || null,
      objectif_3: obj3.trim() || null,
    })
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-900 dark:text-white">5. Objectifs SMART</h3>

      <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg text-sm text-amber-800 dark:text-amber-300">
        <Target className="w-5 h-5 inline mr-2" />
        Les objectifs doivent être <strong>S</strong>pécifiques, <strong>M</strong>esurables, <strong>A</strong>tteignables, <strong>R</strong>éalistes et <strong>T</strong>emporels.
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Objectif 1</label>
          <textarea
            value={obj1}
            onChange={e => setObj1(e.target.value)}
            className="input"
            rows={3}
            placeholder="Ex : Obtenir une reconnaissance RQTH d'ici 3 mois..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Objectif 2</label>
          <textarea
            value={obj2}
            onChange={e => setObj2(e.target.value)}
            className="input"
            rows={3}
            placeholder="Ex : Participer à 2 ateliers collectifs par mois..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Objectif 3</label>
          <textarea
            value={obj3}
            onChange={e => setObj3(e.target.value)}
            className="input"
            rows={3}
            placeholder="Ex : Mettre en place une routine bien-être hebdomadaire..."
          />
        </div>
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
