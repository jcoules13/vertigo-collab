import { useState, useEffect } from 'react'
import { Check, Save } from 'lucide-react'
import type { MdphFormulaire, MdphA1Identite, MdphA2AutoriteParentale } from '../../types/mdph'

interface Props {
  formulaire: MdphFormulaire
  onSave: (updates: Partial<MdphFormulaire>) => Promise<void>
  saving: boolean
}

export default function MdphTabIdentite({ formulaire, onSave, saving }: Props) {
  const [a1, setA1] = useState<MdphA1Identite>(formulaire.section_a1_identite)
  const [a2, setA2] = useState<MdphA2AutoriteParentale>(formulaire.section_a2_autorite_parentale)
  const [justSaved, setJustSaved] = useState(false)

  useEffect(() => {
    setA1(formulaire.section_a1_identite)
    setA2(formulaire.section_a2_autorite_parentale)
  }, [formulaire])

  const isDirty = JSON.stringify(a1) !== JSON.stringify(formulaire.section_a1_identite) ||
    JSON.stringify(a2) !== JSON.stringify(formulaire.section_a2_autorite_parentale)

  const handleSave = async () => {
    await onSave({
      section_a1_identite: a1,
      section_a2_autorite_parentale: a2,
      usager_nom: a1.nom_naissance || formulaire.usager_nom,
      usager_prenom: a1.prenoms || formulaire.usager_prenom,
    })
    setJustSaved(true)
    setTimeout(() => setJustSaved(false), 2000)
  }

  const Input = ({ label, value, onChange, placeholder, className }: {
    label: string; value: string; onChange: (v: string) => void; placeholder?: string; className?: string
  }) => (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
      />
    </div>
  )

  return (
    <div className="space-y-6">
      {/* A1: Identite */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">A1 — Identite</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Identite de l'enfant ou de l'adulte concerne par la demande</p>

        {/* Sexe */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sexe</label>
          <div className="flex gap-4">
            {(['homme', 'femme'] as const).map(s => (
              <label key={s} className="flex items-center gap-2">
                <input type="radio" name="sexe" checked={a1.sexe === s} onChange={() => setA1(d => ({ ...d, sexe: s }))}
                  className="w-4 h-4 text-primary-600" />
                <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">{s}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <Input label="Nom de naissance *" value={a1.nom_naissance} onChange={v => setA1(d => ({ ...d, nom_naissance: v }))} />
          <Input label="Nom d'epoux/se ou d'usage" value={a1.nom_usage} onChange={v => setA1(d => ({ ...d, nom_usage: v }))} />
          <Input label="Prenoms *" value={a1.prenoms} onChange={v => setA1(d => ({ ...d, prenoms: v }))} />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date de naissance</label>
            <input type="date" value={a1.date_naissance} onChange={e => setA1(d => ({ ...d, date_naissance: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm" />
          </div>
        </div>

        {/* Nationalite */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nationalite</label>
          <div className="flex flex-wrap gap-4">
            {([['francaise', 'Francaise'], ['eee_suisse', 'EEE ou Suisse'], ['autre', 'Autre']] as const).map(([val, label]) => (
              <label key={val} className="flex items-center gap-2">
                <input type="radio" name="nationalite" checked={a1.nationalite === val}
                  onChange={() => setA1(d => ({ ...d, nationalite: val }))} className="w-4 h-4 text-primary-600" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
              </label>
            ))}
          </div>
          {a1.nationalite === 'autre' && (
            <Input label="" value={a1.nationalite_autre} onChange={v => setA1(d => ({ ...d, nationalite_autre: v }))} placeholder="Preciser" className="mt-2" />
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <Input label="Commune de naissance" value={a1.commune_naissance} onChange={v => setA1(d => ({ ...d, commune_naissance: v }))} />
          <Input label="Departement" value={a1.departement_naissance} onChange={v => setA1(d => ({ ...d, departement_naissance: v }))} />
        </div>

        {/* Pays de naissance */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Pays de naissance</label>
          <div className="flex gap-4">
            {([['france', 'France'], ['autre', 'Autre']] as const).map(([val, label]) => (
              <label key={val} className="flex items-center gap-2">
                <input type="radio" name="pays_naissance" checked={a1.pays_naissance === val}
                  onChange={() => setA1(d => ({ ...d, pays_naissance: val }))} className="w-4 h-4 text-primary-600" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
              </label>
            ))}
          </div>
          {a1.pays_naissance === 'autre' && (
            <Input label="" value={a1.pays_naissance_autre} onChange={v => setA1(d => ({ ...d, pays_naissance_autre: v }))} placeholder="Preciser" className="mt-2" />
          )}
        </div>

        <div className="mb-4">
          <Input label="Date d'arrivee en France (si residence a l'etranger)" value={a1.date_arrivee_france}
            onChange={v => setA1(d => ({ ...d, date_arrivee_france: v }))} placeholder="JJ/MM/AAAA" />
        </div>

        <h3 className="text-md font-semibold text-gray-900 dark:text-white mt-6 mb-4">Adresse</h3>
        <div className="grid grid-cols-1 gap-4 mb-4">
          <Input label="Complement d'adresse (nom hebergeant si applicable)" value={a1.complement_adresse}
            onChange={v => setA1(d => ({ ...d, complement_adresse: v }))} />
          <Input label="Organisme d'hebergement (si applicable)" value={a1.organisme_hebergement}
            onChange={v => setA1(d => ({ ...d, organisme_hebergement: v }))} />
          <Input label="Adresse (numero et rue)" value={a1.adresse} onChange={v => setA1(d => ({ ...d, adresse: v }))} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <Input label="Code postal" value={a1.code_postal} onChange={v => setA1(d => ({ ...d, code_postal: v }))} />
          <Input label="Commune" value={a1.commune} onChange={v => setA1(d => ({ ...d, commune: v }))} />
          <Input label="Pays" value={a1.pays} onChange={v => setA1(d => ({ ...d, pays: v }))} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <Input label="Telephone" value={a1.telephone} onChange={v => setA1(d => ({ ...d, telephone: v }))} />
          <Input label="Adresse e-mail" value={a1.email} onChange={v => setA1(d => ({ ...d, email: v }))} />
        </div>

        {/* Preference contact */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Comment souhaitez-vous etre contacte par la MDPH ?
          </label>
          <div className="flex flex-wrap gap-4">
            {([
              ['contact_email', 'E-mail'],
              ['contact_appel', 'Appel telephonique'],
              ['contact_sms', 'SMS'],
              ['contact_courrier', 'Courrier'],
            ] as const).map(([key, label]) => (
              <label key={key} className="flex items-center gap-2">
                <input type="checkbox" checked={a1[key]} onChange={e => setA1(d => ({ ...d, [key]: e.target.checked }))}
                  className="w-4 h-4 text-primary-600 rounded border-gray-300" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Organismes */}
        <h3 className="text-md font-semibold text-gray-900 dark:text-white mt-6 mb-4">Organismes</h3>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Organisme payeur (prestations familiales/RSA)</label>
          <div className="flex flex-wrap gap-4">
            {([['caf', 'CAF'], ['msa', 'MSA'], ['autre', 'Autre']] as const).map(([val, label]) => (
              <label key={val} className="flex items-center gap-2">
                <input type="radio" name="organisme_payeur" checked={a1.organisme_payeur === val}
                  onChange={() => setA1(d => ({ ...d, organisme_payeur: val }))} className="w-4 h-4 text-primary-600" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <Input label="N° d'allocataire" value={a1.numero_allocataire} onChange={v => setA1(d => ({ ...d, numero_allocataire: v }))} />
          {a1.organisme_payeur === 'autre' && (
            <Input label="Preciser organisme" value={a1.organisme_payeur_autre} onChange={v => setA1(d => ({ ...d, organisme_payeur_autre: v }))} />
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Organisme d'assurance maladie</label>
          <div className="flex flex-wrap gap-4">
            {([['cpam', 'CPAM'], ['msa', 'MSA'], ['rsi', 'RSI'], ['autre', 'Autre']] as const).map(([val, label]) => (
              <label key={val} className="flex items-center gap-2">
                <input type="radio" name="organisme_maladie" checked={a1.organisme_maladie === val}
                  onChange={() => setA1(d => ({ ...d, organisme_maladie: val }))} className="w-4 h-4 text-primary-600" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
              </label>
            ))}
          </div>
          {a1.organisme_maladie === 'autre' && (
            <Input label="" value={a1.organisme_maladie_autre} onChange={v => setA1(d => ({ ...d, organisme_maladie_autre: v }))} placeholder="Preciser" className="mt-2" />
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="N° de Securite Sociale" value={a1.numero_secu} onChange={v => setA1(d => ({ ...d, numero_secu: v }))} placeholder="1 XX XX XX XXX XXX XX" />
          <Input label="N° Secu enfant (si concerne)" value={a1.numero_secu_enfant} onChange={v => setA1(d => ({ ...d, numero_secu_enfant: v }))} />
        </div>
      </div>

      {/* A2: Autorite parentale */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">A2 — Autorite parentale</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Pour les mineurs : delegation d'autorite parentale ou tutelle</p>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Qui exerce l'autorite parentale ?</label>
          <div className="flex flex-wrap gap-4">
            {([['parent1', 'Parent 1 / Representant legal 1'], ['parent2', 'Parent 2 / Representant legal 2'], ['les_deux', 'Les deux']] as const).map(([val, label]) => (
              <label key={val} className="flex items-center gap-2">
                <input type="radio" name="qui_exerce" checked={a2.qui_exerce === val}
                  onChange={() => setA2(d => ({ ...d, qui_exerce: val }))} className="w-4 h-4 text-primary-600" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {(a2.qui_exerce === 'parent1' || a2.qui_exerce === 'les_deux') && (
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Parent 1 / Representant legal 1</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input label="Nom" value={a2.parent1.nom} onChange={v => setA2(d => ({ ...d, parent1: { ...d.parent1, nom: v } }))} />
              <Input label="Prenom" value={a2.parent1.prenom} onChange={v => setA2(d => ({ ...d, parent1: { ...d.parent1, prenom: v } }))} />
              <Input label="Telephone" value={a2.parent1.telephone} onChange={v => setA2(d => ({ ...d, parent1: { ...d.parent1, telephone: v } }))} />
              <Input label="E-mail" value={a2.parent1.email} onChange={v => setA2(d => ({ ...d, parent1: { ...d.parent1, email: v } }))} />
              <Input label="Adresse" value={a2.parent1.adresse} onChange={v => setA2(d => ({ ...d, parent1: { ...d.parent1, adresse: v } }))} className="md:col-span-2" />
              <Input label="Code postal" value={a2.parent1.code_postal} onChange={v => setA2(d => ({ ...d, parent1: { ...d.parent1, code_postal: v } }))} />
              <Input label="Commune" value={a2.parent1.commune} onChange={v => setA2(d => ({ ...d, parent1: { ...d.parent1, commune: v } }))} />
            </div>
          </div>
        )}

        {(a2.qui_exerce === 'parent2' || a2.qui_exerce === 'les_deux') && (
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Parent 2 / Representant legal 2</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input label="Nom" value={a2.parent2.nom} onChange={v => setA2(d => ({ ...d, parent2: { ...d.parent2, nom: v } }))} />
              <Input label="Prenom" value={a2.parent2.prenom} onChange={v => setA2(d => ({ ...d, parent2: { ...d.parent2, prenom: v } }))} />
              <Input label="Telephone" value={a2.parent2.telephone} onChange={v => setA2(d => ({ ...d, parent2: { ...d.parent2, telephone: v } }))} />
              <Input label="E-mail" value={a2.parent2.email} onChange={v => setA2(d => ({ ...d, parent2: { ...d.parent2, email: v } }))} />
              <Input label="Adresse" value={a2.parent2.adresse} onChange={v => setA2(d => ({ ...d, parent2: { ...d.parent2, adresse: v } }))} className="md:col-span-2" />
              <Input label="Code postal" value={a2.parent2.code_postal} onChange={v => setA2(d => ({ ...d, parent2: { ...d.parent2, code_postal: v } }))} />
              <Input label="Commune" value={a2.parent2.commune} onChange={v => setA2(d => ({ ...d, parent2: { ...d.parent2, commune: v } }))} />
            </div>
          </div>
        )}
      </div>

      {/* Save button */}
      {(isDirty || justSaved) && (
        <div className="flex justify-end">
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
