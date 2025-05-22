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

const { typeDefs } = require('./src/graphql/schema');
const { resolvers } = require('./src/graphql/resolvers');
const projetRouter = require('./src/routers/projet.router');
const livrableRouter = require('./src/routers/livrable.router');
const aiRouter = require('./src/routers/ai.router');
const { errorHandler, notFoundHandler } = require('./src/middleware/errorHandlers');

const app = express();
const httpServer = http.createServer(app);
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
const NODE_ENV = process.env.NODE_ENV || 'development';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Configuration du rate limiter
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false
});

// Configuration CORS plus stricte
const corsOptions = {
    origin: [FRONTEND_URL, 'http://localhost:4200'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

// Vérification des variables d'environnement critiques
if (!MONGO_URI) {
    console.error('❌ Erreur : MONGO_URI manquante dans les variables d\'environnement.');
    process.exit(1);
}

// Middlewares de base
app.use(helmet({
    contentSecurityPolicy: NODE_ENV === 'production',
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
        console.log('✅ Connecté à MongoDB');
    } catch (err) {
        console.error('❌ Erreur de connexion MongoDB :', err.message);
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
            console.error('Erreur GraphQL :', err);
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
    console.error('Erreur MongoDB :', err);
});

mongoose.connection.on('disconnected', () => {
    console.warn('Déconnecté de MongoDB');
});

// Middlewares de gestion d'erreurs (doivent être après toutes les routes)
app.use(notFoundHandler);
app.use(errorHandler);

// Fonction principale de démarrage
async function startServer() {
    try {
        await connectToMongoDB();
        const apolloServer = await startApolloServer();
        
        await new Promise(resolve => httpServer.listen({ port: PORT }, resolve));
        
        console.log(`🚀 Serveur Express démarré sur le port ${PORT} en mode ${NODE_ENV}`);
        console.log(`📊 GraphQL disponible sur http://localhost:${PORT}${apolloServer.graphqlPath}`);

        // Gestion de l'arrêt gracieux
        const gracefulShutdown = async () => {
            console.log('Signal d\'arrêt reçu. Arrêt gracieux...');
            try {
                await apolloServer.stop();
                await new Promise(resolve => httpServer.close(resolve));
                await mongoose.connection.close(false);
                console.log('✅ Serveur arrêté avec succès');
                process.exit(0);
            } catch (error) {
                console.error('❌ Erreur lors de l\'arrêt :', error);
                process.exit(1);
            }
        };

        process.on('SIGTERM', gracefulShutdown);
        process.on('SIGINT', gracefulShutdown);

    } catch (error) {
        console.error('❌ Échec du démarrage du serveur :', error);
        process.exit(1);
    }
}

// Démarrage de l'application
startServer();