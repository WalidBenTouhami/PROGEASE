// src/middleware/validation.js
const mongoose = require('mongoose');
const { validationResult } = require('express-validator');
const { HttpStatus, ErrorMessages } = require('../../config/constants');

/**
 * Middleware de validation des IDs de projet
 * @param {Object} req - Objet requête Express
 * @param {Object} res - Objet réponse Express
 * @param {Function} next - Fonction next d'Express
 */
const validateProjetId = (req, res, next) => {
    const id = req.params.id;
    if (id && !mongoose.Types.ObjectId.isValid(id)) {
        return res.status(HttpStatus.BAD_REQUEST).json({
            erreur: ErrorMessages.GENERAL.INVALID_ID
        });
    }
    next();
};

/**
 * Middleware de validation du corps de requête pour les projets
 * @param {Object} req - Objet requête Express
 * @param {Object} res - Objet réponse Express
 * @param {Function} next - Fonction next d'Express
 */
const validateProjetBody = (req, res, next) => {
    // Vérifier si c'est une création ou une mise à jour
    const isCreation = !req.params.id;

    // Validation des champs obligatoires pour la création
    if (isCreation) {
        const { titre, description } = req.body;

        if (!titre) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                erreur: 'Le titre du projet est requis.'
            });
        }

        if (!description) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                erreur: 'La description du projet est requise.'
            });
        }
    }

    // Pour une mise à jour, au moins un champ doit être présent
    if (!isCreation && Object.keys(req.body).length === 0) {
        return res.status(HttpStatus.BAD_REQUEST).json({
            erreur: 'Aucune donnée fournie pour la mise à jour.'
        });
    }

    next();
};

/**
 * Middleware de validation des IDs de livrable
 * @param {Object} req - Objet requête Express
 * @param {Object} res - Objet réponse Express
 * @param {Function} next - Fonction next d'Express
 */
const validateLivrableId = (req, res, next) => {
    const id = req.params.livrableId;
    if (id && !mongoose.Types.ObjectId.isValid(id)) {
        return res.status(HttpStatus.BAD_REQUEST).json({
            erreur: ErrorMessages.GENERAL.INVALID_ID
        });
    }
    next();
};

/**
 * Middleware de validation du corps de requête pour les livrables
 * @param {Object} req - Objet requête Express
 * @param {Object} res - Objet réponse Express
 * @param {Function} next - Fonction next d'Express
 */
const validateLivrableBody = (req, res, next) => {
    // Vérifier si c'est une création ou une mise à jour
    const isCreation = !req.params.livrableId;

    // Validation pour création
    if (isCreation) {
        const { projetId, nom, description } = req.body;

        if (!projetId) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                erreur: 'L\'ID du projet est requis.'
            });
        }

        if (!mongoose.Types.ObjectId.isValid(projetId)) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                erreur: 'ID de projet invalide.'
            });
        }

        if (!nom) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                erreur: 'Le nom du livrable est requis.'
            });
        }

        if (!description) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                erreur: 'La description du livrable est requise.'
            });
        }
    }

    // Pour une mise à jour, au moins un champ doit être présent
    if (!isCreation && Object.keys(req.body).length === 0) {
        return res.status(HttpStatus.BAD_REQUEST).json({
            erreur: 'Aucune donnée fournie pour la mise à jour.'
        });
    }

    next();
};

/**
 * Middleware pour valider les résultats des validations express-validator
 * @param {Object} req - Objet requête Express
 * @param {Object} res - Objet réponse Express
 * @param {Function} next - Fonction next d'Express
 */
const validateResults = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(HttpStatus.BAD_REQUEST).json({
            erreurs: errors.array()
        });
    }
    next();
};

module.exports = {
    validateProjetId,
    validateProjetBody,
    validateLivrableId,
    validateLivrableBody,
    validateResults
};
