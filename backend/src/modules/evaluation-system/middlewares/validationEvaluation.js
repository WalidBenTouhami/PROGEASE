const { body, validationResult } = require('express-validator');

const validateEvaluation = [
    // Validate note
    body('note')
        .isFloat({ min: 0, max: 20 })
        .withMessage('La note doit être comprise entre 0 et 20'),

    // Validate projetId
    body('projetId')
        .isMongoId()
        .withMessage('ID de projet invalide'),

    // Validate tuteurId
    body('tuteurId')
        .isMongoId()
        .withMessage('ID de tuteur invalide'),

    // Validate either etudiantId or equipeId, but not both
    body().custom((value, { req }) => {
        if ((!req.body.etudiantId && !req.body.equipeId) || (req.body.etudiantId && req.body.equipeId)) {
            throw new Error('Il faut soit un ID étudiant soit un ID équipe, mais pas les deux');
        }
        return true;
    }),

    // Validate etudiantId if present
    body('etudiantId')
        .if(body('etudiantId').exists())
        .isMongoId()
        .withMessage('ID d\'étudiant invalide'),

    // Validate equipeId if present
    body('equipeId')
        .if(body('equipeId').exists())
        .isMongoId()
        .withMessage('ID d\'équipe invalide'),

    // Check for validation errors
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

module.exports = validateEvaluation; 