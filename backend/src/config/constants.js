/**
 * Constantes de l'application
 * @module config/constants
 */

const Enums = {
    StatutProjet: {
        BROUILLON: 'BROUILLON',
        EN_COURS: 'EN_COURS',
        EN_REVISION: 'EN_REVISION',
        TERMINE: 'TERMINE',
        ANNULE: 'ANNULE',
    },

    TypeLivrable: {
        DOCUMENT: 'DOCUMENT',
        CODE: 'CODE',
        PRESENTATION: 'PRESENTATION',
        RAPPORT: 'RAPPORT',
        AUTRE: 'AUTRE',
    },

    StatutLivrable: {
        EN_ATTENTE: 'EN_ATTENTE',
        EN_COURS: 'EN_COURS',
        EN_REVISION: 'EN_REVISION',
        VALIDE: 'VALIDE',
        REJETE: 'REJETE',
    },

    TypeFormation: {
        VIDEO: 'VIDEO',
        PRESENTIEL: 'PRESENTIEL',
        HYBRIDE: 'HYBRIDE',
        AUTO_FORMATION: 'AUTO_FORMATION',
    },

    NiveauFormation: {
        DEBUTANT: 'DEBUTANT',
        INTERMEDIAIRE: 'INTERMEDIAIRE',
        AVANCE: 'AVANCE',
        EXPERT: 'EXPERT',
    },

    StatutCertification: {
        EN_COURS: 'EN_COURS',
        VALIDE: 'VALIDE',
        EXPIRED: 'EXPIRED',
        REVOQUE: 'REVOQUE',
    },
};

const MessagesErreur = {
    AUTHENTIFICATION: {
        NON_AUTHENTIFIE: 'Non authentifié',
        NON_AUTORISE: 'Non autorisé',
        TOKEN_INVALIDE: 'Token invalide',
        TOKEN_EXPIRE: 'Token expiré',
        COMPTE_DESACTIVE: 'Compte désactivé',
    },
    VALIDATION: {
        CHAMPS_REQUIS: 'Tous les champs sont requis',
        FORMAT_INVALIDE: 'Format invalide',
        VALEUR_INVALIDE: 'Valeur invalide',
    },
    RESSOURCE: {
        NON_TROUVE: 'Ressource non trouvée',
        DEJA_EXISTE: 'Cette ressource existe déjà',
        SUPPRESSION_IMPOSSIBLE: 'Impossible de supprimer cette ressource',
    },
};

const StatutHttp = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500,
};

module.exports = {
    Enums,
    MessagesErreur,
    StatutHttp,
};
