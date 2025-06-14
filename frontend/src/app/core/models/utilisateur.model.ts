// Synced with backend/src/models/utilisateur.model.js
export enum UtilisateurRole {
    ETUDIANT = 'ETUDIANT',
    TUTEUR = 'TUTEUR',
    ADMIN = 'ADMIN'
}

export interface Utilisateur {
    _id?: string;
    nom: string;
    prenom: string;
    email: string;
    motDePasse?: string;
    role: UtilisateurRole;
    avatar?: string;
    actif: boolean;
    emailVerifie?: boolean;
    dateEmailVerifie?: string;
    projets?: string[];
    formations?: string[];
    certifications?: string[];
    derniereConnexion?: string;
    tentativesConnexion?: number;
    dateBlocage?: string;
    creeLe: string;
    majLe: string;
    preferences?: {
        theme: 'light' | 'dark';
        language: string;
        notifications: {
            email: boolean;
            push: boolean;
        };
    };
} 