const Projet = require('../models/project.model');
const Livrable = require('../models/deliverable.model');
// const Utilisateur = require('../models/user.model'); // À créer si besoin

function mapProjetMongoVersGraphQL(doc) {
    if (!doc) return null;
    return {
        _id: doc._id,
        titre: doc.titre,
        description: doc.description,
        equipe: doc.equipe,
        tuteur: doc.tuteur,
        competences: doc.competences,
        dateDebut: doc.dateDebut,
        dateFin: doc.dateFin,
        livrables: doc.livrables,
        statut: doc.statut,
        creeLe: doc.creeLe,
        majLe: doc.majLe,
    };
}

function mapLivrableMongoVersGraphQL(doc) {
    if (!doc) return null;
    return {
        _id: doc._id,
        nom: doc.nom,
        description: doc.description,
        dateLimite: doc.dateLimite,
        urlDepot: doc.urlDepot,
        statut: doc.statut,
        projetId: doc.projetId,
        creeLe: doc.creeLe,
        majLe: doc.majLe,
    };
}

const resolvers = {
    Query: {
        projets: async () => {
            const projets = await Projet.find().populate('equipe tuteur livrables');
            return projets.map(mapProjetMongoVersGraphQL);
        },
        projet: async (_, { id }) => {
            const projet = await Projet.findById(id).populate('equipe tuteur livrables');
            return mapProjetMongoVersGraphQL(projet);
        },
        livrables: async (_, { projetId }) => {
            const livrables = await Livrable.find({ projetId });
            return livrables.map(mapLivrableMongoVersGraphQL);
        }
    },
    Mutation: {
        creerProjet: async (_, args) => {
            const projet = new Projet(args);
            const saved = await projet.save();
            return mapProjetMongoVersGraphQL(saved);
        },
        mettreAJourProjet: async (_, { id, ...args }) => {
            const maj = await Projet.findByIdAndUpdate(id, args, { new: true, runValidators: true }).populate('equipe tuteur livrables');
            return mapProjetMongoVersGraphQL(maj);
        },
        supprimerProjet: async (_, { id }) => {
            const supprime = await Projet.findByIdAndDelete(id);
            return mapProjetMongoVersGraphQL(supprime);
        },
        ajouterLivrable: async (_, { projetId, input }) => {
            const livrable = new Livrable({ ...input, projetId });
            const saved = await livrable.save();
            await Projet.findByIdAndUpdate(projetId, { $push: { livrables: saved._id } });
            return mapLivrableMongoVersGraphQL(saved);
        },
        mettreAJourLivrable: async (_, { livrableId, input }) => {
            const maj = await Livrable.findByIdAndUpdate(livrableId, input, { new: true, runValidators: true });
            return mapLivrableMongoVersGraphQL(maj);
        },
        supprimerLivrable: async (_, { livrableId }) => {
            const supprime = await Livrable.findByIdAndDelete(livrableId);
            return mapLivrableMongoVersGraphQL(supprime);
        }
    },
    Projet: {
        progression: (projet) => {
            if (!projet.dateDebut || !projet.dateFin) return null;
            const maintenant = new Date();
            const debut = new Date(projet.dateDebut);
            const fin = new Date(projet.dateFin);
            if (maintenant < debut) return 0;
            if (maintenant > fin) return 100;
            const total = fin - debut;
            const ecoule = maintenant - debut;
            return Math.round((ecoule / total) * 100);
        }
    }
};

module.exports = { resolvers };