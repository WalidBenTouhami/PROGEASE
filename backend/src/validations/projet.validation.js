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
        .required('La date de debut est requise.'),
    dateFin: yup.date()
        .min(yup.ref('dateDebut'), 'La date de fin doit etre posterieure à la date de debut.')
        .required('La date de fin est requise.'),
    statut: yup.string()
        .oneOf(Object.values(Enum.StatutProjet), 'Statut de projet invalide.'),
    progression: yup.number()
        .min(0, 'La progression ne peut pas etre negative.')
        .max(100, 'La progression ne peut pas depasser 100%.')
});