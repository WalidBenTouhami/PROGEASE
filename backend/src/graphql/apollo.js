/**
 * Configuration Apollo Server 4
 *
 * Ce fichier initialise et configure l'instance Apollo Server
 */
'use strict';

const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { ApolloServerPluginLandingPageDisabled } = require('@apollo/server/plugin/disabled');
const { ApolloServerPluginLandingPageLocalDefault } = require('@apollo/server/plugin/landingPage/default');
const { ApolloServerPluginDrainHttpServer } = require('@apollo/server/plugin/drainHttpServer');
const http = require('http');
const { typeDefs } = require('../graphql/schema');
const logger = require('../utils/logger');
const resolvers = require('./resolvers/index');

/**
 * Crée et démarre une instance Apollo Server
 * @param {http.Server} httpServer - Serveur HTTP Express (optionnel)
 * @param {Object} options - Options supplémentaires pour Apollo Server
 * @returns {Promise<ApolloServer>} Instance Apollo Server démarrée
 */
async function createApolloServer(httpServer = null, options = {}) {
    // Configuration des plugins
    const plugins = [
        // Plugin de fermeture propre du serveur HTTP
        ...(httpServer ? [ApolloServerPluginDrainHttpServer({ httpServer })] : []),

        // Page d'accueil GraphQL différente selon l'environnement
        process.env.NODE_ENV === 'production'
            ? ApolloServerPluginLandingPageDisabled()
            : ApolloServerPluginLandingPageLocalDefault({ footer: false })
    ];

    // Ajout des plugins personnalisés
    if (options.plugins) {
        plugins.push(...options.plugins);
    }

    // Création du serveur avec la configuration
    const server = new ApolloServer({
        typeDefs,
        resolvers,
        introspection: process.env.NODE_ENV !== 'production',
        csrfPrevention: process.env.NODE_ENV === 'production',
        cache: 'bounded',
        plugins,
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
                user: error.originalError?.context?.user?.username || 'SYSTEM',
                stacktrace: error.originalError?.stack || formattedError.extensions?.exception?.stacktrace
            };
        },
        ...options
    });

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
        context: async ({ req, res }) => {
            // Extraction du contexte à partir de la requête
            const context = {
                // Utilisateur authentifié
                user: req.user,

                // Ajout de l'objet requête pour accéder aux headers
                req,

                // Ajout de l'objet réponse pour les en-têtes personnalisés
                res,

                // Ajout d'un timestamp pour calculer la durée d'exécution
                requestStartTime: Date.now()
            };

            // Fusionner avec le contexte personnalisé fourni dans les options
            return {
                ...context,
                ...options.context
            };
        }
    });
}

module.exports = {
    createApolloServer,
    createApolloMiddleware
};