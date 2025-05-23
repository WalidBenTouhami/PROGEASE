// FICHIER STANDALONE POUR APOLLO SERVER 4
// src/apollo.js

const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { typeDefs, resolvers } = require('./graphql/schema');
const logger = require('./utils/logger');

// Configuration Apollo selon la documentation officielle v4
async function createApolloServer() {
    // Création du serveur
    const server = new ApolloServer({
        typeDefs,
        resolvers,
        introspection: true, // Activer l'introspection
        formatError: (formattedError) => {
            logger.error(`GraphQL Error: ${formattedError.message}`);
            return {
                ...formattedError,
                timestamp: new Date('2025-05-23 13:32:00').toISOString(),
                user: 'WalidBenTouhami'
            };
        }
    });

    // Cette ligne est CRITIQUE - démarre Apollo avant de créer le middleware
    await server.start();
    logger.info('Apollo Server 4 démarré avec succès');

    // Retourne le serveur démarré - pas encore monté sur Express
    return server;
}

// Exportation
module.exports = { createApolloServer };