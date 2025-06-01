require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const config = require('./src/config');
const logger = require('./src/utils/logger');

// Import des routes
const utilisateurRoutes = require('./src/routes/utilisateur.routes');

// Création de l'application Express
const app = express();

// Middleware
app.use(cors({
  origin: config.cors.origin,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/utilisateurs', utilisateurRoutes);

// Gestion des erreurs
app.use((err, req, res, next) => {
  logger.error('Erreur serveur:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Erreur interne du serveur'
  });
});

// Connexion à MongoDB
mongoose.connect(config.mongodb.uri)
  .then(() => {
    logger.info('✅ Connecté à MongoDB');
    
    // Démarrage du serveur
    const PORT = config.server.port;
    app.listen(PORT, () => {
      logger.info(`✅ Serveur démarré sur le port ${PORT}`);
      logger.info(`✅ Mode: ${config.server.env}`);
    });
  })
  .catch((error) => {
    logger.error('❌ Erreur de connexion à MongoDB:', error);
    process.exit(1);
  });

// Gestion des signaux de terminaison
process.on('SIGTERM', () => {
  logger.info('SIGTERM reçu. Arrêt gracieux...');
  mongoose.connection.close(() => {
    logger.info('Connexion MongoDB fermée');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT reçu. Arrêt gracieux...');
  mongoose.connection.close(() => {
    logger.info('Connexion MongoDB fermée');
    process.exit(0);
  });
});