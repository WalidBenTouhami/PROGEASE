require('dotenv').config({ path: 'D:\\ESPRIT2\\9. Projet intégré\\PROGEASE\\backend\\.env' });

const REQUIRED_ENV_VARS = ["MONGO_URI", "PORT", "JWT_SECRET", "OPENAI_API_KEY"];
REQUIRED_ENV_VARS.forEach((envVar) => {
    if (!process.env[envVar]) {
        throw new Error(`La variable d'environnement ${envVar} est manquante.`);
    }
});

const Enums = Object.freeze({
    StatutProjet: {
        BROUILLON: "Brouillon",
        EN_COURS: "En cours",
        TERMINE: "Terminé",
        ARCHIVE: "Archivé",
    },
    RoleUtilisateur: {
        ETUDIANT: "Étudiant",
        TUTEUR: "Tuteur",
        ADMIN: "Administrateur",
    },
    StatutLivrable: {
        TERMINE: "Terminé",
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
        NOMBRE_SALT: parseInt(process.env.PASSWORD_SALT_ROUNDS, 10) || 12,
        NB_MAX_ESSAIS: parseInt(process.env.PASSWORD_MAX_ATTEMPTS, 10) || 5,
        MINUTES_VERROUILLAGE: parseInt(process.env.PASSWORD_LOCKOUT_MINUTES, 10) || 30,
    },
});

const PaginationDefaut = Object.freeze({
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
    UTILISATEUR: {
        EMAIL_DUPLIQUE: "Adresse e-mail déjà utilisée.",
        ROLE_INVALIDE: "Rôle utilisateur invalide.",
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
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    Enums,
    ConfigSecurite,
    PaginationDefaut,
    MessagesErreur,
    StatutHttp,
};