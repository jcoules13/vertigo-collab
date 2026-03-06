import { useState, useEffect } from 'react'
import { Check, Save } from 'lucide-react'
import type { MdphFormulaire, MdphF1SituationAidant, MdphF2AttentesAidant } from '../../types/mdph'

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

export default function MdphTabAidant({ formulaire, onSave, saving }: Props) {
  const [f1, setF1] = useState<MdphF1SituationAidant>(formulaire.section_f1_situation_aidant)
  const [f2, setF2] = useState<MdphF2AttentesAidant>(formulaire.section_f2_attentes_aidant)
  const [justSaved, setJustSaved] = useState(false)

  useEffect(() => {
    setF1(formulaire.section_f1_situation_aidant)
    setF2(formulaire.section_f2_attentes_aidant)
  }, [formulaire])

  const isDirty = JSON.stringify(f1) !== JSON.stringify(formulaire.section_f1_situation_aidant) ||
    JSON.stringify(f2) !== JSON.stringify(formulaire.section_f2_attentes_aidant)

  const handleSave = async () => {
    await onSave({
      section_f1_situation_aidant: f1,
      section_f2_attentes_aidant: f2,
    })
    setJustSaved(true)
    setTimeout(() => setJustSaved(false), 2000)
  }

  return (
    <div className="space-y-6">
      {/* F1 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">F1 — Situation de l'aidant familial</h2>

        <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-3">Identite de l'aidant</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom</label>
            <input type="text" value={f1.nom_aidant} onChange={e => setF1(d => ({ ...d, nom_aidant: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prenom</label>
            <input type="text" value={f1.prenom_aidant} onChange={e => setF1(d => ({ ...d, prenom_aidant: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date de naissance</label>
            <input type="date" value={f1.date_naissance_aidant} onChange={e => setF1(d => ({ ...d, date_naissance_aidant: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Adresse</label>
            <input type="text" value={f1.adresse_aidant} onChange={e => setF1(d => ({ ...d, adresse_aidant: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom de la personne aidee</label>
            <input type="text" value={f1.nom_personne_aidee} onChange={e => setF1(d => ({ ...d, nom_personne_aidee: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Lien avec la personne</label>
            <input type="text" value={f1.lien_avec_personne} onChange={e => setF1(d => ({ ...d, lien_avec_personne: e.target.value }))}
              placeholder="Parent, conjoint, enfant..." className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white" />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Vivez-vous avec la personne aidee ?</label>
          <div className="flex gap-4">
            {([true, false] as const).map(val => (
              <label key={String(val)} className="flex items-center gap-2">
                <input type="radio" name="vit_avec_personne" checked={f1.vit_avec_personne === val}
                  onChange={() => setF1(d => ({ ...d, vit_avec_personne: val }))} className="w-4 h-4 text-primary-600" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{val ? 'Oui' : 'Non'}</span>
              </label>
            ))}
          </div>
          {f1.vit_avec_personne === true && (
            <div className="mt-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Depuis</label>
              <input type="text" value={f1.vit_avec_depuis} onChange={e => setF1(d => ({ ...d, vit_avec_depuis: e.target.value }))}
                placeholder="Preciser la duree" className="w-full max-w-xs px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white" />
            </div>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Etes-vous en emploi ?</label>
          <div className="flex gap-4">
            {([true, false] as const).map(val => (
              <label key={String(val)} className="flex items-center gap-2">
                <input type="radio" name="en_emploi" checked={f1.en_emploi === val}
                  onChange={() => setF1(d => ({ ...d, en_emploi: val }))} className="w-4 h-4 text-primary-600" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{val ? 'Oui' : 'Non'}</span>
              </label>
            ))}
          </div>
          {f1.en_emploi === true && (
            <div className="mt-2">
              <CheckItem label="Reduction d'activite professionnelle" checked={f1.reduction_activite} onChange={v => setF1(d => ({ ...d, reduction_activite: v }))} />
            </div>
          )}
        </div>

        <h3 className="text-md font-semibold text-gray-900 dark:text-white mt-6 mb-3">Nature de l'aide apportee</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
          <CheckItem label="Surveillance reguliere" checked={f1.aide_surveillance} onChange={v => setF1(d => ({ ...d, aide_surveillance: v }))} />
          <CheckItem label="Deplacement a l'interieur" checked={f1.aide_deplacement_interieur} onChange={v => setF1(d => ({ ...d, aide_deplacement_interieur: v }))} />
          <CheckItem label="Deplacement a l'exterieur" checked={f1.aide_deplacement_exterieur} onChange={v => setF1(d => ({ ...d, aide_deplacement_exterieur: v }))} />
          <CheckItem label="Entretien du logement" checked={f1.aide_entretien_logement} onChange={v => setF1(d => ({ ...d, aide_entretien_logement: v }))} />
          <CheckItem label="Hygiene" checked={f1.aide_hygiene} onChange={v => setF1(d => ({ ...d, aide_hygiene: v }))} />
          <CheckItem label="Preparation des repas" checked={f1.aide_preparation_repas} onChange={v => setF1(d => ({ ...d, aide_preparation_repas: v }))} />
          <CheckItem label="Prise des repas" checked={f1.aide_prise_repas} onChange={v => setF1(d => ({ ...d, aide_prise_repas: v }))} />
          <CheckItem label="Suivi medical" checked={f1.aide_suivi_medical} onChange={v => setF1(d => ({ ...d, aide_suivi_medical: v }))} />
          <CheckItem label="Coordination des soins" checked={f1.aide_coordination} onChange={v => setF1(d => ({ ...d, aide_coordination: v }))} />
          <CheckItem label="Gestion administrative" checked={f1.aide_gestion_admin} onChange={v => setF1(d => ({ ...d, aide_gestion_admin: v }))} />
          <CheckItem label="Gestion financiere" checked={f1.aide_gestion_financiere} onChange={v => setF1(d => ({ ...d, aide_gestion_financiere: v }))} />
          <CheckItem label="Stimulation, soutien moral" checked={f1.aide_stimulation} onChange={v => setF1(d => ({ ...d, aide_stimulation: v }))} />
          <CheckItem label="Communication" checked={f1.aide_communication} onChange={v => setF1(d => ({ ...d, aide_communication: v }))} />
        </div>
        <input type="text" value={f1.aide_autre} onChange={e => setF1(d => ({ ...d, aide_autre: e.target.value }))}
          placeholder="Autre aide (preciser)" className="mb-4 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white" />

        <h3 className="text-md font-semibold text-gray-900 dark:text-white mt-6 mb-3">Qui participe a l'aide ?</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
          <CheckItem label="Professionnels" checked={f1.accompagnement_professionnels} onChange={v => setF1(d => ({ ...d, accompagnement_professionnels: v }))} />
          <CheckItem label="Proches" checked={f1.accompagnement_proches} onChange={v => setF1(d => ({ ...d, accompagnement_proches: v }))} />
          <CheckItem label="Seul(e)" checked={f1.accompagnement_seul} onChange={v => setF1(d => ({ ...d, accompagnement_seul: v }))} />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Etes-vous soutenu(e) dans votre role d'aidant ?</label>
          <div className="flex gap-4">
            {([true, false] as const).map(val => (
              <label key={String(val)} className="flex items-center gap-2">
                <input type="radio" name="soutenu" checked={f1.soutenu === val}
                  onChange={() => setF1(d => ({ ...d, soutenu: val }))} className="w-4 h-4 text-primary-600" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{val ? 'Oui' : 'Non'}</span>
              </label>
            ))}
          </div>
          {f1.soutenu === true && (
            <input type="text" value={f1.soutenu_detail} onChange={e => setF1(d => ({ ...d, soutenu_detail: e.target.value }))}
              placeholder="Par qui / comment ?" className="mt-2 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white" />
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Solution de remplacement en cas d'absence ?</label>
          <div className="flex gap-4">
            {([true, false] as const).map(val => (
              <label key={String(val)} className="flex items-center gap-2">
                <input type="radio" name="solution_remplacement" checked={f1.solution_remplacement === val}
                  onChange={() => setF1(d => ({ ...d, solution_remplacement: val }))} className="w-4 h-4 text-primary-600" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{val ? 'Oui' : 'Non'}</span>
              </label>
            ))}
          </div>
          {f1.solution_remplacement === true && (
            <input type="text" value={f1.solution_remplacement_detail} onChange={e => setF1(d => ({ ...d, solution_remplacement_detail: e.target.value }))}
              placeholder="Preciser la solution" className="mt-2 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white" />
          )}
        </div>
      </div>

      {/* F2 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">F2 — Attentes de l'aidant familial</h2>

        <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-3">Situations rencontrees</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
          <CheckItem label="Eloignement geographique" checked={f2.situation_eloignement} onChange={v => setF2(d => ({ ...d, situation_eloignement: v }))} />
          <CheckItem label="Indisponibilite" checked={f2.situation_indisponibilite} onChange={v => setF2(d => ({ ...d, situation_indisponibilite: v }))} />
          <CheckItem label="Changement personnel" checked={f2.situation_changement_personnel} onChange={v => setF2(d => ({ ...d, situation_changement_personnel: v }))} />
          <CheckItem label="Probleme de sante" checked={f2.situation_sante} onChange={v => setF2(d => ({ ...d, situation_sante: v }))} />
          <CheckItem label="Changement professionnel" checked={f2.situation_changement_pro} onChange={v => setF2(d => ({ ...d, situation_changement_pro: v }))} />
          <CheckItem label="Difficulte dans l'accompagnement" checked={f2.situation_difficulte_accompagnement} onChange={v => setF2(d => ({ ...d, situation_difficulte_accompagnement: v }))} />
        </div>
        <input type="text" value={f2.situation_autre} onChange={e => setF2(d => ({ ...d, situation_autre: e.target.value }))}
          placeholder="Autre situation (preciser)" className="mb-6 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white" />

        <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-3">Attentes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
          <CheckItem label="Repos au quotidien" checked={f2.attente_repos_quotidien} onChange={v => setF2(d => ({ ...d, attente_repos_quotidien: v }))} />
          <CheckItem label="Remplacement ponctuel (besoin prevu)" checked={f2.attente_remplacement_besoin} onChange={v => setF2(d => ({ ...d, attente_remplacement_besoin: v }))} />
          <CheckItem label="Remplacement imprevu" checked={f2.attente_remplacement_imprevu} onChange={v => setF2(d => ({ ...d, attente_remplacement_imprevu: v }))} />
          <CheckItem label="Remplacement vacances" checked={f2.attente_remplacement_vacances} onChange={v => setF2(d => ({ ...d, attente_remplacement_vacances: v }))} />
          <CheckItem label="Activite professionnelle" checked={f2.attente_activite_pro} onChange={v => setF2(d => ({ ...d, attente_activite_pro: v }))} />
          <CheckItem label="Maintien des liens sociaux" checked={f2.attente_liens_sociaux} onChange={v => setF2(d => ({ ...d, attente_liens_sociaux: v }))} />
          <CheckItem label="Contrepartie financiere" checked={f2.attente_contrepartie_financiere} onChange={v => setF2(d => ({ ...d, attente_contrepartie_financiere: v }))} />
          <CheckItem label="Echange avec d'autres aidants" checked={f2.attente_echange_aidants} onChange={v => setF2(d => ({ ...d, attente_echange_aidants: v }))} />
          <CheckItem label="Echange avec des professionnels" checked={f2.attente_echange_professionnels} onChange={v => setF2(d => ({ ...d, attente_echange_professionnels: v }))} />
          <CheckItem label="Soutien psychologique" checked={f2.attente_soutien_psychologique} onChange={v => setF2(d => ({ ...d, attente_soutien_psychologique: v }))} />
          <CheckItem label="Conseil sur le handicap" checked={f2.attente_conseil_handicap} onChange={v => setF2(d => ({ ...d, attente_conseil_handicap: v }))} />
          <CheckItem label="Assurance vieillesse" checked={f2.attente_assurance_vieillesse} onChange={v => setF2(d => ({ ...d, attente_assurance_vieillesse: v }))} />
        </div>
        <input type="text" value={f2.attente_autre} onChange={e => setF2(d => ({ ...d, attente_autre: e.target.value }))}
          placeholder="Autre attente (preciser)" className="mb-6 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white" />

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Structure identifiee</label>
          <input type="text" value={f2.structure_identifiee} onChange={e => setF2(d => ({ ...d, structure_identifiee: e.target.value }))}
            placeholder="Nom de la structure" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white" />
        </div>

        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Souhaitez-vous connaitre les dispositifs ?</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
          <CheckItem label="Pour vous (aidant)" checked={f2.connaitre_dispositifs_pour_vous} onChange={v => setF2(d => ({ ...d, connaitre_dispositifs_pour_vous: v }))} />
          <CheckItem label="Pour la personne aidee" checked={f2.connaitre_dispositifs_pour_personne} onChange={v => setF2(d => ({ ...d, connaitre_dispositifs_pour_personne: v }))} />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Autres renseignements</label>
          <textarea value={f2.autres_renseignements} onChange={e => setF2(d => ({ ...d, autres_renseignements: e.target.value }))} rows={4}
            placeholder="Informations complementaires..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm" />
        </div>
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
