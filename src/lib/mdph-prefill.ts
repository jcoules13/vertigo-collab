import type { DossierSuivi } from '../types/database'
import type { MdphFormulaire } from '../types/mdph'
import {
  DEFAULT_PAGE_GARDE,
  DEFAULT_A1_IDENTITE,
  DEFAULT_A2_AUTORITE_PARENTALE,
  DEFAULT_B1_VIE_QUOTIDIENNE,
  DEFAULT_D1_SITUATION_PRO,
  DEFAULT_E_DEMANDES,
} from '../types/mdph'

function mapSituationPro(situations: string[]): MdphFormulaire['section_d1_situation_pro']['a_emploi'] {
  if (!situations || situations.length === 0) return null
  if (situations.includes('En emploi')) return true
  if (situations.includes('En recherche d\'emploi') || situations.includes('Sans activité')) return false
  return null
}

function mapVousVivez(situations: string[]): string {
  if (!situations || situations.length === 0) return ''
  if (situations.includes('Seul(e)')) return 'seul'
  if (situations.includes('En couple')) return 'couple'
  return ''
}

export function prefillFromDossier(dossier: DossierSuivi): Partial<MdphFormulaire> {
  const hasRepresentant = !!dossier.representant_legal_nom

  return {
    dossier_id: dossier.id,
    usager_nom: dossier.usager_nom,
    usager_prenom: dossier.usager_prenom,

    section_page_garde: {
      ...DEFAULT_PAGE_GARDE,
      dossier_existant: !!dossier.ancien_numero_mdph,
      dossier_numero: dossier.ancien_numero_mdph || '',
    },

    section_a1_identite: {
      ...DEFAULT_A1_IDENTITE,
      nom_naissance: dossier.usager_nom,
      prenoms: dossier.usager_prenom || '',
      date_naissance: dossier.usager_date_naissance || '',
      email: dossier.usager_email || '',
      telephone: dossier.usager_telephone || '',
      adresse: dossier.usager_adresse || '',
      code_postal: dossier.code_postal || '',
      numero_secu: dossier.numero_securite_sociale || '',
      numero_allocataire: dossier.numero_caf || '',
      organisme_payeur: dossier.numero_caf ? 'caf' : '',
    },

    section_a2_autorite_parentale: hasRepresentant ? {
      ...DEFAULT_A2_AUTORITE_PARENTALE,
      qui_exerce: 'parent1',
      parent1: {
        ...DEFAULT_A2_AUTORITE_PARENTALE.parent1,
        nom: dossier.representant_legal_nom || '',
        prenom: dossier.representant_legal_prenom || '',
        telephone: dossier.representant_legal_telephone || '',
        email: dossier.representant_legal_email || '',
      },
    } : { ...DEFAULT_A2_AUTORITE_PARENTALE },

    section_b1_vie_quotidienne: {
      ...DEFAULT_B1_VIE_QUOTIDIENNE,
      vous_vivez: mapVousVivez(dossier.situation_personnelle) as typeof DEFAULT_B1_VIE_QUOTIDIENNE.vous_vivez,
      recoit_aah: dossier.droits_aah,
    },

    section_d1_situation_pro: {
      ...DEFAULT_D1_SITUATION_PRO,
      a_emploi: mapSituationPro(dossier.situation_professionnelle),
      beneficie_rqth: dossier.droits_rqth || null,
    },

    section_e_demandes: {
      ...DEFAULT_E_DEMANDES,
      demande_rqth: dossier.droits_rqth || dossier.droits_mdph_en_cours,
      demande_aah: dossier.droits_aah,
    },
  }
}
