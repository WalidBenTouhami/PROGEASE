// REDÉMARRAGE À ZÉRO - server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const morgan = require('morgan');
const path = require('path');
const http = require('http');
const logger = require('./src/utils/logger');
const { createStandaloneServer } = require('./src/graphql/standalone-server');

// Initialisation des variables principales
const app = express();
const httpServer = http.createServer(app);
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Import des routes
const projetRoutes = require('./src/routes/projet.routes');
const livrableRoutes = require('./src/routes/livrable.routes');
const aiRoutes = require('./src/routes/ai.routes');

// Gestionnaires d'erreurs globaux pour éviter les arrêts inattendus
process.on('uncaughtException', (error) => {
    logger.error(`Exception non capturée: ${error.message}`);
    logger.error(error.stack);
    // Ne pas terminer le processus immédiatement pour permettre la journalisation
});

process.on('unhandledRejection', (reason, _) => {
    logger.error(`Promesse rejetée non gérée: ${reason}`);
    try {
        // Extraction d'informations utiles de la promesse
        const promiseInfo = {
            state: 'rejected',
            reason: String(reason)
        };
        logger.error(`Détails de la promesse: ${JSON.stringify(promiseInfo)}`);
    } catch (e) {
        logger.error('Impossible de sérialiser les détails de la promesse');
    }
});

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'src', 'public')));
if (NODE_ENV === 'development') app.use(morgan('dev'));
app.use((req, res, next) => {
    req.currentUser = 'WalidBenTouhami';
    req.timestamp = new Date('2025-05-23 13:37:20').toISOString();
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

// Middleware d'erreurs 404 - doit être après toutes les routes
app.use((req, res, _next) => {
    logger.warn(`Route non trouvée: ${req.originalUrl}`);
    res.status(404).json({
        status: 'fail',
        message: `Route non trouvée: ${req.originalUrl}`,
        timestamp: req.timestamp || new Date().toISOString()
    });
});

// Middleware de gestion des erreurs-doit être le dernier middleware
app.use((err, req, res, _next) => {
    logger.error(`Erreur serveur: ${err.message}`);
    res.status(err.statusCode || 500).json({
        status: 'error',
        message: err.message,
        timestamp: req.timestamp || new Date().toISOString()
    });
});

// Ajout d'un gestionnaire d'erreurs pour le serveur HTTP
httpServer.on('error', (error) => {
    // Définition explicite de toutes les variables nécessaires
    const errorCode = error.code || 'UNKNOWN_ERROR';
    const timestamp = new Date().toISOString();
    const errorMessage = error.message || 'Erreur inconnue';

    // Journalisation avec toutes les variables clairement définies
    if (errorCode === 'EADDRINUSE') {
        logger.error(`Le port ${PORT} est déjà utilisé par une autre application`);
    } else {
        logger.error(`Erreur du serveur HTTP: ${errorMessage} (Code: ${errorCode})`);
    }

    // Utilisation explicite de la variable timestamp définie plus haut
    logger.error(`Horodatage de l'erreur: ${timestamp}`);
});

// Serveur principal
async function startServer() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/progease');
        logger.info('Connecté à MongoDB avec succès');

        await createStandaloneServer(app, httpServer);
        logger.info('Serveur Apollo Standalone configuré');

        await new Promise(resolve => {
            httpServer.listen(PORT, () => {
                logger.info(`Serveur Express démarré sur le port ${PORT} en mode ${NODE_ENV}`);
                logger.info(`API REST disponible sur http://localhost:${PORT}/api`);
                logger.info(`GraphQL v4 disponible sur http://localhost:${PORT}/graphql`);

                console.log(`
=======================================================
🚀 PROGEASE Server (Apollo v4 Standalone)
=======================================================
📅 Date: ${new Date('2025-05-23 13:37:20').toISOString()}
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
        logger.error(`Erreur de démarrage du serveur: ${error.message}`);
        logger.error(error.stack);
        process.exit(1);
    }
}

startServer().catch(err => {
    logger.error(`Erreur fatale: ${err.message}`);
    process.exit(1);
});

module.exports = app;