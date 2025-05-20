import { Deliverable } from './deliverable.model';

export type StatutProjet = 'Brouillon' | 'En cours' | 'Terminé' | 'Archivé';

export interface Project {
  _id: string;
  titre: string;
  description: string;
  equipe: string[];
  tuteur: string;
  competences: string[];
  dateDebut: Date | string;
  dateFin: Date | string;
  livrables?: Deliverable[];
  statut: StatutProjet;
  progression?: number;
  creeLe?: Date | string;
  majLe?: Date | string;
}

export const ProjectStatuses = {
  BROUILLON: 'Brouillon',
  EN_COURS: 'En cours',
  TERMINE: 'Terminé',
  ARCHIVE: 'Archivé'
} as const;
