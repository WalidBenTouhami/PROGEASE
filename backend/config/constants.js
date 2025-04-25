require('dotenv').config();

module.exports = {
    MONGO_URI: process.env.MONGO_URI,
    PORT: process.env.PORT || 3000,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
};

// 📌 Énumérations globales
const Enums = Object.freeze({
    ProjectStatus: {
        DRAFT: "brouillon",
        IN_PROGRESS: "en_cours",
        COMPLETED: "termine",
        ARCHIVED: "archive",
    },
    UserRole: {
        STUDENT: "etudiant",
        TUTOR: "tuteur",
        ADMIN: "admin",
    },
    DeliverableStatus: {
        COMPLETED: "Terminé",
        PENDING: "En attente",
        OVERDUE: "En retard",
    },
});

// 📌 Configuration de sécurité
const SecurityConfig = Object.freeze({
    JWT: {
        EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d", // Durée de validité du token JWT
        COOKIE_NAME: "__progease_token", // Nom du cookie pour le token
    },
    PASSWORD: {
        MIN_LENGTH: 10, // Longueur minimale du mot de passe
        SALT_ROUNDS: 12, // Nombre de tours pour le salage du mot de passe
        MAX_ATTEMPTS: 5, // Nombre maximum de tentatives de connexion
        LOCKOUT_MINUTES: 30, // Durée de verrouillage après échec
    },
});

// 📌 Paramètres de pagination par défaut
const PaginationDefaults = Object.freeze({
    PAGE: 1, // Page par défaut
    LIMIT: 20, // Limite par défaut
    MAX_LIMIT: 100, // Limite maximale autorisée
});

// 📌 Messages d'erreur globaux & modulaires
const ErrorMessages = Object.freeze({
    GENERAL: {
        NOT_FOUND: "Ressource non trouvée.",
        SERVER_ERROR: "Erreur serveur interne.",
        UNAUTHORIZED: "Accès non autorisé.",
        FORBIDDEN: "Action interdite.",
        INVALID_ID: "ID invalide.",
    },
    EVALUATION: {
        CREATION_FAILED: "Échec de la création de l’évaluation.",
        REPORT_ERROR: "Impossible de générer le rapport d’évaluation.",
    },
    PROJECT: {
        INVALID_TEAM_MEMBER: "Un membre de l’équipe est invalide.",
        NOT_FOUND: "Projet introuvable.",
    },
    USER: {
        DUPLICATE_EMAIL: "Email déjà utilisé.",
        INVALID_ROLE: "Rôle utilisateur invalide.",
    },
});

// 📌 Codes de statut HTTP
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

// 📌 Export des constantes
module.exports = {
    Enums,
    SecurityConfig,
    PaginationDefaults,
    ErrorMessages,
    HttpStatus,
};