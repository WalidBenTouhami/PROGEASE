// src/app.js
require('dotenv').config();
const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const helmet = require('helmet');
const cors = require('cors');
const { scheduleJob } = require('node-schedule');
const { connectToDatabase, checkConnection, closeDatabase } = require('./core/db');
const { typeDefs, resolvers } = require('./schema');
const { verifyToken } = require('./modules/project-management/middlewares/project.middleware');
const { projectRoutes } = require('./modules/project-management');
const iaCron = require('./services/iaCron');
const logger = require('./utils/logger');

// Configuration initiale
const PORT = process.env.PORT || 4000;
const isProduction = process.env.NODE_ENV === 'production';

async function initializeApp() {
    const app = express();

    // 1. Sécurité de base
    app.use(helmet());
    app.use(cors({
        origin: isProduction ? process.env.CORS_ORIGINS.split(',') : '*'
    }));
    app.use(express.json({ limit: '10kb' }));

    // 2. Connexion DB
    await connectToDatabase();
    if (!(await checkConnection())) {
        throw new Error('Échec de connexion à la base de données');
    }

    // 3. Middlewares personnalisés
    app.use(verifyToken);

    // 4. Configuration Apollo Server
    const apolloServer = new ApolloServer({
        typeDefs,
        resolvers,
        context: ({ req }) => ({ user: req.user }),
        subscriptions: {
            path: '/subscriptions',
        },
        introspection: !isProduction,
        playground: !isProduction
    });

    // 5. Routes
    app.use('/api/v1/projects', projectRoutes);

    // Endpoint de santé amélioré
    app.get('/api/health', (req, res) => {
        res.json({
            status: 'ok',
            uptime: process.uptime(),
            dbStatus: checkConnection() ? 'connected' : 'disconnected',
            memoryUsage: process.memoryUsage()
        });
    });

    // 6. Application du middleware Apollo
    await apolloServer.start();
    apolloServer.applyMiddleware({
        app,
        path: '/graphql',
        cors: false
    });

    // 7. Planification des tâches IA
    if (process.env.ENABLE_IA_CRON === 'true') {
        iaCron.initScheduledJobs();
    }

    return { app, apolloServer };
}

async function startServer() {
    try {
        const { app, apolloServer } = await initializeApp();

        const server = app.listen(PORT, () => {
            logger.info(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
            logger.info(`📡 GraphQL endpoint: http://localhost:${PORT}${apolloServer.graphqlPath}`);
            if (apolloServer.subscriptionsPath) {
                logger.info(`🔔 Subscriptions endpoint: ws://localhost:${PORT}${apolloServer.subscriptionsPath}`);
            }
        });

        // Gestion propre des arrêts
        process.on('SIGTERM', gracefulShutdown);
        process.on('SIGINT', gracefulShutdown);

        async function gracefulShutdown() {
            logger.info('🛑 Shutting down gracefully...');
            server.close(async () => {
                await closeDatabase();
                logger.info('✅ All connections closed');
                process.exit(0);
            });
        }

    } catch (error) {
        logger.error(`💥 Failed to start: ${error.message}`);
        await closeDatabase();
        process.exit(1);
    }
}

// Démarrage de l'application
startServer();