const yup = require('yup');
const { MessagesErreur, StatutHttp, Enums } = require('../../config/constants');
const { AppError } = require('../middlewares/errorHandlers');
const { ERROR_CODES } = require('../../config/constants');

// Schema de validation pour les tâches
const tacheSchema = yup.object().shape({
    titre: yup
        .string()
        .required('Le titre est requis')
        .min(3, 'Le titre doit contenir au moins 3 caractères')
        .max(100, 'Le titre ne peut pas dépasser 100 caractères'),
    description: yup
        .string()
        .required('La description est requise')
        .min(10, 'La description doit contenir au moins 10 caractères')
        .max(500, 'La description ne peut pas dépasser 500 caractères'),
    dateDebut: yup.date().required('La date de début est requise'),
    dateFin: yup
        .date()
        .required('La date de fin est requise')
        .min(yup.ref('dateDebut'), 'La date de fin doit être postérieure à la date de début'),
    statut: yup
        .string()
        .oneOf(Object.values(Enums.StatutTache), 'Statut de tâche invalide')
        .default(Enums.StatutTache.A_FAIRE),
    progression: yup
        .number()
        .min(0, 'La progression ne peut pas être négative')
        .max(100, 'La progression ne peut pas dépasser 100%')
        .default(0),
    assigneA: yup
        .string()
        .matches(/^[0-9a-fA-F]{24}$/, 'ID utilisateur invalide')
        .nullable(),
});

// Schema de validation pour les signalements
const signalementSchema = yup.object().shape({
    type: yup
        .string()
        .required('Le type de signalement est requis')
        .oneOf(Object.values(Enums.TypeSignalement), 'Type de signalement invalide'),
    description: yup
        .string()
        .required('La description est requise')
        .min(10, 'La description doit contenir au moins 10 caractères')
        .max(500, 'La description ne peut pas dépasser 500 caractères'),
    priorite: yup
        .string()
        .oneOf(Object.values(Enums.PrioriteSignalement), 'Priorité invalide')
        .default(Enums.PrioriteSignalement.MOYENNE),
    tacheId: yup
        .string()
        .matches(/^[0-9a-fA-F]{24}$/, 'ID tâche invalide')
        .nullable(),
});

// Schema de validation Yup pour les projets
const projetSchema = yup.object().shape({
    titre: yup
        .string()
        .required('Le titre est requis')
        .min(3, 'Le titre doit contenir au moins 3 caractères')
        .max(100, 'Le titre ne peut pas dépasser 100 caractères'),
    description: yup
        .string()
        .required('La description est requise')
        .min(10, 'La description doit contenir au moins 10 caractères')
        .max(1000, 'La description ne peut pas dépasser 1000 caractères'),
    theme: yup
        .string()
        .required('Le thème est requis')
        .min(3, 'Le thème doit contenir au moins 3 caractères')
        .max(50, 'Le thème ne peut pas dépasser 50 caractères'),
    categories: yup.array().of(yup.string()).min(1, 'Au moins une catégorie est requise'),
    dateDebut: yup.date().required('La date de début est requise'),
    dateFin: yup
        .date()
        .required('La date de fin est requise')
        .min(yup.ref('dateDebut'), 'La date de fin doit être postérieure à la date de début'),
    statut: yup
        .string()
        .required('Le statut est requis')
        .oneOf(Object.values(Enums.StatutProjet), 'Statut invalide'),
    equipe: yup
        .array()
        .of(yup.string().matches(/^[0-9a-fA-F]{24}$/, 'ID utilisateur invalide'))
        .min(1, "L'équipe doit contenir au moins un membre"),
    taches: yup.array().of(tacheSchema).default([]),
    signalements: yup.array().of(signalementSchema).default([]),
    progression: yup
        .number()
        .min(0, 'La progression ne peut pas être négative')
        .max(100, 'La progression ne peut pas dépasser 100%')
        .default(0),
});

// Schema de validation pour les requêtes de statistiques
const statistiquesSchema = yup.object().shape({
    dateDebut: yup
        .date()
        .nullable()
        .transform(value => (value === '' ? null : value)),
    dateFin: yup
        .date()
        .nullable()
        .transform(value => (value === '' ? null : value))
        .min(yup.ref('dateDebut'), 'La date de fin doit être postérieure à la date de début'),
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
            details: error.errors || error.message,
        });
    }
};

// Middleware de validation des IDs
const validateId = paramName => (req, res, next) => {
    const id = req.params[paramName];
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        throw new AppError('ID invalide', StatutHttp.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR);
    }
    next();
};

// Middleware de validation des requêtes de statistiques
const validateStatistiquesRequest = async (req, res, next) => {
    try {
        await statistiquesSchema.validate(req.query, { abortEarly: false });
        next();
    } catch (error) {
        res.status(StatutHttp.MAUVAISE_REQUETE).json({
            erreur: MessagesErreur.GENERAL.VALIDATION,
            details: error.errors || error.message,
        });
    }
};

module.exports = {
    validateProjetData,
    validateId,
    validateStatistiquesRequest,
    projetSchema,
    tacheSchema,
    signalementSchema,
    statistiquesSchema,
};
