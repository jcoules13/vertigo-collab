export interface Collaborateur {
  id: string
  user_id: string
  nom: string
  prenom: string
  email: string
  telephone: string | null
  role_asso: 'admin' | 'membre_actif' | 'benevole'
  avatar_url: string | null
  actif: boolean
  created_at: string
  updated_at: string
}

export interface Permanence {
  id: string
  nom: string
  lieu: string
  jour_semaine: number
  heure_debut: string
  heure_fin: string
  actif: boolean
  created_at: string
  updated_at: string
}

export interface PermanenceOccurrence {
  id: string
  permanence_id: string
  date: string
  heure_debut: string
  heure_fin: string
  annulee: boolean
  google_calendar_event_id: string | null
  notes: string | null
  reminder_48h_sent: boolean
  reminder_24h_sent: boolean
  created_at: string
  permanences?: Permanence
  permanence_assignments?: PermanenceAssignment[]
}

export interface PermanenceAssignment {
  id: string
  occurrence_id: string
  collaborateur_id: string
  statut: 'en_attente' | 'confirme' | 'refuse' | 'absent'
  notifie_at: string | null
  confirme_at: string | null
  created_at: string
  collaborateurs?: Collaborateur
}

export interface RendezVous {
  id: string
  titre: string
  description: string | null
  date: string
  heure_debut: string
  heure_fin: string
  lieu: string | null
  cree_par: string | null
  google_calendar_event_id: string | null
  reminder_48h_sent: boolean
  reminder_24h_sent: boolean
  created_at: string
  updated_at: string
  collaborateurs?: Collaborateur
  rdv_participants?: RdvParticipant[]
}

export interface RdvParticipant {
  id: string
  rdv_id: string
  collaborateur_id: string
  statut: 'en_attente' | 'confirme' | 'refuse'
  notifie_at: string | null
  confirme_at: string | null
  created_at: string
  collaborateurs?: Collaborateur
}

export interface ReservationExterne {
  id: string
  usager_nom: string
  usager_email: string | null
  usager_telephone: string | null
  canal: 'visio' | 'presentiel' | 'telephone' | 'autre'
  titre: string
  description: string | null
  date: string
  heure_debut: string
  heure_fin: string
  lieu: string | null
  google_calendar_event_id: string
  statut: 'nouvelle' | 'confirmee' | 'annulee' | 'terminee'
  notes_admin: string | null
  gere_par: string | null
  synced_at: string
  confirmed_at: string | null
  cancelled_at: string | null
  created_at: string
  updated_at: string
}

export const CANAL_LABELS: Record<ReservationExterne['canal'], string> = {
  visio: 'Visio',
  presentiel: 'Présentiel',
  telephone: 'Téléphone',
  autre: 'Autre',
}

export const STATUT_RESERVATION_LABELS: Record<ReservationExterne['statut'], string> = {
  nouvelle: 'Nouvelle',
  confirmee: 'Confirmée',
  annulee: 'Annulée',
  terminee: 'Terminée',
}

// PPV — Pilier d'accompagnement
export interface Pilier {
  besoin: string
  niveau: 1 | 2 | 3 | null
  actions: string
}

export interface Piliers {
  communication: Pilier
  administratif: Pilier
  social: Pilier
  bien_etre: Pilier
}

// PPV — Plan d'actions row
export interface PlanAction {
  action: string
  responsable: string
  echeance: string
  indicateur: string
}

export interface DossierSuivi {
  id: string
  // Section 1: Identite
  usager_nom: string
  usager_prenom: string | null
  usager_email: string | null
  usager_telephone: string | null
  usager_date_naissance: string | null
  usager_adresse: string | null
  personne_prevenir_nom: string | null
  personne_prevenir_telephone: string | null
  // Section 2: Consentement RGPD
  consent_conservation: boolean
  consent_contact: boolean
  consent_date: string | null
  // Section 3: Situation actuelle
  situation_personnelle: string[]
  situation_familiale: string[]
  situation_financiere: string[]
  situation_professionnelle: string[]
  // Section 4: Droits et couverture
  droits_medecin_traitant: boolean
  droits_ald: boolean
  droits_rqth: boolean
  droits_mdph_en_cours: boolean
  droits_aah: boolean
  droits_complementaire_sante: boolean
  droits_commentaires: string | null
  // Section 5: Objectifs SMART
  objectif_1: string | null
  objectif_2: string | null
  objectif_3: string | null
  // Section 6: Piliers
  piliers: Piliers
  // Section 7: Plan d'actions
  plan_actions: PlanAction[]
  // Section 8: Auto-evaluation
  eval_douleur: number | null
  eval_energie: number | null
  eval_stress: number | null
  eval_soutien: number | null
  // Section 9: Observations
  observations: string | null
  // Section 11: Signatures
  signature_beneficiaire_date: string | null
  signature_referent_date: string | null
  // Metadata
  motif: string | null
  notes: string | null
  statut: 'ouvert' | 'en_cours' | 'clos'
  cree_par: string
  responsable_id: string | null
  created_at: string
  updated_at: string
  // Joined data
  collaborateurs?: Collaborateur
  responsable?: Collaborateur
  seances?: Seance[]
  dossier_reservations?: DossierReservation[]
}

export interface Seance {
  id: string
  dossier_id: string
  reservation_id: string | null
  date: string
  resume: string
  actions_prevues: string | null
  redige_par: string
  created_at: string
  updated_at: string
  // Audio transcription
  audio_path: string | null
  audio_duration_seconds: number | null
  transcription_brute: string | null
  transcription_status: 'none' | 'uploading' | 'transcribing' | 'summarizing' | 'ready' | 'validated' | 'error'
  transcription_error: string | null
  consent_enregistrement: boolean
  audio_uploaded_at: string | null
  validated_at: string | null
  audio_deleted_at: string | null
  collaborateurs?: Collaborateur
}

export const TRANSCRIPTION_STATUS_LABELS: Record<Seance['transcription_status'], string> = {
  none: 'Pas d\'enregistrement',
  uploading: 'Envoi en cours...',
  transcribing: 'Transcription en cours...',
  summarizing: 'G\u00e9n\u00e9ration du r\u00e9sum\u00e9...',
  ready: 'Transcription pr\u00eate',
  validated: 'Valid\u00e9e',
  error: 'Erreur',
}

export interface DossierReservation {
  id: string
  dossier_id: string
  reservation_id: string
  linked_at: string
  reservations_externes?: ReservationExterne
}

export const STATUT_DOSSIER_LABELS: Record<DossierSuivi['statut'], string> = {
  ouvert: 'Ouvert',
  en_cours: 'En cours',
  clos: 'Clos',
}

export interface ActiveConflict {
  collaborateur_id: string
  collaborateur_nom: string
  collaborateur_prenom: string
  occurrence_id: string
  assignment_id: string
  permanence_nom: string
  permanence_lieu: string | null
  perm_date: string
  perm_debut: string
  perm_fin: string
  rdv_id: string
  rdv_titre: string
  rdv_debut: string
  rdv_fin: string
  overlap_start: string
  overlap_end: string
}

export const JOURS_SEMAINE = [
  'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'
] as const

// PPV — Options multi-choix
export const SITUATION_PERSONNELLE_OPTIONS = [
  'Seul(e)', 'En couple', 'Enfants à charge'
] as const

export const SITUATION_FAMILIALE_OPTIONS = [
  'Isolé(e)', 'Entourage soutenant', 'Rupture familiale'
] as const

export const SITUATION_FINANCIERE_OPTIONS = [
  'Minima sociaux', 'Difficultés ponctuelles'
] as const

export const SITUATION_PROFESSIONNELLE_OPTIONS = [
  'En emploi', 'En recherche', 'En formation', 'Arrêt maladie'
] as const

// PPV — Labels niveaux par pilier (fidele au document PPV)
export const PILIER_NIVEAUX: Record<keyof Piliers, [string, string, string]> = {
  communication: ['Information', 'Accompagnement', 'Orientation'],
  administratif: ['Information', 'Assistance', 'Accompagnement'],
  social: ['Intégration', 'Autonomisation', 'Accompagnement'],
  bien_etre: ['Sensibilisation', 'Participation', 'Soutien'],
}

export const PILIER_LABELS: Record<keyof Piliers, string> = {
  communication: 'Communication',
  administratif: 'Accompagnement administratif',
  social: 'Accompagnement social',
  bien_etre: 'Accompagnement bien-être',
}

export const PILIER_DESCRIPTIONS: Record<keyof Piliers, [string, string, string]> = {
  communication: [
    'Partage d\'informations, écoute active, échanges',
    'Entraînement, structuration des échanges, compétences de communication',
    'Mise en relation (médiateur, juriste, avocat, etc.)',
  ],
  administratif: [
    'Présentation des droits et dispositifs',
    'Compréhension et préparation des dossiers',
    'Suivi complet des démarches',
  ],
  social: [
    'Participation aux activités collectives',
    'Développement des compétences sociales',
    'Soutien personnalisé à l\'inclusion',
  ],
  bien_etre: [
    'Information sur les activités de bien-être',
    'Engagement dans des activités adaptées',
    'Accompagnement personnalisé',
  ],
}

export const DEFAULT_PILIERS: Piliers = {
  communication: { besoin: '', niveau: null, actions: '' },
  administratif: { besoin: '', niveau: null, actions: '' },
  social: { besoin: '', niveau: null, actions: '' },
  bien_etre: { besoin: '', niveau: null, actions: '' },
}
