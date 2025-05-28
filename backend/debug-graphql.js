/**
 * PROGEASE - Console de debug GraphQL interactive
 * Date: 2025-05-28 09:48:25
 * Utilisateur: WalidBenTouhami
 */

const axios = require('axios');
const readline = require('readline');

// URL du serveur GraphQL
const GRAPHQL_URL = 'http://localhost:5000/graphql';

// Couleurs pour la console
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    gray: '\x1b[90m',
    cyan: '\x1b[36m'
};

// Fonction d'aide pour les textes colorés
function colorize(text, color) {
    return `${colors[color]}${text}${colors.reset}`;
}

// Interface readline
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Requêtes préconfigurées
const presetQueries = {
    health: `query { health { status timestamp user version uptime } }`,
    projets: `query { projets { _id titre description } }`,
    livrables: `query { livrables { _id titre description } }`
};

// Afficher la bannière
function showBanner() {
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║               PROGEASE - Console GraphQL Debug               ║');
    console.log('╟──────────────────────────────────────────────────────────────╢');
    console.log('║ Entrez votre requête GraphQL ou tapez:                       ║');
    console.log('║  .help    pour afficher l\'aide                               ║');
    console.log('║  .exit    pour quitter                                       ║');
    console.log('║  .preset  pour utiliser une requête prédéfinie               ║');
    console.log('╚══════════════════════════════════════════════════════════════╝');
}

// Afficher l'aide
function showHelp() {
    console.log(colorize('\n=== AIDE CONSOLE DEBUG GRAPHQL ===', 'cyan'));
    console.log(colorize('\nCommandes disponibles:', 'yellow'));
    console.log(colorize('  .help   - Affiche cette aide', 'gray'));
    console.log(colorize('  .exit   - Quitte la console', 'gray'));
    console.log(colorize('  .preset - Affiche les requêtes préconfigurées', 'gray'));
    console.log(colorize('  .clear  - Efface l\'écran', 'gray'));

    console.log(colorize('\nExemples de requêtes:', 'yellow'));
    console.log(colorize(`  query { health { status } }`, 'gray'));
    console.log(colorize(`  query { projets { _id titre } }`, 'gray'));
    console.log(colorize(`  query { projet(id: "1") { titre } }`, 'gray'));

    console.log(colorize('\nExemple avec variables:', 'yellow'));
    console.log(colorize(`  { "query": "query GetProjet($id: ID!) { projet(id: $id) { _id titre } }", "variables": { "id": "1" } }`, 'gray'));

    console.log(colorize('\nNote: Pour envoyer une requête avec variables, utilisez un objet JSON complet', 'blue'));
    console.log();
}

// Afficher les requêtes préconfigurées
function showPresets() {
    console.log(colorize('\n=== REQUÊTES PRÉCONFIGURÉES ===', 'cyan'));
    Object.entries(presetQueries).forEach(([name, query]) => {
        console.log(colorize(`\n${name}:`, 'yellow'));
        console.log(colorize(`  ${query}`, 'gray'));
    });
    console.log();
}

// Exécuter une requête GraphQL
async function executeQuery(input) {
    try {
        let requestBody;

        // Vérifier si l'entrée est un objet JSON complet (pour les variables)
        if (input.trim().startsWith('{') && input.trim().endsWith('}')) {
            try {
                requestBody = JSON.parse(input);
            } catch (e) {
                // Si ce n'est pas un JSON valide, traiter comme une requête simple
                requestBody = { query: input };
            }
        } else {
            requestBody = { query: input };
        }

        console.log(colorize('\n🔄 Exécution de la requête...', 'blue'));

        const response = await axios.post(GRAPHQL_URL, requestBody, {
            headers: {
                'Content-Type': 'application/json',
                'X-User': 'WalidBenTouhami'
            },
            timeout: 5000
        });

        console.log(colorize('\n✅ Résultat:', 'green'));
        console.log(JSON.stringify(response.data, null, 2));

    } catch (err) {
        console.log(colorize('\n❌ Erreur:', 'red'));

        if (err.response && err.response.data) {
            console.log(JSON.stringify(err.response.data, null, 2));
        } else if (err.message) {
            console.log(err.message);
        } else {
            console.log('Erreur inconnue');
        }
    }
}

// Démarrer la console interactive
function startConsole() {
    showBanner();

    rl.setPrompt(colorize('GraphQL> ', 'cyan'));
    rl.prompt();

    rl.on('line', async (line) => {
        const input = line.trim();

        if (input === '.help') {
            showHelp();
        } else if (input === '.exit') {
            console.log(colorize('Au revoir!', 'blue'));
            rl.close();
            process.exit(0);
        } else if (input === '.preset') {
            showPresets();
        } else if (input === '.clear') {
            console.clear();
            showBanner();
        } else if (input.startsWith('.preset ')) {
            const presetName = input.split(' ')[1];
            if (presetQueries[presetName]) {
                await executeQuery(presetQueries[presetName]);
            } else {
                console.log(colorize(`Preset "${presetName}" non trouvé. Utilisez .preset pour voir les options disponibles.`, 'red'));
            }
        } else if (input) {
            await executeQuery(input);
        }

        rl.prompt();
    });
}

// Vérifier la disponibilité du serveur
async function checkServerAvailability() {
    try {
        console.log(colorize('🔄 Vérification de la connexion au serveur GraphQL...', 'blue'));
        await axios.post(GRAPHQL_URL, { query: '{ __schema { queryType { name } } }' }, { timeout: 3000 });
        console.log(colorize('✅ Serveur GraphQL accessible\n', 'green'));
        return true;
    } catch (err) {
        console.error(colorize('❌ Impossible de se connecter au serveur GraphQL', 'red'));
        if (err.response) {
            console.log(colorize(`   Code d'erreur: ${err.response.status}`, 'gray'));
        } else if (err.code === 'ECONNREFUSED') {
            console.log(colorize('   Le serveur n\'est pas en cours d\'exécution', 'gray'));
        } else {
            console.log(colorize(`   ${err.message}`, 'gray'));
        }

        console.log(colorize('\nVoulez-vous continuer quand même? (o/N)', 'yellow'));
        return new Promise((resolve) => {
            rl.question('', (answer) => {
                resolve(answer.toLowerCase() === 'o');
            });
        });
    }
}

// Fonction principale
async function main() {
    const serverAvailable = await checkServerAvailability();
    if (!serverAvailable) {
        console.log(colorize('Connexion au serveur impossible, fermeture.', 'red'));
        process.exit(1);
    }

    startConsole();
}

main().catch(err => {
    console.error(colorize('Erreur non gérée:', 'red'), err);
    process.exit(1);
});