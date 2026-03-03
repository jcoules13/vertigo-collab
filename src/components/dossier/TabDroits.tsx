import { useState, useEffect } from 'react'
import { Save, Loader2 } from 'lucide-react'
import { DossierSuivi } from '../../types/database'

interface Props {
  dossier: DossierSuivi
  onSave: (updates: Partial<DossierSuivi>) => Promise<void>
  saving: boolean
}

const DROITS_FIELDS = [
  { key: 'droits_medecin_traitant' as const, label: 'Médecin traitant déclaré' },
  { key: 'droits_ald' as const, label: 'ALD (Affection Longue Durée)' },
  { key: 'droits_rqth' as const, label: 'RQTH (Reconnaissance Qualité Travailleur Handicapé)' },
  { key: 'droits_mdph_en_cours' as const, label: 'Dossier MDPH en cours' },
  { key: 'droits_aah' as const, label: 'AAH (Allocation Adulte Handicapé)' },
  { key: 'droits_complementaire_sante' as const, label: 'Complémentaire santé' },
  { key: 'droits_medecine_travail' as const, label: 'Médecine du travail' },
  { key: 'droits_accident_travail' as const, label: 'Accident du travail reconnu' },
  { key: 'droits_invalidite' as const, label: 'Invalidité' },
]

export default function TabDroits({ dossier, onSave, saving }: Props) {
  const [droits, setDroits] = useState<Record<string, boolean>>({})
  const [commentaires, setCommentaires] = useState('')

  useEffect(() => {
    const d: Record<string, boolean> = {}
    for (const f of DROITS_FIELDS) {
      d[f.key] = (dossier as any)[f.key] || false
    }
    setDroits(d)
    setCommentaires(dossier.droits_commentaires || '')
  }, [dossier])

  const isDirty =
    DROITS_FIELDS.some(f => (droits[f.key] || false) !== ((dossier as any)[f.key] || false)) ||
    commentaires !== (dossier.droits_commentaires || '')

  const handleSave = () => {
    onSave({
      ...droits,
      droits_commentaires: commentaires.trim() || null,
    } as any)
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-900 dark:text-white">4. Droits et couverture</h3>

      <div className="space-y-3">
        {DROITS_FIELDS.map(f => (
          <label key={f.key} className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={droits[f.key] || false}
              onChange={e => setDroits({ ...droits, [f.key]: e.target.checked })}
              className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">{f.label}</span>
          </label>
        ))}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Commentaires</label>
        <textarea
          value={commentaires}
          onChange={e => setCommentaires(e.target.value)}
          className="input"
          rows={3}
          placeholder="Informations complémentaires sur les droits et la couverture..."
        />
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
