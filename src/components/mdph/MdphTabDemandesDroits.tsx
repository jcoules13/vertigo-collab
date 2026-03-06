import { useState, useEffect } from 'react'
import { Check, Save } from 'lucide-react'
import type { MdphFormulaire, MdphEDemandes } from '../../types/mdph'
import MdphAiSuggestionPanel from './MdphAiSuggestionPanel'

interface Props {
  formulaire: MdphFormulaire
  onSave: (updates: Partial<MdphFormulaire>) => Promise<void>
  saving: boolean
}

const CheckItem = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) => (
  <label className="flex items-start gap-2 py-1">
    <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)}
      className="mt-0.5 w-4 h-4 text-primary-600 rounded border-gray-300" />
    <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
  </label>
)

export default function MdphTabDemandesDroits({ formulaire, onSave, saving }: Props) {
  const [dem, setDem] = useState<MdphEDemandes>(formulaire.section_e_demandes)
  const [justSaved, setJustSaved] = useState(false)

  useEffect(() => {
    setDem(formulaire.section_e_demandes)
  }, [formulaire])

  const isDirty = JSON.stringify(dem) !== JSON.stringify(formulaire.section_e_demandes)

  const handleSave = async () => {
    await onSave({ section_e_demandes: dem })
    setJustSaved(true)
    setTimeout(() => setJustSaved(false), 2000)
  }

  return (
    <div className="space-y-6">
      {/* E1 — Moins de 20 ans */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">E1 — Expression des demandes de droits</h2>

        <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-3">Moins de 20 ans</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-6">
          <CheckItem label="AEEH (Allocation d'education de l'enfant handicape)" checked={dem.demande_aeeh} onChange={v => setDem(d => ({ ...d, demande_aeeh: v }))} />
          <CheckItem label="PCH (Prestation de compensation du handicap) — Enfant" checked={dem.demande_pch_enfant} onChange={v => setDem(d => ({ ...d, demande_pch_enfant: v }))} />
          <CheckItem label="CMI Invalidite — Enfant" checked={dem.demande_cmi_invalidite_enfant} onChange={v => setDem(d => ({ ...d, demande_cmi_invalidite_enfant: v }))} />
          <CheckItem label="CMI Stationnement — Enfant" checked={dem.demande_cmi_stationnement_enfant} onChange={v => setDem(d => ({ ...d, demande_cmi_stationnement_enfant: v }))} />
          <CheckItem label="AVPF (Assurance vieillesse du parent au foyer) — Enfant" checked={dem.demande_avpf_enfant} onChange={v => setDem(d => ({ ...d, demande_avpf_enfant: v }))} />
        </div>

        <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-3">Plus de 20 ans</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
          <CheckItem label="AAH (Allocation aux adultes handicapes)" checked={dem.demande_aah} onChange={v => setDem(d => ({ ...d, demande_aah: v }))} />
          <CheckItem label="Complement de ressources" checked={dem.demande_complement_ressources} onChange={v => setDem(d => ({ ...d, demande_complement_ressources: v }))} />
          <CheckItem label="Orientation ESMS adultes" checked={dem.demande_esms_adultes} onChange={v => setDem(d => ({ ...d, demande_esms_adultes: v }))} />
          <CheckItem label="Amendement Creton" checked={dem.demande_creton} onChange={v => setDem(d => ({ ...d, demande_creton: v }))} />
          <CheckItem label="ACTP (Allocation compensatrice pour tierce personne)" checked={dem.demande_actp} onChange={v => setDem(d => ({ ...d, demande_actp: v }))} />
          <CheckItem label="ACFP (Allocation compensatrice pour frais pro)" checked={dem.demande_acfp} onChange={v => setDem(d => ({ ...d, demande_acfp: v }))} />
          <CheckItem label="PCH (Prestation de compensation du handicap) — Adulte" checked={dem.demande_pch_adulte} onChange={v => setDem(d => ({ ...d, demande_pch_adulte: v }))} />
          <CheckItem label="CMI Invalidite — Adulte" checked={dem.demande_cmi_invalidite_adulte} onChange={v => setDem(d => ({ ...d, demande_cmi_invalidite_adulte: v }))} />
          <CheckItem label="CMI Stationnement — Adulte" checked={dem.demande_cmi_stationnement_adulte} onChange={v => setDem(d => ({ ...d, demande_cmi_stationnement_adulte: v }))} />
          <CheckItem label="AVPF (Assurance vieillesse du parent au foyer) — Adulte" checked={dem.demande_avpf_adulte} onChange={v => setDem(d => ({ ...d, demande_avpf_adulte: v }))} />
        </div>
      </div>

      {/* E2 — Scolarisation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">E2 — Demande relative a la scolarisation</h2>

        <CheckItem label="Demande relative a un parcours de scolarisation" checked={dem.demande_scolarisation} onChange={v => setDem(d => ({ ...d, demande_scolarisation: v }))} />
        {dem.demande_scolarisation && (
          <textarea value={dem.demande_scolarisation_detail} onChange={e => setDem(d => ({ ...d, demande_scolarisation_detail: e.target.value }))} rows={3}
            placeholder="Precisez votre demande de scolarisation..."
            className="mt-2 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm" />
        )}
      </div>

      {/* E3 — Travail */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">E3 — Demande relative au travail</h2>

        <CheckItem label="Reconnaissance de la qualite de travailleur handicape (RQTH)" checked={dem.demande_rqth} onChange={v => setDem(d => ({ ...d, demande_rqth: v }))} />

        <div className="mt-4">
          <CheckItem label="Orientation professionnelle" checked={dem.demande_orientation_pro} onChange={v => setDem(d => ({ ...d, demande_orientation_pro: v }))} />
          {dem.demande_orientation_pro && (
            <div className="ml-6 mt-2 space-y-1">
              <CheckItem label="CRP / CPO / UEROS (Centre de reeducation / pre-orientation)" checked={dem.orientation_crp_cpo_ueros} onChange={v => setDem(d => ({ ...d, orientation_crp_cpo_ueros: v }))} />
              <CheckItem label="ESAT (Etablissement et service d'aide par le travail)" checked={dem.orientation_esat} onChange={v => setDem(d => ({ ...d, orientation_esat: v }))} />
              <CheckItem label="Marche du travail" checked={dem.orientation_marche_travail} onChange={v => setDem(d => ({ ...d, orientation_marche_travail: v }))} />
              <CheckItem label="Emploi accompagne" checked={dem.orientation_emploi_accompagne} onChange={v => setDem(d => ({ ...d, orientation_emploi_accompagne: v }))} />
            </div>
          )}
        </div>
      </div>

      {/* AI Recommendations */}
      <MdphAiSuggestionPanel
        section="demandes"
        label="Recommandations IA — Droits a demander"
        contexte={{
          nom: formulaire.section_a1_identite.nom_naissance,
          prenom: formulaire.section_a1_identite.prenoms,
          date_naissance: formulaire.section_a1_identite.date_naissance,
          situation_logement: formulaire.section_b1_vie_quotidienne.vous_vivez,
          situation_pro: formulaire.section_d1_situation_pro.a_emploi ? 'En emploi' : formulaire.section_d1_situation_pro.sans_emploi_depuis ? `Sans emploi depuis ${formulaire.section_d1_situation_pro.sans_emploi_depuis}` : undefined,
          droits_actuels: [
            dem.demande_aah && 'AAH', dem.demande_rqth && 'RQTH', dem.demande_pch_adulte && 'PCH',
            dem.demande_aeeh && 'AEEH', dem.demande_cmi_invalidite_adulte && 'CMI invalidite',
          ].filter(Boolean).join(', ') || 'Aucun droit coche',
          besoins: formulaire.section_b_texte_libre || undefined,
        }}
        onAccept={() => {/* recommendations are informational, user checks boxes manually */}}
      />

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
