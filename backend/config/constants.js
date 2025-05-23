// ../backend/config/constants.js

require('dotenv').config();

// ✅ Validation des variables d'environnement critiques
const REQUIRED_ENV_VARS = ["MONGO_URI", "PORT", "JWT_SECRET", "DEEPSEEK_API_KEY"];
REQUIRED_ENV_VARS.forEach((envVar) => {
    if (!process.env[envVar]) {
        throw new Error(`La variable d'environnement ${envVar} est manquante.`);
    }
});

// ✅ Énumérations globales
const Enums = Object.freeze({
    ProjectStatus: {
        DRAFT: "DRAFT",
        IN_PROGRESS: "IN_PROGRESS",
        COMPLETED: "COMPLETED",
        ARCHIVED: "ARCHIVED",
    },
    UserRole: {
        ETUDIANT: "ETUDIANT",
        TUTEUR: "TUTEUR",
        ADMIN: "ADMIN",
    },
    DeliverableStatus: {
        COMPLETED: "COMPLETED",
        PENDING: "PENDING",
        OVERDUE: "OVERDUE",
    },
});

// ✅ Configuration de sécurité
const SecurityConfig = Object.freeze({
    JWT: {
        EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
        COOKIE_NAME: process.env.JWT_COOKIE_NAME || "__progease_token",
    },
    PASSWORD: {
        MIN_LENGTH: parseInt(process.env.PASSWORD_MIN_LENGTH, 10) || 10,
        SALT_ROUNDS: parseInt(process.env.PASSWORD_SALT_ROUNDS, 10) || 12,
        MAX_ATTEMPTS: parseInt(process.env.PASSWORD_MAX_ATTEMPTS, 10) || 5,
        LOCKOUT_MINUTES: parseInt(process.env.PASSWORD_LOCKOUT_MINUTES, 10) || 30,
    },
});

// ✅ Paramètres de pagination par défaut
const PaginationDefaults = Object.freeze({
    PAGE: 1,
    LIMIT: 20,
    MAX_LIMIT: 100,
});

// ✅ Messages d'erreur globaux & modulaires
const ErrorMessages = Object.freeze({
    GENERAL: {
        NOT_FOUND: "Ressource non trouvée.",
        SERVER_ERROR: "Erreur serveur interne.",
        UNAUTHORIZED: "Accès non autorisé.",
        FORBIDDEN: "Action interdite.",
        INVALID_ID: "ID invalide.",
    },
    PROJECT: {
        INVALID_TEAM_MEMBER: "Un membre de l'équipe est invalide.",
        NOT_FOUND: "Projet introuvable.",
    },
    USER: {
        DUPLICATE_EMAIL: "Email déjà utilisé.",
        INVALID_ROLE: "Rôle utilisateur invalide.",
    },
});

// ✅ Codes de statut HTTP
const HttpStatus = Object.freeze({
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_ERROR: 500,
});

module.exports = {
    MONGO_URI: process.env.MONGO_URI,
    PORT: process.env.PORT || 3000,
    JWT_SECRET: process.env.JWT_SECRET,
    DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY,
    Enums,
    SecurityConfig,
    PaginationDefaults,
    ErrorMessages,
    HttpStatus,
};