export interface Deliverable {
  _id?: string;
  nom: string;
  description: string;
  dateLimite: Date | string;
  urlDepot: string;
  statut: 'OVERDUE' | 'PENDING' | 'COMPLETED';
  projetId?: string;
  creeLe?: Date | string;
  majLe?: Date | string;
}

export const DeliverableStatuses = {
  COMPLETED: 'COMPLETED',
  PENDING: 'PENDING',
  OVERDUE: 'OVERDUE'
};
