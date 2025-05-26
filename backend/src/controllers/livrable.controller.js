// src/controllers/livrable.controller.js

const Projet = require('../models/projet.model');
const Livrable = require('../models/livrable.model');

// 🔁 Mapper MongoDB → GraphQL
function mapperLivrable(doc) {
    if (!doc) return null;
    return {
        _id: doc._id.toString(),
        intitule: doc.intitule,
        description: doc.description,
        dateEcheance: doc.dateLimite,
        statut: doc.statut,
        projetId: doc.projetId?.toString(),
        creeLe: doc.creeLe,
        majLe: doc.majLe,
    };
}

module.exports = {
    // ✅ Mutation : ajouterLivrable
    ajouterLivrable: async (_, { input }) => {
        const { projetId, intitule, description, dateEcheance } = input;

        if (!projetId || !intitule || !description || !dateEcheance) {
            throw new Error('Tous les champs sont requis.');
        }

        const projet = await Projet.findById(projetId);
        if (!projet) {
            throw new Error('Projet introuvable.');
        }

        const livrable = new Livrable({
            intitule,
            description,
            dateLimite: new Date(dateEcheance),
            projetId,
        });

        const saved = await livrable.save();

        projet.livrables.push(saved._id);
        await projet.save();

        return mapperLivrable(saved);
    },

    // ✅ Query : recupererLivrablesParProjet(projetId)
    recupererLivrablesParProjet: async (_, { projetId }) => {
        if (!projetId) throw new Error('projetId requis.');
        const livrables = await Livrable.find({ projetId });
        return livrables.map(mapperLivrable);
    },

    // ✅ Query : recupererTousLivrables
    recupererTousLivrables: async () => {
        const livrables = await Livrable.find();
        return livrables.map(mapperLivrable);
    },

    // ✅ Query : recupererLivrableParId
    recupererLivrableParId: async (_, { livrableId }) => {
        const livrable = await Livrable.findById(livrableId);
        if (!livrable) throw new Error('Livrable non trouvé.');
        return mapperLivrable(livrable);
    },

    // ✅ Mutation : mettreAJourLivrable
    mettreAJourLivrable: async (_, { livrableId, input }) => {
        const updated = await Livrable.findByIdAndUpdate(
            livrableId,
            {
                intitule: input.intitule,
                description: input.description,
                dateLimite: input.dateEcheance,
                statut: input.statut,
            },
            { new: true, runValidators: true }
        );

        if (!updated) throw new Error('Livrable non trouvé.');
        return mapperLivrable(updated);
    },

    // ✅ Mutation : supprimerLivrable
    supprimerLivrable: async (_, { livrableId }) => {
        const deleted = await Livrable.findByIdAndDelete(livrableId);
        if (!deleted) throw new Error('Livrable non trouvé.');
        return true;
    }
};
