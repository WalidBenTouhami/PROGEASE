// src/config/constants.js


export const StatusEnum = Object.freeze({
    DRAFT: 'brouillon',
    IN_PROGRESS: 'en_cours',
    COMPLETED: 'termine',
    ARCHIVED: 'archive'
});

export const RoleEnum = Object.freeze({
    STUDENT: 'etudiant',
    TUTOR: 'tuteur',
    ADMIN: 'admin'
});

export const SecurityConfig = Object.freeze({
    JWT: {
        EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
        COOKIE_NAME: '__progease_token'
    },
    PASSWORD: {
        MIN_LENGTH: 10,
        SALT_ROUNDS: 12,
        MAX_ATTEMPTS: 5,
        LOCKOUT_MINUTES: 30
    }
});

export const PaginationDefaults = Object.freeze({
    PAGE: 1,
    LIMIT: 20,
    MAX_LIMIT: 100
});