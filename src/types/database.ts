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

export const JOURS_SEMAINE = [
  'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'
] as const
