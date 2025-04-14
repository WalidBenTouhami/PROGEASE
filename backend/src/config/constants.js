// src/config/constants.js

// 📌 Statuts des projets
export const StatusEnum = Object.freeze({
    DRAFT: 'brouillon',
    IN_PROGRESS: 'en_cours',
    COMPLETED: 'termine',
    ARCHIVED: 'archive'
});

// 📌 Rôles des utilisateurs
export const RoleEnum = Object.freeze({
    STUDENT: 'etudiant',
    TUTOR: 'tuteur',
    ADMIN: 'admin'
});

// 📌 Configuration de sécurité
export const SecurityConfig = Object.freeze({
    JWT: {
        EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d', // Durée de validité du token JWT
        COOKIE_NAME: '__progease_token' // Nom du cookie pour le token
    },
    PASSWORD: {
        MIN_LENGTH: 10, // Longueur minimale du mot de passe
        SALT_ROUNDS: 12, // Nombre de tours pour le salage du mot de passe
        MAX_ATTEMPTS: 5, // Nombre maximum de tentatives de connexion
        LOCKOUT_MINUTES: 30 // Durée de verrouillage après échec
    }
});

// 📌 Paramètres de pagination par défaut
export const PaginationDefaults = Object.freeze({
    PAGE: 1, // Page par défaut
    LIMIT: 20, // Limite par défaut
    MAX_LIMIT: 100 // Limite maximale autorisée
});