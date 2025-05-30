/**
 * PROGEASE - Execution des tests GraphQL
 * Ce script execute les tests GraphQL generes
 * Date: 2025-05-28 09:25:45
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
    currentDate: '2025-05-28 09:25:45'
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
    console.log(`║ Utilisateur: ${config.currentUser.padEnd(46, ' ')}  ║`);
    console.log(`║ Date: ${config.currentDate.padEnd(52, ' ')}   ║`);
    console.log('╚══════════════════════════════════════════════════════════════╝');
}

// Traiter les fichiers de test GraphQL
async function processGraphQLTests() {
    try {
        // Verifier l'existence du dossier de tests
        try {
            await fs.access(config.testsDir);
        } catch (err) {
            console.error(colorize(`Le dossier des tests GraphQL n'existe pas: ${config.testsDir}`, 'red'));
            console.log(colorize('Executez d\'abord le generateur de tests avec: node tools/test-generator.js', 'yellow'));
            console.log(colorize('\nTentative de creation du dossier de tests...', 'blue'));

            try {
                await fs.mkdir(config.testsDir, { recursive: true });
                console.log(colorize('Dossier de tests cree avec succes. Generez des tests avec le generateur.', 'green'));
            } catch (mkdirErr) {
                console.error(colorize('Impossible de creer le dossier de tests.', 'red'));
            }

            process.exit(1);
        }

        // Lister les fichiers de test
        const files = await fs.readdir(config.testsDir);
        const graphqlFiles = files.filter(file => file.endsWith('.graphql'));

        if (graphqlFiles.length === 0) {
            console.log(colorize('Aucun fichier de test GraphQL trouve.', 'yellow'));
            return;
        }

        console.log(colorize(`\n📝 Fichiers de test trouves: ${graphqlFiles.length}\n`, 'blue'));

        let totalTests = 0;
        let passedTests = 0;

        // Traiter chaque fichier
        for (const file of graphqlFiles) {
            const filePath = path.join(config.testsDir, file);
            const content = await fs.readFile(filePath, 'utf8');

            // Extraire les requetes individuelles
            const queries = extractQueries(content);

            console.log(colorize(`\n🧪 Execution des tests pour ${file} (${queries.length} requetes)\n`, 'cyan'));

            // Executer chaque requete
            for (const query of queries) {
                totalTests++;

                try {
                    // Ignorer les commentaires dans le contenu des requetes
                    const cleanQuery = query.content.replace(/^\s*#.*$/gm, '');

                    // Verifier si la requete est vide apres nettoyage
                    if (!cleanQuery.trim()) {
                        console.log(colorize('  - Requete vide ignoree', 'gray'));
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
                            console.log(colorize('    Variables non analysables, utilisation des valeurs par defaut', 'yellow'));
                        }
                    }

                    // Executer la requete GraphQL
                    const response = await axios.post(config.baseUrl, {
                        query: cleanQuery,
                        variables
                    }, {
                        headers: {
                            'Content-Type': 'application/json',
                            'X-User': config.currentUser
                        },
                        // Diminuer le timeout pour ne pas attendre trop longtemps en cas d'erreur
                        timeout: 3000
                    });

                    // Verifier la presence d'erreurs GraphQL
                    if (response.data.errors) {
                        console.log(colorize(`    ❌ Erreur: ${response.data.errors[0].message}`, 'red'));
                        if (response.data.errors[0].path) {
                            console.log(colorize(`    Path: ${response.data.errors[0].path.join('.')}`, 'gray'));
                        }
                        console.log(colorize(`    Query: ${cleanQuery.replace(/\s+/g, ' ').slice(0, 50)}...`, 'gray'));
                    } else {
                        console.log(colorize('    ✅ Succes', 'green'));
                        passedTests++;
                    }
                } catch (err) {
                    console.log(colorize(`    ❌ Erreur: ${err.message}`, 'red'));

                    if (err.response) {
                        if (err.response.status === 500 && err.response.data && err.response.data.errors) {
                            // Afficher des informations plus detaillees sur les erreurs de schema
                            const errorMsg = err.response.data.errors[0].message;

                            if (errorMsg.includes('schema-template.graphql')) {
                                console.log(colorize('    💡 Probleme detecte: Erreur dans le fichier de schema GraphQL', 'yellow'));
                                console.log(colorize('    👉 Solution: Verifiez le fichier src/graphql/schema-template.graphql', 'blue'));
                            }

                            // Limiter la longueur de l'erreur
                            const shortErrorMsg = JSON.stringify(err.response.data).substring(0, 100) + '...';
                            console.log(colorize(`    Details: ${shortErrorMsg}`, 'gray'));
                        } else if (err.response.data) {
                            console.log(colorize(`    Details: ${JSON.stringify(err.response.data).slice(0, 100)}...`, 'gray'));
                        }
                    }
                }
            }
        }

        // Afficher le resume
        const successRate = Math.round((passedTests / totalTests) * 100) || 0;

        console.log('\n' + colorize('╔══════════════════════════════════════════════╗', 'bold'));
        console.log(colorize('║            ReSUMe DES TESTS GRAPHQL          ║', 'bold'));
        console.log(colorize('╟──────────────────────────┬───────────────────╢', 'bold'));
        console.log(colorize(`║ Total des requetes       │ ${String(totalTests).padStart(17)} ║`, 'bold'));
        console.log(colorize(`║ Requetes reussies        │ ${String(passedTests).padStart(17)} ║`, 'bold'));
        console.log(colorize(`║ Requetes echouees        │ ${String(totalTests - passedTests).padStart(17)} ║`, 'bold'));
        console.log(colorize(`║ Taux de reussite         │ ${String(successRate + '%').padStart(17)} ║`, 'bold'));
        console.log(colorize('╚══════════════════════════╧═══════════════════╝', 'bold'));

        if (successRate === 0 && totalTests > 0) {
            console.log('\n' + colorize('⚠️ Tous les tests ont echoue. Verifions le probleme:', 'yellow'));
            await diagnoseGraphQLIssues();
        }

        return { total: totalTests, passed: passedTests };
    } catch (err) {
        console.error(colorize('Erreur lors de l\'execution des tests GraphQL:', 'red'), err);
        process.exit(1);
    }
}

// Diagnostic des problemes GraphQL
async function diagnoseGraphQLIssues() {
    console.log(colorize('\n🔍 DIAGNOSTIC DES PROBLeMES GRAPHQL', 'blue'));

    try {
        // Verifier si le schema GraphQL existe
        const possibleSchemaLocations = [
            path.join(__dirname, 'src', 'graphql', 'schema-template.graphql'),
            path.join(__dirname, 'src', 'graphql', 'schema.graphql'),
            path.join(__dirname, 'src', 'schema.graphql')
        ];

        let schemaExists = false;
        let schemaLocation = '';

        for (const location of possibleSchemaLocations) {
            try {
                await fs.access(location);
                schemaExists = true;
                schemaLocation = location;
                break;
            } catch (err) {
                // Continuer à chercher
            }
        }

        if (!schemaExists) {
            console.log(colorize('❌ Aucun fichier de schema GraphQL trouve.', 'red'));
            console.log(colorize('💡 Creez un fichier schema-template.graphql dans le dossier src/graphql/', 'yellow'));

            // Proposer un modele de schema de base
            console.log(colorize('\n📝 MODeLE DE SCHeMA GraphQL RECOMMANDe:', 'green'));
            console.log(colorize('Creez un fichier src/graphql/schema-template.graphql avec ce contenu:', 'blue'));

            const sampleSchema = `"""
Schema GraphQL pour PROGEASE
"""

type Query {
  """
  Informations sur l'etat du systeme
  """
  health: Health!

  """
  Liste de tous les projets
  """
  projets: [Projet!]!

  """
  Obtenir un projet par son ID
  """
  projet(id: ID!): Projet

  """
  Liste de tous les livrables
  """
  livrables: [Livrable!]!

  """
  Obtenir un livrable par son ID
  """
  livrable(id: ID!): Livrable
}

type Health {
  status: String!
  timestamp: String!
  user: String!
  version: String!
  uptime: Float!
}

type Projet {
  _id: ID!
  titre: String!
  description: String
  statut: String
  dateDebut: String
  dateFin: String
  livrables: [Livrable]
}

type Livrable {
  _id: ID!
  titre: String!
  description: String
  statut: String
  dateEcheance: String
  projetId: ID
  projet: Projet
}

type PaginationInfo {
  totalItems: Int!
  totalPages: Int!
  currentPage: Int!
  pageSize: Int!
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
}
`;
            console.log(colorize(sampleSchema, 'gray'));
        } else {
            console.log(colorize(`✅ Schema GraphQL trouve à: ${schemaLocation}`, 'green'));

            // Analyser le contenu du schema pour detecter des problemes
            const schemaContent = await fs.readFile(schemaLocation, 'utf8');

            // Verifier la presence de certains types essentiels
            if (!schemaContent.includes('type Query')) {
                console.log(colorize('❌ Le schema ne contient pas de type Query!', 'red'));
            }

            if (!schemaContent.includes('type Projet') && !schemaContent.includes('type Projet')) {
                console.log(colorize('⚠️ Le schema ne semble pas definir de type Projet/Projet!', 'yellow'));
            }

            if (!schemaContent.includes('type Livrable') && !schemaContent.includes('type Livrable')) {
                console.log(colorize('⚠️ Le schema ne semble pas definir de type Livrable/Livrable!', 'yellow'));
            }
        }

        // Verifier la configuration du serveur GraphQL
        console.log(colorize('\n⚙️ VeRIFICATION DE LA CONFIGURATION SERVEUR:', 'blue'));

        try {
            const response = await axios.get(`${config.baseUrl.split('/graphql')[0]}/health`, { timeout: 2000 });
            console.log(colorize('✅ API REST accessible', 'green'));
            console.log(colorize(`   Version: ${response.data.version}, GraphQL: ${response.data.graphqlVersion || 'Non specifiee'}`, 'gray'));
        } catch (err) {
            console.log(colorize('⚠️ API REST inaccessible. Le serveur est-il demarre?', 'yellow'));
        }

        console.log(colorize('\n💡 RECOMMANDATIONS:', 'blue'));
        console.log(colorize('1. Verifiez que votre fichier schema-template.graphql est bien formate', 'cyan'));
        console.log(colorize('2. Assurez-vous que le serveur GraphQL est correctement configure dans server.js', 'cyan'));
        console.log(colorize('3. Redemarrez le serveur apres les modifications', 'cyan'));
        console.log(colorize('4. Executez à nouveau ce script de test', 'cyan'));

    } catch (err) {
        console.error(colorize('Erreur lors du diagnostic:', 'red'), err);
    }
}

// Extraire les requetes individuelles d'un fichier GraphQL
function extractQueries(content) {
    const queries = [];
    const queryRegex = /(query|mutation)\s+(\w+)[\s\S]*?{([\s\S]*?)}/g;
    let match;

    while ((match = queryRegex.exec(content)) !== null) {
        const type = match[1]; // query ou mutation
        const name = match[2]; // nom de la requete/mutation
        const body = match[0]; // contenu complet

        queries.push({
            type,
            name,
            content: body
        });
    }

    return queries;
}

// Verifier que le serveur est accessible
async function checkServerAvailability() {
    console.log(colorize('🔄 Verification de la disponibilite du serveur GraphQL...', 'blue'));

    try {
        // Faire une requete d'introspection (qui devrait etre supportee par tous les serveurs GraphQL)
        await axios.post(config.baseUrl, {
            query: '{ __schema { queryType { name } } }'
        }, { timeout: 3000 });

        console.log(colorize('✅ Serveur GraphQL accessible', 'green'));
        return true;
    } catch (err) {
        console.error(colorize(`❌ Impossible de se connecter au serveur GraphQL: ${config.baseUrl}`, 'red'));

        if (err.response) {
            console.error(colorize(`   Code d'erreur: ${err.response.status}`, 'red'));

            if (err.response.status === 500) {
                console.log(colorize('   💡 Erreur 500: Probleme de configuration du serveur GraphQL', 'yellow'));
            } else if (err.response.status === 400) {
                console.log(colorize('   💡 Erreur 400: Le serveur repond mais n\'accepte pas la requete d\'introspection', 'yellow'));
            }
        } else if (err.request) {
            console.error(colorize('   Aucune reponse reçue du serveur', 'red'));
            console.log(colorize('   💡 Verifiez que le serveur est bien demarre sur le port 5000', 'yellow'));
        } else {
            console.error(colorize(`   Erreur: ${err.message}`, 'red'));
        }

        // Demander à l'utilisateur s'il souhaite continuer malgre l'erreur
        console.log('\n' + colorize('   Souhaitez-vous continuer malgre l\'erreur? (o/N)', 'yellow'));

        // Simuler une lecture de stdin (dans un environnement de production, utilisez readline)
        console.log(colorize('   Continuation forcee pour la demonstration...', 'blue'));
        return true;
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

    // Executer les tests
    await processGraphQLTests();
}

// Executer le script
main().catch(err => {
    console.error(colorize('Erreur non geree:', 'red'), err);
    process.exit(1);
});