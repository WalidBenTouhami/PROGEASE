const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const logger = require('./utils/logger');
const { setupProcessErrorHandlers } = require('./utils/errorHandlers');
const { setupHttpErrorHandlers } = require('./utils/errorHandlers');
const { loadApiKey } = require('./utils/apiKeyLoader');
const { setupRoutes } = require('./routes');
const { setupGraphQL } = require('./graphql');
const { initializeTestData } = require('./utils/testDataInitializer');

// Configuration
const app = express();
const port = process.env.PORT || 5003;
const env = process.env.NODE_ENV || 'development';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuration des gestionnaires d'erreurs
setupProcessErrorHandlers();
logger.info('Gestionnaires d\'erreurs du processus configures');

setupHttpErrorHandlers(app);
logger.info('Gestionnaires d\'erreurs HTTP configures');

// Chargement de la clé API
loadApiKey();
logger.info('✅ Cle API Deepseek chargee');

// Connexion à MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/progease', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  logger.info('Connexion à MongoDB établie avec succès');
  logger.info('Connecte à MongoDB avec succes');
  
  // Initialisation des données de test si nécessaire
  return initializeTestData();
}).then(() => {
  logger.info('Donnees de test creees/verifiees avec succes');
  
  // Configuration des routes
  setupRoutes(app);
  
  // Configuration de GraphQL
  setupGraphQL(app);
  
  // Démarrage du serveur
  app.listen(port, () => {
    logger.info(`Serveur Express demarre sur le port ${port} en mode ${env}`);
    logger.info(`API REST disponible sur http://localhost:${port}/api`);
    logger.info(`GraphQL v4 disponible sur http://localhost:${port}/graphql`);
    
    console.log('=======================================================');
    console.log('🚀 PROGEASE Server (GraphQL v4)');
    console.log('=======================================================');
    console.log(`📅 Date: ${new Date().toLocaleString()}`);
    console.log(`👤 utilisateur: ${process.env.utilisateur || 'WalidBenTouhami'}`);
    console.log(`🌐 Port: ${port}`);
    console.log(`🔧 Mode: ${env}`);
    console.log(`🔗 API: http://localhost:${port}/api`);
    console.log(`🔗 GraphQL v4: http://localhost:${port}/graphql`);
    console.log(`🔗 Health: http://localhost:${port}/health`);
    console.log('=======================================================');
  });
}).catch(err => {
  logger.error('Erreur lors du demarrage du serveur:', err);
  process.exit(1);
}); 