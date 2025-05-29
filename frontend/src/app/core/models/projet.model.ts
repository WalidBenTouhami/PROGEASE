import { Livrable } from './livrable.model';

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
    creeLe?: Date;
    majLe?: Date;
}

export enum StatutProjet {
    BROUILLON = 'Brouillon',
    EN_COURS = 'En cours',
    TERMINE = 'Terminé',
    ARCHIVE = 'Archivé'
}

export const ProjectStatuses = {
  BROUILLON: 'Brouillon',
  EN_COURS: 'En cours',
  TERMINE: 'Terminé',
  ARCHIVE: 'Archivé'
} as const;
