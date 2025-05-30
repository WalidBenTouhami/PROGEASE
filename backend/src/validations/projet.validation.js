const yup = require('yup');
const mongoose = require('mongoose');
const { MessagesErreur, StatutHttp, Enum } = require('../../config/constants');

// Schema de validation Yup pour les projets
const projetSchema = yup.object().shape({
    titre: yup.string()
        .min(5, 'Le titre doit contenir au moins 5 caracteres.')
        .max(200, 'Le titre ne peut pas depasser 200 caracteres.')
        .required('Le titre est requis.'),
    description: yup.string()
        .min(10, 'La description doit contenir au moins 10 caracteres.')
        .required('La description est requise.'),
    equipe: yup.array()
        .of(
            yup.string().test('is-mongo-id', 'ID utilisateur invalide.',
                val => !val || mongoose.Types.ObjectId.isValid(val))
        ),
    tuteur: yup.string()
        .nullable()
        .test('is-mongo-id', 'ID tuteur invalide.',
            val => !val || mongoose.Types.ObjectId.isValid(val)),
    competences: yup.array()
        .of(yup.string())
        .min(1, 'Au moins une competence requise.'),
    dateDebut: yup.date()
        .required('La date de debut est requise.')
        .test('date-valide', 'La date de debut doit être valide.',
            val => val instanceof Date && !isNaN(val)),
    dateFin: yup.date()
        .min(yup.ref('dateDebut'), 'La date de fin doit etre posterieure à la date de debut.')
        .required('La date de fin est requise.')
        .test('date-valide', 'La date de fin doit être valide.',
            val => val instanceof Date && !isNaN(val)),
    statut: yup.string()
        .oneOf(Object.values(Enum.StatutProjet), 'Statut de projet invalide.'),
    urlDepot: yup.string()
        .nullable()
        .matches(/^(https?:\/\/)([\da-z.-]+)\.([a-z.]{2,6})([/\w.-]*)*\/?$/, 'URL de dépôt invalide.')
        .transform(value => value || null),
    progression: yup.number()
        .min(0, 'La progression ne peut pas etre negative.')
        .max(100, 'La progression ne peut pas depasser 100%.')
        .transform(value => Math.round(value))
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