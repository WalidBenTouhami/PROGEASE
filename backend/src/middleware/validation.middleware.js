const Joi = require('joi');
const logger = require('../utils/logger');

const validateRequest = schema => {
    return (req, res, next) => {
        const validationOptions = {
            abortEarly: false,
            allowUnknown: true,
            stripUnknown: true,
        };

        const { error, value } = schema.validate(req.body, validationOptions);

        if (error) {
            const errorMessage = error.details.map(detail => detail.message).join(', ');
            logger.warn('Validation error:', {
                path: req.path,
                method: req.method,
                errors: errorMessage,
            });

            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: error.details.map(detail => ({
                    field: detail.path.join('.'),
                    message: detail.message,
                })),
            });
        }

        // Replace request body with validated value
        req.body = value;
        next();
    };
};

// Common validation schemas
const schemas = {
    user: {
        create: Joi.object({
            email: Joi.string().email().required(),
            password: Joi.string().min(8).required(),
            firstName: Joi.string().required(),
            lastName: Joi.string().required(),
            role: Joi.string().valid('user', 'admin').default('user'),
        }),
        update: Joi.object({
            email: Joi.string().email(),
            firstName: Joi.string(),
            lastName: Joi.string(),
            role: Joi.string().valid('user', 'admin'),
        }).min(1),
    },
    auth: {
        login: Joi.object({
            email: Joi.string().email().required(),
            password: Joi.string().required(),
        }),
        register: Joi.object({
            email: Joi.string().email().required(),
            password: Joi.string().min(8).required(),
            firstName: Joi.string().required(),
            lastName: Joi.string().required(),
        }),
    },
};

module.exports = {
    validateRequest,
    schemas,
};
