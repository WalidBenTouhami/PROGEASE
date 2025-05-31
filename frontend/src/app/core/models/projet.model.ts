import { Livrable } from './livrable.model';

// Synced with backend/src/models/projet.model.js
export interface Projet {
    id: string;
    titre: string;
    description: string;
    dateDebut: string;
    dateFin: string;
    statut: StatutProjet;
    responsableId: string;
    responsable?: {
        id: string;
        nom: string;
        prenom: string;
    };
    membres?: {
        id: string;
        nom: string;
        prenom: string;
        role: string;
    }[];
    livrables?: {
        id: string;
        titre: string;
        dateLimite: string;
        statut: string;
    }[];
    evaluations?: {
        id: string;
        note: number;
        commentaires: string;
        dateEvaluation: string;
    }[];
    tags?: string[];
    progression?: number;
    dateCreation: string;
    dateModification: string;
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
    responsableId: string;
    membres?: string[];
    tags?: string[];
}

export interface UpdateProjetInput {
    titre?: string;
    description?: string;
    dateDebut?: string;
    dateFin?: string;
    statut?: StatutProjet;
    responsableId?: string;
    membres?: string[];
    tags?: string[];
}

export enum StatutProjet {
    EN_COURS = 'EN_COURS',
    EN_ATTENTE = 'EN_ATTENTE',
    TERMINE = 'TERMINE',
    ARCHIVE = 'ARCHIVE'
}




