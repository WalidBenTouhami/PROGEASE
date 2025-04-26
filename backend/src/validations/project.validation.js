//src/validations/project.validation.js

const yup = require('yup');

// Définition du schéma de validation pour les projets
const projectSchema = yup.object().shape({
    titre: yup.string().required('Le titre est requis.'), // Utilisez "titre" au lieu de "title"
    description: yup.string().required('La description est requise.'),
    equipe: yup.array().of(yup.string().required()).min(1, 'L\'équipe doit contenir au moins un membre.'),
    tuteur: yup.string().required('Un tuteur est requis.'),
    deliverables: yup.array().of(
        yup.object().shape({
            name: yup.string().required('Le nom du livrable est requis.'),
            deadline: yup.date().required('La date limite est requise.'),
            statut: yup.string().oneOf(['Terminé', 'En attente', 'En retard']),
            repositoryUrl: yup.string().url('URL invalide').required('L\'URL du dépôt est requise.')
        })
    )
});

module.exports = {
    projectSchema,
};