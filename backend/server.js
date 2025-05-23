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

const app = express();
const httpServer = http.createServer(app);
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

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

// Routes API
const projetRoutes = require('./src/routes/projet.routes');
const livrableRoutes = require('./src/routes/livrable.routes');
const aiRoutes = require('./src/routes/ai.routes');

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
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/progease');
        logger.info('Connecté à MongoDB avec succès');

        await createStandaloneServer(app, httpServer);
        logger.info('Serveur Apollo Standalone configuré');

        // Middlewares d'erreur, APRES le montage GraphQL
        app.use((req, res, next) => {
            logger.warn(`Route non trouvée: ${req.originalUrl}`);
            res.status(404).json({
                status: 'fail',
                message: `Route non trouvée: ${req.originalUrl}`,
                timestamp: req.timestamp
            });
        });

        app.use((err, req, res, next) => {
            logger.error(`Erreur serveur: ${err.message}`);
            res.status(err.statusCode || 500).json({
                status: 'error',
                message: err.message,
                timestamp: req.timestamp
            });
        });

        await new Promise(resolve => {
            httpServer.listen({ port: PORT }, () => {
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
