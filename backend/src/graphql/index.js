/**
 * Fichier central pour les resolvers GraphQL
 * Combine tous les resolvers spécifiques en un seul objet
 *
 * @module graphql/resolvers/index
 * @created 2025-05-27 par WalidBenTouhami
 * @updated 2025-05-28 par WalidBenTouhami
 */

'use strict';

// Suppression de l'import inutilisé de mongoose
const DataLoader = require('dataloader');
const logger = require('../utils/logger');

// Import des resolvers spécifiques
const projetResolvers = require('./resolvers/projet.resolver');
const livrableResolvers = require('./resolvers/livrable.resolver');
const scalarResolvers = require('./resolvers/scalar.resolver');

// Import direct des modèles
const Projet = require('../models/projet.model');
const Livrable = require('../models/livrable.model');

/**
 * Crée les DataLoaders pour optimiser les requêtes N+1
 * @returns {Object} - Ensemble de DataLoaders
 */
function createLoaders() {
    logger.debug('Initialisation des DataLoaders GraphQL');

    return {
        projetLoader: new DataLoader(async (ids) => {
            logger.debug(`Chargement de ${ids.length} projets par DataLoader`);

            const projets = await Projet.find({ _id: { $in: ids } })
                .lean()
                .exec();

            const projetsMap = {};

            // S'assurer que projets est un tableau avant d'utiliser forEach
            (projets || []).forEach(projet => {
                if (projet && projet._id) {
                    projetsMap[projet._id.toString()] = projet;
                }
            });

            return ids.map(id => projetsMap[id.toString()] || null);
        }, { cache: true }),

        livrableLoader: new DataLoader(async (ids) => {
            logger.debug(`Chargement de ${ids.length} livrables par DataLoader`);

            const livrables = await Livrable.find({ _id: { $in: ids } })
                .lean()
                .exec();

            const livrablesMap = {};

            // S'assurer que livrables est un tableau avant d'utiliser forEach
            (livrables || []).forEach(livrable => {
                if (livrable && livrable._id) {
                    livrablesMap[livrable._id.toString()] = livrable;
                }
            });

            return ids.map(id => livrablesMap[id.toString()] || null);
        }, { cache: true }),

        livrablesByProjetLoader: new DataLoader(async (projetIds) => {
            logger.debug(`Chargement des livrables pour ${projetIds.length} projets par DataLoader`);

            const livrables = await Livrable.find({ projetId: { $in: projetIds } })
                .lean()
                .exec();

            // Initialiser la map avec des tableaux vides pour tous les IDs de projets
            const livrablesMap = {};
            for (const id of projetIds) {
                livrablesMap[id.toString()] = [];
            }

            // Remplir la map avec les livrables trouvés
            for (const livrable of (livrables || [])) {
                if (livrable && livrable.projetId) {
                    const projetId = livrable.projetId.toString();
                    if (livrablesMap[projetId]) {
                        livrablesMap[projetId].push(livrable);
                    }
                }
            }

            return projetIds.map(id => livrablesMap[id.toString()] || []);
        }, { cache: true })
    };
}

/**
 * Fonction d'initialisation des DataLoaders pour les requêtes GraphQL
 * @returns {Object} Loaders configurés
 */
function initLoaders() {
    return createLoaders();
}

// Requêtes et mutations utilitaires
const utilityResolvers = {
    Query: {
        // Cette requête est utilisée par le schéma GraphQL, même si elle n'est pas référencée directement dans le code
        healthCheck: () => {
            logger.info('Requête healthCheck exécutée');
            return {
                status: 'ok',
                timestamp: new Date().toISOString(),
                version: '2.0.0',
                message: 'Le serveur GraphQL est opérationnel'
            };
        }
    },

    Mutation: {
        // Cette mutation est utilisée par le schéma GraphQL, même si elle n'est pas référencée directement dans le code
        ping: (_, { message }) => {
            logger.debug(`Mutation ping reçue avec message: ${message || 'aucun'}`);
            return {
                success: true,
                message: `Pong! Message reçu: ${message || 'aucun message'}`,
                timestamp: new Date().toISOString()
            };
        }
    }
};

// Combiner les resolvers
const resolvers = {
    Query: {
        ...projetResolvers.Query,
        ...livrableResolvers.Query,
        ...utilityResolvers.Query
    },

    Mutation: {
        ...projetResolvers.Mutation,
        ...livrableResolvers.Mutation,
        ...utilityResolvers.Mutation
    },

    // Types complexes
    ...projetResolvers.Types,
    ...livrableResolvers.Types,

    // Scalars personnalisés
    ...scalarResolvers
};

// Exports
module.exports = resolvers;
module.exports.initLoaders = initLoaders;