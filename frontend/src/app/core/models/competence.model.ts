// Synced with backend/src/models/competence.model.js
export interface Competence {
    _id?: string;
    nom: string;
    description: string;
    niveau: NiveauCompetence;
    categorie: CategorieCompetence;
    prerequis?: string[];
    creeLe?: Date;
    majLe?: Date;
}

export enum NiveauCompetence {
    DEBUTANT = 'Debutant',
    INTERMEDIAIRE = 'Intermediaire',
    AVANCE = 'Avance',
    EXPERT = 'Expert'
}

export enum CategorieCompetence {
    TECHNIQUE = 'Technique',
    SOFT_SKILL = 'Soft_skill',
    METHODOLOGIE = 'Methodologie',
    OUTIL = 'Outil'
} 