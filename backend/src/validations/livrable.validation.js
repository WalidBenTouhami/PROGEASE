const yup = require('yup');
const mongoose = require('mongoose');
const { MessagesErreur, StatutHttp } = require('../../config/constants');

// Schema de validation Yup pour les livrables
const livrableSchema = yup.object().shape({
    titre: yup.string()
        .min(3, 'Le titre doit contenir au moins 3 caracteres.')
        .max(150, 'Le titre ne peut pas depasser 150 caracteres.')
        .required('Le titre est requis.'),
    intitule: yup.string()
        .min(3, 'L\'intitule doit contenir au moins 3 caracteres.')
        .max(150, 'L\'intitule ne peut pas depasser 150 caracteres.'),
    description: yup.string()
        .min(10, 'La description doit contenir au moins 10 caracteres.')
        .required('La description est requise.'),
    projetId: yup.string()
        .test('is-mongo-id', 'L\'ID de projet est invalide.',
            val => val && mongoose.Types.ObjectId.isValid(val))
        .required('L\'ID du projet est requis.'),
    dateEcheance: yup.date()
        .min(new Date(), 'La date d\'echeance doit etre future.')
        .required('La date d\'echeance est requise.'),
    statut: yup.string()
        .oneOf(['en_attente', 'en_retard', 'termine'], 'Statut invalide.')
});

// Middleware de validation des donnees de livrable
const validateLivrableData = async (req, res, next) => {
    try {
        // Permettre titre OU intitule
        const body = { ...req.body };
        if (body.titre && !body.intitule) body.intitule = body.titre;
        if (body.intitule && !body.titre) body.titre = body.intitule;

        // Adapter dateEcheance au format si besoin
        if (body.dateEcheance && typeof body.dateEcheance === 'string') {
            body.dateEcheance = new Date(body.dateEcheance);
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
    livrableSchema // Export pour tests et reutilisation
};