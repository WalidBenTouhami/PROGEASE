'use strict';

const express = require('express');
const { createApolloServer, createApolloMiddleware } = require('../../apollo');
const { initLoaders } = require('./index');
const logger = require('../utils/logger');

/**
 * Configure un serveur Apollo GraphQL autonome et l'intègre à une application Express
 *
 * @param {express.Application} app - L'application Express existante
 * @param {import('http').Server} httpServer - Le serveur HTTP existant
 * @returns {Promise<void>}
 */
async function createStandaloneServer(app, httpServer) {
    try {
        logger.info('Configuration du serveur Apollo standalone...');

        // Création et démarrage du serveur Apollo
        const apolloServer = await createApolloServer(httpServer, {
            plugins: [
                // Plugins personnalisés si nécessaires
            ]
        });

        // Création du middleware Express pour Apollo Server
        const apolloMiddleware = createApolloMiddleware(apolloServer, {
            context: async ({ req }) => {
                // Contexte personnalisé à partager avec les resolvers
                return {
                    // Initialiser les DataLoaders
                    loaders: initLoaders(),

                    // Données utilisateur et de requête
                    currentUser: req.currentUser || 'anonyme',
                    timestamp: new Date().toISOString()
                };
            }
        });

        // Enregistrement du middleware Apollo sur le chemin /graphql-apollo
        app.use('/graphql-apollo', express.json(), apolloMiddleware);

        logger.info('Serveur Apollo standalone configuré avec succès sur /graphql-apollo');

        return apolloServer;
    } catch (error) {
        logger.error(`Erreur lors de la configuration du serveur Apollo: ${error.message}`);
        throw error;
    }
}

module.exports = {
    createStandaloneServer
};