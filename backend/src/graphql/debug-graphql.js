/**
 * PROGEASE - Console de debug GraphQL interactive
 * Date : 2025-05-28 09:48:25
 * Utilisateur : WalidBenTouhami
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
    cyan: '\x1b[36m',
};

// Fonction d'aide pour les textes colores
function colorize(text, color) {
    return `${colors[color]}${text}${colors.reset}`;
}

// Interface readline
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

// Requetes preconfigurees
const presetQueries = {
    health: 'query { healthCheck { status timestamp version message } }',
    projets: `query {
        projets(page: 1, limit: 10) {
            items {
                _id
                titre
                description
                statut
                progression
                estEnRetard
            }
            pagination {
                total
                pages
                page
                limit
                hasNextPage
                hasPreviousPage
            }
        }
    }`,
    livrables: `query {
        livrables(page: 1, limit: 10) {
            items {
                _id
                intitule
                description
                dateLimite
                statut
                estEnRetard
            }
            pagination {
                total
                pages
                page
                limit
                hasNextPage
                hasPreviousPage
            }
        }
    }`,
    projetDetails: `query($id: ID!) {
        projet(id: $id) {
            _id
            titre
            description
            equipe
            tuteur
            competences
            dateDebut
            dateFin
            statut
            progression
            urlDepot
            estEnRetard
            livrables {
                _id
                intitule
                statut
                dateLimite
                estEnRetard
            }
        }
    }`,
    analyseRisques: `query($projetId: ID!) {
        analyserRisquesProjet(projetId: $projetId) {
            retard
            progression
            livrables
            equipe
            niveauRisque
            recommandations
        }
    }`,
    creerProjet: `mutation($input: ProjetInput!) {
        creerProjet(input: $input) {
            _id
            titre
            description
            statut
            progression
        }
    }`,
    creerLivrable: `mutation($input: LivrableInput!) {
        creerLivrable(input: $input) {
            _id
            intitule
            description
            dateLimite
            statut
            estEnRetard
        }
    }`,
};

// Afficher la banniere
function showBanner() {
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║               PROGEASE - Console GraphQL Debug               ║');
    console.log('╟──────────────────────────────────────────────────────────────╢');
    console.log('║ Entrez votre requete GraphQL ou tapez:                       ║');
    console.log('║  .help    pour afficher l\'aide                               ║');
    console.log('║  .exit    pour quitter                                       ║');
    console.log('║  .preset  pour utiliser une requete predefinie               ║');
    console.log('╚══════════════════════════════════════════════════════════════╝');
}

// Afficher l'aide
function showHelp() {
    console.log(colorize('\n=== AIDE CONSOLE DEBUG GRAPHQL ===', 'cyan'));
    console.log(colorize('\nCommandes disponibles:', 'yellow'));
    console.log(colorize('  .help   - Affiche cette aide', 'gray'));
    console.log(colorize('  .exit   - Quitte la console', 'gray'));
    console.log(colorize('  .preset - Affiche les requetes preconfigurees', 'gray'));
    console.log(colorize('  .clear  - Efface l\'ecran', 'gray'));

    console.log(colorize('\nExemples de requetes:', 'yellow'));
    console.log(colorize('  query { healthCheck { status timestamp } }', 'gray'));
    console.log(
        colorize('  query { projets(page: 1, limit: 10) { items { _id titre } } }', 'gray')
    );
    console.log(colorize('  query { projet(id: "1") { titre livrables { intitule } } }', 'gray'));

    console.log(colorize('\nExemple avec variables:', 'yellow'));
    console.log(
        colorize(
            `  {
    "query": "query GetProjet($id: ID!) { projet(id: $id) { _id titre livrables { intitule } } }",
    "variables": { "id": "1" }
  }`,
            'gray'
        )
    );

    console.log(
        colorize(
            '\nNote: Pour envoyer une requete avec variables, utilisez un objet JSON complet',
            'blue'
        )
    );
    console.log();
}

// Afficher les requetes preconfigurees
function showPresets() {
    console.log(colorize('\n=== REQUeTES PReCONFIGUReES ===', 'cyan'));
    Object.entries(presetQueries).forEach(([name, query]) => {
        console.log(colorize(`\n${name}:`, 'yellow'));
        console.log(colorize(`  ${query}`, 'gray'));
    });
    console.log();
}

// Executer une requete GraphQL
async function executeQuery(input) {
    try {
        let requestBody;

        // Verifier si l'entree est un objet JSON complet (pour les variables)
        if (input.trim().startsWith('{') && input.trim().endsWith('}')) {
            try {
                requestBody = JSON.parse(input);
            } catch (e) {
                // Si ce n'est pas un JSON valide, traiter comme une requete simple
                requestBody = { query: input };
            }
        } else {
            requestBody = { query: input };
        }

        console.log(colorize('\n🔄 Execution de la requete...', 'blue'));

        const response = await axios.post(GRAPHQL_URL, requestBody, {
            headers: {
                'Content-Type': 'application/json',
                'X-utilisateur': 'WalidBenTouhami',
            },
            timeout: 5000,
        });

        console.log(colorize('\n✅ Resultat:', 'green'));
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

// Demarrer la console interactive
function startConsole() {
    showBanner();

    rl.setPrompt(colorize('GraphQL> ', 'cyan'));
    rl.prompt();

    rl.on('line', async line => {
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
                console.log(
                    colorize(
                        `Preset "${presetName}" non trouve. Utilisez .preset pour voir les options disponibles.`,
                        'red'
                    )
                );
            }
        } else if (input) {
            await executeQuery(input);
        }

        rl.prompt();
    });
}

// Verifier la disponibilite du serveur
async function checkServerAvailability() {
    try {
        console.log(colorize('🔄 Verification de la connexion au serveur GraphQL...', 'blue'));
        await axios.post(
            GRAPHQL_URL,
            { query: '{ __schema { queryType { name } } }' },
            { timeout: 3000 }
        );
        console.log(colorize('✅ Serveur GraphQL accessible\n', 'green'));
        return true;
    } catch (err) {
        console.error(colorize('❌ Impossible de se connecter au serveur GraphQL', 'red'));
        if (err.response) {
            console.log(colorize(`   Code d'erreur: ${err.response.status}`, 'gray'));
        } else if (err.code === 'ECONNREFUSED') {
            console.log(colorize('   Le serveur n\'est pas en cours d\'execution', 'gray'));
        } else {
            console.log(colorize(`   ${err.message}`, 'gray'));
        }

        console.log(colorize('\nVoulez-vous continuer quand meme? (o/N)', 'yellow'));
        return new Promise(resolve => {
            rl.question('', answer => {
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
    console.error(colorize('Erreur non geree:', 'red'), err);
    process.exit(1);
});
