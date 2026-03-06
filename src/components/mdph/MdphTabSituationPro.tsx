import { useState, useEffect } from 'react'
import { Check, Save } from 'lucide-react'
import type { MdphFormulaire, MdphD1SituationPro, MdphD2ParcoursPro, MdphD3ProjetPro } from '../../types/mdph'
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

export default function MdphTabSituationPro({ formulaire, onSave, saving }: Props) {
  const [d1, setD1] = useState<MdphD1SituationPro>(formulaire.section_d1_situation_pro)
  const [d2, setD2] = useState<MdphD2ParcoursPro>(formulaire.section_d2_parcours_pro)
  const [d3, setD3] = useState<MdphD3ProjetPro>(formulaire.section_d3_projet_pro)
  const [justSaved, setJustSaved] = useState(false)

  useEffect(() => {
    setD1(formulaire.section_d1_situation_pro)
    setD2(formulaire.section_d2_parcours_pro)
    setD3(formulaire.section_d3_projet_pro)
  }, [formulaire])

  const isDirty = JSON.stringify(d1) !== JSON.stringify(formulaire.section_d1_situation_pro) ||
    JSON.stringify(d2) !== JSON.stringify(formulaire.section_d2_parcours_pro) ||
    JSON.stringify(d3) !== JSON.stringify(formulaire.section_d3_projet_pro)

  const handleSave = async () => {
    await onSave({
      section_d1_situation_pro: d1,
      section_d2_parcours_pro: d2,
      section_d3_projet_pro: d3,
    })
    setJustSaved(true)
    setTimeout(() => setJustSaved(false), 2000)
  }

  return (
    <div className="space-y-6">
      {/* D1 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">D1 — Situation professionnelle</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Avez-vous un emploi ?</label>
          <div className="flex gap-4">
            {([true, false] as const).map(val => (
              <label key={String(val)} className="flex items-center gap-2">
                <input type="radio" name="a_emploi" checked={d1.a_emploi === val}
                  onChange={() => setD1(d => ({ ...d, a_emploi: val }))} className="w-4 h-4 text-primary-600" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{val ? 'Oui' : 'Non'}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Si en emploi */}
        {d1.a_emploi === true && (
          <div className="space-y-4 pl-4 border-l-2 border-primary-200 dark:border-primary-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">En emploi depuis le</label>
                <input type="date" value={d1.emploi_depuis} onChange={e => setD1(d => ({ ...d, emploi_depuis: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Intitule du poste</label>
                <input type="text" value={d1.emploi_intitule} onChange={e => setD1(d => ({ ...d, emploi_intitule: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white" />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Milieu</label>
              <div className="flex gap-4">
                {([['ordinaire', 'Ordinaire'], ['adapte', 'Adapte'], ['protege', 'Protege']] as const).map(([val, label]) => (
                  <label key={val} className="flex items-center gap-2">
                    <input type="radio" name="milieu" checked={d1.milieu === val}
                      onChange={() => setD1(d => ({ ...d, milieu: val }))} className="w-4 h-4 text-primary-600" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Temps de travail</label>
              <div className="flex gap-4">
                {([['complet', 'Temps complet'], ['partiel', 'Temps partiel']] as const).map(([val, label]) => (
                  <label key={val} className="flex items-center gap-2">
                    <input type="radio" name="temps" checked={d1.temps === val}
                      onChange={() => setD1(d => ({ ...d, temps: val }))} className="w-4 h-4 text-primary-600" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type de contrat</label>
              <div className="flex flex-wrap gap-3">
                {([['cdi', 'CDI'], ['cdd', 'CDD'], ['interim', 'Interim'], ['contrat_aide', 'Contrat aide']] as const).map(([val, label]) => (
                  <label key={val} className="flex items-center gap-2">
                    <input type="radio" name="type_contrat" checked={d1.type_contrat === val}
                      onChange={() => setD1(d => ({ ...d, type_contrat: val }))} className="w-4 h-4 text-primary-600" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom de l'employeur</label>
                <input type="text" value={d1.employeur_nom} onChange={e => setD1(d => ({ ...d, employeur_nom: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Adresse employeur</label>
                <input type="text" value={d1.employeur_adresse} onChange={e => setD1(d => ({ ...d, employeur_adresse: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white" />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Poste adapte au handicap ?</label>
              <div className="flex gap-4">
                {([true, false] as const).map(val => (
                  <label key={String(val)} className="flex items-center gap-2">
                    <input type="radio" name="adapte_handicap" checked={d1.adapte_handicap === val}
                      onChange={() => setD1(d => ({ ...d, adapte_handicap: val }))} className="w-4 h-4 text-primary-600" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{val ? 'Oui' : 'Non'}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Difficultes liees au handicap</label>
              <textarea value={d1.difficultes_handicap} onChange={e => setD1(d => ({ ...d, difficultes_handicap: e.target.value }))} rows={3}
                placeholder="Decrivez vos difficultes..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm" />
            </div>

            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Accompagnement</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
              <CheckItem label="Service de sante au travail" checked={d1.accompagnement_sante_travail} onChange={v => setD1(d => ({ ...d, accompagnement_sante_travail: v }))} />
              <CheckItem label="SAMETH" checked={d1.accompagnement_sameth} onChange={v => setD1(d => ({ ...d, accompagnement_sameth: v }))} />
              <CheckItem label="Amenagements du poste" checked={d1.amenagements_poste} onChange={v => setD1(d => ({ ...d, amenagements_poste: v }))} />
            </div>
            {d1.amenagements_poste && (
              <input type="text" value={d1.amenagements_detail} onChange={e => setD1(d => ({ ...d, amenagements_detail: e.target.value }))}
                placeholder="Preciser les amenagements" className="mb-4 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white" />
            )}

            <h3 className="text-md font-semibold text-gray-900 dark:text-white mt-4 mb-3">Arret de travail</h3>
            <CheckItem label="En arret de travail" checked={d1.en_arret} onChange={v => setD1(d => ({ ...d, en_arret: v }))} />
            {d1.en_arret && (
              <div className="ml-4 space-y-2 mt-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Depuis le</label>
                  <input type="date" value={d1.arret_depuis} onChange={e => setD1(d => ({ ...d, arret_depuis: e.target.value }))}
                    className="w-full max-w-xs px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <CheckItem label="Maladie avec IJ" checked={d1.arret_maladie_ij} onChange={v => setD1(d => ({ ...d, arret_maladie_ij: v }))} />
                  <CheckItem label="Maladie sans IJ" checked={d1.arret_maladie_sans_ij} onChange={v => setD1(d => ({ ...d, arret_maladie_sans_ij: v }))} />
                  <CheckItem label="Accident du travail" checked={d1.arret_accident_travail} onChange={v => setD1(d => ({ ...d, arret_accident_travail: v }))} />
                  <CheckItem label="Maternite" checked={d1.arret_maternite} onChange={v => setD1(d => ({ ...d, arret_maternite: v }))} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Si sans emploi */}
        {d1.a_emploi === false && (
          <div className="space-y-4 pl-4 border-l-2 border-primary-200 dark:border-primary-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sans emploi depuis le</label>
                <input type="date" value={d1.sans_emploi_depuis} onChange={e => setD1(d => ({ ...d, sans_emploi_depuis: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white" />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Avez-vous deja travaille ?</label>
              <div className="flex gap-4">
                {([true, false] as const).map(val => (
                  <label key={String(val)} className="flex items-center gap-2">
                    <input type="radio" name="deja_travaille" checked={d1.deja_travaille === val}
                      onChange={() => setD1(d => ({ ...d, deja_travaille: val }))} className="w-4 h-4 text-primary-600" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{val ? 'Oui' : 'Non'}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Raison de l'absence d'emploi</label>
              <textarea value={d1.raison_sans_emploi} onChange={e => setD1(d => ({ ...d, raison_sans_emploi: e.target.value }))} rows={3}
                placeholder="Preciser la raison..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm" />
            </div>

            <CheckItem label="Inscrit(e) a Pole Emploi" checked={d1.inscrit_pole_emploi} onChange={v => setD1(d => ({ ...d, inscrit_pole_emploi: v }))} />
            {d1.inscrit_pole_emploi && (
              <div className="ml-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Depuis le</label>
                <input type="date" value={d1.pole_emploi_depuis} onChange={e => setD1(d => ({ ...d, pole_emploi_depuis: e.target.value }))}
                  className="w-full max-w-xs px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white" />
              </div>
            )}

            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-4 mb-2">Accompagnement</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
              <CheckItem label="Mission locale" checked={d1.accompagnement_mission_locale} onChange={v => setD1(d => ({ ...d, accompagnement_mission_locale: v }))} />
              <CheckItem label="Cap emploi" checked={d1.accompagnement_cap_emploi} onChange={v => setD1(d => ({ ...d, accompagnement_cap_emploi: v }))} />
              <CheckItem label="Pole Emploi" checked={d1.accompagnement_pole_emploi} onChange={v => setD1(d => ({ ...d, accompagnement_pole_emploi: v }))} />
              <CheckItem label="Referent RSA" checked={d1.accompagnement_referent_rsa} onChange={v => setD1(d => ({ ...d, accompagnement_referent_rsa: v }))} />
            </div>
            <input type="text" value={d1.accompagnement_autre} onChange={e => setD1(d => ({ ...d, accompagnement_autre: e.target.value }))}
              placeholder="Autre accompagnement" className="mb-4 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white" />

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Beneficiez-vous de la RQTH ?</label>
              <div className="flex gap-4">
                {([true, false] as const).map(val => (
                  <label key={String(val)} className="flex items-center gap-2">
                    <input type="radio" name="beneficie_rqth" checked={d1.beneficie_rqth === val}
                      onChange={() => setD1(d => ({ ...d, beneficie_rqth: val }))} className="w-4 h-4 text-primary-600" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{val ? 'Oui' : 'Non'}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* D2 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">D2 — Parcours professionnel</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Experiences professionnelles</label>
          <textarea
            value={d2.experiences.map(e => `${e.annees} - ${e.intitule_poste} @ ${e.nom_entreprise} (${e.temps}) - ${e.motif_fin}`).join('\n')}
            onChange={e => {
              const lines = e.target.value.split('\n')
              setD2(d => ({ ...d, experiences: lines.map(l => ({ annees: '', intitule_poste: l, nom_entreprise: '', temps: '', motif_fin: '' })) }))
            }}
            rows={4}
            placeholder="Decrivez vos experiences (une par ligne)..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm" />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Niveau de qualification</label>
          <div className="flex flex-wrap gap-3">
            {([['primaire', 'Primaire'], ['secondaire', 'Secondaire'], ['superieur', 'Superieur']] as const).map(([val, label]) => (
              <label key={val} className="flex items-center gap-2">
                <input type="radio" name="niveau_qualification" checked={d2.niveau_qualification === val}
                  onChange={() => setD2(d => ({ ...d, niveau_qualification: val }))} className="w-4 h-4 text-primary-600" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Formations professionnelles</label>
          <textarea value={d2.formations_pro} onChange={e => setD2(d => ({ ...d, formations_pro: e.target.value }))} rows={3}
            placeholder="Formations suivies..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm" />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Diplomes obtenus</label>
          <textarea
            value={d2.diplomes.map(d => `${d.diplome} (${d.annee_obtention}) - ${d.domaine}`).join('\n')}
            onChange={e => {
              const lines = e.target.value.split('\n')
              setD2(d => ({ ...d, diplomes: lines.map(l => ({ diplome: l, annee_obtention: '', domaine: '' })) }))
            }}
            rows={3}
            placeholder="Diplomes (un par ligne)..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm" />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bilan de competences</label>
          <textarea value={d2.bilan_competences} onChange={e => setD2(d => ({ ...d, bilan_competences: e.target.value }))} rows={3}
            placeholder="Resultats du bilan de competences..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm" />
        </div>
      </div>

      {/* D3 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">D3 — Projet professionnel</h2>

        <div className="mb-4">
          <MdphAiSuggestionPanel
            section="projet_pro"
            contexte={{
              nom: formulaire.section_a1_identite.nom_naissance,
              prenom: formulaire.section_a1_identite.prenoms,
              situation_pro: d1.a_emploi ? `En emploi depuis ${d1.emploi_depuis}, ${d1.milieu}` : `Sans emploi depuis ${d1.sans_emploi_depuis}`,
              handicap_description: d1.difficultes_handicap || undefined,
              details: d2.formations_pro || undefined,
              texte_existant: d3.projets_detail || undefined,
            }}
            onAccept={text => setD3(d => ({ ...d, projets_detail: text }))}
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Detail du projet</label>
          <textarea value={d3.projets_detail} onChange={e => setD3(d => ({ ...d, projets_detail: e.target.value }))} rows={4}
            placeholder="Decrivez votre projet professionnel..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm" />
        </div>

        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Soutien souhaite</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
          <CheckItem label="Bilan des capacites" checked={d3.soutien_bilan_capacites} onChange={v => setD3(d => ({ ...d, soutien_bilan_capacites: v }))} />
          <CheckItem label="Preciser mon projet" checked={d3.soutien_preciser_projet} onChange={v => setD3(d => ({ ...d, soutien_preciser_projet: v }))} />
          <CheckItem label="Adapter l'environnement de travail" checked={d3.soutien_adapter_environnement} onChange={v => setD3(d => ({ ...d, soutien_adapter_environnement: v }))} />
          <CheckItem label="Acceder a un emploi" checked={d3.soutien_acceder_emploi} onChange={v => setD3(d => ({ ...d, soutien_acceder_emploi: v }))} />
          <CheckItem label="Acceder a une formation" checked={d3.soutien_acceder_formation} onChange={v => setD3(d => ({ ...d, soutien_acceder_formation: v }))} />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Structure identifiee</label>
          <input type="text" value={d3.structure_identifiee} onChange={e => setD3(d => ({ ...d, structure_identifiee: e.target.value }))}
            placeholder="Nom de la structure" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white" />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Autres renseignements</label>
          <textarea value={d3.autres_renseignements} onChange={e => setD3(d => ({ ...d, autres_renseignements: e.target.value }))} rows={4}
            placeholder="Informations complementaires sur le projet professionnel..."
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
