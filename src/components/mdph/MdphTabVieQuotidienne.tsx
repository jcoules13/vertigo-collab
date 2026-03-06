import { useState, useEffect } from 'react'
import { Check, Save } from 'lucide-react'
import type { MdphFormulaire, MdphB1VieQuotidienne, MdphB2BesoinsQuotidiens, MdphB3BesoinsDeplacementSocial } from '../../types/mdph'
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

export default function MdphTabVieQuotidienne({ formulaire, onSave, saving }: Props) {
  const [b1, setB1] = useState<MdphB1VieQuotidienne>(formulaire.section_b1_vie_quotidienne)
  const [b2, setB2] = useState<MdphB2BesoinsQuotidiens>(formulaire.section_b2_besoins_quotidiens)
  const [b3, setB3] = useState<MdphB3BesoinsDeplacementSocial>(formulaire.section_b3_besoins_deplacement_social)
  const [texteLibre, setTexteLibre] = useState(formulaire.section_b_texte_libre)
  const [justSaved, setJustSaved] = useState(false)

  useEffect(() => {
    setB1(formulaire.section_b1_vie_quotidienne)
    setB2(formulaire.section_b2_besoins_quotidiens)
    setB3(formulaire.section_b3_besoins_deplacement_social)
    setTexteLibre(formulaire.section_b_texte_libre)
  }, [formulaire])

  const isDirty = JSON.stringify(b1) !== JSON.stringify(formulaire.section_b1_vie_quotidienne) ||
    JSON.stringify(b2) !== JSON.stringify(formulaire.section_b2_besoins_quotidiens) ||
    JSON.stringify(b3) !== JSON.stringify(formulaire.section_b3_besoins_deplacement_social) ||
    texteLibre !== formulaire.section_b_texte_libre

  const handleSave = async () => {
    await onSave({
      section_b1_vie_quotidienne: b1,
      section_b2_besoins_quotidiens: b2,
      section_b3_besoins_deplacement_social: b3,
      section_b_texte_libre: texteLibre,
    })
    setJustSaved(true)
    setTimeout(() => setJustSaved(false), 2000)
  }

  return (
    <div className="space-y-6">
      {/* B1 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">B1 — Votre vie quotidienne</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Vous vivez</label>
          <div className="flex flex-wrap gap-3">
            {([['seul', 'Seul(e)'], ['couple', 'En couple'], ['parents', 'Avec vos parents'], ['enfants', 'Avec vos enfants'], ['autre', 'Autre']] as const).map(([val, label]) => (
              <label key={val} className="flex items-center gap-2">
                <input type="radio" name="vous_vivez" checked={b1.vous_vivez === val}
                  onChange={() => setB1(d => ({ ...d, vous_vivez: val }))} className="w-4 h-4 text-primary-600" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
              </label>
            ))}
          </div>
          {b1.vous_vivez === 'autre' && (
            <input type="text" value={b1.vous_vivez_autre} onChange={e => setB1(d => ({ ...d, vous_vivez_autre: e.target.value }))}
              placeholder="Preciser" className="mt-2 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white" />
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ou vivez-vous ?</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <CheckItem label="Logement independant - Proprietaire" checked={b1.logement_proprietaire} onChange={v => setB1(d => ({ ...d, logement_independant: true, logement_proprietaire: v }))} />
            <CheckItem label="Logement independant - Locataire" checked={b1.logement_locataire} onChange={v => setB1(d => ({ ...d, logement_independant: true, logement_locataire: v }))} />
            <CheckItem label="Heberge chez parents" checked={b1.heberge_parents} onChange={v => setB1(d => ({ ...d, heberge_parents: v }))} />
            <CheckItem label="Heberge chez enfants" checked={b1.heberge_enfants} onChange={v => setB1(d => ({ ...d, heberge_enfants: v }))} />
            <CheckItem label="Heberge chez ami(e)" checked={b1.heberge_ami} onChange={v => setB1(d => ({ ...d, heberge_ami: v }))} />
            <CheckItem label="Famille d'accueil" checked={b1.heberge_famille_accueil} onChange={v => setB1(d => ({ ...d, heberge_famille_accueil: v }))} />
            <CheckItem label="Etablissement medico-social ou de soin" checked={b1.etablissement_medico_social} onChange={v => setB1(d => ({ ...d, etablissement_medico_social: v }))} />
          </div>
        </div>

        <h3 className="text-md font-semibold text-gray-900 dark:text-white mt-6 mb-3">Aides et ressources</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
          <CheckItem label="AAH" checked={b1.recoit_aah} onChange={v => setB1(d => ({ ...d, recoit_aah: v }))} />
          <CheckItem label="RSA" checked={b1.recoit_rsa} onChange={v => setB1(d => ({ ...d, recoit_rsa: v }))} />
          <CheckItem label="Allocation chomage" checked={b1.recoit_chomage} onChange={v => setB1(d => ({ ...d, recoit_chomage: v }))} />
          <CheckItem label="ASS" checked={b1.recoit_ass} onChange={v => setB1(d => ({ ...d, recoit_ass: v }))} />
          <CheckItem label="Revenu d'activite (12 mois)" checked={b1.revenu_activite_12mois} onChange={v => setB1(d => ({ ...d, revenu_activite_12mois: v }))} />
          <CheckItem label="Revenu ESAT (12 mois)" checked={b1.revenu_esat_12mois} onChange={v => setB1(d => ({ ...d, revenu_esat_12mois: v }))} />
          <CheckItem label="Indemnites journalieres" checked={b1.indemnites_journalieres} onChange={v => setB1(d => ({ ...d, indemnites_journalieres: v }))} />
          <CheckItem label="Pension de retraite" checked={b1.pension_retraite} onChange={v => setB1(d => ({ ...d, pension_retraite: v }))} />
          <CheckItem label="Beneficiaire APA" checked={b1.beneficiaire_apa} onChange={v => setB1(d => ({ ...d, beneficiaire_apa: v }))} />
          <CheckItem label="Beneficiaire ASPA" checked={b1.beneficiaire_aspa} onChange={v => setB1(d => ({ ...d, beneficiaire_aspa: v }))} />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Pension d'invalidite</label>
          <div className="flex gap-4">
            {(['', '1', '2', '3'] as const).map(cat => (
              <label key={cat || 'none'} className="flex items-center gap-2">
                <input type="radio" name="pension_invalidite" checked={b1.pension_invalidite === cat}
                  onChange={() => setB1(d => ({ ...d, pension_invalidite: cat }))} className="w-4 h-4 text-primary-600" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{cat ? `${cat}e categorie` : 'Aucune'}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* B2 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">B2 — Besoins dans la vie quotidienne</h2>

        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Besoins pour la vie a domicile</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-6">
          <CheckItem label="Regler les depenses courantes" checked={b2.besoin_depenses_courantes} onChange={v => setB2(d => ({ ...d, besoin_depenses_courantes: v }))} />
          <CheckItem label="Gerer son budget / demarches admin" checked={b2.besoin_budget_admin} onChange={v => setB2(d => ({ ...d, besoin_budget_admin: v }))} />
          <CheckItem label="Hygiene corporelle" checked={b2.besoin_hygiene} onChange={v => setB2(d => ({ ...d, besoin_hygiene: v }))} />
          <CheckItem label="S'habiller" checked={b2.besoin_habiller} onChange={v => setB2(d => ({ ...d, besoin_habiller: v }))} />
          <CheckItem label="Prendre soin de sa sante" checked={b2.besoin_sante} onChange={v => setB2(d => ({ ...d, besoin_sante: v }))} />
          <CheckItem label="Faire les courses" checked={b2.besoin_courses} onChange={v => setB2(d => ({ ...d, besoin_courses: v }))} />
          <CheckItem label="Preparer les repas" checked={b2.besoin_preparer_repas} onChange={v => setB2(d => ({ ...d, besoin_preparer_repas: v }))} />
          <CheckItem label="Prendre les repas" checked={b2.besoin_prendre_repas} onChange={v => setB2(d => ({ ...d, besoin_prendre_repas: v }))} />
          <CheckItem label="Menage et entretien vetements" checked={b2.besoin_menage} onChange={v => setB2(d => ({ ...d, besoin_menage: v }))} />
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Aides actuelles</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
          <CheckItem label="Aide technique / materiel" checked={b2.aide_technique} onChange={v => setB2(d => ({ ...d, aide_technique: v }))} />
          <CheckItem label="Amenagement logement" checked={b2.aide_amenagement_logement} onChange={v => setB2(d => ({ ...d, aide_amenagement_logement: v }))} />
          <CheckItem label="Amenagement vehicule" checked={b2.aide_amenagement_vehicule} onChange={v => setB2(d => ({ ...d, aide_amenagement_vehicule: v }))} />
          <CheckItem label="Aide animaliere" checked={b2.aide_animaliere} onChange={v => setB2(d => ({ ...d, aide_animaliere: v }))} />
          <CheckItem label="Aide humaine - Famille" checked={b2.aide_humaine_famille} onChange={v => setB2(d => ({ ...d, aide_humaine_famille: v }))} />
          <CheckItem label="Aide humaine - Professionnel soins" checked={b2.aide_humaine_pro_soins} onChange={v => setB2(d => ({ ...d, aide_humaine_pro_soins: v }))} />
          <CheckItem label="Aide humaine - Accompagnement medico-social" checked={b2.aide_humaine_medico_social} onChange={v => setB2(d => ({ ...d, aide_humaine_medico_social: v }))} />
        </div>
      </div>

      {/* B3 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">B3 — Besoins pour se deplacer et vie sociale</h2>

        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Besoins pour se deplacer</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
          <CheckItem label="Se deplacer dans le domicile" checked={b3.deplacement_interieur} onChange={v => setB3(d => ({ ...d, deplacement_interieur: v }))} />
          <CheckItem label="Sortir / entrer du domicile" checked={b3.deplacement_sortir_entrer} onChange={v => setB3(d => ({ ...d, deplacement_sortir_entrer: v }))} />
          <CheckItem label="Se deplacer a l'exterieur" checked={b3.deplacement_exterieur} onChange={v => setB3(d => ({ ...d, deplacement_exterieur: v }))} />
          <CheckItem label="Utiliser un vehicule" checked={b3.deplacement_vehicule} onChange={v => setB3(d => ({ ...d, deplacement_vehicule: v }))} />
          <CheckItem label="Transports en commun" checked={b3.deplacement_transports_commun} onChange={v => setB3(d => ({ ...d, deplacement_transports_commun: v }))} />
          <CheckItem label="Partir en vacances" checked={b3.deplacement_vacances} onChange={v => setB3(d => ({ ...d, deplacement_vacances: v }))} />
        </div>

        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Besoins pour la vie sociale</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
          <CheckItem label="S'exprimer, se faire comprendre" checked={b3.social_exprimer} onChange={v => setB3(d => ({ ...d, social_exprimer: v }))} />
          <CheckItem label="Activites sportives et loisirs" checked={b3.social_activites_loisirs} onChange={v => setB3(d => ({ ...d, social_activites_loisirs: v }))} />
          <CheckItem label="Relations avec les autres" checked={b3.social_relations} onChange={v => setB3(d => ({ ...d, social_relations: v }))} />
          <CheckItem label="S'occuper de sa famille" checked={b3.social_famille} onChange={v => setB3(d => ({ ...d, social_famille: v }))} />
          <CheckItem label="Vie citoyenne" checked={b3.social_vie_citoyenne} onChange={v => setB3(d => ({ ...d, social_vie_citoyenne: v }))} />
          <CheckItem label="Assurer sa securite" checked={b3.social_securite} onChange={v => setB3(d => ({ ...d, social_securite: v }))} />
        </div>

        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Vos souhaits pour compenser le handicap</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
          <CheckItem label="Vivre a domicile" checked={b3.souhait_vivre_domicile} onChange={v => setB3(d => ({ ...d, souhait_vivre_domicile: v }))} />
          <CheckItem label="Vivre en etablissement" checked={b3.souhait_vivre_etablissement} onChange={v => setB3(d => ({ ...d, souhait_vivre_etablissement: v }))} />
          <CheckItem label="Amenagement du lieu de vie" checked={b3.souhait_amenagement_lieu} onChange={v => setB3(d => ({ ...d, souhait_amenagement_lieu: v }))} />
          <CheckItem label="Aide humaine" checked={b3.souhait_aide_humaine} onChange={v => setB3(d => ({ ...d, souhait_aide_humaine: v }))} />
          <CheckItem label="Aide pour se deplacer" checked={b3.souhait_aide_deplacement} onChange={v => setB3(d => ({ ...d, souhait_aide_deplacement: v }))} />
          <CheckItem label="Materiel ou equipement" checked={b3.souhait_materiel_equipement} onChange={v => setB3(d => ({ ...d, souhait_materiel_equipement: v }))} />
          <CheckItem label="Aide financiere (depenses handicap)" checked={b3.souhait_aide_financiere_handicap} onChange={v => setB3(d => ({ ...d, souhait_aide_financiere_handicap: v }))} />
          <CheckItem label="Aide financiere (revenu minimum)" checked={b3.souhait_aide_financiere_revenu} onChange={v => setB3(d => ({ ...d, souhait_aide_financiere_revenu: v }))} />
          <CheckItem label="Accompagnement readaptation" checked={b3.souhait_accompagnement_readaptation} onChange={v => setB3(d => ({ ...d, souhait_accompagnement_readaptation: v }))} />
          <CheckItem label="Accueil temporaire" checked={b3.souhait_accueil_temporaire} onChange={v => setB3(d => ({ ...d, souhait_accueil_temporaire: v }))} />
          <CheckItem label="Bilan des capacites" checked={b3.souhait_bilan_capacites} onChange={v => setB3(d => ({ ...d, souhait_bilan_capacites: v }))} />
          <CheckItem label="Aide animaliere" checked={b3.souhait_aide_animaliere} onChange={v => setB3(d => ({ ...d, souhait_aide_animaliere: v }))} />
        </div>
      </div>

      {/* Texte libre */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Autres renseignements — Vie quotidienne</h2>
        <div className="mb-4">
          <MdphAiSuggestionPanel
            section="vie_quotidienne"
            contexte={{
              nom: formulaire.section_a1_identite.nom_naissance,
              prenom: formulaire.section_a1_identite.prenoms,
              date_naissance: formulaire.section_a1_identite.date_naissance,
              situation_logement: b1.vous_vivez,
              ressources: [b1.recoit_aah && 'AAH', b1.recoit_rsa && 'RSA', b1.recoit_chomage && 'Chomage', b1.revenu_activite_12mois && 'Revenus activite'].filter(Boolean).join(', ') || undefined,
              besoins: [
                b2.besoin_menage && 'menage', b2.besoin_courses && 'courses', b2.besoin_preparer_repas && 'repas',
                b2.besoin_hygiene && 'hygiene', b2.besoin_habiller && 'habillage', b2.besoin_sante && 'sante',
              ].filter(Boolean).join(', ') || undefined,
              texte_existant: texteLibre || undefined,
            }}
            onAccept={text => setTexteLibre(text)}
          />
        </div>
        <textarea value={texteLibre} onChange={e => setTexteLibre(e.target.value)} rows={8}
          placeholder="Vous avez d'autres renseignements importants (situation, attentes, projets) concernant votre vie quotidienne, indiquez-les ici..."
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm" />
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
