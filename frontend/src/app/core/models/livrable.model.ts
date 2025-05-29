// Synced with backend/src/models/livrable.model.js
export interface Livrable {
    _id?: string;
    intitule: string;
    description: string;
    dateLimite: Date;
    projetId: string;
    statut: StatutLivrable;
    creeLe?: Date;
    majLe?: Date;
    // urlDepot?: string; // Uncomment if backend adds this field
}

export enum StatutLivrable {
  EN_ATTENTE = 'En_attente',
  EN_COURS = 'En_cours',
  EN_RETARD = 'En_retard',
  TERMINE = 'Termine',
  VALIDE = 'Valide',
  REJETE = 'Rejete'
}
