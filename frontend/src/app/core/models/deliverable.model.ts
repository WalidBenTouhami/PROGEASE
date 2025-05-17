export interface Deliverable {
  _id?: string;
  nom: string;
  description: string;
  dateLimite: Date | string;
  urlDepot: string;
  statut: 'En retard' | 'En attente' | 'Terminé';
  projetId?: string;
  creeLe?: Date | string;
  majLe?: Date | string;
}
