export type StatutLivrable = 'En retard' | 'En attente' | 'Terminé';

export interface Deliverable {
  _id?: string;
  nom: string;
  description: string;
  dateLimite: Date | string;
  urlDepot: string;
  statut: StatutLivrable;
  projetId?: string;
  creeLe?: Date | string;
  majLe?: Date | string;
}

export const DeliverableStatuses = {
  TERMINE: 'Terminé',
  EN_ATTENTE: 'En attente',
  EN_RETARD: 'En retard'
} as const;
