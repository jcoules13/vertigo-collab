import { useState, useEffect } from 'react'
import { Save, Loader2, Check } from 'lucide-react'
import { DossierSuivi, SITUATION_PERSONNELLE_OPTIONS, SITUATION_FAMILIALE_OPTIONS, SITUATION_FINANCIERE_OPTIONS, SITUATION_PROFESSIONNELLE_OPTIONS, SITUATION_MEDICALE_OPTIONS, SITUATION_SANTE_PARCOURS_OPTIONS } from '../../types/database'

interface Props {
  dossier: DossierSuivi
  onSave: (updates: Partial<DossierSuivi>) => Promise<void>
  saving: boolean
}

function CheckboxGroup({ label, options, selected, onChange }: {
  label: string
  options: readonly string[]
  selected: string[]
  onChange: (v: string[]) => void
}) {
  const toggle = (opt: string) => {
    onChange(selected.includes(opt) ? selected.filter(s => s !== opt) : [...selected, opt])
  }

  return (
    <div>
      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{label}</h4>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => (
          <label key={opt} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={selected.includes(opt)}
              onChange={() => toggle(opt)}
              className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">{opt}</span>
          </label>
        ))}
      </div>
    </div>
  )
}

export default function TabSituation({ dossier, onSave, saving }: Props) {
  const [personnelle, setPersonnelle] = useState<string[]>([])
  const [familiale, setFamiliale] = useState<string[]>([])
  const [financiere, setFinanciere] = useState<string[]>([])
  const [professionnelle, setProfessionnelle] = useState<string[]>([])
  const [medicale, setMedicale] = useState<string[]>([])
  const [santeParcours, setSanteParcours] = useState<string[]>([])
  const [aidant, setAidant] = useState(false)
  const [justSaved, setJustSaved] = useState(false)

  useEffect(() => {
    setPersonnelle(dossier.situation_personnelle || [])
    setFamiliale(dossier.situation_familiale || [])
    setFinanciere(dossier.situation_financiere || [])
    setProfessionnelle(dossier.situation_professionnelle || [])
    setMedicale(dossier.situation_medicale || [])
    setSanteParcours(dossier.situation_sante_parcours || [])
    setAidant(dossier.aidant ?? false)
  }, [dossier])

  const isDirty =
    JSON.stringify([...personnelle].sort()) !== JSON.stringify([...(dossier.situation_personnelle || [])].sort()) ||
    JSON.stringify([...familiale].sort()) !== JSON.stringify([...(dossier.situation_familiale || [])].sort()) ||
    JSON.stringify([...financiere].sort()) !== JSON.stringify([...(dossier.situation_financiere || [])].sort()) ||
    JSON.stringify([...professionnelle].sort()) !== JSON.stringify([...(dossier.situation_professionnelle || [])].sort()) ||
    JSON.stringify([...medicale].sort()) !== JSON.stringify([...(dossier.situation_medicale || [])].sort()) ||
    JSON.stringify([...santeParcours].sort()) !== JSON.stringify([...(dossier.situation_sante_parcours || [])].sort()) ||
    aidant !== (dossier.aidant ?? false)

  const handleSave = async () => {
    await onSave({
      situation_personnelle: personnelle,
      situation_familiale: familiale,
      situation_financiere: financiere,
      situation_professionnelle: professionnelle,
      situation_medicale: medicale,
      situation_sante_parcours: santeParcours,
      aidant,
    })
    setJustSaved(true)
    setTimeout(() => setJustSaved(false), 3000)
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-900 dark:text-white">3. Situation actuelle</h3>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={aidant}
          onChange={e => setAidant(e.target.checked)}
          className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
        />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Aidant</span>
      </label>

      <div className="space-y-5">
        <CheckboxGroup label="Situation personnelle" options={SITUATION_PERSONNELLE_OPTIONS} selected={personnelle} onChange={setPersonnelle} />
        <CheckboxGroup label="Situation familiale" options={SITUATION_FAMILIALE_OPTIONS} selected={familiale} onChange={setFamiliale} />
        <CheckboxGroup label="Situation financière" options={SITUATION_FINANCIERE_OPTIONS} selected={financiere} onChange={setFinanciere} />
        <CheckboxGroup label="Situation professionnelle" options={SITUATION_PROFESSIONNELLE_OPTIONS} selected={professionnelle} onChange={setProfessionnelle} />
        <CheckboxGroup label="Situation médicale" options={SITUATION_MEDICALE_OPTIONS} selected={medicale} onChange={setMedicale} />
        <CheckboxGroup label="Santé / parcours" options={SITUATION_SANTE_PARCOURS_OPTIONS} selected={santeParcours} onChange={setSanteParcours} />
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
