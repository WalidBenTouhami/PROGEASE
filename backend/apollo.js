'use strict';

const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { ApolloServerPluginLandingPageDisabled } = require('@apollo/server/plugin/disabled');
const {
    ApolloServerPluginLandingPageLocalDefault,
} = require('@apollo/server/plugin/landingPage/default');
const { ApolloServerPluginDrainHttpServer } = require('@apollo/server/plugin/drainHttpServer');
const { typeDefs } = require('./src/graphql/schema');
const logger = require('./src/utils/logger');
const { resolvers } = require('./src/graphql');

/**
 * Cree et demarre une instance Apollo Server
 * @param {import('http').Server} httpServer - Serveur HTTP Express (optionnel)
 * @param {Object} options - Options supplementaires pour Apollo Server
 * @returns {Promise<ApolloServer>} Instance Apollo Server demarree
 */
async function createApolloServer(httpServer = null, options = {}) {
    // Configuration des plugins
    const plugins = [
        // Plugin de fermeture propre du serveur HTTP
        ...(httpServer ? [ApolloServerPluginDrainHttpServer({ httpServer })] : []),

        // Page d'accueil GraphQL differente selon l'environnement
        process.env.NODE_ENV === 'production'
            ? ApolloServerPluginLandingPageDisabled()
            : ApolloServerPluginLandingPageLocalDefault({ footer: false }),
    ];

    // Ajout des plugins personnalises
    if (options.plugins) {
        plugins.push(...options.plugins);
    }

    // Creation du serveur avec la configuration
    const server = new ApolloServer({
        typeDefs,
        resolvers,
        introspection: process.env.NODE_ENV !== 'production',
        csrfPrevention: process.env.NODE_ENV === 'production',
        cache: 'bounded',
        plugins,
        // Remplacer formatError par la version non depreciee
        formatError: (formattedError, error) => {
            // Log de l'erreur pour le debogage
            logger.error(`GraphQL Error: ${formattedError.message}`, {
                path: formattedError.path,
                code: formattedError.extensions?.code,
                errorType: formattedError.extensions?.errorType,
                originalError: error.originalError,
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
                // Masquer stacktrace et details sensibles
                return baseError;
            }

            // En developpement, ajouter la stacktrace
            return {
                ...baseError,
                stacktrace:
                    error.originalError?.stack || formattedError.extensions?.exception?.stacktrace,
            };
        },
        ...options,
    });

    await server.start();
    logger.info('Apollo Server 4 demarre avec succes');

    return server;
}

/**
 * Cree le middleware Express pour Apollo Server
 * @param {ApolloServer} server - Instance Apollo Server demarree
 * @param {Object} options - Options supplementaires pour le middleware
 * @returns {Function} Middleware Express pour integrer Apollo Server à Express
 */
function createApolloMiddleware(server, options = {}) {
    return expressMiddleware(server, {
        context: async ({ req, res }) => {
            // Extraction du contexte à partir de la requete
            const context = {
                // Metadonnees de requete pour le traçage et le debogage
                ip: req.ip || req.connection?.remoteAddress,
                utilisateurAgent: req.headers['utilisateur-agent'],

                // Ajout de l'objet requete pour acceder aux headers
                req,

                // Ajout de l'objet reponse pour les en-tetes personnalises
                res,

                // Ajout d'un timestamp pour calculer la duree d'execution
                requestStartTime: Date.now(),
            };

            // Fusionner avec le contexte personnalise
            return {
                ...context,
                ...(options.context
                    ? typeof options.context === 'function'
                        ? await options.context({ req, res })
                        : options.context
                    : {}),
            };
        },
    });
}

// Ces fonctions sont utilisees dans "standalone server.js".
module.exports = {
    createApolloServer,
    createApolloMiddleware,
};
