// src/graphql/standalone-server.js
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { gql } = require('graphql-tag');
const express = require('express');
const logger = require('../utils/logger');

// Importations de schéma
let typeDefs, resolvers;
try {
  const schemaImport = require('./schema');
  typeDefs = schemaImport.typeDefs;
  resolvers = schemaImport.resolvers;
} catch (error) {
  // Fallback vers federation.js si schema.js n'existe pas
  try {
    const federationImport = require('./federation');
    typeDefs = federationImport.typeDefs;
    resolvers = federationImport.resolvers;
  } catch (federationError) {
    logger.error('Impossible de charger le schéma GraphQL:', federationError);
  }
}

/**
 * Création d'un serveur Apollo standalone
 * @param {Object} app - Application Express
 * @param {Object} httpServer - Serveur HTTP Express
 */
async function createStandaloneServer(app, httpServer) {
  try {
    // Vérifier si les typeDefs et resolvers existent
    if (!typeDefs || !resolvers) {
      throw new Error('TypeDefs ou resolvers manquants');
    }

    // Conversion du typeDefs en objet DocumentNode si c'est une chaîne
    const processedTypeDefs = typeof typeDefs === 'string' ? gql(typeDefs) : typeDefs;

    // Création du serveur Apollo
    const server = new ApolloServer({
      typeDefs: processedTypeDefs,
      resolvers,
      introspection: process.env.NODE_ENV !== 'production',
      formatError: (formattedError) => {
        // Log les erreurs mais ne pas exposer les détails en production
        logger.error(`GraphQL Error: ${formattedError.message}`, {
          path: formattedError.path,
          extensions: formattedError.extensions
        });

        return process.env.NODE_ENV === 'production'
            ? { message: 'Erreur interne du serveur GraphQL', code: formattedError.extensions?.code || 'INTERNAL_SERVER_ERROR' }
            : {
              ...formattedError,
              timestamp: new Date().toISOString()
            };
      }
    });

    // Démarrage du serveur Apollo
    await server.start();
    logger.info('Serveur Apollo démarré avec succès');

    // Middleware Express pour Apollo
    app.use(
        '/graphql',
        express.json(),
        expressMiddleware(server, {
          context: async ({ req }) => ({
            user: req.currentUser || 'anonymous',
            timestamp: req.timestamp || new Date().toISOString()
          })
        })
    );

    logger.info('Apollo Server configuré sur /graphql');

    return server;
  } catch (error) {
    logger.error('Erreur lors de la création du serveur Apollo:', error);
    throw error;
  }
}

module.exports = { createStandaloneServer };
