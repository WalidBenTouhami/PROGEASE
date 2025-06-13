export enum TypeFormation {
    VIDEO = 'VIDEO',
    PRESENTIEL = 'PRESENTIEL',
    HYBRIDE = 'HYBRIDE',
    AUTO_FORMATION = 'AUTO_FORMATION',
    EN_LIGNE = 'EN_LIGNE'
}

export enum NiveauFormation {
    DEBUTANT = 'DEBUTANT',
    INTERMEDIAIRE = 'INTERMEDIAIRE',
    AVANCE = 'AVANCE',
    EXPERT = 'EXPERT'
}

export interface Formation {
    _id?: string;
    titre: string;
    description: string;
    type: TypeFormation;
    niveau: NiveauFormation;
    categorie: string;
    image?: string;
    dureeEstimee: number;
    prerequis?: string[];
    objectifs?: string[];
    modules?: any[];
    formateur: string;
    creeLe?: string;
    majLe?: string;
} 