import { useState, useEffect } from 'react'
import { Save, Loader2, Check, Plus, Trash2 } from 'lucide-react'
import { DossierSuivi, PlanAction, Collaborateur } from '../../types/database'

interface Props {
  dossier: DossierSuivi
  onSave: (updates: Partial<DossierSuivi>) => Promise<void>
  saving: boolean
  collaborateurs: Collaborateur[]
}

const EMPTY_ACTION: PlanAction = { action: '', responsable: '', echeance: '', indicateur: '' }

export default function TabPlanActions({ dossier, onSave, saving, collaborateurs }: Props) {
  const [actions, setActions] = useState<PlanAction[]>([])
  const [justSaved, setJustSaved] = useState(false)

  useEffect(() => {
    const pa = dossier.plan_actions
    if (Array.isArray(pa) && pa.length > 0) {
      setActions(pa)
    } else {
      setActions([{ ...EMPTY_ACTION }])
    }
  }, [dossier])

  const updateAction = (index: number, field: keyof PlanAction, value: string) => {
    setActions(prev => prev.map((a, i) => i === index ? { ...a, [field]: value } : a))
  }

  const addRow = () => {
    setActions(prev => [...prev, { ...EMPTY_ACTION }])
  }

  const removeRow = (index: number) => {
    if (actions.length <= 1) return
    setActions(prev => prev.filter((_, i) => i !== index))
  }

  const getOriginalActions = (): PlanAction[] => {
    const pa = dossier.plan_actions
    return (Array.isArray(pa) && pa.length > 0) ? pa : [{ ...EMPTY_ACTION }]
  }

  const isDirty = JSON.stringify(actions) !== JSON.stringify(getOriginalActions())

  const handleSave = async () => {
    const cleaned = actions.filter(a => a.action.trim() || a.responsable.trim())
    await onSave({ plan_actions: cleaned.length > 0 ? cleaned : [] })
    setJustSaved(true)
    setTimeout(() => setJustSaved(false), 3000)
  }

  const activeCollabs = collaborateurs.filter(c => c.actif)

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-900 dark:text-white">7. Plan d'actions</h3>

      <div className="space-y-3">
        {actions.map((action, idx) => (
          <div key={idx} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Action {idx + 1}</span>
              {actions.length > 1 && (
                <button onClick={() => removeRow(idx)} className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded" title="Supprimer">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Action</label>
              <input
                value={action.action}
                onChange={e => updateAction(idx, 'action', e.target.value)}
                className="input"
                placeholder="Description de l'action à mener..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Responsable</label>
                <select
                  value={action.responsable}
                  onChange={e => updateAction(idx, 'responsable', e.target.value)}
                  className="input"
                >
                  <option value="">— Sélectionner —</option>
                  <option value="Usager">Usager</option>
                  {activeCollabs.map(c => (
                    <option key={c.id} value={`${c.prenom} ${c.nom}`}>{c.prenom} {c.nom}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Échéance</label>
                <input
                  type="date"
                  value={action.echeance}
                  onChange={e => updateAction(idx, 'echeance', e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Indicateur</label>
                <input
                  value={action.indicateur}
                  onChange={e => updateAction(idx, 'indicateur', e.target.value)}
                  className="input"
                  placeholder="Critère de réussite"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <button onClick={addRow} className="btn-secondary text-sm">
        <Plus className="w-4 h-4 mr-1" /> Ajouter une action
      </button>

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
