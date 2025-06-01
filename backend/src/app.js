const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const { json } = require('body-parser');

const schema = require('./graphql/schema');
const { errorHandler } = require('./middleware/error.middleware');
const { authMiddleware } = require('./middleware/auth.middleware');
const config = require('./config');

const app = express();

// Middleware de base
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(morgan('dev'));
app.use(json());

// Configuration de la base de données
mongoose.connect(config.mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
})
.then(() => console.log('Connecté à MongoDB'))
.catch(err => console.error('Erreur de connexion à MongoDB:', err));

// Configuration du serveur Apollo
const server = new ApolloServer({
    schema,
    context: ({ req }) => ({
        utilisateur: req.utilisateur
    }),
    formatError: (error) => {
        // Supprimer les détails techniques des erreurs en production
        if (process.env.NODE_ENV === 'production') {
            delete error.extensions.exception;
        }
        return error;
    }
});

// Appliquer le middleware d'authentification
app.use(authMiddleware);

// Démarrer le serveur Apollo
server.applyMiddleware({ app });

// Gestion des erreurs
app.use(errorHandler);

// Gestion des routes non trouvées
app.use((req, res) => {
    res.status(404).json({ message: 'Route non trouvée' });
});

module.exports = app; 