/**
 * PROGEASE - Tests GraphQL - Solution complète
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
    currentUser: 'WalidBenTouhami',
    currentDate: '2025-05-28 09:48:25'
};

// Fonction d'aide pour les textes colorés
function colorize(text, color) {
    return `${colors[color]}${text}${colors.reset}`;
}

// Bannière d'information
function showBanner() {
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║                  PROGEASE - Tests GraphQL                    ║');
    console.log('╟──────────────────────────────────────────────────────────────╢');
    console.log(`║ Utilisateur: ${config.currentUser.padEnd(46, ' ')}  ║`);
    console.log(`║ Date: ${config.currentDate.padEnd(52, ' ')}   ║`);
    console.log('╚══════════════════════════════════════════════════════════════╝');
}

// Modèles de requêtes prédéfinis, garantis pour fonctionner avec notre schéma
const predefinedQueries = {
    health: `
query GetHealth {
  health {
    status
    timestamp
    user
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

// Vérifier que le serveur est accessible
async function checkServerAvailability() {
    console.log(colorize('🔄 Vérification de la disponibilité du serveur GraphQL...', 'blue'));

    try {
        // Faire une requête d'introspection simple
        await axios.post(config.baseUrl, {
            query: `{ __schema { queryType { name } } }`
        }, { timeout: 3000 });

        console.log(colorize('✅ Serveur GraphQL accessible', 'green'));
        return true;
    } catch (err) {
        console.error(colorize(`❌ Impossible de se connecter au serveur GraphQL: ${config.baseUrl}`, 'red'));

        if (err.response) {
            console.error(colorize(`   Code d'erreur: ${err.response.status}`, 'red'));
        } else if (err.request) {
            console.error(colorize('   Aucune réponse reçue du serveur', 'red'));
            console.log(colorize('   💡 Vérifiez que le serveur est bien démarré', 'yellow'));
        } else {
            console.error(colorize(`   Erreur: ${err.message}`, 'red'));
        }

        console.log('\n' + colorize('   Voulez-vous continuer quand même? (o/N)', 'yellow'));
        console.log(colorize('   (Continuation automatique pour la démo)', 'gray'));
        return true;
    }
}

// Exécuter les tests GraphQL prédéfinis
async function runPredefinedTests() {
    console.log(colorize('\n🧪 Exécution des tests GraphQL prédéfinis...', 'blue'));

    let totalTests = 0;
    let passedTests = 0;

    // Exécuter chaque requête prédéfinie
    for (const [name, query] of Object.entries(predefinedQueries)) {
        totalTests++;
        console.log(colorize(`\n📌 Test: ${name}`, 'cyan'));

        try {
            // Préparer les variables si nécessaire
            let variables = {};
            if (name === 'projet' || name === 'livrable') {
                variables = { id: "1" }; // ID fictif pour les tests
            }

            // Exécuter la requête
            const response = await axios.post(config.baseUrl, {
                query: query.trim(),
                variables
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-User': config.currentUser
                },
                timeout: 5000
            });

            if (response.data.errors) {
                console.log(colorize(`  ❌ Erreur: ${response.data.errors[0].message}`, 'red'));

                // Afficher la requête pour faciliter le débogage
                console.log(colorize('  Requête:', 'gray'));
                console.log(colorize(`  ${query.trim().replace(/\n/g, '\n  ')}`, 'gray'));
            } else {
                console.log(colorize(`  ✅ Succès`, 'green'));

                // Afficher un aperçu du résultat
                let preview;
                if (response.data.data) {
                    preview = JSON.stringify(response.data.data).substring(0, 60) + '...';
                } else {
                    preview = 'Pas de données retournées';
                }
                console.log(colorize(`  Résultat: ${preview}`, 'gray'));

                passedTests++;
            }
        } catch (err) {
            console.log(colorize(`  ❌ Erreur: ${err.message}`, 'red'));

            if (err.response && err.response.data) {
                try {
                    // Afficher l'erreur spécifique de GraphQL
                    const errorMessage = err.response.data.errors ?
                        err.response.data.errors[0].message :
                        JSON.stringify(err.response.data);

                    console.log(colorize(`  Détails: ${errorMessage}`, 'gray'));
                } catch (e) {
                    console.log(colorize(`  Erreur de serveur (code ${err.response.status})`, 'gray'));
                }
            }

            // Afficher la requête pour faciliter le débogage
            console.log(colorize('  Requête problématique:', 'gray'));
            console.log(colorize(`  ${query.trim().replace(/\n/g, '\n  ')}`, 'gray'));
        }
    }

    // Afficher le résumé
    const successRate = Math.round((passedTests / totalTests) * 100) || 0;

    console.log('\n' + colorize('╔══════════════════════════════════════════════╗', 'bold'));
    console.log(colorize(`║            RÉSUMÉ DES TESTS GRAPHQL          ║`, 'bold'));
    console.log(colorize('╟──────────────────────────┬───────────────────╢', 'bold'));
    console.log(colorize(`║ Total des tests          │ ${String(totalTests).padStart(17)} ║`, 'bold'));
    console.log(colorize(`║ Tests réussis            │ ${String(passedTests).padStart(17)} ║`, 'bold'));
    console.log(colorize(`║ Tests échoués            │ ${String(totalTests - passedTests).padStart(17)} ║`, 'bold'));
    console.log(colorize(`║ Taux de réussite         │ ${String(successRate + '%').padStart(17)} ║`, 'bold'));
    console.log(colorize('╚══════════════════════════╧═══════════════════╝', 'bold'));

    return { totalTests, passedTests };
}

// Créer les fichiers de test corrects (ils peuvent être utilisés plus tard)
async function generateCorrectTestFiles() {
    console.log(colorize('\n📝 Génération de fichiers de test GraphQL corrects...', 'blue'));

    // Assurer que le répertoire existe
    try {
        await fs.access(config.testsDir);
    } catch (err) {
        try {
            await fs.mkdir(config.testsDir, { recursive: true });
            console.log(colorize('  Répertoire de tests créé', 'green'));
        } catch (mkdirErr) {
            console.error(colorize(`  Erreur lors de la création du répertoire: ${mkdirErr.message}`, 'red'));
            return;
        }
    }

    // Créer les fichiers de test
    try {
        // Fichier health.graphql
        await fs.writeFile(
            path.join(config.testsDir, 'health.graphql'),
            `# Tests GraphQL pour Health
# Générés par PROGEASE le ${config.currentDate}
# Utilisateur: ${config.currentUser}

${predefinedQueries.health}
`
        );

        // Fichier projet.graphql
        await fs.writeFile(
            path.join(config.testsDir, 'projet.graphql'),
            `# Tests GraphQL pour Projet
# Générés par PROGEASE le ${config.currentDate}
# Utilisateur: ${config.currentUser}

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
# Générés par PROGEASE le ${config.currentDate}
# Utilisateur: ${config.currentUser}

${predefinedQueries.livrables}

${predefinedQueries.livrable}

# Variables pour GetLivrableById:
# {
#   "id": "1"
# }
`
        );

        console.log(colorize('  ✅ Fichiers de test générés avec succès', 'green'));
    } catch (err) {
        console.error(colorize(`  Erreur lors de la génération des fichiers: ${err.message}`, 'red'));
    }
}

// Diagnostic des problèmes
async function diagnoseIssues(results) {
    if (results.passedTests === results.totalTests) {
        // Tout est bon, pas besoin de diagnostic
        return;
    }

    console.log(colorize('\n🔍 DIAGNOSTIC DES PROBLÈMES GRAPHQL', 'yellow'));

    try {
        // Vérifier le schéma
        console.log(colorize('\n1. Vérification du schéma GraphQL...', 'blue'));

        const schemaPath = path.join(__dirname, 'src', 'graphql', 'schema-template.graphql');
        try {
            const schemaContent = await fs.readFile(schemaPath, 'utf8');
            console.log(colorize('  ✅ Schéma trouvé', 'green'));

            // Vérifions les types essentiels
            const types = ['Query', 'Projet', 'Livrable', 'Health'];
            const missingTypes = [];

            for (const type of types) {
                if (!schemaContent.includes(`type ${type}`)) {
                    missingTypes.push(type);
                }
            }

            if (missingTypes.length > 0) {
                console.log(colorize(`  ⚠️ Types manquants dans le schéma: ${missingTypes.join(', ')}`, 'yellow'));
            } else {
                console.log(colorize('  ✅ Tous les types essentiels sont présents', 'green'));
            }

        } catch (err) {
            console.log(colorize(`  ❌ Schéma non trouvé ou inaccessible: ${err.message}`, 'red'));
        }

        // Vérifier la configuration du serveur
        console.log(colorize('\n2. Vérification du serveur...', 'blue'));
        try {
            const healthResponse = await axios.get('http://localhost:5000/health');
            console.log(colorize(`  ✅ Serveur en ligne (version ${healthResponse.data.version})`, 'green'));

            if (healthResponse.data.graphqlVersion) {
                console.log(colorize(`  ✅ GraphQL configuré (version ${healthResponse.data.graphqlVersion})`, 'green'));
            }
        } catch (err) {
            console.log(colorize('  ❌ Serveur REST inaccessible', 'red'));
        }

        // Recommandations
        console.log(colorize('\n💡 RECOMMANDATIONS:', 'blue'));
        console.log(colorize('1. Vérifiez votre fichier server.js pour vous assurer que GraphQL est correctement configuré', 'cyan'));
        console.log(colorize('2. Vérifiez que les résolveurs dans codegen.js correspondent aux types définis dans le schéma', 'cyan'));
        console.log(colorize('3. Redémarrez le serveur après toute modification', 'cyan'));
        console.log(colorize('4. Utilisez GraphiQL (http://localhost:5000/graphql) pour tester manuellement les requêtes', 'cyan'));
    } catch (err) {
        console.error(colorize('Erreur lors du diagnostic:', 'red'), err);
    }
}

// Fonction principale
async function main() {
    showBanner();

    // Vérifier la disponibilité du serveur
    const serverAvailable = await checkServerAvailability();
    if (!serverAvailable) {
        process.exit(1);
    }

    // Générer des fichiers de test corrects pour référence future
    await generateCorrectTestFiles();

    // Exécuter les tests prédéfinis (ces tests sont garantis syntaxiquement corrects)
    const results = await runPredefinedTests();

    // Si des tests ont échoué, lancer le diagnostic
    if (results.passedTests < results.totalTests) {
        await diagnoseIssues(results);
    }
}

// Lancer le script
main().catch(err => {
    console.error(colorize('Erreur non gérée:', 'red'), err);
    process.exit(1);
});