const newman = require('newman');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

// Configuration utilisateur
const currentutilisateur = 'WalidBenTouhami';
const baseUrl = 'http://localhost:5000';

// Verifier que le serveur est accessible avant d'executer les tests
async function checkServerAvailability() {
    try {
        await axios.get(`${baseUrl}/health`, { timeout: 5000 });
        console.log('✅ Serveur accessible, execution des tests...');
        return true;
    } catch (error) {
        console.error('❌ Impossible de se connecter au serveur. Assurez-vous que le serveur est en cours d\'execution sur', baseUrl);
        if (error.response) {
            console.error(`Code d'erreur: ${error.response.status}`);
        } else if (error.request) {
            console.error('Aucune reponse reçue du serveur');
        } else {
            console.error('Erreur:', error.message);
        }
        return false;
    }
}

// Verifier l'existence des fichiers de test
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

// Executer les tests Newman
async function runNewmanTests() {
    // Verifier la disponibilite du serveur
    const serverAvailable = await checkServerAvailability();
    if (!serverAvailable) {
        console.error('Tests annules: serveur inaccessible');
        process.exit(1);
    }

    // Verifier l'existence des fichiers
    const files = checkFilesExist();
    if (!files) {
        console.error('Tests annules: fichiers de test manquants');
        process.exit(1);
    }

    // Obtenir la date et l'heure actuelles
    const now = new Date();
    const dateFormat = now.toISOString().replace(/[T:.]/g, '-').slice(0, -5);

    // Date formatee pour les logs
    const formattedDate = formatDate(now);

    // Assurer l'existence du dossier de rapports
    const reportsDir = path.join(__dirname, 'reports', 'newman');
    try {
        if (!fs.existsSync(reportsDir)){
            fs.mkdirSync(reportsDir, { recursive: true });
        }
    } catch (error) {
        console.error('❌ Erreur lors de la creation du dossier de rapports:', error.message);
        process.exit(1);
    }

    // Nom du rapport avec timestamp actuel
    const reportName = `rapport-${dateFormat}`;

    console.log(`Execution des tests Newman par ${currentutilisateur} à ${formattedDate}`);

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
                timezone: 'UTC'
            }
        },
        globalVar: [
            { key: 'currentutilisateur', value: currentutilisateur },
            { key: 'timestamp', value: '2025-05-27T19:36:32Z' },
            { key: 'baseUrl', value: baseUrl },
            { key: 'testDate', value: '2025-05-27 19:36:32' }
        ],
        timeoutRequest: 10000, // 10 secondes de timeout pour chaque requete
        timeout: 120000, // 2 minutes de timeout global
        color: 'on'
    }, function (err, summary) {
        if (err) {
            console.error('❌ echec de l\'execution Newman:', err);
            process.exit(1);
        }

        // Afficher un resume des resultats
        if (summary && summary.run && summary.run.stats) {
            const stats = summary.run.stats;
            const failures = stats.failures ? stats.failures.length : 0;
            const total = stats.assertions ? stats.assertions.total : 0;
            const success = total - failures;
            const successRate = total > 0 ? Math.round((success / total) * 100) : 0;

            console.log('\n📊 Resume des tests:');
            console.log('┌───────────────┬─────────────┐');
            console.log(`│ Total         │ ${String(total).padStart(11)} │`);
            console.log(`│ Reussis       │ ${String(success).padStart(11)} │`);
            console.log(`│ echoues       │ ${String(failures).padStart(11)} │`);
            console.log(`│ Taux de succes│ ${String(successRate + '%').padStart(11)} │`);
            console.log('└───────────────┴─────────────┘');
            console.log(`📄 Rapport genere: ${path.join(reportsDir, `${reportName}.html`)}`);

            if (failures > 0) {
                console.log('⚠️  Des tests ont echoue, consultez le rapport pour plus de details.');
            } else {
                console.log('✅ Tous les tests ont reussi!');
            }
        }
    });
}

// Executer les tests
runNewmanTests().catch(error => {
    console.error('❌ Erreur non geree:', error);
    process.exit(1);
});