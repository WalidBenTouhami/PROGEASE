/**
 * PROGEASE - Exécution des tests GraphQL
 * Ce script exécute les tests GraphQL générés
 * Date : 2025-05-27 19:46:03
 * Utilisateur : WalidBenTouhami
 */

const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');

// Couleurs ANSI pour le terminal (pas besoin de chalk)
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
    currentDate: '2025-05-27 19:46:03'
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
    console.log(`║ Utilisateur: ${config.currentUser.padEnd(46, ' ')}║`);
    console.log(`║ Date: ${config.currentDate.padEnd(52, ' ')}║`);
    console.log('╚══════════════════════════════════════════════════════════════╝');
}

// Traiter les fichiers de test GraphQL
async function processGraphQLTests() {
    try {
        // Vérifier l'existence du dossier de tests
        try {
            await fs.access(config.testsDir);
        } catch (err) {
            console.error(colorize(`Le dossier des tests GraphQL n'existe pas: ${config.testsDir}`, 'red'));
            console.log(colorize('Exécutez d\'abord le générateur de tests avec: node tools/test-generator.js', 'yellow'));
            console.log(colorize('\nTentative de création du dossier de tests...', 'blue'));

            try {
                await fs.mkdir(config.testsDir, { recursive: true });
                console.log(colorize('Dossier de tests créé avec succès. Générez des tests avec le générateur.', 'green'));
            } catch (mkdirErr) {
                console.error(colorize('Impossible de créer le dossier de tests.', 'red'));
            }

            process.exit(1);
        }

        // Lister les fichiers de test
        const files = await fs.readdir(config.testsDir);
        const graphqlFiles = files.filter(file => file.endsWith('.graphql'));

        if (graphqlFiles.length === 0) {
            console.log(colorize('Aucun fichier de test GraphQL trouvé.', 'yellow'));
            return;
        }

        console.log(colorize(`\n📝 Fichiers de test trouvés: ${graphqlFiles.length}\n`, 'blue'));

        let totalTests = 0;
        let passedTests = 0;

        // Traiter chaque fichier
        for (const file of graphqlFiles) {
            const filePath = path.join(config.testsDir, file);
            const content = await fs.readFile(filePath, 'utf8');

            // Extraire les requêtes individuelles
            const queries = extractQueries(content);

            console.log(colorize(`\n🧪 Exécution des tests pour ${file} (${queries.length} requêtes)\n`, 'cyan'));

            // Exécuter chaque requête
            for (const query of queries) {
                totalTests++;

                try {
                    // Ignorer les commentaires dans le contenu des requêtes
                    const cleanQuery = query.content.replace(/^\s*#.*$/gm, '');

                    // Vérifier si la requête est vide après nettoyage
                    if (!cleanQuery.trim()) {
                        console.log(colorize(`  - Requête vide ignorée`, 'gray'));
                        continue;
                    }

                    console.log(colorize(`  - ${query.type}: ${query.name}`, 'blue'));

                    // Extraire les variables d'exemple si elles existent
                    let variables = {};
                    const variablesMatch = content.match(new RegExp(`${query.name}[\\s\\S]*?Variables:[\\s\\n]*({[\\s\\S]*?})`, 'i'));
                    if (variablesMatch && variablesMatch[1]) {
                        try {
                            // Nettoyer le texte des commentaires et convertir en JSON
                            const cleanedVars = variablesMatch[1].replace(/^\s*#\s*/gm, '').trim();
                            variables = JSON.parse(cleanedVars);
                        } catch (e) {
                            console.log(colorize(`    Variables non analysables, utilisation des valeurs par défaut`, 'yellow'));
                        }
                    }

                    // Exécuter la requête GraphQL
                    const response = await axios.post(config.baseUrl, {
                        query: cleanQuery,
                        variables
                    }, {
                        headers: {
                            'Content-Type': 'application/json',
                            'X-User': config.currentUser
                        }
                    });

                    // Vérifier la présence d'erreurs GraphQL
                    if (response.data.errors) {
                        console.log(colorize(`    ❌ Erreur: ${response.data.errors[0].message}`, 'red'));
                        console.log(colorize(`    Query: ${cleanQuery.replace(/\s+/g, ' ').slice(0, 50)}...`, 'gray'));
                    } else {
                        console.log(colorize(`    ✅ Succès`, 'green'));
                        passedTests++;
                    }
                } catch (err) {
                    console.log(colorize(`    ❌ Erreur: ${err.message}`, 'red'));
                    if (err.response && err.response.data) {
                        console.log(colorize(`    Détails: ${JSON.stringify(err.response.data).slice(0, 100)}...`, 'gray'));
                    }
                }
            }
        }

        // Afficher le résumé
        const successRate = Math.round((passedTests / totalTests) * 100) || 0;

        console.log('\n' + colorize('╔══════════════════════════════════════════════╗', 'bold'));
        console.log(colorize(`║            RÉSUMÉ DES TESTS GRAPHQL          ║`, 'bold'));
        console.log(colorize('╟──────────────────────────┬───────────────────╢', 'bold'));
        console.log(colorize(`║ Total des requêtes       │ ${String(totalTests).padStart(17)} ║`, 'bold'));
        console.log(colorize(`║ Requêtes réussies        │ ${String(passedTests).padStart(17)} ║`, 'bold'));
        console.log(colorize(`║ Requêtes échouées        │ ${String(totalTests - passedTests).padStart(17)} ║`, 'bold'));
        console.log(colorize(`║ Taux de réussite         │ ${String(successRate + '%').padStart(17)} ║`, 'bold'));
        console.log(colorize('╚══════════════════════════╧═══════════════════╝', 'bold'));

        return { total: totalTests, passed: passedTests };
    } catch (err) {
        console.error(colorize('Erreur lors de l\'exécution des tests GraphQL:', 'red'), err);
        process.exit(1);
    }
}

// Extraire les requêtes individuelles d'un fichier GraphQL
function extractQueries(content) {
    const queries = [];
    const queryRegex = /(query|mutation)\s+(\w+)[\s\S]*?{([\s\S]*?)}/g;
    let match;

    while ((match = queryRegex.exec(content)) !== null) {
        const type = match[1]; // query ou mutation
        const name = match[2]; // nom de la requête/mutation
        const body = match[0]; // contenu complet

        queries.push({
            type,
            name,
            content: body
        });
    }

    return queries;
}

// Vérifier que le serveur est accessible
async function checkServerAvailability() {
    try {
        // Faire une simple requête introspection pour vérifier si le serveur est en ligne
        // Cette requête est universellement supportée par les serveurs GraphQL
        await axios.post(config.baseUrl, {
            query: `{ __schema { queryType { name } } }`
        }, { timeout: 5000 });

        console.log(colorize('✅ Serveur GraphQL accessible', 'green'));
        return true;
    } catch (err) {
        console.error(colorize(`❌ Impossible de se connecter au serveur GraphQL: ${config.baseUrl}`, 'red'));

        // Vérifier si le serveur est en cours d'exécution, mais avec des erreurs GraphQL
        if (err.response && err.response.status === 400) {
            // Le serveur est actif, mais il y a une erreur dans la requête.
            if (err.response.data && err.response.data.errors) {
                console.log(colorize('   Le serveur répond mais avec des erreurs dans la syntaxe GraphQL.', 'yellow'));
                console.log(colorize('   Cela peut indiquer que le schéma est différent de celui attendu.', 'yellow'));
                console.log(colorize('\n   Vérification alternative...', 'blue'));

                // Tentative alternative-juste vérifier que le endpoint répond.
                try {
                    await axios.get(config.baseUrl.split('/graphql')[0], { timeout: 5000 });
                    console.log(colorize('   ✅ Le serveur de base répond, on continue les tests', 'green'));
                    return true;
                } catch (baseErr) {
                    console.error(colorize('   ❌ Échec de la vérification alternative', 'red'));
                }
            }
        }

        if (err.response) {
            console.error(colorize(`   Code d'erreur: ${err.response.status}`, 'red'));
        } else if (err.request) {
            console.error(colorize('   Aucune réponse reçue du serveur', 'red'));
        } else {
            console.error(colorize(`   Erreur: ${err.message}`, 'red'));
        }

        // Demander à l'utilisateur s'il souhaite continuer malgré l'erreur
        console.log('\n' + colorize('   Souhaitez-vous continuer malgré l\'erreur? (o/N)', 'yellow'));

        // Simuler une lecture de stdin (dans un environnement de production, utilisez readline)
        // Pour l'instant, continuons automatiquement pour la démonstration
        console.log(colorize('   Continuation forcée pour la démonstration...', 'blue'));
        return true;
    }
}

// Exécuter les tests en mode examen simple (sans serveur)
async function runInspectionMode() {
    console.log(colorize('\n📋 Mode Examen - Inspection des tests GraphQL disponibles', 'blue'));

    try {
        // Vérifier l'existence du dossier de tests
        try {
            await fs.access(config.testsDir);
        } catch (err) {
            console.error(colorize(`Le dossier des tests GraphQL n'existe pas: ${config.testsDir}`, 'red'));
            return;
        }

        // Lister les fichiers de test
        const files = await fs.readdir(config.testsDir);
        const graphqlFiles = files.filter(file => file.endsWith('.graphql'));

        if (graphqlFiles.length === 0) {
            console.log(colorize('Aucun fichier de test GraphQL trouvé.', 'yellow'));
            return;
        }

        console.log(colorize(`\nFichiers de tests disponibles: ${graphqlFiles.length}`, 'green'));

        for (const file of graphqlFiles) {
            const filePath = path.join(config.testsDir, file);
            const content = await fs.readFile(filePath, 'utf8');

            // Extraire les requêtes individuelles
            const queries = extractQueries(content);

            console.log(colorize(`\n📄 ${file} - ${queries.length} requêtes:`, 'cyan'));

            for (const query of queries) {
                console.log(colorize(`  • ${query.type}: ${query.name}`, 'blue'));
            }
        }
    } catch (err) {
        console.error(colorize('Erreur lors de l\'inspection des tests GraphQL:', 'red'), err);
    }
}

// Fonction principale
async function main() {
    showBanner();

    // Vérifier la disponibilité du serveur
    const serverAvailable = await checkServerAvailability();
    if (!serverAvailable) {
        console.log(colorize('\nPassage en mode inspection...', 'yellow'));
        await runInspectionMode();
        process.exit(1);
    }

    // Exécuter les tests
    await processGraphQLTests();
}

// Exécuter le script
main().catch(err => {
    console.error(colorize('Erreur non gérée:', 'red'), err);
    process.exit(1);
});