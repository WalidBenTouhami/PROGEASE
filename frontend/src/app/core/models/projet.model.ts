import { Livrable } from './livrable.model';

// Synced with backend/src/models/projet.model.js
export enum StatutProjet {
    BROUILLON = 'BROUILLON',
    EN_COURS = 'EN_COURS',
    EN_REVISION = 'EN_REVISION',
    TERMINE = 'TERMINE',
    ANNULE = 'ANNULE'
}

export interface Membre {
    id: string;
    nom: string;
    prenom: string;
    role: string;
}

export interface Projet {
    _id?: string;
    id?: string; // Alias for _id
    titre: string;
    nom?: string; // Alias for titre for backward compatibility
    description: string;
    equipe: string[];
    tuteur?: string;
    competences: string[];
    dateDebut: string; // ISO string
    dateFin: string;   // ISO string
    livrables: string[];
    statut: StatutProjet;
    progression?: number;
    creeLe?: string;
    majLe?: string;
    livrablesComplets?: Livrable[];
}

export interface User {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    role: string;
}

export interface Evaluation {
    id: string;
    score: number;
    comments: string;
    createdAt: string;
}

export interface CreateProjetInput {
    titre: string;
    description: string;
    dateDebut: string;
    dateFin: string;
    statut: StatutProjet;
    responsableId: string;
    membres?: string[];
    competences?: string[];
    livrables?: string[];
}

export interface UpdateProjetInput {
    titre?: string;
    description?: string;
    dateDebut?: string;
    dateFin?: string;
    statut?: StatutProjet;
    responsableId?: string;
    membres?: string[];
    competences?: string[];
    livrables?: string[];
    dateModification?: string;
}




