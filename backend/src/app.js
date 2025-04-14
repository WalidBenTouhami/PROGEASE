//

import 'dotenv/config';
import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import helmet from 'helmet';
import cors from 'cors';
import { connectToDatabase } from './core/db.js';
import { ProjectAPI } from './datasources/projectAPI.js';
import { verifyToken } from './modules/project-management/middlewares/project.middleware.js';
import { projectRoutes } from './modules/project-management/index.js';
import logger from './utils/logger.js';
import { typeDefs, resolvers } from './schema.js';
import { scheduleHealthChecks, healthcheck } from '../../../healthcheck.js';

const isProduction = process.env.NODE_ENV === 'production';

async function initializeApp() {
    const app = express();

    // 1. Sécurité renforcée
    app.use(helmet({
        contentSecurityPolicy: isProduction ? {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                imgSrc: ["'self'", "data:", "https://*.github.com"],
                connectSrc: ["'self'", "https://*.github.com"]
            }
        } : false
    }));

    // 2. Configuration CORS
    app.use(cors({
        origin: isProduction ? process.env.CORS_ORIGINS.split(',') : '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization']
    }));

    // 3. Connexion à la base de données avec retry
    await connectToDatabase({
        retryCount: 3,
        retryDelay: 5000
    });

    // 4. Configuration Apollo Server
    const apolloServer = new ApolloServer({
        typeDefs,
        resolvers,
        introspection: !isProduction,
        persistedQueries: false,
        formatError: (error) => ({
            message: error.message,
            code: error.extensions?.code || 'INTERNAL_ERROR',
            locations: error.locations,
            path: error.path
        })
    });

    await apolloServer.start();

    // 5. Middleware GraphQL
    app.use(
        '/graphql',
        express.json({ limit: '10mb' }),
        expressMiddleware(apolloServer, {
            context: async ({ req }) => ({
                user: req.user,
                dataSources: {
                    projectAPI: new ProjectAPI()
                }
            }),
        })
    );

    // 6. Middleware REST
    app.use('/api/v1/projects',
        express.raw({ type: 'application/json' }),
        verifyToken,
        projectRoutes
    );

    // 7. Healthcheck
    app.get('/api/health', healthcheck);

    // 8. Gestion des erreurs
    app.use((err, req, res, next) => {
        logger.error(`Error ${err.status || 500}: ${err.message}`);
        res.status(err.status || 500).json({
            error: {
                code: err.code || 'UNKNOWN_ERROR',
                message: isProduction ? 'Internal Server Error' : err.message,
                ...(!isProduction && { stack: err.stack })
            }
        });
    });

    // 9. Planification des tâches
    scheduleHealthChecks();

    return app;
}

// Démarrage du serveur
const PORT = process.env.PORT || 4000;
initializeApp().then((app) => {
    app.listen(PORT, () => {
        logger.info(`Server running on port ${PORT}`);
    });
}).catch((error) => {
    logger.error('Failed to initialize the application', { error });
    process.exit(1);
});