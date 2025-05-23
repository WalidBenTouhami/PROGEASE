const yup = require('yup');

const livrableSchema = yup.object().shape({
    nom: yup.string().required('Le nom du livrable est obligatoire.'),
    description: yup.string().required('La description du livrable est obligatoire.'),
    dateLimite: yup.date().required('La date limite est obligatoire.'),
    urlDepot: yup.string()
        .matches(/^https:\/\/github\.com\/[^/]+\/[^/]+$/, 'Format de dépôt GitHub invalide.')
        .required('L\'URL du dépôt est obligatoire.'),
    statut: yup.string().oneOf(['En retard', 'En attente', 'Terminé'])
});

module.exports = { livrableSchema };