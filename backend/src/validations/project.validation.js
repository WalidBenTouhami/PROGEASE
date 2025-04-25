//src/validations/project.validation.js

const yup = require('yup');

// Définition du schéma de validation pour les projets
const projectSchema = yup.object().shape({
    title: yup.string().required('Le titre est requis.'),
    description: yup.string().required('La description est requise.'),
    team: yup.array().of(yup.string().required()).min(1, 'L\'équipe doit contenir au moins un membre.'),
    tutor: yup.string().required('Un tuteur est requis.'),
    deliverables: yup.array().of(
        yup.object().shape({
            name: yup.string().required('Le nom du livrable est requis.'),
            deadline: yup.date().required('La date limite est requise.'),
            status: yup.string().oneOf(['Terminé', 'En attente', 'En retard']),
            repositoryUrl: yup.string().url('URL invalide').required('L\'URL du dépôt est requise.')
        })
    )
});

module.exports = {
    projectSchema,
};