/**
 * Fichier central pour les resolvers GraphQL
 * Combine tous les resolvers spécifiques en un seul objet
 *
 * @module graphql/resolvers/index
 * @created 2025-05-27 par WalidBenTouhami
 */

'use strict';

const mongoose = require('mongoose');
const DataLoader = require('dataloader');
const logger = require('../../utils/logger');

// Import des resolvers spécifiques
const projetResolvers = require('./projet.resolver');
const livrableResolvers = require('./livrable.resolver');
const userResolvers = require('./user.resolver');
const scalarResolvers = require('./scalar.resolver');

/**
 * Crée les DataLoaders pour optimiser les requêtes N+1
 * @param {mongoose.Connection} connection - Connexion MongoDB active
 * @returns {Object} - Ensemble de DataLoaders
 */
function createLoaders(connection) {
    // Import des modèles
    const Projet = require('../../models/projet.model');
    const Livrable = require('../../models/livrable.model');

    return {
        projetLoader: new DataLoader(async (ids) => {
            const projets = await Projet.find({ _id: { $in: ids } })
                .lean()
                .exec();

            const projectsMap = new Map(
                projets.map(projet => [projet._id.toString(), projet])
            );

            return ids.map(id => projectsMap.get(id.toString()) || null);
        }, { cache: true }),

        livrableLoader: new DataLoader(async (ids) => {
            const livrables = await Livrable.find({ _id: { $in: ids } })
                .lean()
                .exec();

            const livrablesMap = new Map(
                livrables.map(livrable => [livrable._id.toString(), livrable])
            );

            return ids.map(id => livrablesMap.get(id.toString()) || null);
        }, { cache: true }),

        livrablesByProjetLoader: new DataLoader(async (projetIds) => {
            const livrables = await Livrable.find({ projetId: { $in: projetIds } })
                .lean()
                .exec();

            const livrablesMap = new Map();
            projetIds.forEach(id => livrablesMap.set(id.toString(), []));

            livrables.forEach(livrable => {
                const projetId = livrable.projetId.toString();
                if (livrablesMap.has(projetId)) {
                    livrablesMap.get(projetId).push(livrable);
                }
            });

            return projetIds.map(id => livrablesMap.get(id.toString()) || []);
        }, { cache: true })
    };
}

/**
 * Fonction d'initialisation des DataLoaders pour les requêtes GraphQL
 * @returns {Object} Loaders configurés
 */
function initLoaders() {
    return createLoaders(mongoose.connection);
}

// Combiner les resolvers
const resolvers = {
    Query: {
        ...projetResolvers.Query,
        ...livrableResolvers.Query,
        ...userResolvers.Query,

        // Requête de santé pour vérifier le bon fonctionnement
        healthCheck: () => ({
            status: 'ok',
            timestamp: new Date().toISOString(),
            version: '2.0.0',
            message: 'Le serveur GraphQL est opérationnel'
        })
    },

    Mutation: {
        ...projetResolvers.Mutation,
        ...livrableResolvers.Mutation,
        ...userResolvers.Mutation,

        // Mutation de test
        ping: (_, { message }) => ({
            success: true,
            message: `Pong! Message reçu: ${message || 'aucun message'}`,
            timestamp: new Date().toISOString()
        })
    },

    // Types complexes
    ...projetResolvers.Types,
    ...livrableResolvers.Types,
    ...userResolvers.Types,

    // Scalars personnalisés
    ...scalarResolvers
};

// Exports
module.exports = resolvers;
module.exports.initLoaders = initLoaders;