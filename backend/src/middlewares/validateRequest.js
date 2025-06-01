const { ValidationError } = require('./errorHandlers');
const logger = require('../utils/logger');

/**
 * Middleware de validation des requêtes
 * @param {Object} schema - Schéma de validation Yup
 * @returns {Function} Middleware Express
 */
const validateRequest = (schema) => async (req, res, next) => {
    try {
        const validatedData = await schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });
        
        // Remplacer le body par les données validées
        req.body = validatedData;
        next();
    } catch (error) {
        logger.warn('Validation de la requête échouée', {
            path: req.path,
            method: req.method,
            errors: error.errors
        });
        next(new ValidationError('Validation de la requête échouée', error.errors));
    }
};

module.exports = {
    validateRequest
}; 