require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const http = require('http');
const helmet = require('helmet');
const logger = require('./src/utils/logger');
const connecterBD = require('./config/db');
const { createStandaloneServer } = require('./src/graphql/standalone-server');
const { NODE_ENV } = require('./config/constants');
const { globalRateLimiter } = require('./src/middleware/rateLimiter');
const { graphqlHTTP } = require('express-graphql');

// Import du schema GraphQL principal (typeDefs)
const { typeDefs } = require('./src/graphql/schema');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const { resolvers } = require('./src/graphql');

// Creer le schema executable à partir des typeDefs et resolvers
const schema = makeExecutableSchema({ typeDefs, resolvers });

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

// Middlewares de securite et performance
app.use(helmet({
    contentSecurityPolicy: false // Desactiver pour GraphQL Playground en dev
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
app.use(express.static(path.join(__dirname, 'public')));

// Logging des requetes
if (NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    // Format personnalise pour la production
    app.use(morgan(':remote-addr - :method :url :status :res[content-length] - :response-time ms', {
        stream: {
            write: (message) => logger.http(message.trim())
        }
    }));
}

// Middleware pour ajouter des informations de contexte
app.use((req, res, next) => {
    req.currentUser = req.headers['x-user'] || 'WalidBenTouhami';
    req.timestamp = new Date().toISOString();

    // Ajouter des en-tetes de securite
    res.set('X-XSS-Protection', '1; mode=block');
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('X-Frame-Options', 'DENY');

    next();
});

// Gestion simple du favicon pour eviter les 404
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

// Point d'entree API
app.get('/api', (req, res) => {
    res.json({
        status: 'ok',
        message: 'PROGEASE API v2',
        timestamp: req.timestamp,
        user: req.currentUser,
        endpoints: ['/api/projets', '/api/livrables', '/api/ai', '/graphql']
    });
});

// Endpoint de sante
app.get('/health', (req, res) => {
    const uptime = process.uptime();
    res.json({
        status: 'ok',
        timestamp: req.timestamp || '2025-05-28T09:19:39Z',
        user: req.currentUser || 'WalidBenTouhami',
        version: '2.0.0',
        graphqlVersion: '4.0',
        environment: NODE_ENV,
        uptime: Math.floor(uptime)
    });
});

// Configuration GraphQL
if (process.env.USE_APOLLO_SERVER === 'true') {
    // Apollo Server (moderne, recommande)
    createStandaloneServer(app, httpServer, schema)
        .then(() => logger.info('Serveur Apollo Standalone configure'))
        .catch(error => {
            logger.error('Erreur Apollo Server, fallback sur express-graphql:', error.message);
            // Fallback express graphql si Apollo echoue
            app.use('/graphql', graphqlHTTP({
                schema,
                graphiql: true,
                customFormatErrorFn: (error) => {
                    logger.error(`GraphQL Error: ${error.message}`, { path: error.path });
                    return {
                        message: error.message,
                        locations: error.locations,
                        path: error.path
                    };
                },
                context: ({ req }) => ({
                    currentUser: req.currentUser,
                    timestamp: req.timestamp
                })
            }));
        });
} else {
    // express-graphql (legacy, fallback)
    app.use('/graphql', graphqlHTTP({
        schema,
        graphiql: true,
        customFormatErrorFn: (error) => {
            logger.error(`GraphQL Error: ${error.message}`, { path: error.path });
            return {
                message: error.message,
                locations: error.locations,
                path: error.path
            };
        },
        context: ({ req }) => ({
            currentUser: req.currentUser,
            timestamp: req.timestamp
        })
    }));
}

// Middleware d'erreurs 404 - doit etre apres les routes ET apres Apollo/GraphQL
app.use(notFoundHandler);

// Middleware de gestion des erreurs
app.use(errorHandler);

// Demarrage du serveur
async function startServer() {
    try {
        // Connexion à la base de donnees
        await connecterBD(process.env.MONGO_URI || 'mongodb://localhost:27017/progease');
        logger.info('Connecte à MongoDB avec succes');

        // Creer les donnees de test pour Newman
        try {
            const { createTestData } = require('./src/utils/testData');
            if (NODE_ENV === 'development') {
                await createTestData();
                logger.info('Donnees de test creees/verifiees avec succes');
            }
        } catch (error) {
            logger.warn('Impossible de creer les donnees de test:', error.message);
        }

        // Demarrage du serveur HTTP
        await new Promise(resolve => {
            httpServer.listen(PORT, () => {
                logger.info(`Serveur Express demarre sur le port ${PORT} en mode ${NODE_ENV}`);
                logger.info(`API REST disponible sur http://localhost:${PORT}/api`);
                logger.info(`GraphQL v4 disponible sur http://localhost:${PORT}/graphql`);

                console.log(`
=======================================================
🚀 PROGEASE Server (GraphQL v4)
=======================================================
📅 Date: 2025-05-28 09:19:39
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

// Exporter pour les tests
if (require.main === module) {
    startServer().catch(err => {
        logger.error(ERROR_MESSAGES.FATAL_ERROR(err.message));
        process.exit(1);
    });
}

module.exports = app;