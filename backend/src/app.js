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
        message: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard'
    }
});

const creerApplication = async () => {
    const app = express();

    // Middleware de sécurité
    app.use(helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                imgSrc: ["'self'", 'data:', 'https:'],
                connectSrc: ["'self'", 'https://api.progease.com']
            }
        }
    }));
    app.use(mongoSanitize()); // Protection contre les injections NoSQL
    app.use(xss()); // Protection contre les attaques XSS
    app.use(hpp()); // Protection contre la pollution des paramètres HTTP

    // Middleware de base
    app.use(cors({
        origin: config.cors.origine,
        credentials: true,
        methods: config.cors.methodes
    }));
    app.use(compression());
    app.use(morgan('dev', {
        stream: {
            write: message => logger.info(message.trim())
        }
    }));
    app.use(json({ limit: '10mb' }));
    app.use(cookieParser());

    // Limiteur de taux global
    app.use('/api/', limiteurGlobal);

    // Configuration de la base de données
    try {
        await mongoose.connect(config.baseDeDonnees.uri, config.baseDeDonnees.options);
        logger.info('✅ Connexion à MongoDB établie avec succès');
    } catch (erreur) {
        logger.error('❌ Erreur de connexion à MongoDB:', erreur);
        process.exit(1);
    }

    // Configuration du serveur Apollo
    const serveurApollo = new ApolloServer({
        schema,
        context: ({ req }) => ({
            utilisateur: req.utilisateur
        }),
        formatError: (erreur) => {
            logger.error('Erreur GraphQL:', erreur);
            
            // Supprimer les détails techniques des erreurs en production
            if (config.serveur.environnement === 'production') {
                delete erreur.extensions.exception;
                delete erreur.extensions.stacktrace;
            }
            
            return {
                message: erreur.message,
                code: erreur.extensions?.code || 'INTERNAL_SERVER_ERROR',
                ...(config.serveur.environnement === 'development' && {
                    stack: erreur.extensions?.exception?.stack
                })
            };
        },
        plugins: [
            {
                async serverWillStart() {
                    logger.info('🚀 Serveur GraphQL démarré');
                }
            }
        ]
    });

    await serveurApollo.start();

    // Appliquer le middleware d'authentification
    app.use(protegerRoute);

    // Démarrer le serveur Apollo
    serveurApollo.applyMiddleware({ 
        app,
        path: '/graphql',
        cors: false
    });

    // Gestion des erreurs
    app.use(gestionnaireErreurs);

    // Gestion des routes non trouvées
    app.use((req, res) => {
        res.status(404).json({
            succes: false,
            message: 'Route non trouvée'
        });
    });

    return app;
};

module.exports = creerApplication; 