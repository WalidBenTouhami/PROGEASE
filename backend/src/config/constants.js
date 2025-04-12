// src/config/constants.js

/**
 * 🔒 Configuration de sécurité
 */
const SECURITY = Object.freeze({
    JWT: {
        EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
        COOKIE_EXPIRES: 90 * 24 * 60 * 60 * 1000, // 90 jours en ms
        TOKEN_TYPES: {
            ACCESS: 'access',
            REFRESH: 'refresh',
            RESET_PASSWORD: 'resetPassword'
        }
    },
    ROLES: {
        STUDENT: 'student',
        TUTOR: 'tutor',
        ADMIN: 'admin'
    }
});

/**
 * 🚀 Configuration des projets
 */
const PROJECT = Object.freeze({
    STATUSES: {
        DRAFT: 'brouillon',
        IN_PROGRESS: 'en cours',
        COMPLETED: 'terminé',
        ARCHIVED: 'archivé'
    },
    VALIDATION: {
        MAX_DURATION_DAYS: 90,
        MIN_TEAM_SIZE: 1,
        MAX_TEAM_SIZE: 5,
        SKILLS: {
            MIN: 1,
            MAX: 10
        }
    }
});

/**
 * 📊 Configuration de pagination
 */
const PAGINATION = Object.freeze({
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100
});

/**
 * 📅 Configuration des tâches planifiées
 */
const SCHEDULER = Object.freeze({
    CRON_JOBS: {
        DAILY: '0 0 * * *',        // Minuit chaque jour
        WEEKLY: '0 0 * * 0',       // Minuit chaque dimanche
        HOURLY: '0 * * * *'
    },
    RETRY_POLICY: {
        MAX_ATTEMPTS: 3,
        BACKOFF_MS: 5000
    }
});

/**
 * ⚙️ Configuration générale
 */
const APP = Object.freeze({
    ENV: {
        DEVELOPMENT: 'development',
        PRODUCTION: 'production',
        TEST: 'test'
    },
    FILE_UPLOAD: {
        MAX_SIZE: 5 * 1024 * 1024, // 5MB
        ALLOWED_TYPES: ['image/jpeg', 'image/png', 'application/pdf']
    }
});

/**
 * 📨 Messages d'erreur
 */
const ERROR_MESSAGES = Object.freeze({
    DB_CONNECTION: 'Échec de connexion à la base de données',
    UNAUTHORIZED: 'Accès non autorisé',
    VALIDATION: {
        DATE: 'La date de fin doit être postérieure à la date de début',
        SKILLS: `Doit contenir entre ${PROJECT.VALIDATION.SKILLS.MIN} et ${PROJECT.VALIDATION.SKILLS.MAX} compétences`
    }
});

/**
 * 🌐 Configuration API
 */
const API = Object.freeze({
    VERSIONS: ['v1', 'v2'],
    CURRENT_VERSION: 'v1',
    RATE_LIMITING: {
        WINDOW_MS: 15 * 60 * 1000, // 15 minutes
        MAX_REQUESTS: 100
    }
});

// Exportations regroupées
module.exports = Object.freeze({
    SECURITY,
    PROJECT,
    PAGINATION,
    SCHEDULER,
    APP,
    ERROR_MESSAGES,
    API,
    HTTP_STATUS: {
        OK: 200,
        CREATED: 201,
        BAD_REQUEST: 400,
        UNAUTHORIZED: 401,
        FORBIDDEN: 403,
        NOT_FOUND: 404,
        INTERNAL_ERROR: 500
    }
});