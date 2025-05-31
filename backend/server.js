// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const morgan = require('morgan');
const path = require('path');
const logger = require('./src/utils/logger');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { typeDefs } = require('./src/graphql/typeDefs');
const { resolvers } = require('./src/graphql/resolvers');

// Import des modèles
require('./src/models/utilisateur.model');
require('./src/models/projet.model');
require('./src/models/livrable.model');

// Import des routes
const projetRoutes = require('./src/routes/projet.routes');
const livrableRoutes = require('./src/routes/livrable.routes');
const utilisateurRoutes = require('./src/routes/utilisateur.routes');
const aiRoutes = require('./src/routes/ai.routes');
const evaluationRouter = require('./src/routers/evaluation.router');

const app = express();
const PORT = process.env.PORT || 5003;
const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/progease';

// CORS configuration
app.use(cors({
    origin: ['http://localhost:4200', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Create Apollo Server
const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    formatError: (error) => {
        logger.error('GraphQL Error:', error);
        if (process.env.NODE_ENV === 'production') {
            return {
                message: 'Internal server error',
                path: error.path
            };
        }
        return error;
    }
});

// Start server function
async function startServer() {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        logger.info('Connected to MongoDB');

        // Start Apollo Server
        await apolloServer.start();
        
        // Apply Apollo middleware
        app.use('/graphql', 
            cors(),
            express.json(),
            expressMiddleware(apolloServer)
        );

        // Routes
        app.get('/health', (req, res) => {
            res.status(200).json({
                success: true,
                message: 'Health check OK',
                data: {
                    status: 'ok',
                    timestamp: new Date().toISOString()
                }
            });
        });

        app.get('/', (req, res) => {
            res.send('API PROGEASE is working correctly.');
        });

        // API Routes
        app.use('/api/projets', projetRoutes);
        app.use('/api/livrables', livrableRoutes);
        app.use('/api/utilisateurs', utilisateurRoutes);
        app.use('/api/ai', aiRoutes);
        app.use('/api/evaluations', evaluationRouter);

        // 404 Handler
        app.use((req, res) => {
            res.status(404).json({
                success: false,
                message: 'Route non trouvée',
                error: `La route ${req.originalUrl} n'existe pas`
            });
        });

        // Global Error Handler
        app.use((err, req, res, next) => {
            logger.error('Erreur serveur:', err);
            res.status(err.status || 500).json({
                success: false,
                message: err.message || 'Erreur serveur interne',
                error: process.env.NODE_ENV === 'development' ? err : {}
            });
        });

        // Start Express server
        app.listen(PORT, () => {
            logger.info(`Server running on port ${PORT}`);
            logger.info(`GraphQL endpoint: http://localhost:${PORT}/graphql`);
        });
    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Start the server
startServer();