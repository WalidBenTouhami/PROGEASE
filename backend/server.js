/**
 * Point d'entrée principal de l'application PROGEASE
 * Serveur Express et Apollo GraphQL
 *
 * @module server
 */

'use strict';

// Imports des modules de configuration
const { PORT, NODE_ENV, FRONTEND_URL, isDev } = require('./config/env');
const { connecterBD } = require('./config/db');
const { LIMITES_REQUETES } = require('./config/constants');

// Modules core
const express = require('express');
const http = require('http');
const https = require('https');
const path = require('path');
const fs = require('fs');

// Middlewares et utilitaires
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const logger = require('./src/utils/logger');

// Handlers d'erreurs et services
const {
    setupProcessErrorHandlers,
    setupHttpErrorHandlers,
    notFoundHandler,
    errorHandler
} = require('./src/middleware/errorHandlers');
const { createStandaloneServer } = require('./src/graphql/standalone-server');

// Import des routes
const projetRoutes = require('./src/routes/projet.routes');
const livrableRoutes = require('./src/routes/livrable.routes');
const aiRoutes = require('./src/routes/ai.routes');

/**
 * Configuration et démarrage du serveur
 */
async function startServer() {
    try {
        // Initialisation des variables principales
        const app = express();
        const httpServer = http.createServer(app);

        // Configuration des gestionnaires d'erreurs
        setupProcessErrorHandlers();
        setupHttpErrorHandlers(httpServer, PORT);

        // Configuration de la connexion à MongoDB
        await connecterBD();

        // Middleware de sécurité et configuration
        configureMiddleware(app);

        // Configuration des routes
        configureRoutes(app);

        // Configuration du serveur GraphQL avant les middlewares d'erreur
        await createStandaloneServer(app, httpServer);
        logger.info('Serveur Apollo Standalone configuré');

        // Middleware d'erreurs (après toutes les routes)
        app.use(notFoundHandler);
        app.use(errorHandler);

        // Démarrage du serveur
        httpServer.listen(PORT, () => {
            displayServerInfo(PORT, NODE_ENV);
        });

        return httpServer;
    } catch (error) {
        logger.error(`Erreur fatale lors du démarrage du serveur: ${error.message}`);
        logger.error(error.stack);
        process.exit(1);
    }
}

/**
 * Configure les middleware d'Express
 * @param {express.Application} app - Application Express
 */
function configureMiddleware(app) {
    // Gestion spéciale pour les requêtes Apollo Sandbox
    app.use((req, res, next) => {
        if (req.headers['apollo-require-preflight']) {
            // Pour les requêtes préflight d'Apollo, répondre immédiatement
            res.set('Access-Control-Allow-Origin', req.headers.origin || '*');
            res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Apollo-Require-Preflight');
            res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
            res.set('Access-Control-Allow-Credentials', 'true');

            if (req.method === 'OPTIONS') {
                return res.sendStatus(200);
            }
        }
        next();
    });

    // Configuration CORS avancée
    const corsOptions = {
        origin: (origin, callback) => {
            const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
                FRONTEND_URL,
                'http://localhost:4200',
                'https://sandbox.embed.apollographql.com',  // Pour Apollo Sandbox
                'https://studio.apollographql.com'          // Pour Apollo Studio
            ];

            // Permettre les requêtes sans origine (comme les appels API directs)
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                console.log(`Origine CORS rejetée: ${origin}`);  // Pour déboguer les problèmes CORS
                callback(new Error('Bloqué par CORS'));
            }
        },
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: [
            'Content-Type',
            'Authorization',
            'X-User',
            'X-Requested-With',
            'Apollo-Require-Preflight',      // Nécessaire pour Apollo
            'Apollo-Federation-Include-Trace' // Pour les traces Apollo
        ],
        credentials: true,
        maxAge: 86400 // 24 heures
    };

    app.use(cors(corsOptions));

    // Protection des en-têtes HTTP
    app.use(helmet({
        contentSecurityPolicy: isDev() ? false : undefined // Désactiver en dev pour Apollo Sandbox
    }));

    // Limites de taille pour prévenir les attaques DoS
    app.use(express.json({ limit: LIMITES_REQUETES.TAILLE_MAX_CORPS }));
    app.use(express.urlencoded({
        extended: true,
        limit: LIMITES_REQUETES.TAILLE_MAX_CORPS
    }));

    // Compression des réponses
    app.use(compression());

    // Fichiers statiques
    app.use(express.static(path.join(__dirname, 'src', 'public')));

    // Journalisation
    if (isDev()) {
        app.use(morgan('dev'));
    } else {
        app.use(morgan('combined', {
            stream: { write: message => logger.info(message.trim()) }
        }));
    }

    // Enrichissement des requêtes
    app.use((req, res, next) => {
        req.currentUser = req.headers['x-user'] || 'anonymous';
        req.timestamp = new Date().toISOString();
        next();
    });

    // Gestion simple du favicon
    app.get('/favicon.ico', (req, res) => {
        res.status(204).end();
    });
}

/**
 * Configure les routes de l'application
 * @param {express.Application} app - Application Express
 */
function configureRoutes(app) {
    // Routes API
    app.use('/api/projets', projetRoutes);
    app.use('/api/livrables', livrableRoutes);
    app.use('/api/ai', aiRoutes);

    // Route d'accueil API
    app.get('/api', (req, res) => {
        res.json({
            status: 'ok',
            message: 'PROGEASE API v2',
            timestamp: req.timestamp,
            user: req.currentUser,
            endpoints: ['/api/projets', '/api/livrables', '/api/ai', '/graphql']
        });
    });

    // Route de surveillance
    app.get('/health', (req, res) => {
        res.json({
            status: 'ok',
            timestamp: req.timestamp,
            user: req.currentUser,
            version: '2.0.0',
            graphqlVersion: '4.0',
            env: NODE_ENV,
            currentTime: new Date().toISOString()
        });
    });
}

/**
 * Affiche les informations de démarrage du serveur
 * @param {number} port - Port sur lequel le serveur écoute
 * @param {string} env - Environnement d'exécution
 */
function displayServerInfo(port, env) {
    logger.info(`Serveur Express démarré sur le port ${port} en mode ${env}`);
    logger.info(`API REST disponible sur http://localhost:${port}/api`);
    logger.info(`GraphQL v4 disponible sur http://localhost:${port}/graphql`);

    console.log(`
=======================================================
🚀 PROGEASE Server (Apollo v4 Standalone)
=======================================================
📅 Date: ${new Date().toISOString()}
👤 User: ${process.env.USER || 'WalidBenTouhami'}
🌐 Port: ${port}
🔧 Mode: ${env}
🔗 API: http://localhost:${port}/api
🔗 GraphQL v4: http://localhost:${port}/graphql
🔗 Health: http://localhost:${port}/health
=======================================================
  `);
}

// Démarrage du serveur
if (require.main === module) {
    startServer().catch(err => {
        logger.error(`Erreur fatale: ${err.message}`);
        process.exit(1);
    });
}

// Export pour les tests
module.exports = {
    startServer
};