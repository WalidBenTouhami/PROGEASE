// src/graphql/standalone-server.js
const http = require('http');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { ApolloServerPluginDrainHttpServer } = require('@apollo/server/plugin/drainHttpServer');
const { typeDefs, resolvers } = require('./schema');
const cors = require('cors');
const bodyParser = require('body-parser');
const logger = require('../utils/logger');

// Date et utilisateur actuels
const currentDate = "2025-05-23 14:31:13";
const currentUser = "WalidBenTouhami";

async function createStandaloneServer(app, httpServer) {
    try {
        // Apollo Server + drain plugin
        const server = new ApolloServer({
            typeDefs,
            resolvers,
            plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
            introspection: true,
            formatError: (formattedError) => {
                logger.error(`GraphQL Error: ${formattedError.message}`);
                return {
                    ...formattedError,
                    timestamp: currentDate,
                    user: currentUser
                };
            }
        });

        // Démarrage du serveur Apollo
        await server.start();
        logger.info('Apollo Server 4 standalone démarré avec succès');

        // Application du middleware pour la route GraphQL
        app.use(
            '/graphql',
            cors(),
            bodyParser.json(),
            expressMiddleware(server, {
                context: async ({ req }) => ({
                    user: req.currentUser || currentUser,
                    timestamp: currentDate,
                    models: {} // Espace pour les modèles Mongoose
                }),
            }),
        );

        // Route pour Apollo Studio
        app.get('/studio', (req, res) => {
            res.redirect('/graphql');
        });

        logger.info('Middleware GraphQL monté sur /graphql');
        return true;
    } catch (error) {
        logger.error(`Erreur Apollo Server: ${error.message}`);
        logger.error(error.stack);
        return false;
    }
}

module.exports = { createStandaloneServer };