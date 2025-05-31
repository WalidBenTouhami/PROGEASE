// Interface pour les analyses IA basée sur le service AI
export interface AnalyseIA {
    analyse: {
        complexite: ComplexiteProjet;
        dureeEstimee: string;
        risques: string[];
        points_forts: string[];
        recommandations: string[];
    };
    competences: {
        requises: string[];
        recommandees: string[];
        niveau: string;
    };
    planning: {
        phases: PhaseProjet[];
        jalons: JalonProjet[];
    };
}

export interface PhaseProjet {
    nom: string;
    duree: string;
    livrables: string[];
}

export interface JalonProjet {
    nom: string;
    date: string;
}

export enum ComplexiteProjet {
    SIMPLE = 'SIMPLE',
    MOYENNE = 'MOYENNE',
    COMPLEXE = 'COMPLEXE',
    TRES_COMPLEXE = 'TRES_COMPLEXE'
}

// Interface pour les recommandations d'apprentissage
export interface RecommandationApprentissage {
    competence: string;
    ressources: {
        cours: {
            titre: string;
            lien: string;
        };
        livre: {
            titre: string;
            auteur: string;
        };
        projet: {
            titre: string;
            description: string;
        };
        communaute: {
            nom: string;
            lien: string;
        };
    };
} 