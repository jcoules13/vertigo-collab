import { useState, useEffect } from 'react'
import { Check, Save } from 'lucide-react'
import type { MdphFormulaire, MdphC1SituationScolaire, MdphC2BesoinsScolaires, MdphC3AttentesScolaires } from '../../types/mdph'

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

export default function MdphTabVieScolaire({ formulaire, onSave, saving }: Props) {
  const [c1, setC1] = useState<MdphC1SituationScolaire>(formulaire.section_c1_situation_scolaire)
  const [c2, setC2] = useState<MdphC2BesoinsScolaires>(formulaire.section_c2_besoins_scolaires)
  const [c3, setC3] = useState<MdphC3AttentesScolaires>(formulaire.section_c3_attentes_scolaires)
  const [justSaved, setJustSaved] = useState(false)

  useEffect(() => {
    setC1(formulaire.section_c1_situation_scolaire)
    setC2(formulaire.section_c2_besoins_scolaires)
    setC3(formulaire.section_c3_attentes_scolaires)
  }, [formulaire])

  const isDirty = JSON.stringify(c1) !== JSON.stringify(formulaire.section_c1_situation_scolaire) ||
    JSON.stringify(c2) !== JSON.stringify(formulaire.section_c2_besoins_scolaires) ||
    JSON.stringify(c3) !== JSON.stringify(formulaire.section_c3_attentes_scolaires)

  const handleSave = async () => {
    await onSave({
      section_c1_situation_scolaire: c1,
      section_c2_besoins_scolaires: c2,
      section_c3_attentes_scolaires: c3,
    })
    setJustSaved(true)
    setTimeout(() => setJustSaved(false), 2000)
  }

  return (
    <div className="space-y-6">
      {/* C1 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">C1 — Situation scolaire ou universitaire</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type de scolarisation</label>
          <div className="flex flex-wrap gap-3">
            {([
              ['milieu_ordinaire', 'Milieu ordinaire'],
              ['domicile', 'A domicile'],
              ['accompagnement_medico_social', 'Accompagnement medico-social'],
              ['temps_partage_medico_social', 'Temps partage medico-social'],
              ['temps_partage_soin', 'Temps partage soin'],
              ['formation_superieure', 'Formation superieure'],
              ['autre', 'Autre'],
            ] as const).map(([val, label]) => (
              <label key={val} className="flex items-center gap-2">
                <input type="radio" name="type_scolarisation" checked={c1.type_scolarisation === val}
                  onChange={() => setC1(d => ({ ...d, type_scolarisation: val }))} className="w-4 h-4 text-primary-600" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
              </label>
            ))}
          </div>
          {c1.type_scolarisation === 'autre' && (
            <input type="text" value={c1.type_scolarisation_autre} onChange={e => setC1(d => ({ ...d, type_scolarisation_autre: e.target.value }))}
              placeholder="Preciser" className="mt-2 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white" />
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Etablissements frequentes</label>
          <textarea value={c1.etablissements} onChange={e => setC1(d => ({ ...d, etablissements: e.target.value }))} rows={3}
            placeholder="Nom(s) et adresse(s) des etablissements..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Depuis le</label>
            <input type="date" value={c1.depuis_le} onChange={e => setC1(d => ({ ...d, depuis_le: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white" />
          </div>
        </div>

        <h3 className="text-md font-semibold text-gray-900 dark:text-white mt-6 mb-3">Etudiant</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type d'etudes</label>
            <input type="text" value={c1.etudiant_type_etudes} onChange={e => setC1(d => ({ ...d, etudiant_type_etudes: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Diplomes obtenus</label>
            <input type="text" value={c1.etudiant_diplomes_obtenus} onChange={e => setC1(d => ({ ...d, etudiant_diplomes_obtenus: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Diplomes prepares</label>
            <input type="text" value={c1.etudiant_diplomes_prepares} onChange={e => setC1(d => ({ ...d, etudiant_diplomes_prepares: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom de l'etablissement</label>
            <input type="text" value={c1.etudiant_etablissement_nom} onChange={e => setC1(d => ({ ...d, etudiant_etablissement_nom: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Adresse etablissement</label>
            <input type="text" value={c1.etudiant_etablissement_rue} onChange={e => setC1(d => ({ ...d, etudiant_etablissement_rue: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ville etablissement</label>
            <input type="text" value={c1.etudiant_etablissement_ville} onChange={e => setC1(d => ({ ...d, etudiant_etablissement_ville: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white" />
          </div>
        </div>

        <h3 className="text-md font-semibold text-gray-900 dark:text-white mt-6 mb-3">Soins</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
          <CheckItem label="Soins hospitaliers" checked={c1.soins_hospitaliers} onChange={v => setC1(d => ({ ...d, soins_hospitaliers: v }))} />
          <CheckItem label="Soins en liberal" checked={c1.soins_liberal} onChange={v => setC1(d => ({ ...d, soins_liberal: v }))} />
        </div>
        <div className="mb-4">
          <input type="text" value={c1.soins_autre} onChange={e => setC1(d => ({ ...d, soins_autre: e.target.value }))}
            placeholder="Autre soins (preciser)" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white" />
        </div>

        <h3 className="text-md font-semibold text-gray-900 dark:text-white mt-6 mb-3">Adaptations mises en place</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
          <CheckItem label="Adaptation pedagogique" checked={c1.adaptation_pedagogique} onChange={v => setC1(d => ({ ...d, adaptation_pedagogique: v }))} />
          <CheckItem label="Aide a la communication" checked={c1.adaptation_communication} onChange={v => setC1(d => ({ ...d, adaptation_communication: v }))} />
          <CheckItem label="Aide informatique" checked={c1.adaptation_informatique} onChange={v => setC1(d => ({ ...d, adaptation_informatique: v }))} />
          <CheckItem label="Deficience auditive" checked={c1.adaptation_deficience_auditive} onChange={v => setC1(d => ({ ...d, adaptation_deficience_auditive: v }))} />
          <CheckItem label="Deficience visuelle" checked={c1.adaptation_deficience_visuelle} onChange={v => setC1(d => ({ ...d, adaptation_deficience_visuelle: v }))} />
          <CheckItem label="Mobilier adapte" checked={c1.adaptation_mobilier} onChange={v => setC1(d => ({ ...d, adaptation_mobilier: v }))} />
          <CheckItem label="Transport adapte" checked={c1.adaptation_transport} onChange={v => setC1(d => ({ ...d, adaptation_transport: v }))} />
        </div>
        <div className="mb-4">
          <input type="text" value={c1.adaptation_autre} onChange={e => setC1(d => ({ ...d, adaptation_autre: e.target.value }))}
            placeholder="Autre adaptation (preciser)" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white" />
        </div>

        <h3 className="text-md font-semibold text-gray-900 dark:text-white mt-6 mb-3">Aide humaine</h3>
        <CheckItem label="Aide humaine aupres de l'eleve" checked={c1.aide_humaine_eleve} onChange={v => setC1(d => ({ ...d, aide_humaine_eleve: v }))} />
        {c1.aide_humaine_eleve && (
          <textarea value={c1.aide_humaine_detail} onChange={e => setC1(d => ({ ...d, aide_humaine_detail: e.target.value }))} rows={2}
            placeholder="Preciser l'aide humaine..."
            className="mt-2 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm" />
        )}
      </div>

      {/* C2 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">C2 — Besoins en milieu scolaire</h2>

        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Apprentissages</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
          <CheckItem label="Lire" checked={c2.apprentissage_lire} onChange={v => setC2(d => ({ ...d, apprentissage_lire: v }))} />
          <CheckItem label="Ecrire" checked={c2.apprentissage_ecrire} onChange={v => setC2(d => ({ ...d, apprentissage_ecrire: v }))} />
          <CheckItem label="Calculer" checked={c2.apprentissage_calculer} onChange={v => setC2(d => ({ ...d, apprentissage_calculer: v }))} />
          <CheckItem label="Comprendre" checked={c2.apprentissage_comprendre} onChange={v => setC2(d => ({ ...d, apprentissage_comprendre: v }))} />
          <CheckItem label="S'organiser" checked={c2.apprentissage_organiser} onChange={v => setC2(d => ({ ...d, apprentissage_organiser: v }))} />
          <CheckItem label="Utiliser le materiel" checked={c2.apprentissage_materiel} onChange={v => setC2(d => ({ ...d, apprentissage_materiel: v }))} />
        </div>
        <input type="text" value={c2.apprentissage_autre} onChange={e => setC2(d => ({ ...d, apprentissage_autre: e.target.value }))}
          placeholder="Autre besoin d'apprentissage" className="mb-4 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white" />

        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Communication et relations</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
          <CheckItem label="S'exprimer, communiquer" checked={c2.communication_exprimer} onChange={v => setC2(d => ({ ...d, communication_exprimer: v }))} />
          <CheckItem label="Relations avec les autres" checked={c2.communication_relations} onChange={v => setC2(d => ({ ...d, communication_relations: v }))} />
          <CheckItem label="Assurer sa securite" checked={c2.communication_securite} onChange={v => setC2(d => ({ ...d, communication_securite: v }))} />
        </div>
        <input type="text" value={c2.communication_autre} onChange={e => setC2(d => ({ ...d, communication_autre: e.target.value }))}
          placeholder="Autre besoin de communication" className="mb-4 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white" />

        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Entretien personnel</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
          <CheckItem label="Hygiene" checked={c2.entretien_hygiene} onChange={v => setC2(d => ({ ...d, entretien_hygiene: v }))} />
          <CheckItem label="Prise des repas" checked={c2.entretien_repas} onChange={v => setC2(d => ({ ...d, entretien_repas: v }))} />
          <CheckItem label="S'habiller" checked={c2.entretien_habiller} onChange={v => setC2(d => ({ ...d, entretien_habiller: v }))} />
          <CheckItem label="Prendre soin de sa sante" checked={c2.entretien_sante} onChange={v => setC2(d => ({ ...d, entretien_sante: v }))} />
        </div>
        <input type="text" value={c2.entretien_autre} onChange={e => setC2(d => ({ ...d, entretien_autre: e.target.value }))}
          placeholder="Autre besoin d'entretien" className="mb-4 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white" />

        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Deplacement</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
          <CheckItem label="A l'interieur de l'etablissement" checked={c2.deplacement_interieur} onChange={v => setC2(d => ({ ...d, deplacement_interieur: v }))} />
          <CheckItem label="A l'exterieur de l'etablissement" checked={c2.deplacement_exterieur} onChange={v => setC2(d => ({ ...d, deplacement_exterieur: v }))} />
          <CheckItem label="Transports scolaires" checked={c2.deplacement_transports} onChange={v => setC2(d => ({ ...d, deplacement_transports: v }))} />
        </div>
        <input type="text" value={c2.deplacement_autre} onChange={e => setC2(d => ({ ...d, deplacement_autre: e.target.value }))}
          placeholder="Autre besoin de deplacement" className="mb-2 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white" />
      </div>

      {/* C3 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">C3 — Attentes pour la scolarite</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
          <CheckItem label="Adaptation de la scolarite" checked={c3.souhait_adaptation_scolarite} onChange={v => setC3(d => ({ ...d, souhait_adaptation_scolarite: v }))} />
          <CheckItem label="Orientation differente" checked={c3.souhait_orientation_differente} onChange={v => setC3(d => ({ ...d, souhait_orientation_differente: v }))} />
          <CheckItem label="Aide humaine" checked={c3.souhait_aide_humaine} onChange={v => setC3(d => ({ ...d, souhait_aide_humaine: v }))} />
          <CheckItem label="Aide materielle" checked={c3.souhait_aide_materielle} onChange={v => setC3(d => ({ ...d, souhait_aide_materielle: v }))} />
          <CheckItem label="Accompagnement / readaptation" checked={c3.souhait_accompagnement_readaptation} onChange={v => setC3(d => ({ ...d, souhait_accompagnement_readaptation: v }))} />
          <CheckItem label="Etablissement sans hebergement" checked={c3.souhait_etablissement_sans_hebergement} onChange={v => setC3(d => ({ ...d, souhait_etablissement_sans_hebergement: v }))} />
          <CheckItem label="Etablissement avec hebergement" checked={c3.souhait_etablissement_avec_hebergement} onChange={v => setC3(d => ({ ...d, souhait_etablissement_avec_hebergement: v }))} />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Autre souhait</label>
          <input type="text" value={c3.souhait_autre} onChange={e => setC3(d => ({ ...d, souhait_autre: e.target.value }))}
            placeholder="Preciser" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white" />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Etablissement identifie</label>
          <input type="text" value={c3.etablissement_identifie} onChange={e => setC3(d => ({ ...d, etablissement_identifie: e.target.value }))}
            placeholder="Nom de l'etablissement" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white" />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Autres renseignements</label>
          <textarea value={c3.autres_renseignements} onChange={e => setC3(d => ({ ...d, autres_renseignements: e.target.value }))} rows={4}
            placeholder="Informations complementaires sur la scolarite..."
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
