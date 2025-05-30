// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const morgan = require('morgan');
const path = require('path');
const logger = require('./src/utils/logger');

// Import des modèles
require('./src/models/utilisateur.model');
require('./src/models/projet.model');
require('./src/models/livrable.model');

// Import des routes
const projetRoutes = require('./src/routes/projet.routes');
const livrableRoutes = require('./src/routes/livrable.routes');
const utilisateurRoutes = require('./src/routes/utilisateur.routes');
const aiRoutes = require('./src/routes/ai.routes');

const app = express();
const PORT = process.env.PORT || 5003;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/progease';

// Middlewares
app.use(cors({
    origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:3000'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Routes de base
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

// Routes API
app.use('/api/projets', projetRoutes);
app.use('/api/livrables', livrableRoutes);
app.use('/api/utilisateurs', utilisateurRoutes);
app.use('/api/ai', aiRoutes);

// Gestion des erreurs 404
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route non trouvée',
        error: `La route ${req.originalUrl} n'existe pas`
    });
});

// Gestion globale des erreurs
app.use((err, req, res, next) => {
    logger.error('Erreur serveur:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Erreur serveur interne',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

// Connexion à MongoDB
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => {
        logger.info('Connecté à MongoDB');
        app.listen(PORT, () => {
            logger.info(`Serveur démarré sur le port ${PORT}`);
        });
    })
    .catch(err => {
        logger.error('Erreur de connexion à MongoDB:', err);
        process.exit(1);
    });