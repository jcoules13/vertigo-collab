import { useState, useEffect } from 'react'
import { Check, Save } from 'lucide-react'
import type { MdphFormulaire, MdphA3AideDemarches, MdphA4MesureProtection, MdphA5Urgence } from '../../types/mdph'

interface Props {
  formulaire: MdphFormulaire
  onSave: (updates: Partial<MdphFormulaire>) => Promise<void>
  saving: boolean
}

const Input = ({ label, value, onChange, placeholder, className }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; className?: string
}) => (
  <div className={className}>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
    <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm" />
  </div>
)

export default function MdphTabAccompagnement({ formulaire, onSave, saving }: Props) {
  const [a3, setA3] = useState<MdphA3AideDemarches>(formulaire.section_a3_aide_demarches)
  const [a4, setA4] = useState<MdphA4MesureProtection>(formulaire.section_a4_mesure_protection)
  const [a5, setA5] = useState<MdphA5Urgence>(formulaire.section_a5_urgence)
  const [justSaved, setJustSaved] = useState(false)

  useEffect(() => {
    setA3(formulaire.section_a3_aide_demarches)
    setA4(formulaire.section_a4_mesure_protection)
    setA5(formulaire.section_a5_urgence)
  }, [formulaire])

  const isDirty = JSON.stringify(a3) !== JSON.stringify(formulaire.section_a3_aide_demarches) ||
    JSON.stringify(a4) !== JSON.stringify(formulaire.section_a4_mesure_protection) ||
    JSON.stringify(a5) !== JSON.stringify(formulaire.section_a5_urgence)

  const handleSave = async () => {
    await onSave({ section_a3_aide_demarches: a3, section_a4_mesure_protection: a4, section_a5_urgence: a5 })
    setJustSaved(true)
    setTimeout(() => setJustSaved(false), 2000)
  }

  return (
    <div className="space-y-6">
      {/* A3 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">A3 — Aide dans vos demarches</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Vous etes aide(e) dans vos demarches aupres de la MDPH</p>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type d'aide</label>
          <div className="flex flex-wrap gap-4">
            {([['proche', 'Un proche'], ['association', 'Une association'], ['autre', 'Autre']] as const).map(([val, label]) => (
              <label key={val} className="flex items-center gap-2">
                <input type="radio" name="type_aide" checked={a3.type_aide === val}
                  onChange={() => setA3(d => ({ ...d, type_aide: val }))} className="w-4 h-4 text-primary-600" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {a3.type_aide && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {a3.type_aide === 'association' && (
              <Input label="Nom de l'association" value={a3.nom_association} onChange={v => setA3(d => ({ ...d, nom_association: v }))} className="md:col-span-2" />
            )}
            <Input label="Nom et prenom" value={a3.nom_prenom_personne} onChange={v => setA3(d => ({ ...d, nom_prenom_personne: v }))} className="md:col-span-2" />
            <Input label="Adresse" value={a3.adresse} onChange={v => setA3(d => ({ ...d, adresse: v }))} className="md:col-span-2" />
            <Input label="Code postal" value={a3.code_postal} onChange={v => setA3(d => ({ ...d, code_postal: v }))} />
            <Input label="Commune" value={a3.commune} onChange={v => setA3(d => ({ ...d, commune: v }))} />
            <Input label="Telephone" value={a3.telephone} onChange={v => setA3(d => ({ ...d, telephone: v }))} />
            <Input label="E-mail" value={a3.email} onChange={v => setA3(d => ({ ...d, email: v }))} />
          </div>
        )}
      </div>

      {/* A4 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">A4 — Mesure de protection</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Vous beneficiez d'une mesure de protection</p>

        <label className="flex items-center gap-2 mb-4">
          <input type="checkbox" checked={a4.a_mesure} onChange={e => setA4(d => ({ ...d, a_mesure: e.target.checked }))}
            className="w-4 h-4 text-primary-600 rounded border-gray-300" />
          <span className="text-sm text-gray-700 dark:text-gray-300">Oui, je beneficie d'une mesure de protection</span>
        </label>

        {a4.a_mesure && (
          <div className="space-y-6">
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Representant legal 1</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input label="Type de mesure" value={a4.representant1.type_mesure} onChange={v => setA4(d => ({ ...d, representant1: { ...d.representant1, type_mesure: v } }))} placeholder="tutelle, curatelle..." />
                <Input label="Organisme" value={a4.representant1.nom_organisme} onChange={v => setA4(d => ({ ...d, representant1: { ...d.representant1, nom_organisme: v } }))} />
                <Input label="Nom" value={a4.representant1.nom_personne} onChange={v => setA4(d => ({ ...d, representant1: { ...d.representant1, nom_personne: v } }))} />
                <Input label="Telephone" value={a4.representant1.telephone} onChange={v => setA4(d => ({ ...d, representant1: { ...d.representant1, telephone: v } }))} />
                <Input label="Adresse" value={a4.representant1.adresse} onChange={v => setA4(d => ({ ...d, representant1: { ...d.representant1, adresse: v } }))} className="md:col-span-2" />
                <Input label="Code postal" value={a4.representant1.code_postal} onChange={v => setA4(d => ({ ...d, representant1: { ...d.representant1, code_postal: v } }))} />
                <Input label="Commune" value={a4.representant1.commune} onChange={v => setA4(d => ({ ...d, representant1: { ...d.representant1, commune: v } }))} />
                <Input label="E-mail" value={a4.representant1.email} onChange={v => setA4(d => ({ ...d, representant1: { ...d.representant1, email: v } }))} className="md:col-span-2" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* A5 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">A5 — Situation necessitant un traitement rapide</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Cochez si vous pensez etre dans une de ces situations</p>

        <div className="space-y-3 mb-4">
          {([
            ['ne_peut_vivre_domicile', 'Vous n\'arrivez plus a vivre chez vous ou vous risquez de ne plus pouvoir y vivre'],
            ['ecole_ne_peut_accueillir', 'Votre ecole ne peut plus vous accueillir'],
            ['sortie_hospitalisation', 'Vous sortez d\'hospitalisation et ne pouvez pas retourner chez vous'],
            ['risque_perte_travail', 'Vous risquez rapidement de perdre votre travail'],
            ['nouvel_emploi_formation', 'Vous venez de trouver un emploi ou commencez bientot une formation'],
          ] as const).map(([key, label]) => (
            <label key={key} className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
              <input type="checkbox" checked={a5[key]} onChange={e => setA5(d => ({ ...d, [key]: e.target.checked }))}
                className="mt-0.5 w-4 h-4 text-primary-600 rounded border-gray-300" />
              <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
            </label>
          ))}
        </div>

        {a5.nouvel_emploi_formation && (
          <Input label="Date d'entree prevue" value={a5.date_entree_prevue}
            onChange={v => setA5(d => ({ ...d, date_entree_prevue: v }))} placeholder="JJ/MM/AAAA" className="mb-4" />
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expliquer la difficulte</label>
          <textarea value={a5.explication} onChange={e => setA5(d => ({ ...d, explication: e.target.value }))} rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm" />
        </div>

        <label className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 mb-4">
          <input type="checkbox" checked={a5.fin_droits_imminente} onChange={e => setA5(d => ({ ...d, fin_droits_imminente: e.target.checked }))}
            className="mt-0.5 w-4 h-4 text-primary-600 rounded border-gray-300" />
          <span className="text-sm text-gray-700 dark:text-gray-300">Vous arrivez dans moins de 2 mois a la fin de vos droits</span>
        </label>

        {a5.fin_droits_imminente && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Droits concernes et dates d'echeance</label>
            <textarea value={a5.droits_concernes} onChange={e => setA5(d => ({ ...d, droits_concernes: e.target.value }))} rows={2}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm" />
          </div>
        )}
      </div>

      {/* Save */}
      {(isDirty || justSaved) && (
        <div className="flex justify-end">
          <button onClick={handleSave} disabled={saving || !isDirty}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-colors ${justSaved ? 'bg-green-500' : 'bg-primary-600 hover:bg-primary-700'} disabled:opacity-50`}>
            {justSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {justSaved ? 'Enregistre' : 'Enregistrer'}
          </button>
        </div>
      )}
    </div>
  )
}
