import { Deliverable } from './deliverable.model';

export interface Project {
  _id?: string;
  titre: string;
  description: string;
  equipe: string[]; // IDs des utilisateurs
  tuteur: string;   // ID de l'utilisateur tuteur
  competences: string[];
  dateDebut: Date | string;
  dateFin: Date | string;
  livrables?: Deliverable[];
  statut: 'brouillon' | 'en_cours' | 'termine' | 'archive';
  progression?: number;
  creeLe?: Date | string;
  majLe?: Date | string;
}

export const ProjectStatuses = {
  DRAFT: 'brouillon',
  IN_PROGRESS: 'en_cours',
  COMPLETED: 'termine',
  ARCHIVED: 'archive'
};
