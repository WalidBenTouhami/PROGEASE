// ./backend/server.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const { ApolloServer } = require('apollo-server-express');
const { typeDefs } = require('./src/graphql/schema');
const { resolvers } = require('./src/graphql/resolvers');
const projectRouter = require('./src/routers/project.router');
const deliverableRouter = require('./src/routers/deliverable.router');
const aiRouter = require('./src/routers/ai.router'); // ✅ Import du routeur IA

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

// ✅ Vérification des variables d'environnement critiques
if (!MONGO_URI) {
    console.error('❌ Erreur : MONGO_URI manquante dans les variables d\'environnement.');
    process.exit(1);
}

// ✅ Middlewares
app.use(morgan('dev')); // Journalisation
app.use(cors()); // Autoriser les requêtes cross-origin
app.use(express.json()); // Parseur JSON

// ✅ Initialisation Apollo Server
const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    formatError: (err) => {
        console.error('Erreur GraphQL :', err.message);
        return {
            message: err.message,
            code: err.extensions?.code || 'ERREUR_INTERNE',
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
    .connect(MONGO_URI)
    .then(() => console.log('✅ Connecté à MongoDB'))
    .catch((err) => {
        console.error('❌ Erreur de connexion MongoDB :', err.message);
        process.exit(1);
    });

// ✅ Définition des routes
app.get('/', (req, res) => {
    res.send('API PROGEASE fonctionne correctement.');
});
app.use('/api/projects', projectRouter);
app.use('/api/deliverables', deliverableRouter);
app.use('/api/ai', aiRouter); // ✅ Route IA

// ✅ Gestion globale des erreurs
app.use((req, res) => res.status(404).json({ error: 'Route introuvable' }));
app.use((err, req, res, next) => {
    console.error('Erreur non gérée :', err.stack);
    res.status(err.status || 500).json({ error: err.message || 'Erreur serveur interne' });
});

// ✅ Démarrage de l'application
(async () => {
    try {
        await startApolloServer();
        app.listen(PORT, () => {
            console.log(`🚀 Serveur Apollo lancé sur http://localhost:${PORT}${apolloServer.graphqlPath}`);
            console.log(`✅ Serveur Express démarré sur le port ${PORT}`);
        });
    } catch (error) {
        console.error('❌ Échec du démarrage du serveur :', error.message);
        process.exit(1);
    }
})();