const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Tableau des variables necessaires et fonction pour verifier/logger sans crash
const VARIABLES_ENV_OBLIGATOIRES = {
    CRITIQUES: ["MONGO_URI", "JWT_SECRET"],
    RECOMMANDEES: ["PORT", "DEEPSEEK_API_KEY"]
};

// Verification sans crash immediat pour les variables recommandees
const variablesManquantes = {
    critiques: [],
    recommandees: []
};

VARIABLES_ENV_OBLIGATOIRES.CRITIQUES.forEach((varEnv) => {
    if (!process.env[varEnv]) {
        variablesManquantes.critiques.push(varEnv);
    }
});

VARIABLES_ENV_OBLIGATOIRES.RECOMMANDEES.forEach((varEnv) => {
    if (!process.env[varEnv]) {
        variablesManquantes.recommandees.push(varEnv);
    }
});

// Ne crash que si des variables critiques manquent
if (variablesManquantes.critiques.length) {
    throw new Error(`Variables d'environnement critiques manquantes: ${variablesManquantes.critiques.join(', ')}`);
}

if (variablesManquantes.recommandees.length) {
    console.warn(`⚠️ Variables d'environnement recommandees manquantes: ${variablesManquantes.recommandees.join(', ')}`);
}

// Enum utilises dans le systeme
const Enum = Object.freeze({
    StatutProjet: {
        BROUILLON: "Brouillon",
        EN_COURS: "En_cours",
        TERMINE: "Termine",
        ARCHIVE: "Archive",
        EN_RETARD: "En_retard",
        A_VENIR: "A_venir",
    },
    StatutLivrable: {
        EN_ATTENTE: 'En_attente',
        EN_COURS: 'En_cours',
        EN_RETARD: 'En_retard',
        TERMINE: 'Termine',
        VALIDE: 'Valide',
        REJETE: 'Rejete'
    },
});

// Securite avec valeurs de production plus strictes
const ConfigSecurite = Object.freeze({
    JWT: {
        // 1 jour en dev, 2h en production
        EXPIRE_DANS: process.env.NODE_ENV === 'production'
            ? process.env.JWT_EXPIRES_IN || "2h"
            : process.env.JWT_EXPIRES_IN || "1d",
        NOM_COOKIE: process.env.JWT_COOKIE_NAME || "__progease_token",
    },
    MOT_DE_PASSE: {
        LONGUEUR_MIN: parseInt(process.env.PASSWORD_MIN_LENGTH, 10) || 10,
        NB_SALT: parseInt(process.env.PASSWORD_SALT_ROUNDS, 10) || 12,
        NB_MAX_ESSAIS: parseInt(process.env.PASSWORD_MAX_ATTEMPTS, 10) || 5,
        MINUTES_VERROUILLAGE: parseInt(process.env.PASSWORD_LOCKOUT_MINUTES, 10) || 30,
    },
    RATE_LIMIT: {
        WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000, // 15 minutes
        MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100, // 100 requetes
    }
});

const PaginationParDefaut = Object.freeze({
    PAGE: 1,
    LIMITE: 20,
    LIMITE_MAX: 100,
});

const MessagesErreur = Object.freeze({
    GENERAL: {
        NON_TROUVE: "Ressource non trouvee.",
        ERREUR_SERVEUR: "Erreur serveur interne.",
        NON_AUTORISE: "Acces non autorise.",
        INTERDIT: "Action interdite.",
        ID_INVALIDE: "ID invalide.",
        VALIDATION: "Erreur de validation des donnees."
    },
    PROJET: {
        MEMBRE_EQUIPE_INVALIDE: "Un membre de l'equipe est invalide.",
        NON_TROUVE: "Projet introuvable.",
    },
    LIVRABLE: {
        NON_TROUVE: "Livrable introuvable.",
        INVALIDE: "Livrable invalide.",
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
    ERREUR_INTERNE: 500,
});

module.exports = {
    MONGO_URI: process.env.MONGO_URI,
    PORT: process.env.PORT || 3000,
    JWT_SECRET: process.env.JWT_SECRET,
    DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY,
    Enum,
    ConfigSecurite,
    PaginationParDefaut,
    MessagesErreur,
    StatutHttp,
    NODE_ENV: process.env.NODE_ENV || 'development',

};

