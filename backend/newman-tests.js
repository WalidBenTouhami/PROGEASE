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
    if (error.response) {
      console.error(`Code d'erreur: ${error.response.status}`);
    } else if (error.request) {
      console.error('Aucune réponse reçue du serveur');
    } else {
      console.error('Erreur:', error.message);
    }
    return false;
  }
}

// Vérifier l'existence des fichiers de test
function checkFilesExist() {
  const collection = path.join(__dirname, 'tests', 'postman', 'PROGEASE.postman_collection.json');
  const environment = path.join(__dirname, 'tests', 'postman', 'PROGEASE.postman_environment.json');

  const missingFiles = [];
  if (!fs.existsSync(collection)) missingFiles.push(collection);
  if (!fs.existsSync(environment)) missingFiles.push(environment);

  if (missingFiles.length > 0) {
    console.error('❌ Fichiers manquants:', missingFiles.join(', '));
    return false;
  }

  return { collection, environment };
}

// Formater la date pour les logs
function formatDate(date) {
  return date.toISOString().replace('T', ' ').slice(0, 19);
}

// Exécuter les tests Newman
async function runNewmanTests() {
  // Vérifier la disponibilité du serveur
  const serverAvailable = await checkServerAvailability();
  if (!serverAvailable) {
    console.error('Tests annulés: serveur inaccessible');
    process.exit(1);
  }

  // Vérifier l'existence des fichiers
  const files = checkFilesExist();
  if (!files) {
    console.error('Tests annulés: fichiers de test manquants');
    process.exit(1);
  }

  // Obtenir la date et l'heure actuelles
  const now = new Date();
  const dateFormat = now.toISOString().replace(/[T:\.]/g, '-').slice(0, -5);

  // Date formatée pour les logs
  const formattedDate = formatDate(now);

  // Assurer l'existence du dossier de rapports
  const reportsDir = path.join(__dirname, 'reports', 'newman');
  try {
    if (!fs.existsSync(reportsDir)){
      fs.mkdirSync(reportsDir, { recursive: true });
    }
  } catch (error) {
    console.error('❌ Erreur lors de la création du dossier de rapports:', error.message);
    process.exit(1);
  }

  // Nom du rapport avec timestamp actuel
  const reportName = `rapport-${dateFormat}`;

  console.log(`Exécution des tests Newman par ${currentUser} à ${formattedDate}`);

  // Options de Newman
  newman.run({
    collection: files.collection,
    environment: files.environment,
    reporters: ['cli', 'htmlextra'],
    reporter: {
      htmlextra: {
        export: path.join(reportsDir, `${reportName}.html`),
        title: 'PROGEASE API Tests',
        browser: true,
        logs: true,
        darkTheme: false,
        titleSize: 1,
        displayProgressBar: true,
        timezone: "UTC"
      }
    },
    globalVar: [
      { key: "currentUser", value: currentUser },
      { key: "timestamp", value: "2025-05-27T19:36:32Z" },
      { key: "baseUrl", value: baseUrl },
      { key: "testDate", value: "2025-05-27 19:36:32" }
    ],
    timeoutRequest: 10000, // 10 secondes de timeout pour chaque requête
    timeout: 120000, // 2 minutes de timeout global
    color: "on"
  }, function (err, summary) {
    if (err) {
      console.error('❌ Échec de l\'exécution Newman:', err);
      process.exit(1);
    }

    // Afficher un résumé des résultats
    if (summary && summary.run && summary.run.stats) {
      const stats = summary.run.stats;
      const failures = stats.failures ? stats.failures.length : 0;
      const total = stats.assertions ? stats.assertions.total : 0;
      const success = total - failures;
      const successRate = total > 0 ? Math.round((success / total) * 100) : 0;

      console.log('\n📊 Résumé des tests:');
      console.log('┌───────────────┬─────────────┐');
      console.log(`│ Total         │ ${String(total).padStart(11)} │`);
      console.log(`│ Réussis       │ ${String(success).padStart(11)} │`);
      console.log(`│ Échoués       │ ${String(failures).padStart(11)} │`);
      console.log(`│ Taux de succès│ ${String(successRate + '%').padStart(11)} │`);
      console.log('└───────────────┴─────────────┘');
      console.log(`📄 Rapport généré: ${path.join(reportsDir, `${reportName}.html`)}`);

      if (failures > 0) {
        console.log('⚠️  Des tests ont échoué, consultez le rapport pour plus de détails.');
      } else {
        console.log('✅ Tous les tests ont réussi!');
      }
    }
  });
}

// Exécuter les tests
runNewmanTests().catch(error => {
  console.error('❌ Erreur non gérée:', error);
  process.exit(1);
});