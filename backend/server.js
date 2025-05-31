require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const http = require('http');
const helmet = require('helmet');
const mongoose = require('mongoose');
const logger = require('./src/utils/logger');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { typeDefs } = require('./src/graphql/schema');
const { resolvers } = require('./src/graphql/resolvers');
const connecterBD = require('./config/db');
const { NODE_ENV } = require('./config/constants');
const { globalRateLimiter } = require('./src/middleware/rateLimiter');
const { makeExecutableSchema } = require('@graphql-tools/schema');

const {
    ERROR_MESSAGES,
    setupProcessErrorHandlers,
    setupHttpErrorHandlers,
    notFoundHandler,
    errorHandler
} = require('./src/middleware/errorHandlers');

// Import des routes
const projetRoutes = require('./src/routes/projet.routes');
const livrableRoutes = require('./src/routes/livrable.routes');
const aiRoutes = require('./src/routes/ai.routes');
const utilisateurRoutes = require('./src/routes/utilisateur.routes');
const evaluationRouter = require('./src/routes/evaluation.router');

// Initialisation des variables principales
const app = express();
const httpServer = http.createServer(app);
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/progease';

// Configuration des gestionnaires d'erreurs
setupProcessErrorHandlers();
setupHttpErrorHandlers(httpServer, PORT);

// CORS et sécurité
app.use(helmet({
    contentSecurityPolicy: false // Désactivé pour GraphQL Playground en dev
}));

app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:4200', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400
}));

// Limiter les abus d'API
app.use(globalRateLimiter);

// Middlewares standards
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Logging des requêtes
if (NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan(':remote-addr - :method :url :status :res[content-length] - :response-time ms', {
        stream: {
            write: (message) => logger.http(message.trim())
        }
    }));
}

// Middleware pour ajouter des informations de contexte
app.use((req, res, next) => {
    req.currentutilisateur = req.headers['x-utilisateur'] || 'WalidBenTouhami';
    req.timestamp = new Date().toISOString();
    res.set('X-XSS-Protection', '1; mode=block');
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('X-Frame-Options', 'DENY');
    next();
});

// Gestion du favicon
app.get('/favicon.ico', (req, res) => res.status(204).end());

// Create Apollo Server
const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    formatError: (error) => {
        logger.error('GraphQL Error:', error);
        return process.env.NODE_ENV === 'production' 
            ? { message: 'Internal server error', path: error.path }
            : error;
    }
});

// Démarrage du serveur
async function startServer() {
    try {
        // Connexion à MongoDB
        await connecterBD(MONGODB_URI);
        logger.info('Connecté à MongoDB avec succès');

        // Démarrer Apollo Server
        await apolloServer.start();
        
        // Appliquer le middleware Apollo
        app.use('/graphql', 
            cors(),
            express.json(),
            expressMiddleware(apolloServer, {
                context: async ({ req }) => ({
                    currentutilisateur: req.currentutilisateur,
                    timestamp: req.timestamp
                })
            })
        );

        // Routes API
        app.get('/', (req, res) => {
            res.send('API PROGEASE is working correctly.');
        });

        app.get('/health', (req, res) => {
            const uptime = process.uptime();
            res.json({
                status: 'ok',
                timestamp: req.timestamp || new Date().toISOString(),
                utilisateur: req.currentutilisateur || 'WalidBenTouhami',
                version: '2.0.0',
                graphqlVersion: '4.0',
                environment: NODE_ENV,
                uptime: Math.floor(uptime)
            });
        });

        // Point d'entrée API
        app.get('/api', (req, res) => {
            res.json({
                status: 'ok',
                message: 'PROGEASE API v2',
                timestamp: req.timestamp,
                utilisateur: req.currentutilisateur,
                endpoints: ['/api/projets', '/api/livrables', '/api/evaluations', '/api/ai', '/graphql']
            });
        });

        // Routes API
        app.use('/api/projets', projetRoutes);
        app.use('/api/livrables', livrableRoutes);
        app.use('/api/ai', aiRoutes);
        app.use('/api/utilisateurs', utilisateurRoutes);
        app.use('/api/evaluations', evaluationRouter);

        // Middleware 404
        app.use(notFoundHandler);

        // Middleware de gestion des erreurs
        app.use(errorHandler);

        // Démarrer le serveur HTTP
        httpServer.listen(PORT, () => {
            logger.info(`Serveur Express démarré sur le port ${PORT} en mode ${NODE_ENV}`);
            logger.info(`API REST disponible sur http://localhost:${PORT}/api`);
            logger.info(`GraphQL v4 disponible sur http://localhost:${PORT}/graphql`);

            console.log(`
=======================================================
🚀 PROGEASE Server (GraphQL v4)
=======================================================
📅 Date: ${new Date().toISOString()}
👤 Utilisateur: WalidBenTouhami
🌐 Port: ${PORT}
🔧 Mode: ${NODE_ENV}
🔗 API: http://localhost:${PORT}/api
🔗 GraphQL v4: http://localhost:${PORT}/graphql
🔗 Health: http://localhost:${PORT}/health
=======================================================
            `);
        });

        // Créer les données de test en développement
        if (NODE_ENV === 'development') {
            try {
                const { createTestData } = require('./src/utils/testData');
                await createTestData();
                logger.info('Données de test créées/vérifiées avec succès');
            } catch (error) {
                logger.warn('Impossible de créer les données de test:', error.message);
            }
        }

    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Démarrer le serveur si ce n'est pas un import
if (require.main === module) {
    startServer();
}

module.exports = app;