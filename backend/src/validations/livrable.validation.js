const yup = require('yup');
const mongoose = require('mongoose');
const { MessagesErreur, StatutHttp, Enums } = require('../../config/constants');

// Schema de validation Yup pour les livrables
const livrableSchema = yup.object().shape({
    titre: yup
        .string()
        .required('Le titre est requis.')
        .min(3, 'Le titre doit contenir au moins 3 caractères.')
        .max(150, 'Le titre ne peut pas dépasser 150 caractères.'),

    description: yup
        .string()
        .required('La description est requise.')
        .min(10, 'La description doit contenir au moins 10 caractères.'),

    projetId: yup
        .string()
        .required("L'ID du projet est requis.")
        .matches(/^[0-9a-fA-F]{24}$/, 'ID de projet invalide.'),

    dateLimite: yup
        .date()
        .required('La date limite est requise.')
        .min(new Date(), "La date limite doit être ultérieure à aujourd'hui."),

    statut: yup
        .string()
        .required('Le statut est requis.')
        .oneOf(Object.values(Enums.StatutLivrable), 'Statut invalide.'),

    urlLivrable: yup.string().nullable().url("L'URL du livrable doit être valide."),
});

// Middleware de validation des donnees de livrable
const validateLivrableData = async (req, res, next) => {
    try {
        const body = { ...req.body };

        // Adapter les dates au format
        if (body.dateLimite && typeof body.dateLimite === 'string') {
            body.dateLimite = new Date(body.dateLimite);
        }

        // Validation
        await livrableSchema.validate(body, { abortEarly: false });
        next();
    } catch (error) {
        res.status(StatutHttp.MAUVAISE_REQUETE).json({
            erreur: MessagesErreur.GENERAL.VALIDATION,
            details: error.errors || error.message,
        });
    }
};

// Middleware de validation des IDs
const validateId = (paramName, source = 'params') => {
    return (req, res, next) => {
        const id = source === 'params' ? req.params[paramName] : req.body[paramName];

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(StatutHttp.MAUVAISE_REQUETE).json({
                erreur: MessagesErreur.GENERAL.ID_INVALIDE,
                details: `L'ID '${paramName}' est invalide ou manquant.`,
            });
        }
        next();
    };
};

module.exports = {
    validateLivrableData,
    validateId,
    livrableSchema, // Export pour tests et réutilisation
};
