// src/middlewares/validation.middleware.js
const { body, param, query, validationResult } = require('express-validator');
const logger = require('../utils/logger');

/**
 * Middleware pour gérer les erreurs de validation
 */
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        logger.warn('Erreur de validation', {
            errors: errors.array(),
            path: req.path,
            method: req.method,
        });

        return res.status(400).json({
            success: false,
            message: 'Erreur de validation',
            errors: errors.array().map(err => ({
                field: err.param,
                message: err.msg,
                value: err.value,
            })),
        });
    }

    next();
};

/**
 * Validations pour l'endpoint de formation d'équipes
 */
const validateTeamFormation = [
    body('membres')
        .isArray({ min: 1 })
        .withMessage('La liste des membres doit être un tableau non vide'),
    body('membres.*.id').optional().isString().withMessage("L'ID du membre doit être une chaîne"),
    body('membres.*.nom')
        .optional()
        .isString()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Le nom doit contenir entre 2 et 100 caractères'),
    body('membres.*.competences')
        .optional()
        .isArray()
        .withMessage('Les compétences doivent être un tableau'),
    handleValidationErrors,
];

/**
 * Validations pour l'endpoint d'association de tuteurs
 */
const validateTutorMatching = [
    body('membres')
        .isArray({ min: 1 })
        .withMessage('La liste des membres doit être un tableau non vide'),
    body('membres.*.id').optional().isString().withMessage("L'ID du membre doit être une chaîne"),
    body('membres.*.role')
        .optional()
        .isIn(['TUTEUR', 'ETUDIANT', 'EQUIPE'])
        .withMessage('Le rôle doit être TUTEUR, ETUDIANT ou EQUIPE'),
    handleValidationErrors,
];

/**
 * Validations pour l'endpoint de recommandations d'apprentissage
 */
const validateLearningResources = [
    body('competences')
        .isArray({ min: 1 })
        .withMessage('La liste des compétences doit être un tableau non vide'),
    body('competences.*')
        .isString()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Chaque compétence doit contenir entre 2 et 50 caractères'),
    handleValidationErrors,
];

/**
 * Validations pour l'endpoint de suivi de progression
 */
const validateProgressTracking = [
    body('taches').isArray().withMessage('La liste des tâches doit être un tableau'),
    body('taches.*.titre')
        .optional()
        .isString()
        .trim()
        .isLength({ min: 2, max: 200 })
        .withMessage('Le titre doit contenir entre 2 et 200 caractères'),
    body('taches.*.statut')
        .optional()
        .isIn([
            'A_FAIRE',
            'EN_COURS',
            'TERMINEE',
            'BLOQUEE',
            'terminee',
            'complete',
            'Termine',
            'en cours',
            'En cours',
            'En attente',
        ])
        .withMessage('Statut de tâche invalide'),
    handleValidationErrors,
];

/**
 * Validations pour l'endpoint de génération de planning
 */
const validateScheduleGeneration = [
    body('taches')
        .isArray({ min: 1 })
        .withMessage('La liste des tâches doit être un tableau non vide'),
    body('dateDebut').isISO8601().withMessage('La date de début doit être au format ISO 8601'),
    body('dateFin')
        .isISO8601()
        .withMessage('La date de fin doit être au format ISO 8601')
        .custom((dateFin, { req }) => {
            if (new Date(dateFin) <= new Date(req.body.dateDebut)) {
                throw new Error('La date de fin doit être postérieure à la date de début');
            }
            return true;
        }),
    handleValidationErrors,
];

/**
 * Validations pour l'endpoint de planification d'événements
 */
const validateEventScheduling = [
    param('projetId').isMongoId().withMessage('ID de projet invalide'),
    body('type')
        .optional()
        .isIn(['REUNION', 'REVUE', 'SOUTENANCE'])
        .withMessage('Le type doit être REUNION, REVUE ou SOUTENANCE'),
    body('frequence')
        .optional()
        .isIn(['QUOTIDIEN', 'HEBDOMADAIRE', 'BIHEBDOMADAIRE', 'MENSUEL'])
        .withMessage('La fréquence doit être QUOTIDIEN, HEBDOMADAIRE, BIHEBDOMADAIRE ou MENSUEL'),
    handleValidationErrors,
];

/**
 * Validations pour l'endpoint de détection de conflits
 */
const validateConflictDetection = [
    body('evenements')
        .isArray({ min: 2 })
        .withMessage('Au moins 2 événements sont nécessaires pour détecter les conflits'),
    body('evenements.*.date').isISO8601().withMessage('La date doit être au format ISO 8601'),
    body('evenements.*.duree')
        .isInt({ min: 1, max: 1440 })
        .withMessage('La durée doit être entre 1 et 1440 minutes'),
    handleValidationErrors,
];

/**
 * Validations pour l'endpoint d'envoi de notifications
 */
const validateNotifications = [
    body('rappels')
        .isArray({ min: 1 })
        .withMessage('La liste des rappels doit être un tableau non vide'),
    body('rappels.*.type')
        .optional()
        .isIn(['DEADLINE_PROJET', 'DEADLINE_LIVRABLE', 'DEADLINE_TACHE', 'REUNION', 'AUTRE'])
        .withMessage('Type de rappel invalide'),
    body('rappels.*.titre')
        .optional()
        .isString()
        .trim()
        .isLength({ min: 5, max: 200 })
        .withMessage('Le titre doit contenir entre 5 et 200 caractères'),
    handleValidationErrors,
];

/**
 * Validations pour l'endpoint d'analyse de projet
 */
const validateProjectAnalysis = [
    body('projetId').isMongoId().withMessage('ID de projet invalide'),
    body('contenu').isObject().withMessage('Le contenu doit être un objet'),
    body('type')
        .optional()
        .isIn(['GENERAL', 'TECHNIQUE', 'RISQUES', 'QUALITE'])
        .withMessage("Type d'analyse invalide"),
    handleValidationErrors,
];

/**
 * Validations génériques pour les paramètres de projet
 */
const validateProjetId = [
    param('projetId').isMongoId().withMessage('ID de projet invalide'),
    handleValidationErrors,
];

/**
 * Validations génériques pour les paramètres de livrable
 */
const validateLivrableId = [
    param('livrableId').isMongoId().withMessage('ID de livrable invalide'),
    handleValidationErrors,
];

module.exports = {
    handleValidationErrors,
    validateTeamFormation,
    validateTutorMatching,
    validateLearningResources,
    validateProgressTracking,
    validateScheduleGeneration,
    validateEventScheduling,
    validateConflictDetection,
    validateNotifications,
    validateProjectAnalysis,
    validateProjetId,
    validateLivrableId,
};
