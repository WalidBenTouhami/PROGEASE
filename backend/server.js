// ./backend/server.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const { ApolloServer } = require('apollo-server-express');
const { typeDefs } = require('./src/graphql/typeDefs');
const { resolvers } = require('./src/graphql/resolvers');
const projectRouter = require('./src/routers/project.router');
const deliverableRouter = require('./src/routers/deliverable.router');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

// ✅ Vérification des variables d'environnement critiques
if (!MONGO_URI) {
    console.error('❌ Error: MONGO_URI is missing in environment variables.');
    process.exit(1);
}

// ✅ Middleware
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

// ✅ Apollo Server Initialization
const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    formatError: (err) => {
        console.error('GraphQL Error:', err.message);
        return {
            message: err.message,
            code: err.extensions?.code || 'INTERNAL_SERVER_ERROR',
        };
    },
});

// ✅ Fonction pour démarrer Apollo Server
async function startApolloServer() {
    await apolloServer.start();
    apolloServer.applyMiddleware({ app });
}

// ✅ Connexion à MongoDB
mongoose
    .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch((err) => {
        console.error('❌ MongoDB connection error:', err.message);
        process.exit(1);
    });

// ✅ Définition des routes
app.get('/', (req, res) => {
    res.send('API PROGEASE is working correctly.');
});
app.use('/api/projects', projectRouter);
app.use('/api/deliverables', deliverableRouter);

// ✅ Gestion des erreurs globales
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));
app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err.stack);
    res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

// ✅ Lancement de l'application
(async () => {
    try {
        await startApolloServer();
        app.listen(PORT, () => {
            console.log(`🚀 Apollo Server running at http://localhost:${PORT}${apolloServer.graphqlPath}`);
            console.log(`✅ Express server started on port ${PORT}`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        process.exit(1);
    }
})();