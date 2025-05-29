import { Livrable } from './livrable.model';

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
    BROUILLON = 'Brouillon',
    EN_COURS = 'En_cours',
    TERMINE = 'Termine',
    ARCHIVE = 'Archive',
    EN_RETARD= 'En_retard',
    A_VENIR= 'A_venir'
}




