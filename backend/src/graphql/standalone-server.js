/**
 * Configuration du serveur Apollo GraphQL autonome
 * Intégration avec Express et configuration des plugins Apollo
 *
 * @module graphql/standalone-server
 */

'use strict';

// Imports Apollo Server
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { buildSubgraphSchema } = require('@apollo/subgraph');
const { ApolloServerPluginUsageReporting } = require('@apollo/server/plugin/usageReporting');
const { ApolloServerPluginLandingPageLocalDefault, ApolloServerPluginLandingPageProductionDefault } = require('@apollo/server/plugin/landingPage/default');
const { ApolloServerPluginCacheControl } = require('@apollo/server/plugin/cacheControl');
const { ApolloServerPluginDrainHttpServer } = require('@apollo/server/plugin/drainHttpServer');
const { ApolloServerPluginInlineTrace } = require('@apollo/server/plugin/inlineTrace');

// Imports modules de base
const { readFileSync } = require('fs');
const { gql } = require('graphql-tag');
const path = require('path');

// Imports modules personnalisés
const logger = require('../utils/logger');
const { formatGraphQLError, AppError } = require('../middleware/errorHandlers');
const {
  isDev,
  NODE_ENV,
  APOLLO_KEY,
  APOLLO_GRAPH_REF,
  APOLLO_SCHEMA_PATH
} = require('../../config/env');
const { GraphQLRateLimiterPlugin } = require('../plugins/rateLimiter');

// Importation des resolvers
const resolvers = require('./resolvers');

/**
 * Charge le schéma GraphQL depuis un fichier
 * @param {string} schemaPath - Chemin vers le fichier de schéma GraphQL
 * @returns {string} Contenu du schéma GraphQL
 * @throws {Error} Si le fichier n'existe pas ou ne peut être lu
 */
function loadSchemaFromFile(schemaPath) {
  try {
    // Résoudre le chemin absolu (en tenant compte du répertoire de travail)
    const absoluteSchemaPath = path.resolve(process.cwd(), schemaPath);
    logger.info(`Chargement du schéma GraphQL depuis: ${absoluteSchemaPath}`);

    // Lire le contenu du fichier
    return readFileSync(absoluteSchemaPath, 'utf-8');
  } catch (error) {
    logger.error(`Erreur de chargement du schéma GraphQL: ${error.message}`);
    throw new AppError(
        `Impossible de charger le schéma GraphQL: ${error.message}`,
        500,
        'ERR_SCHEMA_LOAD'
    );
  }
}

/**
 * Configure les plugins Apollo en fonction de l'environnement
 * @param {boolean} isDevEnv - Indique si l'environnement est de développement
 * @returns {Array} Liste des plugins Apollo configurés
 */
function configureApolloPlugins(httpServer) {
  const isDevEnv = isDev(); // Utilisez isDev comme une fonction
  const plugins = [];

  // Ajouter plugin de cache en production seulement
  if (!isDevEnv) {
    try {
      // Utiliser le package correct pour Apollo Server 4
      const { responseCachePlugin } = require('@apollo/server-plugin-response-cache');
      plugins.push(responseCachePlugin({
        sessionId: (requestContext) =>
            requestContext.request.http.headers.get('authorization') || null,
      }));
      logger.info('Plugin de cache de réponse configuré avec succès');
    } catch (error) {
      logger.warn(`Plugin de cache non chargé: ${error.message}`);
    }
  }

  // Ajouter le plugin de drainage HTTP
  if (httpServer) {
    plugins.push(ApolloServerPluginDrainHttpServer({ httpServer }));
  }

  // Plugin de limitation de débit pour prévenir les abus
  plugins.push(GraphQLRateLimiterPlugin({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: isDevEnv ? 1000 : 100, // limites différentes selon l'environnement
  }));

  // Suivi des performances des requêtes
  plugins.push(ApolloServerPluginInlineTrace());

  // Plugins spécifiques à l'environnement
  if (isDevEnv) {
    // Page d'accueil et explorateur GraphQL pour le développement
    plugins.push(ApolloServerPluginLandingPageLocalDefault({
      embed: true,
      includeCookies: true
    }));
  } else {
    // Page d'accueil pour la production (sans explorateur)
    plugins.push(ApolloServerPluginLandingPageProductionDefault({
      graphRef: APOLLO_GRAPH_REF,
      footer: false,
    }));

    // Rapports d'utilisation pour la production (si une clé Apollo est configurée)
    if (APOLLO_KEY) {
      plugins.push(ApolloServerPluginUsageReporting({
        sendReportsImmediately: true,
        sendErrors: { unmodified: true },
        rewriteError: (err) => {
          // Masquer les détails sensibles en production
          return new Error(`[${err.path?.join('.')}] Erreur interne du serveur`);
        }
      }));
    }
  }

  return plugins;
}

/**
 * Crée et configure un serveur Apollo GraphQL
 * @param {Express.Application} app - Application Express
 * @param {http.Server} httpServer - Serveur HTTP Express
 * @returns {Promise<ApolloServer>} Instance du serveur Apollo configuré
 */
async function createStandaloneServer(app, httpServer) {
  try {
    logger.info(`Configuration d'Apollo Server en mode ${NODE_ENV}`);

    // Charger le schéma GraphQL
    const schemaString = loadSchemaFromFile(APOLLO_SCHEMA_PATH || './src/graphql/schema.graphql');
    const typeDefs = gql`${schemaString}`;

    // Créer le schéma de sous-graphe
    const schema = buildSubgraphSchema({ typeDefs, resolvers });

    // Créer le serveur Apollo
    const server = new ApolloServer({
      schema,
      formatError: formatGraphQLError, // Utiliser notre formateur d'erreur amélioré
      introspection: isDev(), // Désactiver l'introspection en production
      plugins: configureApolloPlugins(httpServer),
      nodeEnv: NODE_ENV,
      cache: 'bounded', // Cache à taille limitée pour éviter les fuites mémoire
    });

    // Démarrer le serveur Apollo
    await server.start();
    logger.info('Serveur Apollo démarré avec succès');

    // Ajouter le middleware de contexte
    app.use((req, res, next) => {
      // Initialiser un ID de requête unique pour le traçage
      req.requestId = req.requestId || require('crypto').randomUUID();

      // Enrichir l'objet req avec les informations utilisateur
      // Note: dans une app réelle, cela viendrait de l'authentification
      req.user = req.user || req.headers['x-user'] || null;
      next();
    });

    // Configurer le middleware Express pour Apollo
    app.use('/graphql',
        expressMiddleware(server, {
          context: async ({ req, res }) => {
            try {
              // Vérifications de sécurité
              if (!req) {
                throw new AppError('Requête invalide', 400, 'ERR_INVALID_REQUEST');
              }

              // Construire le contexte avec les informations utiles
              return {
                user: req.user,
                timestamp: Date.now(),
                requestId: req.requestId,
                ip: req.ip,
                userAgent: req.get('user-agent'),
                // Ajouter la réponse pour manipuler les en-têtes si nécessaire
                res
              };
            } catch (error) {
              logger.error(`Erreur de contexte GraphQL: ${error.message}`, {
                stack: error.stack
              });

              return {
                user: null,
                timestamp: Date.now(),
                requestId: req?.requestId || 'unknown',
                ip: req?.ip || 'unknown',
                res
              };
            }
          }
        })
    );

    return server;
  } catch (error) {
    logger.error(`Erreur critique Apollo Server: ${error.message}`);
    logger.error(error.stack);
    throw error;
  }
}

module.exports = { createStandaloneServer };