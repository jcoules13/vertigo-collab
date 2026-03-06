import { useState, useEffect } from 'react'
import { Check, Save } from 'lucide-react'
import type { MdphFormulaire, MdphPageGarde } from '../../types/mdph'

interface Props {
  formulaire: MdphFormulaire
  onSave: (updates: Partial<MdphFormulaire>) => Promise<void>
  saving: boolean
}

export default function MdphTabDemande({ formulaire, onSave, saving }: Props) {
  const [data, setData] = useState<MdphPageGarde>(formulaire.section_page_garde)
  const [justSaved, setJustSaved] = useState(false)

  useEffect(() => { setData(formulaire.section_page_garde) }, [formulaire.section_page_garde])

  const isDirty = JSON.stringify(data) !== JSON.stringify(formulaire.section_page_garde)

  const handleSave = async () => {
    await onSave({ section_page_garde: data })
    setJustSaved(true)
    setTimeout(() => setJustSaved(false), 2000)
  }

  const Checkbox = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) => (
    <label className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        className="mt-0.5 w-4 h-4 text-primary-600 rounded border-gray-300"
      />
      <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
    </label>
  )

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Type de demande</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Cochez la ou les cases correspondant a votre situation</p>

      <div className="space-y-3 mb-8">
        <Checkbox
          label="C'est ma premiere demande a la MDPH"
          checked={data.premiere_demande}
          onChange={v => setData(d => ({ ...d, premiere_demande: v }))}
        />
        <Checkbox
          label="Ma situation medicale, administrative, familiale ou mon projet a change"
          checked={data.situation_changee}
          onChange={v => setData(d => ({ ...d, situation_changee: v }))}
        />
        <Checkbox
          label="Je souhaite une reevaluation de ma situation et/ou une revision de mes droits"
          checked={data.reevaluation}
          onChange={v => setData(d => ({ ...d, reevaluation: v }))}
        />
        <Checkbox
          label="Je souhaite le renouvellement de mes droits a l'identique car j'estime que ma situation n'a pas change"
          checked={data.renouvellement_identique}
          onChange={v => setData(d => ({ ...d, renouvellement_identique: v }))}
        />
        <Checkbox
          label="Votre aidant familial souhaite exprimer sa situation et ses besoins"
          checked={data.aidant_familial}
          onChange={v => setData(d => ({ ...d, aidant_familial: v }))}
        />
      </div>

      <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-4">Dossier existant a la MDPH</h3>
      <div className="flex items-center gap-4 mb-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={data.dossier_existant}
            onChange={e => setData(d => ({ ...d, dossier_existant: e.target.checked }))}
            className="w-4 h-4 text-primary-600 rounded border-gray-300"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">Oui</span>
        </label>
      </div>

      {data.dossier_existant && (
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Departement</label>
            <input
              type="text"
              value={data.dossier_departement}
              onChange={e => setData(d => ({ ...d, dossier_departement: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="ex: 13"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">N° de dossier</label>
            <input
              type="text"
              value={data.dossier_numero}
              onChange={e => setData(d => ({ ...d, dossier_numero: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>
      )}

      {/* Save button */}
      {(isDirty || justSaved) && (
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving || !isDirty}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-colors ${
              justSaved ? 'bg-green-500' : 'bg-primary-600 hover:bg-primary-700'
            } disabled:opacity-50`}
          >
            {justSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {justSaved ? 'Enregistre' : 'Enregistrer'}
          </button>
        </div>
      )}
    </div>
  )
}
