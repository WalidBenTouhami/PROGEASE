// ./backend/server.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { ApolloServer } = require('apollo-server-express');
const { GraphQLError } = require('graphql');
const { typeDefs } = require('./src/graphql/schema');
const { resolvers } = require('./src/graphql/resolvers');
const projetRouter = require('./src/routers/projet.router');
const livrableRouter = require('./src/routers/livrable.router');
const aiRouter = require('./src/routers/ai.router'); // ✅ Import du routeur IA
const { errorHandler, notFoundHandler } = require('./src/middleware/errorHandlers');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;
const NODE_ENV = process.env.NODE_ENV || 'development';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:4200';

// Fonction pour trouver un port disponible
const findAvailablePort = async (startPort) => {
    const net = require('net');
    
    return new Promise((resolve, reject) => {
        const server = net.createServer();
        server.unref();
        
        server.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                server.close();
                resolve(findAvailablePort(startPort + 1));
            } else {
                reject(err);
            }
        });

        server.listen(startPort, () => {
            server.close();
            resolve(startPort);
        });
    });
};

// Configuration du rate limiter
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limite chaque IP à 100 requêtes par fenêtre
    standardHeaders: true,
    legacyHeaders: false
});

// Configuration CORS plus stricte
const corsOptions = {
    origin: FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

// ✅ Vérification des variables d'environnement critiques
if (!MONGO_URI) {
    console.error('❌ Erreur : MONGO_URI manquante dans les variables d\'environnement.');
    process.exit(1);
}

// ✅ Middlewares
app.use(helmet()); // Sécurité des en-têtes HTTP
app.use(morgan('combined')); // Logging amélioré
app.use(cors(corsOptions));
app.use(compression()); // Compression des réponses
app.use(limiter); // Rate limiting
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

// ✅ Initialisation Apollo Server
const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    formatError: (err) => {
        const error = err instanceof GraphQLError ? err : new GraphQLError(err.message);
        
        console.error('Erreur GraphQL :', {
            message: error.message,
            path: error.path,
            extensions: error.extensions,
        });

        return {
            message: NODE_ENV === 'production' ? 'Une erreur est survenue' : error.message,
            code: error.extensions?.code || 'ERREUR_INTERNE',
            path: error.path,
            extensions: error.extensions
        };
    },
    context: async ({ req }) => {
        return {
            req,
            // Ajoutez ici d'autres éléments de contexte si nécessaire
        };
    },
    playground: true, // Active le playground GraphQL
    introspection: true // Permet l'introspection en production
});

// ✅ Fonction pour démarrer Apollo Server
async function startApolloServer() {
    try {
        // Démarrer Apollo Server
        await apolloServer.start();
        
        // Appliquer le middleware GraphQL
        apolloServer.applyMiddleware({ 
            app,
            cors: false, // On utilise déjà cors au niveau express
            path: '/graphql'
        });
        
        console.log('✅ Apollo Server démarré avec succès');
    } catch (error) {
        console.error('❌ Erreur lors du démarrage d\'Apollo Server:', error);
        throw error;
    }
}

// ✅ Connexion à MongoDB
async function connectToMongoDB() {
    try {
        await mongoose.connect(MONGO_URI, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            family: 4 // Force IPv4
        });
        console.log('✅ Connecté à MongoDB');
    } catch (err) {
        console.error('❌ Erreur de connexion MongoDB :', err.message);
        process.exit(1);
    }
}

// Gestion des événements MongoDB
mongoose.connection.on('error', (err) => {
    console.error('Erreur MongoDB :', err);
});

mongoose.connection.on('disconnected', () => {
    console.warn('Déconnecté de MongoDB');
});

// ✅ Définition des routes
app.get('/health', (_req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date(),
        uptime: process.uptime()
    });
});

// Appliquer les routes API REST avant GraphQL
app.use('/api/projets', projetRouter);
app.use('/api/livrables', livrableRouter);
app.use('/api/ai', aiRouter);

// Gestion des erreurs
app.use(notFoundHandler);
app.use(errorHandler);

// Fonction principale de démarrage
async function startServer() {
    try {
        // Connexion à MongoDB
        await connectToMongoDB();
        
        // Démarrage Apollo Server
        await startApolloServer();
        
        // Recherche d'un port disponible
        const availablePort = await findAvailablePort(PORT);
        if (availablePort !== PORT) {
            console.warn(`⚠️ Le port ${PORT} est occupé, utilisation du port ${availablePort}`);
        }
        
        // Démarrage du serveur
        const server = app.listen(availablePort, () => {
            console.log(`🚀 Serveur Apollo lancé sur http://localhost:${availablePort}${apolloServer.graphqlPath}`);
            console.log(`✅ Serveur Express démarré sur le port ${availablePort} en mode ${NODE_ENV}`);
        });

        // Gestion de l'arrêt gracieux
        const gracefulShutdown = async () => {
            console.log('Signal d\'arrêt reçu. Arrêt gracieux...');
            try {
                await server.close();
                await mongoose.connection.close(false);
                console.log('✅ Serveur arrêté avec succès');
                process.exit(0);
            } catch (error) {
                console.error('❌ Erreur lors de l\'arrêt :', error);
                process.exit(1);
            }
        };

        // Gestion des signaux d'arrêt
        process.on('SIGTERM', gracefulShutdown);
        process.on('SIGINT', gracefulShutdown);

        // Gestion des erreurs non capturées
        process.on('uncaughtException', (error) => {
            console.error('❌ Erreur non capturée :', error);
            gracefulShutdown();
        });

        process.on('unhandledRejection', (reason, promise) => {
            console.error('❌ Promesse rejetée non gérée :', reason);
            gracefulShutdown();
        });

    } catch (error) {
        console.error('❌ Échec du démarrage du serveur :', error);
        process.exit(1);
    }
}

// Démarrage de l'application
startServer();