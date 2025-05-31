/**
 * PROGEASE - Tests GraphQL - Solution complete
 * Date: 2025-05-28 09:48:25
 * Utilisateur: WalidBenTouhami
 */

const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');

// Couleurs ANSI pour le terminal
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    gray: '\x1b[90m',
    bold: '\x1b[1m'
};

// Configuration
const config = {
    baseUrl: 'http://localhost:5000/graphql',
    testsDir: path.join(__dirname, 'tests', 'graphql'),
    currentutilisateur: 'WalidBenTouhami',
    currentDate: '2025-05-28 09:48:25'
};

// Fonction d'aide pour les textes colores
function colorize(text, color) {
    return `${colors[color]}${text}${colors.reset}`;
}

// Banniere d'information
function showBanner() {
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║                  PROGEASE - Tests GraphQL                    ║');
    console.log('╟──────────────────────────────────────────────────────────────╢');
    console.log(`║ Utilisateur: ${config.currentutilisateur.padEnd(46, ' ')}  ║`);
    console.log(`║ Date: ${config.currentDate.padEnd(52, ' ')}   ║`);
    console.log('╚══════════════════════════════════════════════════════════════╝');
}

// Modeles de requetes predefinis, garantis pour fonctionner avec notre schema
const predefinedQueries = {
    health: `
query GetHealth {
  health {
    status
    timestamp
    utilisateur
    version
    uptime
  }
}`,
    projets: `
query GetAllProjets {
  projets {
    _id
    titre
    description
    statut
    dateDebut
    dateFin
  }
}`,
    projet: `
query GetProjetById($id: ID!) {
  projet(id: $id) {
    _id
    titre
    description
    statut
    dateDebut
    dateFin
    livrables {
      _id
      titre
    }
  }
}`,
    livrables: `
query GetAllLivrables {
  livrables {
    _id
    titre
    description
    statut
    dateEcheance
    projetId
  }
}`,
    livrable: `
query GetLivrableById($id: ID!) {
  livrable(id: $id) {
    _id
    titre
    description
    statut
    dateEcheance
    projetId
    projet {
      _id
      titre
    }
  }
}`
};

// Verifier que le serveur est accessible
async function checkServerAvailability() {
    console.log(colorize('🔄 Verification de la disponibilite du serveur GraphQL...', 'blue'));

    try {
        // Faire une requete d'introspection simple
        await axios.post(config.baseUrl, {
            query: '{ __schema { queryType { name } } }'
        }, { timeout: 3000 });

        console.log(colorize('✅ Serveur GraphQL accessible', 'green'));
        return true;
    } catch (err) {
        console.error(colorize(`❌ Impossible de se connecter au serveur GraphQL: ${config.baseUrl}`, 'red'));

        if (err.response) {
            console.error(colorize(`   Code d'erreur: ${err.response.status}`, 'red'));
        } else if (err.request) {
            console.error(colorize('   Aucune reponse reçue du serveur', 'red'));
            console.log(colorize('   💡 Verifiez que le serveur est bien demarre', 'yellow'));
        } else {
            console.error(colorize(`   Erreur: ${err.message}`, 'red'));
        }

        console.log('\n' + colorize('   Voulez-vous continuer quand meme? (o/N)', 'yellow'));
        console.log(colorize('   (Continuation automatique pour la demo)', 'gray'));
        return true;
    }
}

// Executer les tests GraphQL predefinis
async function runPredefinedTests() {
    console.log(colorize('\n🧪 Execution des tests GraphQL predefinis...', 'blue'));

    let totalTests = 0;
    let passedTests = 0;

    // Executer chaque requete predefinie
    for (const [name, query] of Object.entries(predefinedQueries)) {
        totalTests++;
        console.log(colorize(`\n📌 Test: ${name}`, 'cyan'));

        try {
            // Preparer les variables si necessaire
            let variables = {};
            if (name === 'projet' || name === 'livrable') {
                variables = { id: '1' }; // ID fictif pour les tests
            }

            // Executer la requete
            const response = await axios.post(config.baseUrl, {
                query: query.trim(),
                variables
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-utilisateur': config.currentutilisateur
                },
                timeout: 5000
            });

            if (response.data.errors) {
                console.log(colorize(`  ❌ Erreur: ${response.data.errors[0].message}`, 'red'));

                // Afficher la requete pour faciliter le debogage
                console.log(colorize('  Requete:', 'gray'));
                console.log(colorize(`  ${query.trim().replace(/\n/g, '\n  ')}`, 'gray'));
            } else {
                console.log(colorize('  ✅ Succes', 'green'));

                // Afficher un aperçu du resultat
                let preview;
                if (response.data.data) {
                    preview = JSON.stringify(response.data.data).substring(0, 60) + '...';
                } else {
                    preview = 'Pas de donnees retournees';
                }
                console.log(colorize(`  Resultat: ${preview}`, 'gray'));

                passedTests++;
            }
        } catch (err) {
            console.log(colorize(`  ❌ Erreur: ${err.message}`, 'red'));

            if (err.response && err.response.data) {
                try {
                    // Afficher l'erreur specifique de GraphQL
                    const errorMessage = err.response.data.errors ?
                        err.response.data.errors[0].message :
                        JSON.stringify(err.response.data);

                    console.log(colorize(`  Details: ${errorMessage}`, 'gray'));
                } catch (e) {
                    console.log(colorize(`  Erreur de serveur (code ${err.response.status})`, 'gray'));
                }
            }

            // Afficher la requete pour faciliter le debogage
            console.log(colorize('  Requete problematique:', 'gray'));
            console.log(colorize(`  ${query.trim().replace(/\n/g, '\n  ')}`, 'gray'));
        }
    }

    // Afficher le resume
    const successRate = Math.round((passedTests / totalTests) * 100) || 0;

    console.log('\n' + colorize('╔══════════════════════════════════════════════╗', 'bold'));
    console.log(colorize('║            ReSUMe DES TESTS GRAPHQL          ║', 'bold'));
    console.log(colorize('╟──────────────────────────┬───────────────────╢', 'bold'));
    console.log(colorize(`║ Total des tests          │ ${String(totalTests).padStart(17)} ║`, 'bold'));
    console.log(colorize(`║ Tests reussis            │ ${String(passedTests).padStart(17)} ║`, 'bold'));
    console.log(colorize(`║ Tests echoues            │ ${String(totalTests - passedTests).padStart(17)} ║`, 'bold'));
    console.log(colorize(`║ Taux de reussite         │ ${String(successRate + '%').padStart(17)} ║`, 'bold'));
    console.log(colorize('╚══════════════════════════╧═══════════════════╝', 'bold'));

    return { totalTests, passedTests };
}

// Creer les fichiers de test corrects (ils peuvent etre utilises plus tard)
async function generateCorrectTestFiles() {
    console.log(colorize('\n📝 Generation de fichiers de test GraphQL corrects...', 'blue'));

    // Assurer que le repertoire existe
    try {
        await fs.access(config.testsDir);
    } catch (err) {
        try {
            await fs.mkdir(config.testsDir, { recursive: true });
            console.log(colorize('  Repertoire de tests cree', 'green'));
        } catch (mkdirErr) {
            console.error(colorize(`  Erreur lors de la creation du repertoire: ${mkdirErr.message}`, 'red'));
            return;
        }
    }

    // Creer les fichiers de test
    try {
        // Fichier health.graphql
        await fs.writeFile(
            path.join(config.testsDir, 'health.graphql'),
            `# Tests GraphQL pour Health
# Generes par PROGEASE le ${config.currentDate}
# Utilisateur: ${config.currentutilisateur}

${predefinedQueries.health}
`
        );

        // Fichier projet.graphql
        await fs.writeFile(
            path.join(config.testsDir, 'projet.graphql'),
            `# Tests GraphQL pour Projet
# Generes par PROGEASE le ${config.currentDate}
# Utilisateur: ${config.currentutilisateur}

${predefinedQueries.projets}

${predefinedQueries.projet}

# Variables pour GetProjetById:
# {
#   "id": "1"
# }
`
        );

        // Fichier livrable.graphql
        await fs.writeFile(
            path.join(config.testsDir, 'livrable.graphql'),
            `# Tests GraphQL pour Livrable
# Generes par PROGEASE le ${config.currentDate}
# Utilisateur: ${config.currentutilisateur}

${predefinedQueries.livrables}

${predefinedQueries.livrable}

# Variables pour GetLivrableById:
# {
#   "id": "1"
# }
`
        );

        console.log(colorize('  ✅ Fichiers de test generes avec succes', 'green'));
    } catch (err) {
        console.error(colorize(`  Erreur lors de la generation des fichiers: ${err.message}`, 'red'));
    }
}

// Diagnostic des problemes
async function diagnoseIssues(results) {
    if (results.passedTests === results.totalTests) {
        // Tout est bon, pas besoin de diagnostic
        return;
    }

    console.log(colorize('\n🔍 DIAGNOSTIC DES PROBLeMES GRAPHQL', 'yellow'));

    try {
        // Verifier le schema
        console.log(colorize('\n1. Verification du schema GraphQL...', 'blue'));

        const schemaPath = path.join(__dirname, 'src', 'graphql', 'schema-template.graphql');
        try {
            const schemaContent = await fs.readFile(schemaPath, 'utf8');
            console.log(colorize('  ✅ Schema trouve', 'green'));

            // Verifions les types essentiels
            const types = ['Query', 'Projet', 'Livrable', 'Health'];
            const missingTypes = [];

            for (const type of types) {
                if (!schemaContent.includes(`type ${type}`)) {
                    missingTypes.push(type);
                }
            }

            if (missingTypes.length > 0) {
                console.log(colorize(`  ⚠️ Types manquants dans le schema: ${missingTypes.join(', ')}`, 'yellow'));
            } else {
                console.log(colorize('  ✅ Tous les types essentiels sont presents', 'green'));
            }

        } catch (err) {
            console.log(colorize(`  ❌ Schema non trouve ou inaccessible: ${err.message}`, 'red'));
        }

        // Verifier la configuration du serveur
        console.log(colorize('\n2. Verification du serveur...', 'blue'));
        try {
            const healthResponse = await axios.get('http://localhost:5000/health');
            console.log(colorize(`  ✅ Serveur en ligne (version ${healthResponse.data.version})`, 'green'));

            if (healthResponse.data.graphqlVersion) {
                console.log(colorize(`  ✅ GraphQL configure (version ${healthResponse.data.graphqlVersion})`, 'green'));
            }
        } catch (err) {
            console.log(colorize('  ❌ Serveur REST inaccessible', 'red'));
        }

        // Recommandations
        console.log(colorize('\n💡 RECOMMANDATIONS:', 'blue'));
        console.log(colorize('1. Verifiez votre fichier server.js pour vous assurer que GraphQL est correctement configure', 'cyan'));
        console.log(colorize('2. Verifiez que les resolveurs dans codegen.js correspondent aux types definis dans le schema', 'cyan'));
        console.log(colorize('3. Redemarrez le serveur apres toute modification', 'cyan'));
        console.log(colorize('4. Utilisez GraphiQL (http://localhost:5000/graphql) pour tester manuellement les requetes', 'cyan'));
    } catch (err) {
        console.error(colorize('Erreur lors du diagnostic:', 'red'), err);
    }
}

// Fonction principale
async function main() {
    showBanner();

    // Verifier la disponibilite du serveur
    const serverAvailable = await checkServerAvailability();
    if (!serverAvailable) {
        process.exit(1);
    }

    // Generer des fichiers de test corrects pour reference future
    await generateCorrectTestFiles();

    // Executer les tests predefinis (ces tests sont garantis syntaxiquement corrects)
    const results = await runPredefinedTests();

    // Si des tests ont echoue, lancer le diagnostic
    if (results.passedTests < results.totalTests) {
        await diagnoseIssues(results);
    }
}

// Lancer le script
main().catch(err => {
    console.error(colorize('Erreur non geree:', 'red'), err);
    process.exit(1);
});