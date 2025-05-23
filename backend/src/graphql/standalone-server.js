const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { buildSubgraphSchema } = require('@apollo/subgraph');
const { readFileSync } = require('fs');
const { gql } = require('graphql-tag');
const path = require('path');
const logger = require('../utils/logger');

// Importez les resolvers depuis le bon chemin
const resolvers = require('./resolvers');

async function createStandaloneServer(app, httpServer) {
  try {
    // Utiliser la variable d'environnement ou un chemin par défaut
    const schemaPath = process.env.APOLLO_SCHEMA_PATH || './src/graphql/schema.graphql';

    // Résoudre le chemin absolu (en tenant compte du répertoire de travail)
    const absoluteSchemaPath = path.resolve(process.cwd(), schemaPath);

    logger.info(`Chargement du schéma GraphQL depuis: ${absoluteSchemaPath}`);

    // Lire le contenu du fichier
    const schemaString = readFileSync(absoluteSchemaPath, 'utf-8');

    // Parser le schéma avec gql
    const typeDefs = gql`${schemaString}`;

    // Créer le schéma de sous-graphe
    const schema = buildSubgraphSchema({
      typeDefs,
      resolvers
    });

    const server = new ApolloServer({
      schema,
      formatError: (error) => {
        logger.error(`Erreur GraphQL: ${error.message}`);
        return error;
      },
    });

    await server.start();
    app.use('/graphql', expressMiddleware(server, {
      context: async ({ req }) => ({
        user: req.currentUser,
        timestamp: req.timestamp
      }),
    }));

    return server;
  } catch (error) {
    logger.error(`Erreur Apollo Server: ${error.message}`);
    throw error;
  }
}

module.exports = { createStandaloneServer };