// Synced with backend/src/models/livrable.model.js
export enum StatutLivrable {
  EN_ATTENTE = 'EN_ATTENTE',
  EN_COURS = 'EN_COURS',
  EN_REVISION = 'EN_REVISION',
  VALIDE = 'VALIDE',
  REJETE = 'REJETE'
}

export enum TypeLivrable {
  DOCUMENT = 'DOCUMENT',
  CODE = 'CODE',
  PRESENTATION = 'PRESENTATION',
  RAPPORT = 'RAPPORT',
  AUTRE = 'AUTRE'
}

export interface Livrable {
  _id?: string;
  intitule: string;
  description: string;
  type: TypeLivrable;
  projetId: string;
  dateLimite: string;
  statut: StatutLivrable;
  urlDepot?: string;
  fichiers?: {
    nom: string;
    url: string;
    type: string;
    taille: number;
    dateUpload: string;
  }[];
  commentaires?: {
    auteur: string;
    contenu: string;
    dateCreation: string;
  }[];
  creeLe?: string;
  majLe?: string;
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
