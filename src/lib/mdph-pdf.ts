import { PDFDocument } from 'pdf-lib'
import type { MdphFormulaire } from '../types/mdph'

// Helper: split date string 'YYYY-MM-DD' or 'DD/MM/YYYY' into { j, m, a }
function splitDate(d: string): { j: string; m: string; a: string } {
  if (!d) return { j: '', m: '', a: '' }
  if (d.includes('-')) {
    const [a, m, j] = d.split('-')
    return { j, m, a }
  }
  const [j, m, a] = d.split('/')
  return { j: j || '', m: m || '', a: a || '' }
}

// Helper: split numéro sécu '1234567890123' into individual chars
function splitNumero(n: string, count: number): string[] {
  const chars: string[] = []
  for (let i = 0; i < count; i++) chars.push(n?.[i] || '')
  return chars
}

export async function generateMdphPdf(formulaire: MdphFormulaire): Promise<Uint8Array> {
  const pdfBytes = await fetch('/cerfa-mdph-15692.pdf').then(r => r.arrayBuffer())
  const doc = await PDFDocument.load(pdfBytes)
  const form = doc.getForm()

  // Helpers
  const setText = (name: string, value: string) => {
    try {
      const field = form.getTextField(name)
      field.setText(value || '')
    } catch { /* field not found */ }
  }
  const setCheck = (name: string, checked: boolean) => {
    try {
      const field = form.getCheckBox(name)
      if (checked) field.check()
      else field.uncheck()
    } catch { /* field not found */ }
  }

  const pg = formulaire.section_page_garde
  const a1 = formulaire.section_a1_identite
  const a2 = formulaire.section_a2_autorite_parentale
  const a3 = formulaire.section_a3_aide_demarches
  const a5 = formulaire.section_a5_urgence
  const sig = formulaire.section_a_signature
  const b1 = formulaire.section_b1_vie_quotidienne
  const b2 = formulaire.section_b2_besoins_quotidiens
  const b3 = formulaire.section_b3_besoins_deplacement_social
  const c1 = formulaire.section_c1_situation_scolaire
  const c2 = formulaire.section_c2_besoins_scolaires
  const c3 = formulaire.section_c3_attentes_scolaires
  const d1 = formulaire.section_d1_situation_pro
  const d2 = formulaire.section_d2_parcours_pro
  const d3 = formulaire.section_d3_projet_pro
  const dem = formulaire.section_e_demandes
  const f1 = formulaire.section_f1_situation_aidant
  const f2 = formulaire.section_f2_attentes_aidant

  // ==================== PAGE DE GARDE ====================
  setCheck('Première demande à la MDPH', pg.premiere_demande)
  setCheck('Ma situation a changé', pg.situation_changee)
  setCheck('Réévaluation de ma situation', pg.reevaluation)
  setCheck('Renouvellement droits identiques', pg.renouvellement_identique)
  setCheck('Aidant familial souhaite exprimer sa situation', pg.aidant_familial)
  setCheck('Oui, j\'ai déja un dossier à la MDPH', pg.dossier_existant)
  setText('Indiquer dans quel département', pg.dossier_departement)
  setText('Numéro de dossier', pg.dossier_numero)

  // ==================== A1 IDENTITE ====================
  setCheck('Sexe H p2', a1.sexe === 'homme')
  setCheck('Sexe F p2', a1.sexe === 'femme')
  setText('Nom de naissance p2', a1.nom_naissance)
  setText('Nom d\'usage p2', a1.nom_usage)
  setText('Prénoms p2', a1.prenoms)

  const dn = splitDate(a1.date_naissance)
  setText('DN J p2', dn.j)
  setText('DN M p2', dn.m)
  setText('DN A p2', dn.a)

  setCheck('Nationalité f p2', a1.nationalite === 'francaise')
  setCheck('Nationalité e p2', a1.nationalite === 'eee_suisse')
  setCheck('Nationalité autre p2', a1.nationalite === 'autre')

  setText('Commune de naissance p2', a1.commune_naissance)
  setText('Département de naissance p2', a1.departement_naissance)
  setCheck('Pays de naissance France p2', a1.pays_naissance === 'france')
  setCheck('Pays de naissance Autre préciser p2', a1.pays_naissance === 'autre')
  setText('Pays de naissance Autre p2', a1.pays_naissance_autre)

  if (a1.date_arrivee_france) {
    const da = splitDate(a1.date_arrivee_france)
    setText('DA J p2', da.j)
    setText('DA M p2', da.m)
    setText('DA A p2', da.a)
  }

  setText('Adresse p2', a1.adresse)
  setText('Complément d\'adresse p2', a1.complement_adresse)
  const cp = (a1.code_postal || '').padEnd(5, '')
  setText('Code postal 1 p2', cp[0] || '')
  setText('Code postal 2 p2', cp[1] || '')
  setText('Code postal 3 p2', cp[2] || '')
  setText('Code postal 4 p2', cp[3] || '')
  setText('Code postal 5 p2', cp[4] || '')
  setText('Commune p2', a1.commune)
  setText('Pays p2', a1.pays)
  setText('Numéro de téléphone p2', a1.telephone)
  setText('Adresse e-mail p2', a1.email)

  setCheck('E-mail p2', a1.contact_email)
  setCheck('Appel téléphonique p2', a1.contact_appel)
  setCheck('SMS p2', a1.contact_sms)
  setCheck('Courrier p2', a1.contact_courrier)

  setText('Nom de l\'organisme p2', a1.organisme_hebergement)
  setCheck('OP CAF p2', a1.organisme_payeur === 'caf')
  setCheck('OP MSA p2', a1.organisme_payeur === 'msa')
  setCheck('OP Autre p2', a1.organisme_payeur === 'autre')
  setText('Numéro d\'allocataire p2', a1.numero_allocataire)

  setCheck('OAM CPAM p2', a1.organisme_maladie === 'cpam')
  setCheck('OAM MSA p2', a1.organisme_maladie === 'msa')
  setCheck('OAM RSI p2', a1.organisme_maladie === 'rsi')
  setCheck('OAM Autre p2', a1.organisme_maladie === 'autre')
  setText('Organisme assurance maladie Autre p2', a1.organisme_maladie_autre)

  const ss = splitNumero(a1.numero_secu, 15)
  for (let i = 0; i < 15; i++) setText(`Numero SS ${i + 1}`, ss[i])

  const sse = splitNumero(a1.numero_secu_enfant, 15)
  for (let i = 0; i < 15; i++) setText(`N° SS Enfant ${i + 1}`, sse[i])

  // ==================== A2 AUTORITE PARENTALE ====================
  // Parent 1
  setText('Autorite Parent 1  A', a2.parent1.nom)
  setText('Autorite Parent 1  B', a2.parent1.prenom)
  if (a2.parent1.date_naissance) {
    const dp1 = splitDate(a2.parent1.date_naissance)
    setText('Autorite Parent 1  C', `${dp1.j}/${dp1.m}/${dp1.a}`)
  }
  setText('Autorite Parent 1  D', a2.parent1.adresse)
  setText('Autorite Parent 1  E', a2.parent1.code_postal)
  setText('Autorite Parent 1  F', a2.parent1.commune)
  setText('Autorite Parent 1  G', a2.parent1.telephone)
  setText('Autorite Parent 1  H', a2.parent1.email)

  // Parent 2
  setText('Autorite Parent  2 A', a2.parent2.nom)
  setText('Autorite Parent  2 B', a2.parent2.prenom)
  if (a2.parent2.date_naissance) {
    const dp2 = splitDate(a2.parent2.date_naissance)
    setText('Autorite Parent  2 C', `${dp2.j}/${dp2.m}/${dp2.a}`)
  }
  setText('Autorite Parent  2 D', a2.parent2.adresse)
  setText('Autorite Parent  2 E', a2.parent2.code_postal)
  setText('Autorite Parent  2 F', a2.parent2.commune)
  setText('Autorite Parent  2 G', a2.parent2.telephone)
  setText('Autorite Parent  2 H', a2.parent2.email)

  // ==================== A3 AIDE DEMARCHES ====================
  setCheck('Aide dans vos démarches MDPH Un proche', a3.type_aide === 'proche')
  setCheck('Aide dans vos démarches MDPH Une association', a3.type_aide === 'association')
  setCheck('Aide dans vos démarches MDPH Autre', a3.type_aide === 'autre')
  setText('Nom de l\'association', a3.nom_association)
  setText('Nom et prénom de la personne', a3.nom_prenom_personne)
  setText('Numéro et rue', a3.adresse)
  setText('Complément d\'adresse', a3.complement_adresse)
  setText('Code postal', a3.code_postal)
  setText('Commune', a3.commune)
  setText('Téléphone', a3.telephone)
  setText('E-mail', a3.email)

  // ==================== A5 URGENCE ====================
  setCheck('Traitement rapide Vous n\'arrivez plus à vivre chez vous', a5.ne_peut_vivre_domicile)
  setCheck('Traitement rapide École n\'accueille plus votre enfant', a5.ecole_ne_peut_accueillir)
  setCheck('Traitement rapide Hospitalisation', a5.sortie_hospitalisation)
  setCheck('Traitement rapide Risque perte travail', a5.risque_perte_travail)
  setCheck('Traitement rapide Nouvel emploi', a5.nouvel_emploi_formation)
  if (a5.date_entree_prevue) {
    const ne = splitDate(a5.date_entree_prevue)
    setText('Nouvel emploi Date entrée prévue Jour', ne.j)
    setText('Nouvel emploi Date entrée prévue Mois', ne.m)
    setText('Nouvel emploi Date entrée prévue Année', ne.a)
  }
  setText('Traitement rapide Explication de votre difficulté', a5.explication)
  setCheck('Traitement rapide Fin de droits dans moins de 2 mois', a5.fin_droits_imminente)
  setText('Fin de droits dans moins de 2 mois Indiquer les droits', a5.droits_concernes)

  // ==================== SIGNATURE ====================
  if (sig.date_signature) {
    const ds = splitDate(sig.date_signature)
    setText('Date de rédaction formulaire Jour', ds.j)
    setText('Date de rédaction formulaire Mois', ds.m)
    setText('Date de rédaction formulaire Année', ds.a)
  }
  setCheck('Signature personne concernée', sig.signataire === 'personne_concernee')
  setCheck('Signature représentant légal', sig.signataire === 'representant_legal')
  setCheck('Signature des deux parents', sig.signataire === 'deux_parents')
  setCheck('J\'accepte les échanges', sig.accepte_echange_professionnels === true)
  setCheck('Je n\'accepte pas les échanges', sig.accepte_echange_professionnels === false)
  setCheck('Je certifie l\'exactitude des informations déclarées', sig.certification_honneur)
  setCheck('Je souhaite bénéficier d\'une procédure simplifiée', sig.procedure_simplifiee)

  // ==================== B1 VIE QUOTIDIENNE ====================
  setCheck('Situation Seul', b1.vous_vivez === 'seul')
  setCheck('Situation En couple', b1.vous_vivez === 'couple')
  setCheck('Situation Avec un parent (ou les deux)', b1.vous_vivez === 'parents')
  setCheck('Situation Avec votre enfant (ou l\'un d\'entre eux)', b1.vous_vivez === 'enfants')
  setCheck('Autre situation', b1.vous_vivez === 'autre')
  setText('Autre situation Lieu de vie Préciser', b1.vous_vivez_autre)

  setCheck('Vous avez un logement indépendant', b1.logement_independant)
  setCheck('Vous êtes propriétaire', b1.logement_proprietaire)
  setCheck('Vous êtes locataire', b1.logement_locataire)
  setCheck('Vous êtes hébergé au domicile de vos parents', b1.heberge_parents)
  setCheck('Vous êtes hébergé au domicile de vos enfants', b1.heberge_enfants)
  setCheck('Vous êtes hébergé au domicile d\'un ami', b1.heberge_ami)
  setCheck('Vous êtes hébergé au domicile d\'un autre membre de votre famille', b1.heberge_famille)
  setCheck('Vous êtes hébergé au domicile d\'une famille d\'accueil', b1.heberge_famille_accueil)
  setCheck('Vous êtes dans un établissement médico social', b1.etablissement_medico_social)
  setText('Établissement médico social Préciser', b1.etablissement_nom)
  setCheck('Autre situation Lieu de vie', b1.autre_situation !== '')

  setCheck('Accident causé par un tiers', b1.accident_tiers)
  setCheck('Accident du travail', b1.accident_travail)
  setCheck('Autre type d\'accident', b1.accident_autre)
  setText('Autre type d\'accident Préciser', b1.accident_autre_detail)
  setCheck('Suite accident Demande d\'indemnisation ? Oui', b1.indemnisation_en_cours === true)
  setCheck('Suite accident Demande d\'indemnisation ? Non', b1.indemnisation_en_cours === false)
  setText('Demande en cours auprès de quel organisme ?', b1.indemnisation_organisme)

  setCheck('Vous recevez l\'AAH', b1.recoit_aah)
  setCheck('Vous recevez le RSA', b1.recoit_rsa)
  setCheck('Vous recevez l\'Allocation chômage', b1.recoit_chomage)
  setCheck('Vous recevez l\'ASS', b1.recoit_ass)
  setCheck('Dans les 12 mois précédents vous avez perçu un revenu d\'activité', b1.revenu_activite_12mois)
  setCheck('Dans les 12 mois précédents vous avez perçu un revenu d\'activité en ESAT', b1.revenu_esat_12mois)
  setCheck('Pension d\'invalidité 1re catégorie', b1.pension_invalidite === '1')
  setCheck('Pension d\'invalidité 2e catégorie', b1.pension_invalidite === '2')
  setCheck('Pension d\'invalidité 3e catégorie', b1.pension_invalidite === '3')

  if (b1.indemnites_journalieres) {
    const ijDu = splitDate(b1.ij_du)
    const ijAu = splitDate(b1.ij_au)
    setText('Indemnités journalières Début Jour', ijDu.j)
    setText('Indemnités journalières Début Mois', ijDu.m)
    setText('Indemnités journalières Début Année', ijDu.a)
    setText('Indemnités journalières Fin Jour', ijAu.j)
    setText('Indemnités journalières Fin Mois', ijAu.m)
    setText('Indemnités journalières Fin Année', ijAu.a)
  }

  if (b1.pension_invalidite_depuis) {
    const pi = splitDate(b1.pension_invalidite_depuis)
    setText('Pension d\'invalidité Depuis date Jour', pi.j)
    setText('Pension d\'invalidité Depuis date Mois', pi.m)
    setText('Pension d\'invalidité Depuis date Année', pi.a)
  }

  setCheck('Vous êtes bénéficiaire de l\'APA', b1.beneficiaire_apa)
  setCheck('Vous êtes bénéficiaire de l\'ASPA', b1.beneficiaire_aspa)

  // ==================== B2 BESOINS QUOTIDIENS ====================
  setCheck('Besoin pour régler les dépenses courantes', b2.besoin_depenses_courantes)
  setCheck('Besoin pour gérer son budget', b2.besoin_budget_admin)
  setCheck('Besoin pour l\'hygiène corporelle', b2.besoin_hygiene)
  setCheck('Besoin pour s\'habiller', b2.besoin_habiller)
  setCheck('Besoin pour prendre soin de sa santé', b2.besoin_sante)
  setCheck('Besoin pour faire les courses', b2.besoin_courses)
  setCheck('Besoin pour préparer les repas', b2.besoin_preparer_repas)
  setCheck('Besoin pour prendre les repas', b2.besoin_prendre_repas)
  setCheck('Besoin pour faire le ménage', b2.besoin_menage)

  setCheck('Aide technique', b2.aide_technique)
  setCheck('Aménagement de logement', b2.aide_amenagement_logement)
  setCheck('Aménagement de véhicule', b2.aide_amenagement_vehicule)
  setCheck('Aides animalières', b2.aide_animaliere)
  setText('Aides techniques Préciser', b2.aide_technique_detail)

  setCheck('Votre famille', b2.aide_humaine_famille)
  setCheck('Professionnel de soins à domicile', b2.aide_humaine_pro_soins)
  setCheck('Un accompagnement médico-social', b2.aide_humaine_medico_social)

  // Frais handicap (up to 3 lines)
  const frais = b2.frais_handicap || []
  for (let i = 0; i < Math.min(frais.length, 3); i++) {
    const prefix = `Ligne ${i + 1}`
    setText(`${prefix} Frais engagés`, frais[i].frais)
    setText(`${prefix} Fréquence`, frais[i].frequence)
    setText(`${prefix} Montant total`, frais[i].montant_total)
    setText(`${prefix} Montant remboursé`, frais[i].montant_rembourse)
    setText(`${prefix} Précisions`, frais[i].precisions)
  }

  // ==================== B3 DEPLACEMENT / VIE SOCIALE ====================
  setCheck('Pour se déplacer dans le domicile', b3.deplacement_interieur)
  setCheck('Pour sortir du domicile ou y entrer', b3.deplacement_sortir_entrer)
  setCheck('Pour se déplacer à l\'extérieur du domicile', b3.deplacement_exterieur)
  setCheck('Pour utiliser un véhicule', b3.deplacement_vehicule)
  setCheck('Pour partir en vacances', b3.deplacement_vacances)
  setCheck('Utilisez-vous les transports adaptés ? Oui', b3.transports_adaptes === true)
  setCheck('Utilisez-vous les transports adaptés ? Non', b3.transports_adaptes === false)

  setCheck('Pour s\'exprimer, se faire comprendre', b3.social_exprimer)
  setCheck('Pour avoir des activités sportives', b3.social_activites_loisirs)
  setCheck('Pour s\'occuper de sa famille', b3.social_famille)
  setCheck('Pour être accompagné dans la vie citoyenne', b3.social_vie_citoyenne)

  setCheck('Vivre à domicile', b3.souhait_vivre_domicile)
  setCheck('Vivre en établissement', b3.souhait_vivre_etablissement)
  setCheck('Un aménagement du lieu de vie', b3.souhait_amenagement_lieu)
  setCheck('Une aide pour se déplacer', b3.souhait_aide_deplacement)
  setCheck('Du matériel ou équipement', b3.souhait_materiel_equipement)
  setCheck('Une aide financière pour des dépenses liées au handicap', b3.souhait_aide_financiere_handicap)
  setCheck('Un accompagnement pour l\'adaptation / réadaptation à la vie quotidienne', b3.souhait_accompagnement_readaptation)
  setCheck('Un accueil temporaire en établissement', b3.souhait_accueil_temporaire)
  setCheck('Une aide animalière', b3.souhait_aide_animaliere)
  setCheck('Réaliser un bilan des capacités dans la vie quotidienne', b3.souhait_bilan_capacites)

  // Texte libre vie quotidienne
  setText('Autres renseignements concernant votre vie quotidienne', formulaire.section_b_texte_libre)

  // ==================== C1 SITUATION SCOLAIRE ====================
  setCheck('À domicile', c1.type_scolarisation === 'domicile')
  setCheck('Avec accompagnement par un service de soin', c1.type_scolarisation === 'accompagnement_medico_social')
  setCheck('En temps partagé entre établissement et milieu ordinaire', c1.type_scolarisation === 'temps_partage_medico_social')
  setCheck('En temps partagé entre service de soin et milieu ordinaire', c1.type_scolarisation === 'temps_partage_soin')
  setCheck('En milieu ordinaire p9', c1.type_scolarisation === 'milieu_ordinaire')
  setCheck('En formation supérieure', c1.type_scolarisation === 'formation_superieure')
  setCheck('Enfant scolarisé Autre', c1.type_scolarisation === 'autre')
  setText('Enfant scolarisé Autre Préciser', c1.type_scolarisation_autre)

  if (c1.depuis_le) {
    const sd = splitDate(c1.depuis_le)
    setText('Enfant scolarisé depuis le Date Jour', sd.j)
    setText('Enfant scolarisé depuis le Date Mois', sd.m)
    setText('Enfant scolarisé depuis le Date Année', sd.a)
  }

  setText('Au sein de quels établissements ? Préciser', c1.etablissements)
  setCheck('Oui, ses frais de séjour sont intégralement pris en charge', c1.internat_pris_en_charge === true)
  setCheck('Non, ses frais de séjour ne sont pas intégralement pris en charge', c1.internat_pris_en_charge === false)

  setText('Type d\'études', c1.etudiant_type_etudes)
  setText('Diplômes obtenus', c1.etudiant_diplomes_obtenus)
  setText('Diplômes préparés', c1.etudiant_diplomes_prepares)
  setText('Nom de l\'établissement', c1.etudiant_etablissement_nom)
  setText('Rue de l\'établissement', c1.etudiant_etablissement_rue)
  setText('Ville de l\'établissement', c1.etudiant_etablissement_ville)

  setCheck('Soins hospitaliers', c1.soins_hospitaliers)
  setCheck('Soins en libéral', c1.soins_liberal)
  setCheck('Aménagements et adaptations pédagogiques', c1.adaptation_pedagogique)
  setCheck('Outils de communication', c1.adaptation_communication)
  setCheck('Matériel informatique et audiovisuel', c1.adaptation_informatique)
  setCheck('Matériel déficience auditive', c1.adaptation_deficience_auditive)
  setCheck('Matériel déficience visuelle', c1.adaptation_deficience_visuelle)
  setCheck('Mobilier et petits matériels', c1.adaptation_mobilier)
  setCheck('Transport', c1.adaptation_transport)
  setCheck('Oui, je dispose d\'une aide humaine aux élèves handicapés', c1.aide_humaine_eleve)

  // C2 Besoins scolaires
  setCheck('Pour lire', c2.apprentissage_lire)
  setCheck('Pour écrire, prendre des notes', c2.apprentissage_ecrire)
  setCheck('Pour calculer', c2.apprentissage_calculer)
  setCheck('Pour organiser, contrôler son travail', c2.apprentissage_organiser)
  setCheck('Pour comprendre, suivre les consignes', c2.apprentissage_comprendre)
  setCheck('Pour l\'utilisation du matériel', c2.apprentissage_materiel)
  setCheck('Pour s\'exprimer', c2.communication_exprimer)
  setCheck('Pour les relations avec les autres', c2.communication_relations)
  setCheck('Pour assurer sa sécurité', c2.communication_securite)
  setCheck('Pour l\'hygiène corporelle', c2.entretien_hygiene)
  setCheck('Pour les repas', c2.entretien_repas)
  setCheck('Pour s\'habiller', c2.entretien_habiller)
  setCheck('Pour prendre soin de sa santé', c2.entretien_sante)
  setCheck('Pour se déplacer à l\'intérieur des locaux', c2.deplacement_interieur)
  setCheck('Pour se déplacer à l\'extérieur des locaux', c2.deplacement_exterieur)
  setCheck('Pour utiliser les transports en commun', c2.deplacement_transports)

  // C3 Attentes scolaires
  setCheck('Une adaptation de la scolarité', c3.souhait_adaptation_scolarite)
  setCheck('Une orientation scolaire différente', c3.souhait_orientation_differente)
  setCheck('Une aide humaine', c3.souhait_aide_humaine)
  setCheck('Une aide matérielle', c3.souhait_aide_materielle)
  setCheck('Un accompagnement pour une réadaptation', c3.souhait_accompagnement_readaptation)
  setCheck('Une prise en charge par un établissement sans hébergement', c3.souhait_etablissement_sans_hebergement)
  setCheck('Une prise en charge par un établissement avec hébergement', c3.souhait_etablissement_avec_hebergement)
  setText('Établissement qui pourrait répondre à vos attentes Préciser', c3.etablissement_identifie)
  setText('Autres renseignements', c3.autres_renseignements)

  // ==================== D1 SITUATION PRO ====================
  setCheck('Oui j\'ai un emploi', d1.a_emploi === true)
  setCheck('Je suis sans emploi', d1.sans_emploi === true)

  if (d1.a_emploi && d1.emploi_depuis) {
    const ed = splitDate(d1.emploi_depuis)
    setText('Emploi Date début Jour', ed.j)
    setText('Emploi Date début Mois', ed.m)
    setText('Emploi Date début Année', ed.a)
  }

  setCheck('En milieu ordinaire', d1.milieu === 'ordinaire')
  setCheck('En entreprise adaptée', d1.milieu === 'adapte')
  setCheck('En milieu protégé', d1.milieu === 'protege')
  setText('Votre emploi', d1.emploi_intitule)
  setCheck('Emploi temps complet', d1.temps === 'complet')
  setCheck('Emploi temps partiel', d1.temps === 'partiel')
  setCheck('Type d\'emploi CDI', d1.type_contrat === 'cdi')
  setCheck('Type d\'emploi CDD', d1.type_contrat === 'cdd')
  setCheck('Type d\'emploi Interim', d1.type_contrat === 'interim')
  setCheck('Type d\'emploi Contrat aidé', d1.type_contrat === 'contrat_aide')
  setText('Votre employeur Nom', d1.employeur_nom)
  setText('Votre employeur Adresse', d1.employeur_adresse)
  setCheck('Emploi adapté ? Oui', d1.adapte_handicap === true)
  setCheck('Emploi adapté ? Non', d1.adapte_handicap === false)
  setText('Emploi non-adapté Préciser', d1.adapte_handicap_non_detail)
  setText('Difficultés liées à votre handicap Préciser', d1.difficultes_handicap)

  setCheck('Type d\'emploi Stagiaire de la formation professionnelle', d1.stagiaire_formation)
  setCheck('Stagiaire rémunéré', d1.stagiaire_remunere === true)
  setCheck('Stagiaire non rémunéré', d1.stagiaire_remunere === false)
  setCheck('Type d\'emploi Travailleur indépendant', d1.travailleur_independant)
  setText('Travailleur indépendant Régime Préciser', d1.travailleur_independant_regime)

  setCheck('Accompagnement par un service de santé', d1.accompagnement_sante_travail)
  setCheck('Accompagnement par le SAMETH', d1.accompagnement_sameth)
  setCheck('Oui, des aménagements ont été réalisés sur mon poste de travail', d1.amenagements_poste)
  setText('Des aménagements ont été réalisés sur votre poste de travail Préciser', d1.amenagements_detail)

  setCheck('Oui, je suis actuellement en arrêt de travail', d1.en_arret)
  if (d1.arret_depuis) {
    const ar = splitDate(d1.arret_depuis)
    setText('Arrêt de travail Depuis le Date Jour', ar.j)
    setText('Arrêt de travail Depuis le Date Mois', ar.m)
    setText('Arrêt de travail Depuis le Date Année', ar.a)
  }
  setCheck('Arrêt maladie avec indemnités journalières', d1.arret_maladie_ij)
  setCheck('Arrêt maladie sans indemnités journalières', d1.arret_maladie_sans_ij)
  setCheck('Arrêt maladie suite à un accident du travail ou maladie professionnelle indemnités journalières', d1.arret_accident_travail)
  setCheck('Congé maternité / Congé d\'adoption / Autres', d1.arret_maternite)

  setCheck('Rencontre professionnel service social Oui', d1.rencontre_service_social === true)
  setCheck('Rencontre professionnel service social Non', d1.rencontre_service_social === false)
  setCheck('Rencontre médecin de santé au travail Oui', d1.rencontre_medecin_travail === true)
  setCheck('Rencontre médecin de santé au travail Non', d1.rencontre_medecin_travail === false)

  // Sans emploi
  if (d1.sans_emploi && d1.sans_emploi_depuis) {
    const se = splitDate(d1.sans_emploi_depuis)
    setText('Sans emploi depuis le Date Jour', se.j)
    setText('Sans emploi depuis le Date Mois', se.m)
    setText('Sans emploi depuis le Date Année', se.a)
  }
  setCheck('Oui, j\'ai déjà travaillé', d1.deja_travaille === true)
  setCheck('Non, je n\'ai jamais travaillé', d1.deja_travaille === false)
  setText('Sans emploi Raisons préciser', d1.raison_sans_emploi)
  setCheck('Je suis inscrit à Pôle Emploi', d1.inscrit_pole_emploi)

  setCheck('Oui, je bénéficie d\'une RQTH', d1.beneficie_rqth === true)
  setCheck('Non, je ne bénéficie pas d\'une RQTH', d1.beneficie_rqth === false)

  // ==================== D2 PARCOURS PRO ====================
  // Expériences (up to 4 lines)
  const exp = d2.experiences || []
  for (let i = 0; i < Math.min(exp.length, 4); i++) {
    setText(`Ligne ${i + 1} Année`, exp[i].annees)
    setText(`Ligne ${i + 1} Intitulé du poste`, exp[i].intitule_poste)
    setText(`Ligne ${i + 1} Nom de l'entreprise`, exp[i].nom_entreprise)
    setText(`Ligne ${i + 1} Temps plein ou partiel`, exp[i].temps)
    setText(`Ligne ${i + 1} Motif de fin d'activité`, exp[i].motif_fin)
  }

  setCheck('Primaire', d2.niveau_qualification === 'primaire')
  setCheck('Secondaire', d2.niveau_qualification === 'secondaire')
  setCheck('Supérieur', d2.niveau_qualification === 'superieur')

  // Diplômes (up to 3 lines)
  const dipl = d2.diplomes || []
  for (let i = 0; i < Math.min(dipl.length, 3); i++) {
    setText(`Ligne ${i + 1} Diplôme`, dipl[i].diplome)
    setText(`Ligne ${i + 1} Année d'obtention`, dipl[i].annee_obtention)
    setText(`Ligne ${i + 1} Domaine`, dipl[i].domaine)
  }

  setText('Si bilan de compétences, MOP, pré-orientation déjà effectué Préciser année et organisme', d2.bilan_competences)

  // ==================== D3 PROJET PRO ====================
  setText('Si projet professionnel, Préciser', d3.projets_detail)
  setCheck('Faire un bilan de vos capacités professionnelles', d3.soutien_bilan_capacites)
  setCheck('Préciser votre projet professionnel', d3.soutien_preciser_projet)
  setCheck('Adapter votre environnement de travail', d3.soutien_adapter_environnement)
  setCheck('Accéder à un emploi', d3.soutien_acceder_emploi)
  setCheck('Accéder à une formation', d3.soutien_acceder_formation)
  setText('Autres renseignements importants sur votre situation professionnelle', d3.autres_renseignements)

  // ==================== E DEMANDES ====================
  // Moins de 20 ans
  setCheck('Vous avez moins de 20 ans Allocation d\'éducation de l\'enfant handicapé', dem.demande_aeeh)
  setCheck('Vous avez moins de 20 ans Prestation de compensation du handicap', dem.demande_pch_enfant)
  setCheck('Vous avez moins de 20 ans Carte mobilité inclusion Mention invalidité', dem.demande_cmi_invalidite_enfant)
  setCheck('Vous avez moins de 20 ans Carte mobilité inclusion Mention stationnement', dem.demande_cmi_stationnement_enfant)
  setCheck('Vous avez moins de 20 ans Affiliation gratuite à l\'assurance vieillesse des parents au foyer', dem.demande_avpf_enfant)

  // Plus de 20 ans
  setCheck('Vous avez plus de 20 ans Allocations aux adultes handicapés', dem.demande_aah)
  setCheck('Vous avez plus de 20 ans Complément de ressources', dem.demande_complement_ressources)
  setCheck('Vous avez plus de 20 ans Orientation vers un établissement ou service médico-social pour adultes', dem.demande_esms_adultes)
  setCheck('Vous avez plus de 20 ans Maintien en établissement ou service médico-social au titre de l\'amendemant Creton', dem.demande_creton)
  setCheck('Vous avez plus de 20 ans Allocation compensatrice pour tierce personne', dem.demande_actp)
  setCheck('Vous avez plus de 20 ans Allocation compensatrice pour frais professionnels', dem.demande_acfp)
  setCheck('Prestation de compensation du handicap', dem.demande_pch_adulte)
  setCheck('Vous avez plus de 20 ans Carte mobilité inclusion Mention invalidité', dem.demande_cmi_invalidite_adulte)
  setCheck('Vous avez plus de 20 ans Carte mobilité inclusion Mention stationnement', dem.demande_cmi_stationnement_adulte)
  setCheck('Vous avez plus de 20 ans Affiliation gratuite à l\'assurance vieillesse des parents au foyer', dem.demande_avpf_adulte)

  // Vie scolaire
  setCheck('Demandes relatives à la vie scolaire', dem.demande_scolarisation)
  setText('Demandes relatives à la vie scolaire Préciser', dem.demande_scolarisation_detail)

  // Travail
  setCheck('RQTH', dem.demande_rqth)
  setCheck('Orientation professionnelle', dem.demande_orientation_pro)
  setCheck('CRP, CPO ou UEROS', dem.orientation_crp_cpo_ueros)
  setCheck('ESAT', dem.orientation_esat)
  setCheck('Marché du travail', dem.orientation_marche_travail)
  setCheck('Avec accompagnement par le dispositif "Emploi accompagné"', dem.orientation_emploi_accompagne)

  // ==================== F1 AIDANT ====================
  setText('Nom de l\'aidant', f1.nom_aidant)
  setText('Prénom de l\'aidant', f1.prenom_aidant)
  if (f1.date_naissance_aidant) {
    const da = splitDate(f1.date_naissance_aidant)
    setText('Date de naissance de l\'aidant Jour', da.j)
    setText('Date de naissance de l\'aidant Mois', da.m)
    setText('Date de naissance de l\'aidant Année', da.a)
  }
  setText('Adresse de l\'aidant', f1.adresse_aidant)
  setText('Nom de la personne aidée', f1.nom_personne_aidee)
  setText('Votre lien avec la personne en situation de handicap', f1.lien_avec_personne)
  setCheck('Oui je vis avec la personne en situation de handicap', f1.vit_avec_personne === true)
  setCheck('Non je ne vis pas avec la personne en situation de handicap', f1.vit_avec_personne === false)
  setCheck('Oui, j\'ai un emploi p19', f1.en_emploi === true)
  setCheck('Non, je n\'ai pas d\'emploi p19', f1.en_emploi === false)

  setCheck('Surveillance / présence responsable', f1.aide_surveillance)
  setCheck('Aide aux déplacements à l\'intérieur du logement', f1.aide_deplacement_interieur)
  setCheck('Aide aux déplacements à l\'extérieur', f1.aide_deplacement_exterieur)
  setCheck('Aide pour entretenir le logement et le linge', f1.aide_entretien_logement)
  setCheck('Aide à l\'hygiène corporelle', f1.aide_hygiene)
  setCheck('Aide à la préparation des repas', f1.aide_preparation_repas)
  setCheck('Aide à la prise de repas', f1.aide_prise_repas)
  setCheck('Coordination des intervenants professionnels', f1.aide_coordination)
  setCheck('Gestion administrative et juridique', f1.aide_gestion_admin)
  setCheck('Gestion financière', f1.aide_gestion_financiere)
  setCheck('Stimulation par des activités', f1.aide_stimulation)
  setCheck('Aide à la communication et aux relations sociales', f1.aide_communication)
  setCheck('Aide au suivi médical', f1.aide_suivi_medical)

  setCheck('Je suis seul aidant du demandeur', f1.accompagnement_seul)
  setCheck('Un des professionnels', f1.accompagnement_professionnels)
  setCheck('Un ou plusieurs autres proches', f1.accompagnement_proches)

  setCheck('Oui je suis soutenu dans ma fonction d\'aidant', f1.soutenu === true)
  setCheck('Non, je ne suis pas soutenu dans ma fonction d\'aidant', f1.soutenu === false)
  setText('Oui je suis soutenu dans ma fonction d\'aidant Précision', f1.soutenu_detail)
  setCheck('Solution pour vous remplacer ? Oui', f1.solution_remplacement === true)
  setCheck('Solution pour vous remplacer ? Non', f1.solution_remplacement === false)
  setText('Solution pour vous remplacer ? Oui, Préciser', f1.solution_remplacement_detail)

  // ==================== F2 ATTENTES AIDANT ====================
  setCheck('Éloignement géographique', f2.situation_eloignement)
  setCheck('Indisponibilité prolongée', f2.situation_indisponibilite)
  setCheck('Changement majeur dans la situation personnelle', f2.situation_changement_personnel)
  setCheck('Problème de santé', f2.situation_sante)
  setCheck('Changement majeur dans la situation professionnelle', f2.situation_changement_pro)
  setCheck('Difficulté à assurer l\'accompagnement actuel', f2.situation_difficulte_accompagnement)

  setCheck('Pouvoir vous reposer au quotidien', f2.attente_repos_quotidien)
  setCheck('Pouvoir vous faire remplacer en cas de besoin', f2.attente_remplacement_besoin)
  setCheck('Pouvoir vous faire remplacer en cas d\'imprévu', f2.attente_remplacement_imprevu)
  setCheck('Pouvoir vous faire remplacer pour partir en week-end / vacances', f2.attente_remplacement_vacances)
  setCheck('Reprendre / renforcer / maintenir votre activité professionnelle', f2.attente_activite_pro)
  setCheck('Reprendre / renforcer / maintenir vos liens sociaux', f2.attente_liens_sociaux)
  setCheck('Obtenir une contrepartie financière', f2.attente_contrepartie_financiere)
  setCheck('Échanger avec d\'autres aidants', f2.attente_echange_aidants)
  setCheck('Échanger avec les professionnels qui suivent mon proche', f2.attente_echange_professionnels)
  setCheck('Avoir un soutien psychologique', f2.attente_soutien_psychologique)
  setCheck('Être conseillé pour mieux faire face au handicap de mon proche', f2.attente_conseil_handicap)
  setCheck('Être affilié gratuitement à l\'assurance vieillesse', f2.attente_assurance_vieillesse)

  setText('Structure identifiée pouvant répondre à vos attentes', f2.structure_identifiee)
  setText('Autres renseignements que vous souhaiteriez nous communiquer concernant votre vie d\'aidant', f2.autres_renseignements)

  // Nom/Prénom en bas de page
  setText('NOM BAS DE PAGE', a1.nom_naissance)
  setText('PRENOM BAS DE PAGE', a1.prenoms)

  // Flatten form to make it non-editable
  form.flatten()

  return doc.save()
}

export function downloadPdf(bytes: Uint8Array, filename: string) {
  const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
