const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

require('dotenv').config();

// ✅ Validation des variables d'environnement critiques
const REQUIRED_ENV_VARS = ["MONGODB_URI", "PORT", "JWT_SECRET", "DEEPSEEK_API_KEY"];
REQUIRED_ENV_VARS.forEach((envVar) => {
    if (!process.env[envVar]) {
        throw new Error(`La variable d'environnement ${envVar} est manquante.`);
    }
});

// ✅ Énumérations globales
const Enums = Object.freeze({
    UtilisateurRole: {
        ETUDIANT: "ETUDIANT",
        TUTEUR: "TUTEUR",
        ADMIN: "ADMIN",
    },
    StatutProjet: {
        BROUILLON: 'BROUILLON',
        A_VENIR: 'A_VENIR',
        EN_COURS: 'EN_COURS',
        EN_RETARD: 'EN_RETARD',
        BLOQUE: 'BLOQUE',
        TERMINE: 'TERMINE',
        ARCHIVE: 'ARCHIVE'
    },
    StatutLivrable: {
        PLANIFIE: 'PLANIFIE',
        EN_COURS: 'EN_COURS',
        SOUMIS: 'SOUMIS',
        VALIDE: 'VALIDE',
        REFUSE: 'REFUSE',
        ARCHIVE: 'ARCHIVE'
    },
    NiveauRisque: {
        FAIBLE: 'FAIBLE',
        MODERE: 'MODERE',
        ELEVE: 'ELEVE',
        CRITIQUE: 'CRITIQUE'
    },
    TypeValidation: {
        REQUIS: 'REQUIS',
        OPTIONNEL: 'OPTIONNEL',
        CONDITIONNEL: 'CONDITIONNEL'
    },
    TypeLivrable: {
        DOCUMENT: 'DOCUMENT',
        CODE: 'CODE',
        PRESENTATION: 'PRESENTATION',
        PROTOTYPE: 'PROTOTYPE',
        AUTRE: 'AUTRE'
    },
    PrioriteProjet: {
        BASSE: 'BASSE',
        MOYENNE: 'MOYENNE',
        HAUTE: 'HAUTE',
        CRITIQUE: 'CRITIQUE'
    },
    TypeFormation: {
        EN_LIGNE: 'EN_LIGNE',
        PRESENTIEL: 'PRESENTIEL',
        HYBRIDE: 'HYBRIDE'
    },
    NiveauFormation: {
        DEBUTANT: 'DEBUTANT',
        INTERMEDIAIRE: 'INTERMEDIAIRE',
        AVANCE: 'AVANCE',
        EXPERT: 'EXPERT'
    },
    StatutCertification: {
        NON_COMMENCE: 'NON_COMMENCE',
        EN_COURS: 'EN_COURS',
        REUSSI: 'REUSSI',
        ECHOUE: 'ECHOUE',
        EXPIRE: 'EXPIRE'
    },
    StatutTache: {
        A_FAIRE: 'A_FAIRE',
        EN_COURS: 'EN_COURS',
        TERMINEE: 'TERMINEE',
        BLOQUEE: 'BLOQUEE'
    },
    TypeSignalement: {
        BLOQUE: 'BLOQUE',
        URGENT: 'URGENT',
        RETARD: 'RETARD',
        AUTRE: 'AUTRE'
    },
    PrioriteSignalement: {
        BASSE: 'BASSE',
        MOYENNE: 'MOYENNE',
        HAUTE: 'HAUTE',
        URGENTE: 'URGENTE'
    },
    StatutSignalement: {
        OUVERT: 'OUVERT',
        EN_COURS: 'EN_COURS',
        RESOLU: 'RESOLU',
        FERME: 'FERME'
    }
});

// Securite avec valeurs de production plus strictes
const ConfigSecurite = Object.freeze({
    JWT: {
        // 1 jour en dev, 2h en production
        EXPIRE_DANS: process.env.NODE_ENV === 'production'
            ? process.env.JWT_EXPIRES_IN || '2h'
            : process.env.JWT_EXPIRES_IN || '1d',
        NOM_COOKIE: process.env.JWT_COOKIE_NAME || '__progease_token',
        ALGORITHME: 'HS256',
        REFRESH_TOKEN_EXPIRE: '7d'
    },
    MOT_DE_PASSE: {
        LONGUEUR_MIN: parseInt(process.env.PASSWORD_MIN_LENGTH, 10) || 10,
        NB_SALT: parseInt(process.env.PASSWORD_SALT_ROUNDS, 10) || 12,
        NB_MAX_ESSAIS: parseInt(process.env.PASSWORD_MAX_ATTEMPTS, 10) || 5,
        MINUTES_VERROUILLAGE: parseInt(process.env.PASSWORD_LOCKOUT_MINUTES, 10) || 30,
        REGEX_VALIDATION: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10,}$/
    },
    RATE_LIMIT: {
        WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000, // 15 minutes
        MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100, // 100 requetes
    },
    CORS: {
        ORIGINS: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:3000'],
        METHODS: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        ALLOWED_HEADERS: ['Content-Type', 'Authorization']
    }
});

const PaginationParDefaut = Object.freeze({
    PAGE: 1,
    LIMITE: 20,
    LIMITE_MAX: 100,
});

const MessagesErreur = Object.freeze({
    GENERAL: {
        NON_TROUVE: 'Ressource non trouvee.',
        ERREUR_SERVEUR: 'Erreur serveur interne.',
        NON_AUTORISE: 'Acces non autorise.',
        INTERDIT: 'Action interdite.',
        ID_INVALIDE: 'ID invalide.',
        VALIDATION: 'Erreur de validation des donnees.',
        RATE_LIMIT: 'Trop de requetes, veuillez reessayer plus tard.'
    },
    PROJET: {
        INVALID_TEAM_MEMBER: "Un membre de l'équipe est invalide.",
        NOT_FOUND: "Projet introuvable.",
        MEMBRE_EQUIPE_INVALIDE: 'Un membre de l\'equipe est invalide.',
        NON_TROUVE: 'Projet introuvable.',
        DATE_INVALIDE: 'Les dates du projet sont invalides.',
        STATUT_INVALIDE: 'Le statut du projet est invalide.',
        COMPETENCES_INVALIDES: 'Les competences specifiees sont invalides.'
    },
    LIVRABLE: {
        NON_TROUVE: 'Livrable introuvable.',
        INVALIDE: 'Livrable invalide.',
        DATE_LIMITE_INVALIDE: 'La date limite est invalide.',
        STATUT_INVALIDE: 'Le statut du livrable est invalide.',
        PROJET_INVALIDE: 'Le projet associe est invalide ou introuvable.'
    },
    AUTH: {
        TOKEN_EXPIRE: 'Token d\'authentification expire.',
        TOKEN_INVALIDE: 'Token d\'authentification invalide.',
        COMPTE_VERROUILLE: 'Compte verrouille suite à trop de tentatives.',
        MOT_DE_PASSE_INVALIDE: 'Le mot de passe ne respecte pas les criteres de securite.',
        INVALID_CREDENTIALS: 'Identifiants invalides',
        TOKEN_EXPIRED: 'Token expiré',
        TOKEN_INVALID: 'Token invalide',
        UNAUTHORIZED: 'Non autorisé'
    },
    VALIDATION: {
        REQUIRED_FIELD: 'Ce champ est requis',
        INVALID_FORMAT: 'Format invalide'
    }
});

const StatutHttp = Object.freeze({
    OK: 200,
    CREE: 201,
    SANS_CONTENU: 204,
    MAUVAISE_REQUETE: 400,
    NON_AUTORISE: 401,
    INTERDIT: 403,
    NON_TROUVE: 404,
    CONFLIT: 409,
    TROP_DE_REQUETES: 429,
    ERREUR_INTERNE: 500,
});

const NODE_ENV = process.env.NODE_ENV || 'development';
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/progease';
const JWT_SECRET = process.env.JWT_SECRET || 'votre_secret_jwt_super_securise_pour_la_production_2025';
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:4200', 'http://localhost:3000'];
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

const API_VERSION = '2.0.0';
const RATE_LIMIT = {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX: 100 // Nombre maximum de requêtes par fenêtre
};

const ERROR_CODES = {
    BAD_REQUEST: 'BAD_REQUEST',
    UNAUTHORIZED: 'UNAUTHORIZED',
    FORBIDDEN: 'FORBIDDEN',
    NOT_FOUND: 'NOT_FOUND',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    INTERNAL_ERROR: 'INTERNAL_ERROR'
};

// Configuration des variables d'environnement requises
exports.VARIABLES_ENV_OBLIGATOIRES = {
    MONGODB_URI: 'URI de connexion MongoDB',
    JWT_SECRET: 'Clé secrète pour JWT',
    PORT: 'Port du serveur',
    NODE_ENV: 'Environnement (development/production)',
    DEEPSEEK_API_KEY: 'Clé API Deepseek'
};

// Configuration de la base de données
exports.DB_CONFIG = {
    COLLECTIONS: {
        UTILISATEURS: 'utilisateurs',
        PROJETS: 'projets',
        EVALUATIONS: 'evaluations',
        LIVRABLES: 'livrables'
    },
    CONNECTION_OPTIONS: {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
};

// Configuration de l'API
exports.API_CONFIG = {
    PREFIX: '/api/v1',
    RATE_LIMIT: {
        WINDOW_MS: 15 * 60 * 1000, // 15 minutes
        MAX_REQUESTS: 100
    }
};

// Configuration de la validation
exports.VALIDATION = {
    PASSWORD: {
        MIN_LENGTH: 8,
        MAX_LENGTH: 50
    },
    NOM_UTILISATEUR: {
        MIN_LENGTH: 3,
        MAX_LENGTH: 30
    }
};

// Configuration des messages d'erreur
exports.ERROR_MESSAGES = {
    AUTH: {
        INVALID_CREDENTIALS: 'Identifiants invalides',
        TOKEN_EXPIRED: 'Token expiré',
        TOKEN_INVALID: 'Token invalide',
        UNAUTHORIZED: 'Non autorisé'
    },
    VALIDATION: {
        REQUIRED_FIELD: 'Ce champ est requis',
        INVALID_FORMAT: 'Format invalide'
    }
};

// Configuration des statuts HTTP
exports.HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_ERROR: 500
};

module.exports = {
    NODE_ENV,
    PORT,
    MONGODB_URI,
    JWT_SECRET,
    ALLOWED_ORIGINS,
    LOG_LEVEL,
    API_VERSION,
    RATE_LIMIT,
    ERROR_CODES,
    MessagesErreur,
    StatutHttp,
    Enums,
    SecurityConfig: ConfigSecurite,
    PaginationDefaults: PaginationParDefaut,
    ENVIRONMENTS: {
        DEVELOPMENT: 'development',
        PRODUCTION: 'production',
        TEST: 'test'
    },
    Config: {
        pagination: {
            defaultLimit: 20,
            maxLimit: 100
        },
        upload: {
            maxFileSize: 5 * 1024 * 1024, // 5MB
            allowedMimeTypes: [
                'image/jpeg',
                'image/png',
                'image/gif',
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/vnd.ms-powerpoint',
                'application/vnd.openxmlformats-officedocument.presentationml.presentation'
            ]
        },
        security: {
            passwordMinLength: 8,
            passwordMaxLength: 128,
            saltRounds: 10,
            tokenExpiration: '24h',
            refreshTokenExpiration: '7d'
        },
        email: {
            verificationTokenExpiration: 24 * 60 * 60 * 1000, // 24 heures
            resetPasswordTokenExpiration: 1 * 60 * 60 * 1000 // 1 heure
        }
    }
};

