const newman = require('newman');
const path = require('path');
const fs = require('fs');

// Configuration utilisateur
const currentUser = 'WalidBenTouhami';

// Obtenir la date et l'heure actuelles
const now = new Date();
const dateFormat = now.toISOString().replace(/[T:]/g, '-').replace(/\..+/, '');

// Assurer l'existence du dossier de rapports
const reportsDir = path.join(__dirname, 'reports', 'newman');
if (!fs.existsSync(reportsDir)){
  fs.mkdirSync(reportsDir, { recursive: true });
}

// Chemins des fichiers (relatifs à la racine du backend)
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
    { key: "timestamp", value: now.toISOString() }  // Timestamp au format ISO pour les tests
  ]
}, function (err) {
  if (err) {
    console.error('Newman run failed:', err);
    process.exit(1);
  }
  console.log('Newman tests completed successfully');
});