// config/constants.js

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const VARIABLES_ENV_OBLIGATOIRES = ["MONGO_URI", "PORT", "JWT_SECRET", "DEEPSEEK_API_KEY"];
VARIABLES_ENV_OBLIGATOIRES.forEach((varEnv) => {
    if (!process.env[varEnv]) {
        throw new Error(`La variable d'environnement ${varEnv} est manquante.`);
    }
});

const Enum = Object.freeze({
    StatutProjet: {
        BROUILLON: "Brouillon",
        EN_COURS: "En cours",
        TERMINE: "Terminé",
        ARCHIVE: "Archivé",
    },

    StatutLivrable: {
        TERMINE: "Termine",
        EN_ATTENTE: "En attente",
        EN_RETARD: "En retard",
    },
});

const ConfigSecurite = Object.freeze({
    JWT: {
        EXPIRE_DANS: process.env.JWT_EXPIRES_IN || "7j",
        NOM_COOKIE: process.env.JWT_COOKIE_NAME || "__progease_token",
    },
    MOT_DE_PASSE: {
        LONGUEUR_MIN: parseInt(process.env.PASSWORD_MIN_LENGTH, 10) || 10,
        NB_SALT: parseInt(process.env.PASSWORD_SALT_ROUNDS, 10) || 12,
        NB_MAX_ESSAIS: parseInt(process.env.PASSWORD_MAX_ATTEMPTS, 10) || 5,
        MINUTES_VERROUILLAGE: parseInt(process.env.PASSWORD_LOCKOUT_MINUTES, 10) || 30,
    },
});

const PaginationParDefaut = Object.freeze({
    PAGE: 1,
    LIMITE: 20,
    LIMITE_MAX: 100,
});

const MessagesErreur = Object.freeze({
    GENERAL: {
        NON_TROUVE: "Ressource non trouvée.",
        ERREUR_SERVEUR: "Erreur serveur interne.",
        NON_AUTORISE: "Accès non autorisé.",
        INTERDIT: "Action interdite.",
        ID_INVALIDE: "ID invalide.",
    },
    PROJET: {
        MEMBRE_EQUIPE_INVALIDE: "Un membre de l’équipe est invalide.",
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
};