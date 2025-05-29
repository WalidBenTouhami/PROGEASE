'use strict';

const express = require('express');
const { createApolloServer, createApolloMiddleware } = require('../../apollo');
const { initLoaders } = require('./index');
const logger = require('../utils/logger');

/**
 * Configure un serveur Apollo GraphQL autonome et l'integre à une application Express
 *
 * @param {express.Application} app - L'application Express existante
 * @param {import('http').Server} httpServer - Le serveur HTTP existant
 * @returns {Promise<void>}
 */
async function createStandaloneServer(app, httpServer) {
    try {
        logger.info('Configuration du serveur Apollo standalone...');

        // Creation et demarrage du serveur Apollo
        const apolloServer = await createApolloServer(httpServer, {
            plugins: [
                // Plugins personnalises si necessaires
            ]
        });

        // Creation du middleware Express pour Apollo Server
        const apolloMiddleware = createApolloMiddleware(apolloServer, {
            context: async ({ req }) => {
                // Contexte personnalise à partager avec les resolvers
                return {
                    // Initialiser les DataLoaders
                    loaders: initLoaders(),

                    // Donnees utilisateur et de requete
                    currentUser: req.currentUser || 'anonyme',
                    timestamp: new Date().toISOString()
                };
            }
        });

        // Enregistrement du middleware Apollo sur le chemin /graphql-apollo
        app.use('/graphql-apollo', express.json(), apolloMiddleware);

        logger.info('Serveur Apollo standalone configure avec succes sur /graphql-apollo');

        return apolloServer;
    } catch (error) {
        logger.error(`Erreur lors de la configuration du serveur Apollo: ${error.message}`);
        throw error;
    }
}

module.exports = {
    createStandaloneServer
};