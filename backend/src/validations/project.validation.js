const yup = require('yup');

const projectSchema = yup.object().shape({
    titre: yup.string().required('Le titre du projet est obligatoire.'),
    description: yup.string().required('La description du projet est obligatoire.'),
    equipe: yup.array().of(yup.string().required()).min(1, 'L\'équipe doit contenir au moins un membre.'),
    tuteur: yup.string().required('Un tuteur est requis.'),
    competences: yup.array().of(yup.string().required()).min(1, 'Le projet doit comporter au moins une compétence.'),
    dateDebut: yup.date().required('La date de début est obligatoire.'),
    dateFin: yup.date().required('La date de fin est obligatoire.'),
    livrables: yup.array().of(
        yup.object().shape({
            nom: yup.string().required('Le nom du livrable est requis.'),
            description: yup.string().required('La description du livrable est requise.'),
            dateLimite: yup.date().required('La date limite est requise.'),
            statut: yup.string().oneOf(['Terminé', 'En attente', 'En retard']),
            urlDepot: yup.string().url('URL du dépôt invalide.').required('L\'URL du dépôt est requise.')
        })
    )
});

module.exports = {
    projectSchema,
};