require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const config = require('./src/config');
const logger = require('./src/utils/logger');

// Importation des routes
const utilisateurRoutes = require('./src/routes/utilisateur.routes');

// Création de l'application Express
const app = express();

// Configuration de la limite de taux
const limiteur = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limite chaque IP à 100 requêtes par fenêtre
  message: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard'
});

// Middleware de sécurité et d'optimisation
app.use(helmet());
app.use(compression());
app.use(limiteur);
app.use(cors({
  origin: config.cors.origin,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes API
app.use('/api/utilisateurs', utilisateurRoutes);

// Middleware de gestion des erreurs
app.use((err, req, res, next) => {
  logger.error('Erreur serveur:', err);
  const statusCode = err.status || 500;
  const message = err.message || 'Erreur interne du serveur';
  
  res.status(statusCode).json({
    succes: false,
    message,
    ...(config.server.env === 'development' && { stack: err.stack })
  });
});

// Configuration de la connexion MongoDB avec options optimisées
const optionsMongoDB = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

// Connexion à MongoDB
mongoose.connect(config.mongodb.uri, optionsMongoDB)
  .then(() => {
    logger.info('✅ Connexion à MongoDB établie avec succès');
    
    // Démarrage du serveur
    const PORT = config.server.port;
    app.listen(PORT, () => {
      logger.info(`✅ Serveur démarré sur le port ${PORT}`);
      logger.info(`✅ Environnement: ${config.server.env}`);
      logger.info(`✅ URL: http://localhost:${PORT}`);
    });
  })
  .catch((erreur) => {
    logger.error('❌ Échec de la connexion à MongoDB:', erreur);
    process.exit(1);
  });

// Gestion des signaux de terminaison
const fermetureGraceuse = async () => {
  logger.info('Arrêt gracieux du serveur...');
  try {
    await mongoose.connection.close();
    logger.info('Connexion MongoDB fermée avec succès');
    process.exit(0);
  } catch (erreur) {
    logger.error('Erreur lors de la fermeture de la connexion MongoDB:', erreur);
    process.exit(1);
  }
};

process.on('SIGTERM', fermetureGraceuse);
process.on('SIGINT', fermetureGraceuse);