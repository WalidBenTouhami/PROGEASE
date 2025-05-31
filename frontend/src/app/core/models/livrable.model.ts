// Synced with backend/src/models/livrable.model.js
export enum StatutLivrable {
  EN_ATTENTE = 'EN_ATTENTE',
  SOUMIS = 'SOUMIS',
  EN_REVISION = 'EN_REVISION',
  VALIDE = 'VALIDE',
  REJETE = 'REJETE'
}

export interface Livrable {
  id: string;
  titre: string;
  description: string;
  dateCreation: string;
  dateLimite: string;
  dateModification: string;
  statut: StatutLivrable;
  note?: number;
  commentaires?: string;
  fichiers?: string[];
  projetId: string;
  projet?: {
    id: string;
    titre: string;
  };
  auteurId: string;
  auteur?: {
    id: string;
    nom: string;
    prenom: string;
  };
}

export interface CreateLivrableInput {
  titre: string;
  description: string;
  dateLimite: string;
  projetId: string;
  fichiers?: string[];
}

export interface UpdateLivrableInput {
  titre?: string;
  description?: string;
  dateLimite?: string;
  statut?: StatutLivrable;
  note?: number;
  commentaires?: string;
  fichiers?: string[];
}
