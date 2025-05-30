const yup = require('yup');
const mongoose = require('mongoose');
const { MessagesErreur, StatutHttp, Enum } = require('../../config/constants');

// Schema de validation Yup pour les livrables
const livrableSchema = yup.object().shape({
    intitule: yup.string()
        .min(3, 'L\'intitule doit contenir au moins 3 caracteres.')
        .max(150, 'L\'intitule ne peut pas depasser 150 caracteres.')
        .required('L\'intitule est requis.'),
    description: yup.string()
        .min(10, 'La description doit contenir au moins 10 caracteres.')
        .required('La description est requise.'),
    projetId: yup.string()
        .test('is-mongo-id', 'L\'ID de projet est invalide.',
            val => val && mongoose.Types.ObjectId.isValid(val))
        .required('L\'ID du projet est requis.'),
    dateLimite: yup.date()
        .min(new Date(), 'La date limite doit etre future.')
        .required('La date limite est requise.')
        .test('date-valide', 'La date limite doit être valide.',
            val => val instanceof Date && !isNaN(val)),
    statut: yup.string()
        .oneOf(Object.values(Enum.StatutLivrable), 'Statut invalide.')
        .default(Enum.StatutLivrable.EN_ATTENTE)
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
            details: error.errors || error.message
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
                details: `L'ID '${paramName}' est invalide ou manquant.`
            });
        }
        next();
    };
};

module.exports = {
    validateLivrableData,
    validateId,
    livrableSchema // Export pour tests et réutilisation
};