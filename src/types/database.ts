export interface Collaborateur {
  id: string
  user_id: string
  nom: string
  prenom: string
  email: string
  telephone: string | null
  role_asso: 'admin' | 'membre' | 'benevole'
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

export interface DossierSuivi {
  id: string
  usager_nom: string
  usager_email: string | null
  usager_telephone: string | null
  motif: string | null
  notes: string | null
  statut: 'ouvert' | 'en_cours' | 'clos'
  cree_par: string
  responsable_id: string | null
  created_at: string
  updated_at: string
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
  collaborateurs?: Collaborateur
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

export const JOURS_SEMAINE = [
  'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'
] as const
