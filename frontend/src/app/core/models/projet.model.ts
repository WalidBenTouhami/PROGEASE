import { Livrable } from './livrable.model';

// Synced with backend/src/models/projet.model.js
export enum StatutProjet {
    EN_COURS = 'EN_COURS',
    TERMINE = 'TERMINE',
    EN_ATTENTE = 'EN_ATTENTE',
    ANNULE = 'ANNULE'
}

export interface Membre {
    id: string;
    nom: string;
    prenom: string;
    role: string;
}

export interface Projet {
    id?: string;
    titre: string;
    description: string;
    dateDebut: string;
    dateFin: string;
    statut: StatutProjet;
    responsableId?: string;
    responsable?: {
        id: string;
        nom: string;
        prenom: string;
    };
    membres?: Membre[];
    competences?: string[];
    livrables?: string[];
    dateCreation?: string;
    dateModification?: string;
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




