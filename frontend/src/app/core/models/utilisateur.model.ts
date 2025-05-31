// Synced with backend/src/models/utilisateur.model.js
export interface Utilisateur {
    _id?: string;
    nom: string;
    email: string;
    role: RoleUtilisateur;
    competences?: string[];
    projets?: string[];
    disponibilite?: boolean;
    creeLe?: Date;
    majLe?: Date;
}

export enum RoleUtilisateur {
    ADMIN = 'ADMIN',
    TUTEUR = 'TUTEUR',
    ETUDIANT = 'ETUDIANT'
} 