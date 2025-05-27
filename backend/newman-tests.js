const newman = require('newman');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

// Configuration utilisateur
const currentUser = 'WalidBenTouhami';
const baseUrl = 'http://localhost:5000';

// Vérifier que le serveur est accessible avant d'exécuter les tests
async function checkServerAvailability() {
  try {
    await axios.get(`${baseUrl}/health`, { timeout: 5000 });
    console.log('✅ Serveur accessible, exécution des tests...');
    return true;
  } catch (error) {
    console.error('❌ Impossible de se connecter au serveur. Assurez-vous que le serveur est en cours d\'exécution sur', baseUrl);
    return false;
  }
}

// Exécuter les tests Newman
async function runNewmanTests() {
  const serverAvailable = await checkServerAvailability();
  if (!serverAvailable) {
    console.error('Tests annulés: serveur inaccessible');
    process.exit(1);
  }

  // Obtenir la date et l'heure actuelles
  const now = new Date();
  const dateFormat = now.toISOString().replace(/[T:]/g, '-').replace(/\..+/, '');

  // Assurer l'existence du dossier de rapports
  const reportsDir = path.join(__dirname, 'reports', 'newman');
  if (!fs.existsSync(reportsDir)){
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  // Chemins des fichiers
  const collection = path.join(__dirname, 'tests', 'postman', 'PROGEASE.postman_collection.json');
  const environment = path.join(__dirname, 'tests', 'postman', 'PROGEASE.postman_environment.json');

  // Nom du rapport avec timestamp actuel
  const reportName = `rapport-${dateFormat}`;

  console.log(`Exécution des tests Newman par ${currentUser} à ${now.toLocaleString()}`);

  // Options de Newman
  newman.run({
    collection: collection,
    environment: environment,
    reporters: ['cli', 'htmlextra'],
    reporter: {
      htmlextra: {
        export: path.join(reportsDir, `${reportName}.html`),
        title: 'PROGEASE API Tests',
        browser: true,
        logs: true
      }
    },
    globalVar: [
      { key: "currentUser", value: currentUser },
      { key: "timestamp", value: now.toISOString() },
      { key: "baseUrl", value: baseUrl }
    ]
  }, function (err) {
    if (err) {
      console.error('Newman run failed:', err);
      process.exit(1);
    }
    console.log('Newman tests completed successfully');
  });
}

// Exécuter les tests
runNewmanTests();
