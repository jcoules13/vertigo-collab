// =============================================================================
// Types pour le module MDPH - Cerfa 15692*01
// =============================================================================

// --- Page de garde ---
export interface MdphPageGarde {
  premiere_demande: boolean
  situation_changee: boolean
  reevaluation: boolean
  renouvellement_identique: boolean
  aidant_familial: boolean
  dossier_existant: boolean
  dossier_departement: string
  dossier_numero: string
}

// --- A1: Identite ---
export interface MdphA1Identite {
  sexe: 'homme' | 'femme' | ''
  nom_naissance: string
  nom_usage: string
  prenoms: string
  date_naissance: string
  nationalite: 'francaise' | 'eee_suisse' | 'autre'
  nationalite_autre: string
  commune_naissance: string
  pays_naissance: 'france' | 'autre'
  pays_naissance_autre: string
  departement_naissance: string
  date_arrivee_france: string
  complement_adresse: string
  organisme_hebergement: string
  adresse: string
  code_postal: string
  commune: string
  pays: string
  telephone: string
  email: string
  contact_email: boolean
  contact_appel: boolean
  contact_sms: boolean
  contact_courrier: boolean
  organisme_payeur: 'caf' | 'msa' | 'autre' | ''
  organisme_payeur_autre: string
  numero_allocataire: string
  organisme_maladie: 'cpam' | 'msa' | 'rsi' | 'autre' | ''
  organisme_maladie_autre: string
  numero_secu: string
  numero_secu_enfant: string
}

// --- A2: Autorite parentale ---
export interface MdphRepresentantLegal {
  nom: string
  prenom: string
  date_naissance: string
  adresse: string
  complement_adresse: string
  code_postal: string
  commune: string
  pays: string
  telephone: string
  email: string
}

export interface MdphA2AutoriteParentale {
  qui_exerce: 'parent1' | 'parent2' | 'les_deux' | ''
  parent1: MdphRepresentantLegal
  parent2: MdphRepresentantLegal
}

// --- A3: Aide dans les demarches ---
export interface MdphA3AideDemarches {
  type_aide: 'proche' | 'association' | 'autre' | ''
  nom_association: string
  nom_prenom_personne: string
  adresse: string
  complement_adresse: string
  code_postal: string
  commune: string
  telephone: string
  email: string
}

// --- A4: Mesure de protection ---
export interface MdphProtecteur {
  type_mesure: string
  nom_organisme: string
  nom_personne: string
  date_naissance: string
  adresse: string
  complement_adresse: string
  code_postal: string
  commune: string
  telephone: string
  email: string
}

export interface MdphA4MesureProtection {
  a_mesure: boolean
  representant1: MdphProtecteur
  representant2: MdphProtecteur
}

// --- A5: Situation urgente ---
export interface MdphA5Urgence {
  ne_peut_vivre_domicile: boolean
  ecole_ne_peut_accueillir: boolean
  sortie_hospitalisation: boolean
  risque_perte_travail: boolean
  nouvel_emploi_formation: boolean
  date_entree_prevue: string
  explication: string
  fin_droits_imminente: boolean
  droits_concernes: string
}

// --- A Documents obligatoires ---
export interface MdphADocuments {
  certificat_medical: boolean
  justificatif_identite: boolean
  justificatif_domicile: boolean
  jugement_protection: boolean
  difficulte_certificat: boolean
  difficulte_certificat_detail: string
}

// --- A Signature ---
export interface MdphASignature {
  date_signature: string
  signataire: 'personne_concernee' | 'representant_legal' | 'deux_parents' | ''
  accepte_echange_professionnels: boolean | null
  certification_honneur: boolean
  procedure_simplifiee: boolean
}

// --- B1: Vie quotidienne ---
export interface MdphB1VieQuotidienne {
  vous_vivez: 'seul' | 'couple' | 'parents' | 'enfants' | 'autre' | ''
  vous_vivez_autre: string
  logement_independant: boolean
  logement_proprietaire: boolean
  logement_locataire: boolean
  heberge_parents: boolean
  heberge_enfants: boolean
  heberge_ami: boolean
  heberge_famille: boolean
  heberge_famille_accueil: boolean
  etablissement_medico_social: boolean
  etablissement_nom: string
  autre_situation: string
  accident_tiers: boolean
  accident_travail: boolean
  accident_autre: boolean
  accident_autre_detail: string
  indemnisation_en_cours: boolean | null
  indemnisation_organisme: string
  recoit_aah: boolean
  recoit_rsa: boolean
  recoit_chomage: boolean
  recoit_ass: boolean
  revenu_activite_12mois: boolean
  revenu_esat_12mois: boolean
  indemnites_journalieres: boolean
  ij_du: string
  ij_au: string
  pension_invalidite: '' | '1' | '2' | '3'
  pension_invalidite_depuis: string
  autres_pensions: boolean
  majoration_tierce_personne: boolean
  allocation_supplementaire_invalidite: boolean
  rente_accident_maladie_pro: boolean
  prestation_tierce_personne: boolean
  retraite_inaptitude_depuis: string
  taux_ipp: string
  pension_retraite: boolean
  retraite_depuis: string
  beneficiaire_aspa: boolean
  demande_pension_retraite: boolean
  beneficiaire_apa: boolean
}

// --- B2: Besoins quotidiens ---
export interface MdphFraisHandicap {
  frais: string
  frequence: string
  montant_total: string
  montant_rembourse: string
  precisions: string
}

export interface MdphB2BesoinsQuotidiens {
  besoin_depenses_courantes: boolean
  besoin_budget_admin: boolean
  besoin_hygiene: boolean
  besoin_habiller: boolean
  besoin_sante: boolean
  besoin_courses: boolean
  besoin_preparer_repas: boolean
  besoin_prendre_repas: boolean
  besoin_menage: boolean
  besoin_autre: string
  aide_technique: boolean
  aide_amenagement_logement: boolean
  aide_amenagement_vehicule: boolean
  aide_animaliere: boolean
  aide_technique_detail: string
  aide_technique_autres: string
  aide_humaine_famille: boolean
  aide_humaine_pro_soins: boolean
  aide_humaine_medico_social: boolean
  aide_humaine_autres: string
  presence_enfant_temps_partiel: boolean | null
  presence_enfant_heures_semaine: string
  presence_enfant_heures_an: string
  presence_enfant_quotite: string
  frais_handicap: MdphFraisHandicap[]
}

// --- B3: Besoins deplacement + vie sociale + attentes ---
export interface MdphB3BesoinsDeplacementSocial {
  deplacement_interieur: boolean
  deplacement_sortir_entrer: boolean
  deplacement_exterieur: boolean
  deplacement_vehicule: boolean
  deplacement_transports_commun: boolean
  deplacement_vacances: boolean
  transports_adaptes: boolean | null
  deplacement_autre: string
  social_exprimer: boolean
  social_activites_loisirs: boolean
  social_relations: boolean
  social_famille: boolean
  social_vie_citoyenne: boolean
  social_securite: boolean
  social_autre: string
  souhait_vivre_domicile: boolean
  souhait_vivre_etablissement: boolean
  souhait_amenagement_lieu: boolean
  souhait_aide_humaine: boolean
  souhait_aide_deplacement: boolean
  souhait_materiel_equipement: boolean
  souhait_aide_financiere_handicap: boolean
  souhait_accompagnement_readaptation: boolean
  souhait_accueil_temporaire: boolean
  souhait_aide_animaliere: boolean
  souhait_bilan_capacites: boolean
  souhait_aide_financiere_revenu: boolean
  souhait_autre: string
  etablissement_identifie: boolean | null
  etablissement_nom1: string
  etablissement_contact1: boolean | null
  etablissement_nom2: string
  etablissement_contact2: boolean | null
}

// --- C1: Situation scolaire ---
export interface MdphEmploiDuTemps {
  [jour: string]: { matinee: string; midi: string; apres_midi: string; soiree_nuit: string }
}

export interface MdphParcoursScolaire {
  annees: string
  etablissement: string
}

export interface MdphC1SituationScolaire {
  scolarise: boolean | null
  type_scolarisation: 'milieu_ordinaire' | 'domicile' | 'accompagnement_medico_social' | 'temps_partage_medico_social' | 'temps_partage_soin' | 'formation_superieure' | 'autre' | ''
  type_scolarisation_autre: string
  etablissements: string
  depuis_le: string
  internat_pris_en_charge: boolean | null
  non_scolarise_trop_jeune: boolean
  non_scolarise_sans_solution: boolean
  non_scolarise_a_partir: string
  non_scolarise_preciser: string
  etudiant_type_etudes: string
  etudiant_diplomes_obtenus: string
  etudiant_diplomes_prepares: string
  etudiant_etablissement_nom: string
  etudiant_etablissement_rue: string
  etudiant_etablissement_ville: string
  etudiant_depuis: string
  parcours: MdphParcoursScolaire[]
  soins_hospitaliers: boolean
  soins_liberal: boolean
  soins_autre: string
  adaptation_pedagogique: boolean
  adaptation_communication: boolean
  adaptation_informatique: boolean
  adaptation_deficience_auditive: boolean
  adaptation_deficience_visuelle: boolean
  adaptation_mobilier: boolean
  adaptation_transport: boolean
  adaptation_autre: string
  aide_humaine_eleve: boolean
  aide_humaine_detail: string
  emploi_du_temps: MdphEmploiDuTemps
}

// --- C2: Besoins scolaires ---
export interface MdphC2BesoinsScolaires {
  apprentissage_lire: boolean
  apprentissage_ecrire: boolean
  apprentissage_calculer: boolean
  apprentissage_comprendre: boolean
  apprentissage_organiser: boolean
  apprentissage_materiel: boolean
  apprentissage_autre: string
  communication_exprimer: boolean
  communication_relations: boolean
  communication_securite: boolean
  communication_autre: string
  entretien_hygiene: boolean
  entretien_repas: boolean
  entretien_habiller: boolean
  entretien_sante: boolean
  entretien_autre: string
  deplacement_interieur: boolean
  deplacement_exterieur: boolean
  deplacement_transports: boolean
  deplacement_autre: string
}

// --- C3: Attentes scolaires ---
export interface MdphC3AttentesScolaires {
  souhait_adaptation_scolarite: boolean
  souhait_orientation_differente: boolean
  souhait_aide_humaine: boolean
  souhait_aide_materielle: boolean
  souhait_accompagnement_readaptation: boolean
  souhait_etablissement_sans_hebergement: boolean
  souhait_etablissement_avec_hebergement: boolean
  souhait_autre: string
  etablissement_identifie: string
  etablissement_contact: boolean | null
  pas_contact_enseignant_raison: string
  autres_renseignements: string
}

// --- D1: Situation professionnelle ---
export interface MdphD1SituationPro {
  a_emploi: boolean | null
  emploi_depuis: string
  milieu: 'ordinaire' | 'adapte' | 'protege' | ''
  emploi_intitule: string
  temps: 'complet' | 'partiel' | ''
  type_contrat: 'cdi' | 'cdd' | 'interim' | 'contrat_aide' | ''
  employeur_nom: string
  employeur_adresse: string
  adapte_handicap: boolean | null
  adapte_handicap_non_detail: string
  difficultes_handicap: string
  stagiaire_formation: boolean
  stagiaire_remunere: boolean | null
  stagiaire_organisme: string
  travailleur_independant: boolean
  travailleur_independant_regime: string
  accompagnement_sante_travail: boolean
  accompagnement_sameth: boolean
  amenagements_poste: boolean
  amenagements_detail: string
  en_arret: boolean
  arret_depuis: string
  arret_maladie_ij: boolean
  arret_maladie_sans_ij: boolean
  arret_accident_travail: boolean
  arret_maternite: boolean
  rencontre_service_social: boolean | null
  rencontre_service_social_date: string
  rencontre_medecin_travail: boolean | null
  rencontre_medecin_travail_date: string
  sans_emploi: boolean | null
  sans_emploi_depuis: string
  deja_travaille: boolean | null
  raison_sans_emploi: string
  inscrit_pole_emploi: boolean
  pole_emploi_depuis: string
  en_formation_continue: boolean
  formation_continue_detail: string
  etudiant: boolean
  accompagnement_mission_locale: boolean
  accompagnement_cap_emploi: boolean
  accompagnement_pole_emploi: boolean
  accompagnement_referent_rsa: boolean
  accompagnement_autre: string
  prestation_agefiph: boolean
  prestation_fiphfp: boolean
  beneficie_rqth: boolean | null
}

// --- D2: Parcours professionnel ---
export interface MdphExperiencePro {
  annees: string
  intitule_poste: string
  nom_entreprise: string
  temps: string
  motif_fin: string
}

export interface MdphDiplome {
  diplome: string
  annee_obtention: string
  domaine: string
}

export interface MdphD2ParcoursPro {
  experiences: MdphExperiencePro[]
  niveau_qualification: 'primaire' | 'secondaire' | 'superieur' | ''
  derniere_classe: string
  formations_pro: string
  diplomes: MdphDiplome[]
  bilan_competences: string
}

// --- D3: Projet professionnel ---
export interface MdphD3ProjetPro {
  a_projet: string
  projets_detail: string
  soutien_bilan_capacites: boolean
  soutien_preciser_projet: boolean
  soutien_adapter_environnement: boolean
  soutien_acceder_emploi: boolean
  soutien_acceder_formation: boolean
  structure_identifiee: string
  structure_contact: boolean | null
  autres_renseignements: string
}

// --- E: Expression des demandes ---
export interface MdphEDemandes {
  // Moins de 20 ans
  demande_aeeh: boolean
  demande_pch_enfant: boolean
  demande_cmi_invalidite_enfant: boolean
  demande_cmi_stationnement_enfant: boolean
  demande_avpf_enfant: boolean
  // Plus de 20 ans
  demande_aah: boolean
  demande_complement_ressources: boolean
  demande_esms_adultes: boolean
  demande_creton: boolean
  demande_actp: boolean
  demande_acfp: boolean
  demande_pch_adulte: boolean
  demande_cmi_invalidite_adulte: boolean
  demande_cmi_stationnement_adulte: boolean
  demande_avpf_adulte: boolean
  // Vie scolaire
  demande_scolarisation: boolean
  demande_scolarisation_detail: string
  // Travail
  demande_rqth: boolean
  demande_orientation_pro: boolean
  orientation_crp_cpo_ueros: boolean
  orientation_esat: boolean
  orientation_marche_travail: boolean
  orientation_emploi_accompagne: boolean
}

// --- F1: Situation aidant ---
export interface MdphF1SituationAidant {
  nom_aidant: string
  prenom_aidant: string
  date_naissance_aidant: string
  adresse_aidant: string
  nom_personne_aidee: string
  lien_avec_personne: string
  vit_avec_personne: boolean | null
  vit_avec_depuis: string
  en_emploi: boolean | null
  reduction_activite: boolean
  aide_surveillance: boolean
  aide_deplacement_interieur: boolean
  aide_deplacement_exterieur: boolean
  aide_entretien_logement: boolean
  aide_hygiene: boolean
  aide_preparation_repas: boolean
  aide_prise_repas: boolean
  aide_suivi_medical: boolean
  aide_coordination: boolean
  aide_gestion_admin: boolean
  aide_gestion_financiere: boolean
  aide_stimulation: boolean
  aide_communication: boolean
  aide_autre: string
  accompagnement_professionnels: boolean
  accompagnement_proches: boolean
  accompagnement_seul: boolean
  soutenu: boolean | null
  soutenu_detail: string
  solution_remplacement: boolean | null
  solution_remplacement_detail: string
}

// --- F2: Attentes aidant ---
export interface MdphF2AttentesAidant {
  situation_eloignement: boolean
  situation_indisponibilite: boolean
  situation_changement_personnel: boolean
  situation_sante: boolean
  situation_changement_pro: boolean
  situation_difficulte_accompagnement: boolean
  situation_autre: string
  attente_repos_quotidien: boolean
  attente_remplacement_besoin: boolean
  attente_remplacement_imprevu: boolean
  attente_remplacement_vacances: boolean
  attente_activite_pro: boolean
  attente_liens_sociaux: boolean
  attente_contrepartie_financiere: boolean
  attente_echange_aidants: boolean
  attente_echange_professionnels: boolean
  attente_soutien_psychologique: boolean
  attente_conseil_handicap: boolean
  attente_assurance_vieillesse: boolean
  attente_autre: string
  structure_identifiee: string
  connaitre_dispositifs_pour_vous: boolean
  connaitre_dispositifs_pour_personne: boolean
  autres_renseignements: string
}

// --- AI Suggestions ---
export interface MdphAiSuggestions {
  vie_quotidienne_suggestion?: string
  projet_pro_suggestion?: string
  demandes_suggestion?: string
  generated_at?: string
  model_used?: string
}

// --- Statut ---
export type MdphStatut = 'brouillon' | 'en_cours' | 'a_relire' | 'pret' | 'envoye'

export const MDPH_STATUT_LABELS: Record<MdphStatut, string> = {
  brouillon: 'Brouillon',
  en_cours: 'En cours',
  a_relire: 'À relire',
  pret: 'Prêt',
  envoye: 'Envoyé',
}

export const MDPH_STATUT_COLORS: Record<MdphStatut, string> = {
  brouillon: 'bg-gray-100 text-gray-700',
  en_cours: 'bg-blue-100 text-blue-700',
  a_relire: 'bg-yellow-100 text-yellow-700',
  pret: 'bg-green-100 text-green-700',
  envoye: 'bg-teal-100 text-teal-700',
}

// --- Formulaire principal ---
export interface MdphFormulaire {
  id: string
  dossier_id: string | null
  usager_nom: string
  usager_prenom: string | null
  statut: MdphStatut
  section_page_garde: MdphPageGarde
  section_a1_identite: MdphA1Identite
  section_a2_autorite_parentale: MdphA2AutoriteParentale
  section_a3_aide_demarches: MdphA3AideDemarches
  section_a4_mesure_protection: MdphA4MesureProtection
  section_a5_urgence: MdphA5Urgence
  section_a_documents: MdphADocuments
  section_a_signature: MdphASignature
  section_b1_vie_quotidienne: MdphB1VieQuotidienne
  section_b2_besoins_quotidiens: MdphB2BesoinsQuotidiens
  section_b3_besoins_deplacement_social: MdphB3BesoinsDeplacementSocial
  section_b_texte_libre: string
  section_c1_situation_scolaire: MdphC1SituationScolaire
  section_c2_besoins_scolaires: MdphC2BesoinsScolaires
  section_c3_attentes_scolaires: MdphC3AttentesScolaires
  section_d1_situation_pro: MdphD1SituationPro
  section_d2_parcours_pro: MdphD2ParcoursPro
  section_d3_projet_pro: MdphD3ProjetPro
  section_e_demandes: MdphEDemandes
  section_f1_situation_aidant: MdphF1SituationAidant
  section_f2_attentes_aidant: MdphF2AttentesAidant
  ai_suggestions: MdphAiSuggestions
  pdf_generated_at: string | null
  pdf_storage_path: string | null
  cree_par: string
  responsable_id: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

// --- Piece jointe ---
export interface MdphPieceJointe {
  id: string
  formulaire_id: string
  type_piece: string
  nom_fichier: string | null
  storage_path: string | null
  statut: 'manquant' | 'fourni' | 'a_renouveler'
  notes: string | null
  created_at: string
  updated_at: string
}

// =============================================================================
// Valeurs par defaut
// =============================================================================

export const DEFAULT_PAGE_GARDE: MdphPageGarde = {
  premiere_demande: false,
  situation_changee: false,
  reevaluation: false,
  renouvellement_identique: false,
  aidant_familial: false,
  dossier_existant: false,
  dossier_departement: '',
  dossier_numero: '',
}

const DEFAULT_REPRESENTANT: MdphRepresentantLegal = {
  nom: '', prenom: '', date_naissance: '', adresse: '',
  complement_adresse: '', code_postal: '', commune: '', pays: '',
  telephone: '', email: '',
}

const DEFAULT_PROTECTEUR: MdphProtecteur = {
  type_mesure: '', nom_organisme: '', nom_personne: '', date_naissance: '',
  adresse: '', complement_adresse: '', code_postal: '', commune: '',
  telephone: '', email: '',
}

export const DEFAULT_A1_IDENTITE: MdphA1Identite = {
  sexe: '', nom_naissance: '', nom_usage: '', prenoms: '', date_naissance: '',
  nationalite: 'francaise', nationalite_autre: '',
  commune_naissance: '', pays_naissance: 'france', pays_naissance_autre: '',
  departement_naissance: '', date_arrivee_france: '',
  complement_adresse: '', organisme_hebergement: '',
  adresse: '', code_postal: '', commune: '', pays: 'France',
  telephone: '', email: '',
  contact_email: false, contact_appel: false, contact_sms: false, contact_courrier: false,
  organisme_payeur: '', organisme_payeur_autre: '', numero_allocataire: '',
  organisme_maladie: '', organisme_maladie_autre: '',
  numero_secu: '', numero_secu_enfant: '',
}

export const DEFAULT_A2_AUTORITE_PARENTALE: MdphA2AutoriteParentale = {
  qui_exerce: '',
  parent1: { ...DEFAULT_REPRESENTANT },
  parent2: { ...DEFAULT_REPRESENTANT },
}

export const DEFAULT_A3_AIDE_DEMARCHES: MdphA3AideDemarches = {
  type_aide: '', nom_association: '', nom_prenom_personne: '',
  adresse: '', complement_adresse: '', code_postal: '', commune: '',
  telephone: '', email: '',
}

export const DEFAULT_A4_MESURE_PROTECTION: MdphA4MesureProtection = {
  a_mesure: false,
  representant1: { ...DEFAULT_PROTECTEUR },
  representant2: { ...DEFAULT_PROTECTEUR },
}

export const DEFAULT_A5_URGENCE: MdphA5Urgence = {
  ne_peut_vivre_domicile: false, ecole_ne_peut_accueillir: false,
  sortie_hospitalisation: false, risque_perte_travail: false,
  nouvel_emploi_formation: false, date_entree_prevue: '', explication: '',
  fin_droits_imminente: false, droits_concernes: '',
}

export const DEFAULT_A_DOCUMENTS: MdphADocuments = {
  certificat_medical: false, justificatif_identite: false,
  justificatif_domicile: false, jugement_protection: false,
  difficulte_certificat: false, difficulte_certificat_detail: '',
}

export const DEFAULT_A_SIGNATURE: MdphASignature = {
  date_signature: '', signataire: '', accepte_echange_professionnels: null,
  certification_honneur: false, procedure_simplifiee: false,
}

export const DEFAULT_B1_VIE_QUOTIDIENNE: MdphB1VieQuotidienne = {
  vous_vivez: '', vous_vivez_autre: '',
  logement_independant: false, logement_proprietaire: false, logement_locataire: false,
  heberge_parents: false, heberge_enfants: false, heberge_ami: false,
  heberge_famille: false, heberge_famille_accueil: false,
  etablissement_medico_social: false, etablissement_nom: '', autre_situation: '',
  accident_tiers: false, accident_travail: false, accident_autre: false,
  accident_autre_detail: '', indemnisation_en_cours: null, indemnisation_organisme: '',
  recoit_aah: false, recoit_rsa: false, recoit_chomage: false, recoit_ass: false,
  revenu_activite_12mois: false, revenu_esat_12mois: false,
  indemnites_journalieres: false, ij_du: '', ij_au: '',
  pension_invalidite: '', pension_invalidite_depuis: '',
  autres_pensions: false, majoration_tierce_personne: false,
  allocation_supplementaire_invalidite: false, rente_accident_maladie_pro: false,
  prestation_tierce_personne: false, retraite_inaptitude_depuis: '', taux_ipp: '',
  pension_retraite: false, retraite_depuis: '',
  beneficiaire_aspa: false, demande_pension_retraite: false, beneficiaire_apa: false,
}

export const DEFAULT_B2_BESOINS_QUOTIDIENS: MdphB2BesoinsQuotidiens = {
  besoin_depenses_courantes: false, besoin_budget_admin: false,
  besoin_hygiene: false, besoin_habiller: false, besoin_sante: false,
  besoin_courses: false, besoin_preparer_repas: false,
  besoin_prendre_repas: false, besoin_menage: false, besoin_autre: '',
  aide_technique: false, aide_amenagement_logement: false,
  aide_amenagement_vehicule: false, aide_animaliere: false,
  aide_technique_detail: '', aide_technique_autres: '',
  aide_humaine_famille: false, aide_humaine_pro_soins: false,
  aide_humaine_medico_social: false, aide_humaine_autres: '',
  presence_enfant_temps_partiel: null,
  presence_enfant_heures_semaine: '', presence_enfant_heures_an: '',
  presence_enfant_quotite: '', frais_handicap: [],
}

export const DEFAULT_B3_BESOINS_DEPLACEMENT_SOCIAL: MdphB3BesoinsDeplacementSocial = {
  deplacement_interieur: false, deplacement_sortir_entrer: false,
  deplacement_exterieur: false, deplacement_vehicule: false,
  deplacement_transports_commun: false, deplacement_vacances: false,
  transports_adaptes: null, deplacement_autre: '',
  social_exprimer: false, social_activites_loisirs: false,
  social_relations: false, social_famille: false,
  social_vie_citoyenne: false, social_securite: false, social_autre: '',
  souhait_vivre_domicile: false, souhait_vivre_etablissement: false,
  souhait_amenagement_lieu: false, souhait_aide_humaine: false,
  souhait_aide_deplacement: false, souhait_materiel_equipement: false,
  souhait_aide_financiere_handicap: false, souhait_accompagnement_readaptation: false,
  souhait_accueil_temporaire: false, souhait_aide_animaliere: false,
  souhait_bilan_capacites: false, souhait_aide_financiere_revenu: false,
  souhait_autre: '', etablissement_identifie: null,
  etablissement_nom1: '', etablissement_contact1: null,
  etablissement_nom2: '', etablissement_contact2: null,
}

export const DEFAULT_C1_SITUATION_SCOLAIRE: MdphC1SituationScolaire = {
  scolarise: null, type_scolarisation: '', type_scolarisation_autre: '',
  etablissements: '', depuis_le: '', internat_pris_en_charge: null,
  non_scolarise_trop_jeune: false, non_scolarise_sans_solution: false,
  non_scolarise_a_partir: '', non_scolarise_preciser: '',
  etudiant_type_etudes: '', etudiant_diplomes_obtenus: '',
  etudiant_diplomes_prepares: '', etudiant_etablissement_nom: '',
  etudiant_etablissement_rue: '', etudiant_etablissement_ville: '',
  etudiant_depuis: '', parcours: [],
  soins_hospitaliers: false, soins_liberal: false, soins_autre: '',
  adaptation_pedagogique: false, adaptation_communication: false,
  adaptation_informatique: false, adaptation_deficience_auditive: false,
  adaptation_deficience_visuelle: false, adaptation_mobilier: false,
  adaptation_transport: false, adaptation_autre: '',
  aide_humaine_eleve: false, aide_humaine_detail: '',
  emploi_du_temps: {},
}

export const DEFAULT_C2_BESOINS_SCOLAIRES: MdphC2BesoinsScolaires = {
  apprentissage_lire: false, apprentissage_ecrire: false,
  apprentissage_calculer: false, apprentissage_comprendre: false,
  apprentissage_organiser: false, apprentissage_materiel: false,
  apprentissage_autre: '',
  communication_exprimer: false, communication_relations: false,
  communication_securite: false, communication_autre: '',
  entretien_hygiene: false, entretien_repas: false,
  entretien_habiller: false, entretien_sante: false, entretien_autre: '',
  deplacement_interieur: false, deplacement_exterieur: false,
  deplacement_transports: false, deplacement_autre: '',
}

export const DEFAULT_C3_ATTENTES_SCOLAIRES: MdphC3AttentesScolaires = {
  souhait_adaptation_scolarite: false, souhait_orientation_differente: false,
  souhait_aide_humaine: false, souhait_aide_materielle: false,
  souhait_accompagnement_readaptation: false,
  souhait_etablissement_sans_hebergement: false,
  souhait_etablissement_avec_hebergement: false,
  souhait_autre: '', etablissement_identifie: '',
  etablissement_contact: null, pas_contact_enseignant_raison: '',
  autres_renseignements: '',
}

export const DEFAULT_D1_SITUATION_PRO: MdphD1SituationPro = {
  a_emploi: null, emploi_depuis: '', milieu: '', emploi_intitule: '',
  temps: '', type_contrat: '', employeur_nom: '', employeur_adresse: '',
  adapte_handicap: null, adapte_handicap_non_detail: '', difficultes_handicap: '',
  stagiaire_formation: false, stagiaire_remunere: null, stagiaire_organisme: '',
  travailleur_independant: false, travailleur_independant_regime: '',
  accompagnement_sante_travail: false, accompagnement_sameth: false,
  amenagements_poste: false, amenagements_detail: '',
  en_arret: false, arret_depuis: '',
  arret_maladie_ij: false, arret_maladie_sans_ij: false,
  arret_accident_travail: false, arret_maternite: false,
  rencontre_service_social: null, rencontre_service_social_date: '',
  rencontre_medecin_travail: null, rencontre_medecin_travail_date: '',
  sans_emploi: null, sans_emploi_depuis: '',
  deja_travaille: null, raison_sans_emploi: '',
  inscrit_pole_emploi: false, pole_emploi_depuis: '',
  en_formation_continue: false, formation_continue_detail: '',
  etudiant: false,
  accompagnement_mission_locale: false, accompagnement_cap_emploi: false,
  accompagnement_pole_emploi: false, accompagnement_referent_rsa: false,
  accompagnement_autre: '',
  prestation_agefiph: false, prestation_fiphfp: false,
  beneficie_rqth: null,
}

export const DEFAULT_D2_PARCOURS_PRO: MdphD2ParcoursPro = {
  experiences: [], niveau_qualification: '', derniere_classe: '',
  formations_pro: '', diplomes: [], bilan_competences: '',
}

export const DEFAULT_D3_PROJET_PRO: MdphD3ProjetPro = {
  a_projet: '', projets_detail: '',
  soutien_bilan_capacites: false, soutien_preciser_projet: false,
  soutien_adapter_environnement: false, soutien_acceder_emploi: false,
  soutien_acceder_formation: false,
  structure_identifiee: '', structure_contact: null,
  autres_renseignements: '',
}

export const DEFAULT_E_DEMANDES: MdphEDemandes = {
  demande_aeeh: false, demande_pch_enfant: false,
  demande_cmi_invalidite_enfant: false, demande_cmi_stationnement_enfant: false,
  demande_avpf_enfant: false,
  demande_aah: false, demande_complement_ressources: false,
  demande_esms_adultes: false, demande_creton: false,
  demande_actp: false, demande_acfp: false,
  demande_pch_adulte: false, demande_cmi_invalidite_adulte: false,
  demande_cmi_stationnement_adulte: false, demande_avpf_adulte: false,
  demande_scolarisation: false, demande_scolarisation_detail: '',
  demande_rqth: false, demande_orientation_pro: false,
  orientation_crp_cpo_ueros: false, orientation_esat: false,
  orientation_marche_travail: false, orientation_emploi_accompagne: false,
}

export const DEFAULT_F1_SITUATION_AIDANT: MdphF1SituationAidant = {
  nom_aidant: '', prenom_aidant: '', date_naissance_aidant: '',
  adresse_aidant: '', nom_personne_aidee: '', lien_avec_personne: '',
  vit_avec_personne: null, vit_avec_depuis: '',
  en_emploi: null, reduction_activite: false,
  aide_surveillance: false, aide_deplacement_interieur: false,
  aide_deplacement_exterieur: false, aide_entretien_logement: false,
  aide_hygiene: false, aide_preparation_repas: false,
  aide_prise_repas: false, aide_suivi_medical: false,
  aide_coordination: false, aide_gestion_admin: false,
  aide_gestion_financiere: false, aide_stimulation: false,
  aide_communication: false, aide_autre: '',
  accompagnement_professionnels: false, accompagnement_proches: false,
  accompagnement_seul: false,
  soutenu: null, soutenu_detail: '',
  solution_remplacement: null, solution_remplacement_detail: '',
}

export const DEFAULT_F2_ATTENTES_AIDANT: MdphF2AttentesAidant = {
  situation_eloignement: false, situation_indisponibilite: false,
  situation_changement_personnel: false, situation_sante: false,
  situation_changement_pro: false, situation_difficulte_accompagnement: false,
  situation_autre: '',
  attente_repos_quotidien: false, attente_remplacement_besoin: false,
  attente_remplacement_imprevu: false, attente_remplacement_vacances: false,
  attente_activite_pro: false, attente_liens_sociaux: false,
  attente_contrepartie_financiere: false, attente_echange_aidants: false,
  attente_echange_professionnels: false, attente_soutien_psychologique: false,
  attente_conseil_handicap: false, attente_assurance_vieillesse: false,
  attente_autre: '',
  structure_identifiee: '',
  connaitre_dispositifs_pour_vous: false,
  connaitre_dispositifs_pour_personne: false,
  autres_renseignements: '',
}

// --- Onglets ---
export interface MdphTab {
  id: string
  label: string
  cerfa: string
  conditionnel?: boolean
}

export const MDPH_TABS: MdphTab[] = [
  { id: 'demande', label: 'Demande', cerfa: 'Page garde' },
  { id: 'identite', label: 'Identité', cerfa: 'A1 + A2' },
  { id: 'accompagnement', label: 'Accompagnement', cerfa: 'A3 + A4 + A5' },
  { id: 'vie-quotidienne', label: 'Vie quotidienne', cerfa: 'B1 + B2 + B3' },
  { id: 'vie-scolaire', label: 'Vie scolaire', cerfa: 'C1 + C2 + C3', conditionnel: true },
  { id: 'situation-pro', label: 'Situation pro', cerfa: 'D1 + D2 + D3', conditionnel: true },
  { id: 'demandes-droits', label: 'Demandes', cerfa: 'E1 + E2 + E3' },
  { id: 'aidant', label: 'Aidant familial', cerfa: 'F1 + F2', conditionnel: true },
  { id: 'recap', label: 'Récapitulatif', cerfa: 'Signature + PDF' },
]

// --- Helper pour merger les defaults avec les donnees DB (JSONB peut etre partiel) ---
export function mergeWithDefaults<T extends object>(data: Partial<T> | undefined | null, defaults: T): T {
  if (!data) return { ...defaults }
  return { ...defaults, ...data }
}
