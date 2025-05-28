'use strict';

const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { ApolloServerPluginLandingPageDisabled } = require('@apollo/server/plugin/disabled');
const { ApolloServerPluginLandingPageLocalDefault } = require('@apollo/server/plugin/landingPage/default');
const { ApolloServerPluginDrainHttpServer } = require('@apollo/server/plugin/drainHttpServer');
const { typeDefs } = require('./src/graphql/schema');
const logger = require('./src/utils/logger');
const resolvers = require('./src/graphql');

/**
 * Crée et démarre une instance Apollo Server
 * @param {import('http').Server} httpServer - Serveur HTTP Express (optionnel)
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
        // Remplacer formatError par la version non dépréciée
        formatError: (formattedError, error) => {
            // Log de l'erreur pour le débogage
            logger.error(`GraphQL Error: ${formattedError.message}`, {
                path: formattedError.path,
                code: formattedError.extensions?.code,
                errorType: formattedError.extensions?.errorType,
                originalError: error.originalError
            });

            const baseError = {
                message: formattedError.message,
                code: formattedError.extensions?.code || 'INTERNAL_SERVER_ERROR',
                path: formattedError.path,
                timestamp: new Date().toISOString(),
            };
            if (formattedError.extensions?.errorType) {
                baseError.errorType = formattedError.extensions.errorType;
            }

            if (process.env.NODE_ENV === 'production') {
                // Masquer stacktrace et détails sensibles
                return baseError;
            }

            // En développement, ajouter la stacktrace
            return {
                ...baseError,
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
 * @returns {Function} Middleware Express pour intégrer Apollo Server à Express
 */
function createApolloMiddleware(server, options = {}) {
    return expressMiddleware(server, {
        context: async ({ req, res }) => {
            // Extraction du contexte à partir de la requête
            const context = {
                // Métadonnées de requête pour le traçage et le débogage
                ip: req.ip || req.connection?.remoteAddress,
                userAgent: req.headers['user-agent'],

                // Ajout de l'objet requête pour accéder aux headers
                req,

                // Ajout de l'objet réponse pour les en-têtes personnalisés
                res,

                // Ajout d'un timestamp pour calculer la durée d'exécution
                requestStartTime: Date.now()
            };

            // Fusionner avec le contexte personnalisé
            return {
                ...context,
                ...(options.context ?
                    (typeof options.context === 'function' ?
                        await options.context({ req, res }) :
                        options.context) :
                    {})
            };
        }
    });
}

// Ces fonctions sont utilisées dans "standalone server.js".
module.exports = {
    createApolloServer,
    createApolloMiddleware
};