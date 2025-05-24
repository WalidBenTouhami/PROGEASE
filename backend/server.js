// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const morgan = require('morgan');
const path = require('path');
const http = require('http');
const logger = require('./src/utils/logger');
const { createStandaloneServer } = require('./src/graphql/standalone-server');
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
const NODE_ENV = process.env.NODE_ENV || 'development';

// Import des routes
const projetRoutes = require('./src/routes/projet.routes');
const livrableRoutes = require('./src/routes/livrable.routes');
const aiRoutes = require('./src/routes/ai.routes');

// Configuration des gestionnaires d'erreurs au niveau du processus
setupProcessErrorHandlers();

// Configuration des gestionnaires d'erreurs HTTP
setupHttpErrorHandlers(httpServer, PORT);

// Middlewares
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || 'http://localhost:4200',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'src', 'public')));
if (NODE_ENV === 'development') app.use(morgan('dev'));
app.use((req, res, next) => {
    req.currentUser = req.headers['x-user'] || 'anonymous';
    req.timestamp = new Date().toISOString();
    next();
});

// Gestion simple du favicon pour éviter les 404
app.get('/favicon.ico', (req, res) => {
    res.status(204).end();
});

// Routes API
app.use('/api/projets', projetRoutes);
app.use('/api/livrables', livrableRoutes);
app.use('/api/ai', aiRoutes);

app.get('/api', (req, res) => {
    res.json({
        status: 'ok',
        message: 'PROGEASE API v2',
        timestamp: req.timestamp,
        user: 'WalidBenTouhami',
        endpoints: ['/api/projets', '/api/livrables', '/api/ai', '/graphql']
    });
});

app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: req.timestamp,
        user: 'WalidBenTouhami',
        version: '2.0.0',
        graphqlVersion: '4.0'
    });
});

// Serveur principal
async function startServer() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/progease');
        logger.info('Connecté à MongoDB avec succès');

        // Configuration du serveur GraphQL avant les middlewares d'erreur
        await createStandaloneServer(app, httpServer);
        logger.info('Serveur Apollo Standalone configuré');

        // Middleware d'erreurs 404 - doit être après les routes ET après Apollo
        app.use((req, res, next) => {
            notFoundHandler(req, res, next);
        });

        // Middleware de gestion des erreurs
        app.use((req, res, next) => {
            errorHandler(req, res, next);
        });

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
👤 User: WalidBenTouhami
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

startServer().catch(err => {
    logger.error(ERROR_MESSAGES.FATAL_ERROR(err.message));
    process.exit(1);
});

module.exports = app;