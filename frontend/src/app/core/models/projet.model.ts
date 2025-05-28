import { Livrable } from './livrable.model';
import { GetProjetsQuery, GetProjetsGQL } from '../core/generated/graphql';

// Synced with backend/src/models/projet.model.js
export interface Projet {
    _id?: string;
    titre: string;
    description: string;
    equipe: string[];
    tuteur?: string;
    competences: string[];
    dateDebut: Date;
    dateFin: Date;
    livrables: string[];
    statut: StatutProjet;
    progression?: number;
    duree?: number; // Virtual
    estEnRetard?: boolean; // Virtual
    livrablesComplets?: Livrable[]; // Virtual, if used in UI
    creeLe?: Date;
    majLe?: Date;
}

export enum StatutProjet {
    BROUILLON = 'brouillon',
    EN_COURS = 'en_cours',
    TERMINE = 'termine',
    ARCHIVE = 'archive'
}

export const ProjectStatuses = {
  BROUILLON: 'brouillon',
  EN_COURS: 'en_cours',
  TERMINE: 'termine',
  ARCHIVE: 'archive'
} as const;
