const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const { json } = require('body-parser');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const schema = require('./graphql/schema');
const { gestionnaireErreurs } = require('./middlewares/error.middleware');
const { protegerRoute } = require('./middlewares/auth.middleware');
const config = require('./config');
const logger = require('./utils/logger');

// Configuration du limiteur de taux global
const limiteurGlobal = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limite chaque IP à 100 requêtes par fenêtre
    message: {
        succes: false,
        message: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard',
    },
});

const creerApplication = async () => {
    const app = express();

    // Middleware de sécurité
    app.use(
        helmet({
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
                    styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
                    imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
                    connectSrc: ["'self'", 'https://api.progease.com', 'wss:', 'ws:'],
                    fontSrc: ["'self'", 'https://fonts.gstatic.com'],
                    objectSrc: ["'none'"],
                    mediaSrc: ["'self'"],
                    frameSrc: ["'self'"],
                    workerSrc: ["'self'", 'blob:'],
                    childSrc: ["'self'", 'blob:'],
                },
            },
            crossOriginEmbedderPolicy: false,
            crossOriginOpenerPolicy: false,
            crossOriginResourcePolicy: { policy: 'cross-origin' },
        })
    );
    app.use(mongoSanitize()); // Protection contre les injections NoSQL
    app.use(xss()); // Protection contre les attaques XSS
    app.use(hpp()); // Protection contre la pollution des paramètres HTTP

    // Middleware de base
    app.use(
        cors({
            origin: config.cors.origine.split(','),
            credentials: true,
            methods: config.cors.methodes,
            allowedHeaders: [
                'Content-Type',
                'Authorization',
                'x-api-version',
                'apollographql-client-name',
                'apollographql-client-version',
            ],
        })
    );
    app.use(compression());
    app.use(
        morgan('dev', {
            stream: {
                write: message => logger.info(message.trim()),
            },
        })
    );
    app.use(json({ limit: '10mb' }));
    app.use(cookieParser());

    // Limiteur de taux global
    app.use('/api/', limiteurGlobal);

    // Configuration de la base de données
    try {
        const optionsMongoDB = {
            maxPoolSize: 10,
            minPoolSize: 5,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            family: 4,
            autoIndex: config.serveur.environnement === 'development',
            retryWrites: true,
            w: 'majority',
            readPreference: 'primary',
            readConcern: { level: 'local' },
            writeConcern: { w: 'majority', wtimeout: 2500 },
            compressors: ['zlib'],
            maxIdleTimeMS: 60000,
            connectTimeoutMS: 10000,
            heartbeatFrequencyMS: 10000,
            appName: 'progease-api',
        };
        await mongoose.connect(config.baseDeDonnees.uri, optionsMongoDB);
        logger.info('✅ Connexion à MongoDB établie avec succès');
    } catch (erreur) {
        logger.error('❌ Erreur de connexion à MongoDB:', erreur);
        process.exit(1);
    }

    // Configuration du serveur Apollo
    const serveurApollo = new ApolloServer({
        schema,
        context: ({ req }) => ({
            utilisateur: req.utilisateur,
        }),
        formatError: erreur => {
            logger.error('Erreur GraphQL:', erreur);
            return {
                message: erreur.message,
                code: erreur.extensions?.code || 'INTERNAL_SERVER_ERROR',
            };
        },
        plugins: [
            {
                async serverWillStart() {
                    logger.info('🚀 Serveur GraphQL démarré');
                },
            },
        ],
        playground: {
            settings: {
                'editor.theme': 'dark',
                'editor.reuseHeaders': true,
                'tracing.hideTracingResponse': true,
                'queryPlan.hideQueryPlanResponse': true,
            },
        },
        introspection: true,
        csrfPrevention: false,
        cache: 'bounded',
    });

    await serveurApollo.start();

    // Appliquer le middleware d'authentification
    app.use(protegerRoute);

    // Démarrer le serveur Apollo
    serveurApollo.applyMiddleware({
        app,
        path: '/graphql',
        cors: false,
    });

    // Routes REST API
    const aiRoutes = require('./routes/ai.routes');
    const schedulingRoutes = require('./routes/scheduling.routes');

    app.use('/api/ai', aiRoutes);
    app.use('/api/scheduling', schedulingRoutes);

    // Route de santé de l'API
    app.get('/api/health', (req, res) => {
        res.status(200).json({
            success: true,
            message: 'API is healthy',
            data: {
                status: 'ok',
                timestamp: new Date().toISOString(),
                services: {
                    graphql: 'operational',
                    ai: 'operational',
                    scheduling: 'operational',
                },
            },
        });
    });

    // Gestion des erreurs
    app.use(gestionnaireErreurs);

    // Gestion des routes non trouvées
    app.use((req, res) => {
        res.status(404).json({
            succes: false,
            message: 'Route non trouvée',
        });
    });

    return app;
};

module.exports = creerApplication;
