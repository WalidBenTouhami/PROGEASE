// Synced with backend/src/models/livrable.model.js
export interface Livrable {
    _id?: string;
    intitule: string;
    description: string;
    dateLimite: Date;
    projetId: string;
    statut: StatutLivrable;
    creeLe?: Date;
    majLe?: Date;
    // urlDepot?: string; // Uncomment if backend adds this field
}

export enum StatutLivrable {
    EN_ATTENTE = 'en_attente',
    EN_RETARD = 'en_retard',
    TERMINE = 'termine'
}
