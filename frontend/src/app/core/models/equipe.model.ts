// Synced with backend/src/models/equipe.model.js
export interface Equipe {
    _id?: string;
    nom: string;
    membres: string[];
    projet?: string;
    competencesPrincipales: string[];
    forceEstimee?: number;
    creeLe?: Date;
    majLe?: Date;
}

export enum StatutEquipe {
    EN_FORMATION = 'En_formation',
    ACTIVE = 'Active',
    INACTIVE = 'Inactive',
    DISSOUTE = 'Dissoute'
} 