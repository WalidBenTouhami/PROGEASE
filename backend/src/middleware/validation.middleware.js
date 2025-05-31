const { MessagesErreur, StatutHttp } = require('../../config/constants');

/**
 * Middleware de validation générique utilisant Yup
 * @param {Object} schema - Schema de validation Yup
 */
const validateRequest = (schema) => {
    return async (req, res, next) => {
        try {
            const body = { ...req.body };

            // Conversion des dates si présentes
            Object.keys(body).forEach(key => {
                if (body[key] && typeof body[key] === 'string' && key.toLowerCase().includes('date')) {
                    const date = new Date(body[key]);
                    if (!isNaN(date)) {
                        body[key] = date;
                    }
                }
            });

            // Validation avec le schéma
            await schema.validate(body, { abortEarly: false });
            req.validatedData = body;
            next();
        } catch (error) {
            res.status(StatutHttp.MAUVAISE_REQUETE).json({
                success: false,
                message: MessagesErreur.GENERAL.VALIDATION,
                errors: error.errors || [error.message]
            });
        }
    };
};

module.exports = {
    validateRequest
}; 