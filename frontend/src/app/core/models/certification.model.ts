export enum StatutCertification {
    NON_COMMENCE = 'NON_COMMENCE',
    EN_COURS = 'EN_COURS',
    REUSSI = 'REUSSI',
    ECHOUE = 'ECHOUE',
    EXPIRE = 'EXPIRE',
    VALIDE = 'VALIDE',
    REVOQUE = 'REVOQUE'
}

export interface Certification {
    _id?: string;
    titre: string;
    description: string;
    niveau: string;
    image?: string;
    conditions?: {
        formationsRequises?: {
            formation: string;
            noteMinimale: number;
        }[];
        quizFinal?: string;
        noteMinimaleQuizFinal?: number;
        projetFinal?: string;
    };
    creeLe?: string;
    majLe?: string;
}

export interface CertificationObtenue {
    _id?: string;
    certification: string;
    utilisateur: string;
    statut: StatutCertification;
    dateObtention?: string;
    dateExpiration?: string;
    numeroUnique?: string;
    formationsTerminees?: {
        formation: string;
        dateCompletion: string;
        note: number;
    }[];
    quizFinalResultat?: string;
    projetFinalResultat?: string;
    creeLe?: string;
    majLe?: string;
} 