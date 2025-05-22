export interface Livrable {
    _id?: string;
    nom: string;
    description: string;
    dateLimite: Date;
    urlDepot: string;
    statut: StatutLivrable;
    projetId: string;
    creeLe?: Date;
    majLe?: Date;
}

export enum StatutLivrable {
    EN_ATTENTE = 'En attente',
    EN_RETARD = 'En retard',
    TERMINE = 'Terminé'
}
