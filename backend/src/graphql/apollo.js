/**
 * Configuration Apollo Server 4
 *
 * Ce fichier initialise et configure l'instance Apollo Server
 */
'use strict';

const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { typeDefs, resolvers } = require('./graphql/schema');
const logger = require('./utils/logger');

/**
 * Crée et démarre une instance Apollo Server
 * @returns {Promise<ApolloServer>} Instance Apollo Server démarrée
 */
async function createApolloServer() {
    // Création du serveur avec la configuration
    const server = new ApolloServer({
        typeDefs,
        resolvers,
        introspection: process.env.NODE_ENV !== 'production', // Sécurité: désactivé en production
        formatError: (formattedError, error) => {
            // Log de l'erreur pour le débogage
            logger.error(`GraphQL Error: ${formattedError.message}`, {
                path: formattedError.path,
                code: formattedError.extensions?.code,
                originalError: error.originalError
            });

            // En production, on peut masquer certains détails sensibles
            if (process.env.NODE_ENV === 'production') {
                // Retourner une erreur simplifiée au client
                return {
                    message: formattedError.message,
                    code: formattedError.extensions?.code || 'INTERNAL_SERVER_ERROR'
                };
            }

            // En développement, ajouter des détails pour le débogage
            return {
                ...formattedError,
                timestamp: new Date().toISOString(),
                // Utiliser dynamiquement l'utilisateur du contexte si disponible
                user: error.originalError?.context?.user?.username || 'SYSTEM'
            };
        }
    });

    // CRITIQUE: démarrer Apollo avant de créer le middleware
    await server.start();
    logger.info('Apollo Server 4 démarré avec succès');

    return server;
}

/**
 * Crée le middleware Express pour Apollo Server
 * @param {ApolloServer} server - Instance Apollo Server démarrée
 * @param {Object} options - Options supplémentaires pour le middleware
 * @returns {Function} Middleware Express
 */
function createApolloMiddleware(server, options = {}) {
    return expressMiddleware(server, {
        context: async ({ req }) => ({
            // Extraction du contexte à partir de la requête
            user: req.user, // Supposant que l'authentification est gérée ailleurs
            ...options.context
        })
    });
}

module.exports = {
    createApolloServer,
    createApolloMiddleware
};