'use strict';

const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { ApolloServerPluginDrainHttpServer } = require('@apollo/server/plugin/drainHttpServer');
const logger = require('../utils/logger');

/**
 * Configure un serveur Apollo GraphQL autonome et l'integre à une application Express
 *
 * @param {express.Application} app - L'application Express existante
 * @param {import('http').Server} httpServer - Le serveur HTTP existant
 * @param {import('graphql').GraphQLSchema} schema - Le schéma GraphQL
 * @returns {Promise<void>}
 */
async function createStandaloneServer(app, httpServer, schema) {
    try {
        logger.info('Configuration du serveur Apollo standalone...');

        const server = new ApolloServer({
            schema,
            plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
            formatError: error => {
                logger.error('GraphQL Error:', error);
                return error;
            },
        });

        await server.start();

        app.use(
            '/graphql',
            expressMiddleware(server, {
                context: async ({ req }) => ({
                    currentutilisateur: req.currentutilisateur,
                    timestamp: req.timestamp,
                }),
            })
        );

        logger.info('Serveur Apollo standalone configure avec succes sur /graphql');

        return server;
    } catch (error) {
        logger.error(`Erreur lors de la configuration du serveur Apollo: ${error.message}`);
        throw error;
    }
}

module.exports = {
    createStandaloneServer,
};
