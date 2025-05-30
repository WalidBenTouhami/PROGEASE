const mongoose = require('mongoose');
const { body } = require('express-validator');

// Validation de l'ID utilisateur
exports.validateId = (paramName, source = 'params') => {
    return (req, res, next) => {
        const id = source === 'params' ? req.params[paramName] : req.body[paramName];

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID invalide',
                error: `L'ID '${paramName}' est invalide ou manquant.`
            });
        }
        next();
    };
};

// Validation des données utilisateur
exports.validateUtilisateurData = [
    body('nom')
        .trim()
        .notEmpty().withMessage('Le nom est requis')
        .isLength({ min: 2 }).withMessage('Le nom doit contenir au moins 2 caractères')
        .isLength({ max: 100 }).withMessage('Le nom ne peut pas dépasser 100 caractères'),

    body('email')
        .trim()
        .notEmpty().withMessage('L\'email est requis')
        .isEmail().withMessage('Format d\'email invalide')
        .normalizeEmail(),

    body('role')
        .optional()
        .isIn(['ADMIN', 'TUTEUR', 'ETUDIANT']).withMessage('Rôle invalide'),

    body('projets')
        .optional()
        .isArray().withMessage('Les projets doivent être un tableau')
        .custom((value) => {
            if (!value.every(id => mongoose.Types.ObjectId.isValid(id))) {
                throw new Error('Un ou plusieurs IDs de projet sont invalides');
            }
            return true;
        })
];

module.exports = exports;