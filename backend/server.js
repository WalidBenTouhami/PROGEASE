// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const morgan = require('morgan');
const path = require('path');
const http = require('http');
const helmet = require('helmet'); // Ajouter helmet pour la sécurité
const logger = require('./src/utils/logger');
const connecterBD = require('./config/db');
const { createStandaloneServer } = require('./src/graphql/standalone-server');
const { NODE_ENV } = require('./config/constants');
const { globalRateLimiter } = require('./src/middleware/rateLimiter');
const {
    ERROR_MESSAGES,
    setupProcessErrorHandlers,
    setupHttpErrorHandlers,
    notFoundHandler,
    errorHandler
} = require('./src/middleware/errorHandlers');

// Initialisation des variables principales
const app = express();
const httpServer = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Configuration des gestionnaires d'erreurs au niveau du processus
setupProcessErrorHandlers();

// Configuration des gestionnaires d'erreurs HTTP
setupHttpErrorHandlers(httpServer, PORT);

// Middlewares de sécurité et performance
app.use(helmet({
    contentSecurityPolicy: false // Désactiver pour GraphQL Playground en dev
}));
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') ||
        (NODE_ENV === 'production' ? [] : 'http://localhost:4200'),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    maxAge: 86400 // 1 jour de mise en cache CORS
}));

// Limiter les abus d'API
app.use(globalRateLimiter);

// Middlewares standards
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'src', 'public')));

// Logging des requêtes
if (NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    // Format personnalisé pour la production
    app.use(morgan(':remote-addr - :method :url :status :res[content-length] - :response-time ms', {
        stream: {
            write: (message) => logger.http(message.trim())
        }
    }));
}

// Middleware pour ajouter des informations de contexte
app.use((req, res, next) => {
    req.currentUser = req.headers['x-user'] || 'anonymous';
    req.timestamp = new Date().toISOString();

    // Ajouter des en-têtes de sécurité
    res.set('X-XSS-Protection', '1; mode=block');
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('X-Frame-Options', 'DENY');

    next();
});

// Gestion simple du favicon pour éviter les 404
app.get('/favicon.ico', (req, res) => {
    res.status(204).end();
});

// Import des routes
const projetRoutes = require('./src/routes/projet.routes');
const livrableRoutes = require('./src/routes/livrable.routes');
const aiRoutes = require('./src/routes/ai.routes');

// Routes API
app.use('/api/projets', projetRoutes);
app.use('/api/livrables', livrableRoutes);
app.use('/api/ai', aiRoutes);

// Point d'entrée API
app.get('/api', (req, res) => {
    res.json({
        status: 'ok',
        message: 'PROGEASE API v2',
        timestamp: req.timestamp,
        user: req.currentUser,
        endpoints: ['/api/projets', '/api/livrables', '/api/ai', '/graphql']
    });
});

// Endpoint de santé
app.get('/health', (req, res) => {
    const uptime = process.uptime();
    res.json({
        status: 'ok',
        timestamp: req.timestamp || new Date().toISOString(),
        user: req.currentUser || 'anonymous',
        version: '2.0.0',
        graphqlVersion: '4.0',
        environment: process.env.NODE_ENV || 'development',
        uptime: Math.floor(uptime) // Ajouter cette ligne
    });
});

// Serveur principal
async function startServer() {
    try {
        // Connexion à la base de données
        await connecterBD(process.env.MONGO_URI || 'mongodb://localhost:27017/progease');
        logger.info('Connecté à MongoDB avec succès');

        // Configuration du serveur GraphQL avant les middlewares d'erreur
        try {
            await createStandaloneServer(app, httpServer);
            logger.info('Serveur Apollo Standalone configuré');
        } catch (error) {
            logger.warn('Le serveur GraphQL n\'a pas pu être configuré. L\'API REST fonctionnera toujours:', error.message);
        }

        // Middleware d'erreurs 404 - doit être après les routes ET après Apollo
        app.use(notFoundHandler);

        // Middleware de gestion des erreurs
        app.use(errorHandler);

        // Démarrage du serveur HTTP
        await new Promise(resolve => {
            httpServer.listen(PORT, () => {
                logger.info(`Serveur Express démarré sur le port ${PORT} en mode ${NODE_ENV}`);
                logger.info(`API REST disponible sur http://localhost:${PORT}/api`);
                logger.info(`GraphQL v4 disponible sur http://localhost:${PORT}/graphql`);

                console.log(`
=======================================================
🚀 PROGEASE Server (Apollo v4 Standalone)
=======================================================
📅 Date: ${new Date().toISOString()}
👤 User: ${process.env.USER || 'WalidBenTouhami'}
🌐 Port: ${PORT}
🔧 Mode: ${NODE_ENV}
🔗 API: http://localhost:${PORT}/api
🔗 GraphQL v4: http://localhost:${PORT}/graphql
🔗 Health: http://localhost:${PORT}/health
=======================================================
                `);

                resolve();
            });
        });
    } catch (error) {
        logger.error(ERROR_MESSAGES.STARTUP_ERROR(error.message));
        logger.error(error.stack);
        process.exit(1);
    }
}

// Exporter pour les tests
if (require.main === module) {
    startServer().catch(err => {
        logger.error(ERROR_MESSAGES.FATAL_ERROR(err.message));
        process.exit(1);
    });
}

module.exports = app;