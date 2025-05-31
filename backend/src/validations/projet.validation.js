const yup = require('yup');
const mongoose = require('mongoose');
const { MessagesErreur, StatutHttp, Enums } = require('../../config/constants');

// Schema de validation Yup pour les projets
const projetSchema = yup.object().shape({
    titre: yup.string()
        .required('Le titre du projet est requis.')
        .min(5, 'Le titre doit contenir au moins 5 caractères.')
        .max(100, 'Le titre ne peut pas dépasser 100 caractères.'),
    description: yup.string()
        .required('La description du projet est requise.')
        .min(10, 'La description doit contenir au moins 10 caractères.'),
    equipe: yup.array().of(
        yup.string()
            .required('L\'ID du membre est requis.')
            .matches(/^[0-9a-fA-F]{24}$/, 'ID de membre invalide.')
    ),
    tuteur: yup.string()
        .nullable()
        .test('is-mongo-id', 'ID tuteur invalide.',
            val => !val || mongoose.Types.ObjectId.isValid(val)),
    skills: yup.array()
        .of(yup.string().required())
        .min(1, 'Au moins une compétence est requise.'),
    dateDebut: yup.date()
        .required('La date de début est requise.')
        .min(new Date(), 'La date de début doit être ultérieure à aujourd\'hui.'),
    dateFin: yup.date()
        .required('La date de fin est requise.')
        .min(yup.ref('dateDebut'), 'La date de fin doit être ultérieure à la date de début.'),
    statut: yup.string()
        .required('Le statut est requis.')
        .oneOf(Object.values(Enums.StatutProjet), 'Statut de projet invalide.'),
    urlDepot: yup.string()
        .nullable()
        .url('L\'URL du dépôt doit être valide.')
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
    validateProjetData,
    validateId,
    projetSchema // Export pour tests et réutilisation
};