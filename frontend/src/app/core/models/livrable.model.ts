// Synced with backend/src/models/livrable.model.js
export enum StatutLivrable {
  EN_COURS = 'EN_COURS',
  TERMINE = 'TERMINE',
  EN_ATTENTE = 'EN_ATTENTE',
  SOUMIS = 'SOUMIS'
}

export interface Livrable {
  id?: string;
  titre: string;
  intitule: string;
  description: string;
  dateLimite: string;
  statut: StatutLivrable;
  projetId: string;
  dateCreation?: string;
  dateModification?: string;
  fichiers?: string[];
  commentaires?: string[];
}

export interface CreateLivrableInput {
  titre: string;
  intitule: string;
  description: string;
  dateLimite: string;
  statut: StatutLivrable;
  projetId: string;
  fichiers?: string[];
  commentaires?: string;
}

export interface UpdateLivrableInput {
  titre?: string;
  intitule?: string;
  description?: string;
  dateLimite?: string;
  statut?: StatutLivrable;
  projetId?: string;
  fichiers?: string[];
  commentaires?: string;
  dateModification?: string;
}
