const Livrable = require('../models/livrable.model');
const logger = require('../utils/logger');

/**
 * Crée un nouveau livrable
 * @param {Object} data - Données du livrable à créer
 * @returns {Promise<Object>} - Livrable créé
 */
async function creerLivrable(data) {
    try {
        const livrable = new Livrable(data);
        return await livrable.save();
    } catch (error) {
        logger.error(`Erreur lors de la création du livrable: ${error.message}`, {
            stack: error.stack,
        });
        throw error;
    }
}

/**
 * Récupère tous les livrables avec filtres et pagination
 * @param {Object} options - Options de filtrage et pagination
 * @returns {Promise<Object>} - Liste paginée de livrables
 */
async function recupererTousLivrables(options = {}) {
    try {
        const { page = 1, limit = 20, statut, projetId, tri = '-creeLe' } = options;

        const query = {};
        if (statut) query.statut = statut;
        if (projetId) query.projetId = projetId;

        const [livrables, total] = await Promise.all([
            Livrable.find(query)
                .sort(tri)
                .limit(Number(limit))
                .skip((Number(page) - 1) * Number(limit))
                .populate('projetId', 'titre description')
                .lean(),
            Livrable.countDocuments(query),
        ]);

        return {
            livrables,
            pagination: {
                page: Number(page),
                limite: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit)),
            },
        };
    } catch (error) {
        logger.error(`Erreur lors de la récupération des livrables: ${error.message}`, {
            stack: error.stack,
        });
        throw error;
    }
}

module.exports = {
    creerLivrable,
    recupererTousLivrables,
};
