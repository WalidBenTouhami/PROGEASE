import { Deliverable } from './deliverable.model';

export interface Project {
  _id?: string;
  titre: string;
  description: string;
  equipe: string[]; // ou User[] si tu as un modèle utilisateur
  tuteur: string;   // ou User
  competences: string[];
  dateDebut: Date | string;
  dateFin: Date | string;
  livrables: Deliverable[];
  statut: 'Brouillon' | 'En cours' | 'Terminé' | 'Archivé';
  creeLe?: Date | string;
  majLe?: Date | string;
}
