const yup = require('yup');
const mongoose = require('mongoose');
const { MessagesErreur, StatutHttp, Enums } = require('../../config/constants');
const { AppError } = require('../middlewares/errorHandlers');
const { ERROR_CODES } = require('../../config/constants');

// Schema de validation Yup pour les projets
const projetSchema = yup.object().shape({
    titre: yup.string()
        .required('Le titre est requis')
        .min(3, 'Le titre doit contenir au moins 3 caractères')
        .max(100, 'Le titre ne peut pas dépasser 100 caractères'),
    description: yup.string()
        .required('La description est requise')
        .min(10, 'La description doit contenir au moins 10 caractères')
        .max(1000, 'La description ne peut pas dépasser 1000 caractères'),
    dateDebut: yup.date()
        .required('La date de début est requise'),
    dateFin: yup.date()
        .required('La date de fin est requise')
        .min(yup.ref('dateDebut'), 'La date de fin doit être postérieure à la date de début'),
    statut: yup.string()
        .required('Le statut est requis')
        .oneOf(['EN_COURS', 'TERMINE', 'EN_PAUSE', 'ANNULE'], 'Statut invalide'),
    priorite: yup.number()
        .required('La priorité est requise')
        .min(1, 'La priorité minimale est 1')
        .max(5, 'La priorité maximale est 5'),
    responsable: yup.string()
        .required('Le responsable est requis'),
    equipe: yup.array()
        .of(yup.string())
        .min(1, 'L\'équipe doit contenir au moins un membre'),
    tags: yup.array()
        .of(yup.string())
        .nullable(),
    budget: yup.number()
        .positive('Le budget doit être positif')
        .nullable(),
    progression: yup.number()
        .min(0, 'La progression ne peut pas être négative')
        .max(100, 'La progression ne peut pas dépasser 100%')
        .default(0)
});

// Middleware de validation des données de projet
const validateProjetData = async (req, res, next) => {
    try {
        const body = { ...req.body };

        // Adapter les dates au format
        if (body.dateDebut && typeof body.dateDebut === 'string') {
            body.dateDebut = new Date(body.dateDebut);
        }
        if (body.dateFin && typeof body.dateFin === 'string') {
            body.dateFin = new Date(body.dateFin);
        }

        // Validation
        await projetSchema.validate(body, { abortEarly: false });
        next();
    } catch (error) {
        res.status(StatutHttp.MAUVAISE_REQUETE).json({
            erreur: MessagesErreur.GENERAL.VALIDATION,
            details: error.errors || error.message
        });
    }
};

// Middleware de validation des IDs
const validateId = (paramName) => (req, res, next) => {
    const id = req.params[paramName];
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        throw new AppError(
            'ID invalide',
            StatutHttp.BAD_REQUEST,
            ERROR_CODES.VALIDATION_ERROR
        );
    }
    next();
};

module.exports = {
    validateProjetData,
    validateId,
    projetSchema // Export pour tests et réutilisation
};