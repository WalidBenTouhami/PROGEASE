// ./backend/server.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { ApolloServer } = require('apollo-server-express');
const { ApolloServerPluginDrainHttpServer } = require('apollo-server-core');
const { GraphQLError } = require('graphql');
const http = require('http');
require('dotenv').config();
const logger = require('./src/utils/logger');


// Générer des logs de test pour chaque niveau
logger.error('Erreur de test');
logger.warn('Avertissement de test');
logger.info('Information de test');
logger.debug('Debug de test');

console.log('Logs de test générés dans le dossier logs/');

// Import des typeDefs et resolvers (attention à la façon dont ils sont exportés)
let typeDefs, resolvers;
try {
    const schema = require('./src/graphql/schema');
    const resolversModule = require('./src/graphql/resolvers');
    typeDefs = schema.typeDefs || schema;
    resolvers = resolversModule.resolvers || resolversModule;
} catch (error) {
    logger.error('Erreur lors de l\'import GraphQL:', error);
    typeDefs = [];
    resolvers = {};
}

// Import des routes
const projetRouter = require('./src/routes/projet.routes');
const livrableRouter = require('./src/routes/livrable.routes');
const aiRouter = require('./src/routes/ai.router');
const { errorHandler, notFoundHandler } = require('./src/middleware/errorHandlers');

const app = express();
const httpServer = http.createServer(app);
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/progease';
const NODE_ENV = process.env.NODE_ENV || 'development';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Middleware de journalisation pour déboguer les requêtes
app.use((req, res, next) => {
    logger.debug(`${req.method} ${req.originalUrl}`, {
        ip: req.ip,
        userAgent: req.get('User-Agent')
    });
    next();
});

// Configuration du rate limiter
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false
});

// Configuration CORS plus flexible pour les tests
const corsOptions = {
    origin: NODE_ENV === 'production'
        ? [FRONTEND_URL] // Liste blanche en production
        : '*', // Permissif en développement
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

// Middlewares de base
app.use(helmet({
    contentSecurityPolicy: false, // Désactivé pour faciliter les tests
    crossOriginEmbedderPolicy: false
}));
app.use(morgan('combined'));
app.use(cors(corsOptions));
app.use(compression());
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Configuration du cache pour l'environnement de production
if (NODE_ENV === 'production') {
    app.set('trust proxy', 1);
    app.use((_req, res, next) => {
        res.set('Cache-Control', 'public, max-age=300, s-maxage=600');
        next();
    });
}

// Route de test
app.get('/', (_req, res) => {
    res.json({ message: 'PROGEASE API is running' });
});

// Route de santé
app.get('/health', (_req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date(),
        uptime: process.uptime(),
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

// Routes API REST
app.use('/api/projets', projetRouter);
app.use('/api/livrables', livrableRouter);
app.use('/api/ai', aiRouter);

// Connexion à MongoDB
async function connectToMongoDB() {
    try {
        await mongoose.connect(MONGO_URI, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            family: 4
        });
        logger.info('Connecté à MongoDB avec succès');
    } catch (err) {
        logger.error('Erreur de connexion MongoDB:', err);
        process.exit(1);
    }
}

// Initialisation Apollo Server
async function startApolloServer() {
    const server = new ApolloServer({
        typeDefs,
        resolvers,
        plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
        context: async ({ req }) => ({ req }),
        formatError: (err) => {
            logger.error('Erreur GraphQL:', {
                message: err.message,
                path: err.path,
                extensions: err.extensions
            });

            if (err.extensions?.code === 'UNAUTHENTICATED') {
                return new GraphQLError('Authentification requise');
            }
            return new GraphQLError(
                NODE_ENV === 'production'
                    ? 'Une erreur est survenue'
                    : err.message
            );
        },
        playground: true,
        introspection: true
    });

    await server.start();

    server.applyMiddleware({
        app,
        path: '/graphql',
        cors: false
    });

    return server;
}

// Gestion des événements MongoDB
mongoose.connection.on('error', (err) => {
    logger.error('Erreur MongoDB:', err);
});

mongoose.connection.on('disconnected', () => {
    logger.warn('Déconnecté de MongoDB');
});

// Middlewares de gestion d'erreurs (doivent être après toutes les routes)
app.use(notFoundHandler);
app.use(errorHandler);

// Fonction principale de démarrage
async function startServer() {
    try {
        logger.info('Démarrage du serveur PROGEASE...');
        await connectToMongoDB();
        const apolloServer = await startApolloServer();

        await new Promise(resolve => httpServer.listen({ port: PORT }, resolve));

        logger.info(`Serveur Express démarré sur le port ${PORT} en mode ${NODE_ENV}`);
        logger.info(`GraphQL disponible sur http://localhost:${PORT}${apolloServer.graphqlPath}`);
        logger.info(`API REST disponible sur http://localhost:${PORT}/api`);

        // Gestion de l'arrêt gracieux
        const gracefulShutdown = async () => {
            logger.info('Signal d\'arrêt reçu. Arrêt gracieux...');
            try {
                await apolloServer.stop();
                await new Promise(resolve => httpServer.close(resolve));
                await mongoose.connection.close(false);
                logger.info('Serveur arrêté avec succès');
                process.exit(0);
            } catch (error) {
                logger.error('Erreur lors de l\'arrêt:', error);
                process.exit(1);
            }
        };

        process.on('SIGTERM', gracefulShutdown);
        process.on('SIGINT', gracefulShutdown);

    } catch (error) {
        logger.error('Échec du démarrage du serveur:', error);
        process.exit(1);
    }
}

// Démarrage de l'application
startServer();