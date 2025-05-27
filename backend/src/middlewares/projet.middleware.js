/**
 * Middleware de validation spécifique aux projets
 * Utilise express-validator pour valider les données des requêtes
 * et transmet les erreurs au gestionnaire central
 *
 * @module middlewares/projet.middleware
 * @author WalidBenTouhami
 * @version 2.0.0
 * @updated 2025-05-27
 */

'use strict';

const { validationResult } = require('express-validator');

/**
 * Middleware de validation pour les routes de projet
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction next d'Express
 */
const validateProjet = (req, res, next) => {
    // Récupérer les résultats de validation
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        // Création d'une erreur de validation structurée pour le gestionnaire central
        const validationError = new Error('Validation du projet échouée');
        validationError.name = 'ProjetValidationError';
        validationError.errors = errors.array().map(err => ({
            champ: err.param,
            message: err.msg,
            valeur: err.value
        }));

        // Métadonnées pour le gestionnaire d'erreurs
        validationError.statusCode = 400;
        validationError.isOperational = true;
        validationError.errorType = 'VALIDATION_ERROR';

        // Transmettre au gestionnaire d'erreurs
        return next(validationError);
    }

    // Si la validation réussit, continuer
    next();
};

// Exporter le middleware de validation des projets
module.exports = validateProjet;