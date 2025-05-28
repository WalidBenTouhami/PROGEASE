#!/usr/bin/env node
/**
 * PROGEASE - Générateur de tests automatiques (NINJA REFACTOR)
 * CLI Usage:
 *   node tools/test-generator.js --graphql            # Regenerate GraphQL tests from live schema
 *   node tools/test-generator.js --validate-graphql   # Validate GraphQL tests against live schema
 *   node tools/test-generator.js --rest               # Regenerate REST/Postman tests from Express app
 *   node tools/test-generator.js --validate-rest      # Validate Postman collection against Express app
 *   node tools/test-generator.js --docs               # Auto-generate API documentation from schema and route definitions
 */

const fs = require('fs');
const path = require('path');
const util = require('util');
const axios = require('axios');

const readdir = util.promisify(fs.readdir);
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const mkdir = util.promisify(fs.mkdir);

const GRAPHQL_URL = process.env.GRAPHQL_URL || 'http://localhost:5000/graphql';
const TESTS_DIR = path.join(__dirname, '..', 'tests', 'graphql');
const POSTMAN_COLLECTION_PATH = path.join(__dirname, '..', 'tests', 'postman', 'PROGEASE.postman_collection.json');

// Configuration
const config = {
    // Chemin vers les différents dossiers du projet
    paths: {
        models: path.join(__dirname, '..', 'src', 'models'),
        controllers: path.join(__dirname, '..', 'src', 'controllers'),
        routes: path.join(__dirname, '..', 'src', 'routes'),
        services: path.join(__dirname, '..', 'src', 'services'),
        validations: path.join(__dirname, '..', 'src', 'validations'),
        middleware: path.join(__dirname, '..', 'src', 'middleware'),
        // Chemins de sortie pour les tests générés
        output: {
            newman: path.join(__dirname, '..', 'tests', 'postman'),
            graphql: path.join(__dirname, '..', 'tests', 'graphql')
        }
    },
    // Métadonnées
    metadata: {
        author: 'WalidBenTouhami',
        date: '2025-05-27 19:27:50',
        version: '1.0.0'
    },
    // URL de base pour les tests API
    baseUrl: 'http://localhost:5000'
};

// Structure pour stocker les informations extraites
const projectStructure = {
    models: [],
    endpoints: [],
    graphqlTypes: [],
    graphqlQueries: [],
    graphqlMutations: []
};

/**
 * Parcourt les fichiers d'un répertoire de manière récursive
 */
async function scanDirectory(directory, filePattern) {
    try {
        const entries = await readdir(directory, { withFileTypes: true });

        let files = [];
        for (const entry of entries) {
            const fullPath = path.join(directory, entry.name);

            if (entry.isDirectory()) {
                files = files.concat(await scanDirectory(fullPath, filePattern));
            } else if (!filePattern || entry.name.match(filePattern)) {
                files.push(fullPath);
            }
        }

        return files;
    } catch (err) {
        if (err.code === 'ENOENT') {
            console.log(`Le répertoire ${directory} n'existe pas.`);
            return [];
        }
        throw err;
    }
}

/**
 * Analyse les fichiers de modèles pour extraire les structures de données
 */
async function analyzeModels() {
    console.log('Analyse des modèles...');
    const modelFiles = await scanDirectory(config.paths.models, /\.(js|ts)$/);

    for (const file of modelFiles) {
        try {
            const content = await readFile(file, 'utf8');
            const modelName = path.basename(file, path.extname(file));

            // Extraction des propriétés du modèle
            const fields = [];
            const schemaRegex = /new\s+Schema\s*\(\s*{([^}]*)}/s;
            const schemaMatch = content.match(schemaRegex);

            if (schemaMatch && schemaMatch[1]) {
                const fieldsContent = schemaMatch[1];
                const fieldRegex = /(\w+)\s*:\s*{([^}]*)}/g;
                let fieldMatch;

                while ((fieldMatch = fieldRegex.exec(fieldsContent)) !== null) {
                    const fieldName = fieldMatch[1];
                    const fieldDef = fieldMatch[2];

                    const typeRegex = /type\s*:\s*(\w+)/;
                    const requiredRegex = /required\s*:\s*(true|false)/;
                    const defaultRegex = /default\s*:\s*([^,\n]+)/;

                    const typeMatch = fieldDef.match(typeRegex);
                    const requiredMatch = fieldDef.match(requiredRegex);
                    const defaultMatch = fieldDef.match(defaultRegex);

                    fields.push({
                        name: fieldName,
                        type: typeMatch ? typeMatch[1] : 'String',
                        required: requiredMatch ? requiredMatch[1] === 'true' : false,
                        default: defaultMatch ? defaultMatch[1].trim() : undefined
                    });
                }
            }

            projectStructure.models.push({
                name: modelName,
                fields: fields,
                file: path.relative(path.join(__dirname, '..'), file)
            });
        } catch (err) {
            console.error(`Erreur lors de l'analyse du fichier ${file}:`, err);
        }
    }

    console.log(`${projectStructure.models.length} modèles analysés.`);
}

/**
 * Analyse les fichiers de routes pour détecter les endpoints API
 */
async function analyzeRoutes() {
    console.log('Analyse des routes...');
    const routeFiles = await scanDirectory(config.paths.routes, /\.(js|ts)$/);

    for (const file of routeFiles) {
        try {
            const content = await readFile(file, 'utf8');
            const routeName = path.basename(file, path.extname(file));

            // Extraction des endpoints (routes)
            const routeRegex = /router\.(get|post|put|delete|patch)\s*\(\s*['"]([^'"]+)['"]/g;
            let routeMatch;

            while ((routeMatch = routeRegex.exec(content)) !== null) {
                const method = routeMatch[1].toUpperCase();
                const endpoint = routeMatch[2];

                // Extraction du contrôleur associé
                const lineContext = content.substring(
                    Math.max(0, routeMatch.index - 100),
                    Math.min(content.length, routeMatch.index + 200)
                );

                const controllerRegex = new RegExp(`${method.toLowerCase()}\\s*\\(\\s*['"]${endpoint.replace(/\//g, '\\/')}['"]\\s*,\\s*([\\w.]+)`, 'i');
                const controllerMatch = lineContext.match(controllerRegex);
                const controller = controllerMatch ? controllerMatch[1] : 'unknown';

                projectStructure.endpoints.push({
                    method: method,
                    path: endpoint,
                    controller: controller,
                    routeFile: routeName,
                    file: path.relative(path.join(__dirname, '..'), file)
                });
            }
        } catch (err) {
            console.error(`Erreur lors de l'analyse du fichier ${file}:`, err);
        }
    }

    console.log(`${projectStructure.endpoints.length} endpoints détectés.`);
}

/**
 * Analyse les fichiers GraphQL pour extraire les types, requêtes et mutations
 */
async function analyzeGraphQL() {
    console.log('Analyse des définitions GraphQL...');

    // Chercher les fichiers GraphQL dans différents endroits possibles
    const gqlFolders = [
        path.join(__dirname, '..', 'src'),
        ];

    let gqlFiles = [];
    for (const folder of gqlFolders) {
        gqlFiles = gqlFiles.concat(await scanDirectory(folder, /\.(graphql|gql|js|ts)$/));
    }

    for (const file of gqlFiles) {
        try {
            const content = await readFile(file, 'utf8');

            // Extraction des types
            const typeRegex = /type\s+(\w+)\s*{([^}]*)}/g;
            let typeMatch;

            while ((typeMatch = typeRegex.exec(content)) !== null) {
                const typeName = typeMatch[1];
                const typeContent = typeMatch[2];

                const fields = [];
                const fieldRegex = /(\w+)\s*:\s*(\w+)/g;
                let fieldMatch;

                while ((fieldMatch = fieldRegex.exec(typeContent)) !== null) {
                    fields.push({
                        name: fieldMatch[1],
                        type: fieldMatch[2]
                    });
                }

                projectStructure.graphqlTypes.push({
                    name: typeName,
                    fields: fields,
                    file: path.relative(path.join(__dirname, '..'), file)
                });
            }

            // Extraction des requêtes
            const queryRegex = /type\s+Query\s*{([^}]*)}/;
            const queryMatch = content.match(queryRegex);

            if (queryMatch && queryMatch[1]) {
                const queriesContent = queryMatch[1];
                const queryFieldRegex = /(\w+)(?:\s*\([^)]*\))?\s*:\s*(\w+)/g;
                let queryFieldMatch;

                while ((queryFieldMatch = queryFieldRegex.exec(queriesContent)) !== null) {
                    projectStructure.graphqlQueries.push({
                        name: queryFieldMatch[1],
                        returnType: queryFieldMatch[2],
                        file: path.relative(path.join(__dirname, '..'), file)
                    });
                }
            }

            // Extraction des mutations
            const mutationRegex = /type\s+Mutation\s*{([^}]*)}/;
            const mutationMatch = content.match(mutationRegex);

            if (mutationMatch && mutationMatch[1]) {
                const mutationsContent = mutationMatch[1];
                const mutationFieldRegex = /(\w+)(?:\s*\([^)]*\))?\s*:\s*(\w+)/g;
                let mutationFieldMatch;

                while ((mutationFieldMatch = mutationFieldRegex.exec(mutationsContent)) !== null) {
                    projectStructure.graphqlMutations.push({
                        name: mutationFieldMatch[1],
                        returnType: mutationFieldMatch[2],
                        file: path.relative(path.join(__dirname, '..'), file)
                    });
                }
            }
        } catch (err) {
            console.error(`Erreur lors de l'analyse du fichier ${file}:`, err);
        }
    }

    console.log(`${projectStructure.graphqlTypes.length} types GraphQL détectés.`);
    console.log(`${projectStructure.graphqlQueries.length} requêtes GraphQL détectées.`);
    console.log(`${projectStructure.graphqlMutations.length} mutations GraphQL détectées.`);
}

/**
 * Génère une collection Postman/Newman à partir des données analysées
 */
async function generateNewmanCollection() {
    console.log('Génération de la collection Newman/Postman...');

    // Créer la structure de la collection
    const timestamp = Date.now();
    const collection = {
        info: {
            _postman_id: `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`.replace(/[xy]/g, (c) => {
                const r = (timestamp + Math.random() * 16) % 16 | 0;
                return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
            }),
            name: "PROGEASE API Tests (Auto-générés)",
            schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
            description: `Collection de tests auto-générés pour l'API PROGEASE - ${config.metadata.date}`
        },
        item: [
            {
                name: "1. Tests de Santé",
                item: [
                    {
                        name: "Vérifier l'état du serveur",
                        request: {
                            method: "GET",
                            header: [],
                            url: "{{baseUrl}}/health"
                        }
                    },
                    {
                        name: "Vérifier l'API principale",
                        request: {
                            method: "GET",
                            header: [],
                            url: "{{baseUrl}}/api"
                        }
                    }
                ]
            }
        ],
        variable: [
            {
                key: "baseUrl",
                value: config.baseUrl,
                type: "string"
            }
        ]
    };

    // Regrouper les endpoints par ressource (basé sur le premier segment de l'URL)
    const endpointGroups = {};

    projectStructure.endpoints.forEach(endpoint => {
        // Ignorer les routes de santé et API principale déjà incluses
        if (endpoint.path === '/health' || endpoint.path === '/api') {
            return;
        }

        // Déterminer le groupe (ressource) basé sur le chemin
        const segments = endpoint.path.split('/').filter(s => s);
        const resourceName = segments.length > 0 ? segments[0] : 'autres';

        if (!endpointGroups[resourceName]) {
            endpointGroups[resourceName] = [];
        }

        endpointGroups[resourceName].push(endpoint);
    });

    // Ajouter les groupes d'endpoints à la collection
    let groupCounter = 2; // commencer à 2 car nous avons déjà les tests de santé

    for (const [resource, endpoints] of Object.entries(endpointGroups)) {
        const itemGroup = {
            name: `${groupCounter}. Tests de ${resource}`,
            item: []
        };

        // Trouver le modèle associé à cette ressource
        const associatedModel = projectStructure.models.find(m =>
            m.name.toLowerCase() === resource.toLowerCase() ||
            m.name.toLowerCase() === resource.toLowerCase().slice(0, -1) // singulier
        );

        // Générer des exemples de données pour les tests
        const testData = associatedModel ? generateTestData(associatedModel) : {};

        // Trier les endpoints pour avoir un ordre logique: GET all, POST, GET one, PUT, DELETE
        endpoints.sort((a, b) => {
            const methodOrder = { GET: 1, POST: 2, PUT: 3, PATCH: 4, DELETE: 5 };
            if (a.method !== b.method) {
                return methodOrder[a.method] - methodOrder[b.method];
            }
            return a.path.localeCompare(b.path);
        });

        let subCounter = 1;
        endpoints.forEach(endpoint => {
            const testItem = {
                name: `${groupCounter}.${subCounter} ${endpoint.method} ${endpoint.path}`,
                request: {
                    method: endpoint.method,
                    header: [
                        {
                            key: "Content-Type",
                            value: "application/json"
                        }
                    ],
                    url: `{{baseUrl}}${endpoint.path}`
                }
            };

            // Ajouter un corps de requête pour POST, PUT, PATCH
            if (['POST', 'PUT', 'PATCH'].includes(endpoint.method) && Object.keys(testData).length > 0) {
                testItem.request.body = {
                    mode: "raw",
                    raw: JSON.stringify(testData, null, 2)
                };
            }

            // Scripts de test pour vérifier les réponses
            testItem.event = [
                {
                    listen: "test",
                    script: {
                        type: "text/javascript",
                        exec: generateTestScript(endpoint, resource)
                    }
                }
            ];

            itemGroup.item.push(testItem);
            subCounter++;
        });

        collection.item.push(itemGroup);
        groupCounter++;
    }

    // Ajouter une section pour les tests GraphQL si présents
    if (projectStructure.graphqlQueries.length > 0 || projectStructure.graphqlMutations.length > 0) {
        const graphqlGroup = {
            name: `${groupCounter}. Tests GraphQL`,
            item: []
        };

        // Ajouter des requêtes pour chaque query GraphQL
        let gqlCounter = 1;
        projectStructure.graphqlQueries.forEach(query => {
            const testItem = {
                name: `${groupCounter}.${gqlCounter} Query ${query.name}`,
                request: {
                    method: "POST",
                    header: [
                        {
                            key: "Content-Type",
                            value: "application/json"
                        }
                    ],
                    body: {
                        mode: "raw",
                        raw: JSON.stringify({
                            query: `query { ${query.name} { _id } }`
                        }, null, 2)
                    },
                    url: "{{baseUrl}}/graphql"
                },
                event: [
                    {
                        listen: "test",
                        script: {
                            type: "text/javascript",
                            exec: [
                                "pm.test(\"Status code is 200\", function () {",
                                "    pm.response.to.have.status(200);",
                                "});",
                                "",
                                "pm.test(\"Response has valid GraphQL data\", function () {",
                                "    var jsonData = pm.response.json();",
                                "    pm.expect(jsonData.data).to.exist;",
                                "});"
                            ]
                        }
                    }
                ]
            };

            graphqlGroup.item.push(testItem);
            gqlCounter++;
        });

        // Ajouter des requêtes pour chaque mutation GraphQL
        projectStructure.graphqlMutations.forEach(mutation => {
            const testItem = {
                name: `${groupCounter}.${gqlCounter} Mutation ${mutation.name}`,
                request: {
                    method: "POST",
                    header: [
                        {
                            key: "Content-Type",
                            value: "application/json"
                        }
                    ],
                    body: {
                        mode: "raw",
                        raw: JSON.stringify({
                            query: `mutation { ${mutation.name}(input: {}) { _id } }`
                        }, null, 2)
                    },
                    url: "{{baseUrl}}/graphql"
                },
                event: [
                    {
                        listen: "test",
                        script: {
                            type: "text/javascript",
                            exec: [
                                "pm.test(\"Status code is 200\", function () {",
                                "    pm.response.to.have.status(200);",
                                "});",
                                "",
                                "pm.test(\"Response has valid GraphQL data\", function () {",
                                "    var jsonData = pm.response.json();",
                                "    pm.expect(jsonData.data).to.exist;",
                                "});"
                            ]
                        }
                    }
                ]
            };

            graphqlGroup.item.push(testItem);
            gqlCounter++;
        });

        collection.item.push(graphqlGroup);
    }

    // Créer le répertoire de sortie s'il n'existe pas
    await mkdir(config.paths.output.newman, { recursive: true });

    // Écrire le fichier de collection
    const outputPath = path.join(config.paths.output.newman, 'PROGEASE.postman_collection.json');
    await writeFile(outputPath, JSON.stringify(collection, null, 2), 'utf8');

    console.log(`Collection Newman/Postman générée dans: ${outputPath}`);

    // Générer également un fichier d'environnement
    const environment = {
        id: `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`.replace(/[xy]/g, (c) => {
            const r = (timestamp + Math.random() * 16) % 16 | 0;
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        }),
        name: "PROGEASE Environment",
        values: [
            {
                key: "baseUrl",
                value: config.baseUrl,
                type: "default"
            },
            {
                key: "currentUser",
                value: config.metadata.author,
                type: "default"
            }
        ],
        _postman_variable_scope: "environment"
    };

    const envOutputPath = path.join(config.paths.output.newman, 'PROGEASE.postman_environment.json');
    await writeFile(envOutputPath, JSON.stringify(environment, null, 2), 'utf8');

    console.log(`Environnement Newman/Postman généré dans: ${envOutputPath}`);
}

/**
 * Génère des scripts de test pour un endpoint spécifique
 */
function generateTestScript(endpoint, resource) {
    const scripts = [
        "pm.test(\"Status code is successful\", function () {",
        "    pm.expect(pm.response.code).to.be.oneOf([200, 201, 202, 204]);",
        "});",
        ""
    ];

    if (endpoint.method === 'GET') {
        scripts.push("pm.test(\"Response format is correct\", function () {");
        scripts.push("    var jsonData = pm.response.json();");

        if (endpoint.path.match(/\/\w+\/:\w+/) || endpoint.path.includes('/:id')) {
            // GET détail
            scripts.push("    pm.expect(jsonData).to.be.an('object');");
            scripts.push(`    pm.expect(jsonData._id || jsonData.id).to.exist;`);
        } else {
            // GET liste
            scripts.push("    if (Array.isArray(jsonData)) {");
            scripts.push("        pm.expect(jsonData).to.be.an('array');");
            scripts.push("    } else if (jsonData.data || jsonData.items || jsonData." + resource + ") {");
            scripts.push(`        pm.expect(jsonData.data || jsonData.items || jsonData.${resource}).to.be.an('array');`);
            scripts.push("    }");
        }
        scripts.push("});");
    }

    else if (endpoint.method === 'POST') {
        scripts.push("pm.test(\"Response contains created item\", function () {");
        scripts.push("    var jsonData = pm.response.json();");
        scripts.push("    pm.expect(jsonData._id || jsonData.id).to.exist;");
        scripts.push("    ");
        scripts.push(`    pm.environment.set("${resource.toLowerCase()}Id", jsonData._id || jsonData.id);`);
        scripts.push("});");
    }

    else if (endpoint.method === 'PUT' || endpoint.method === 'PATCH') {
        scripts.push("pm.test(\"Item updated successfully\", function () {");
        scripts.push("    var jsonData = pm.response.json();");
        scripts.push("    pm.expect(jsonData._id || jsonData.id).to.exist;");
        scripts.push("});");
    }

    else if (endpoint.method === 'DELETE') {
        scripts.push("pm.test(\"Item deleted successfully\", function () {");
        scripts.push("    if (pm.response.headers.get('Content-Type') && pm.response.headers.get('Content-Type').includes('application/json')) {");
        scripts.push("        var jsonData = pm.response.json();");
        scripts.push("        pm.expect(jsonData.success || jsonData.deleted || jsonData.message).to.exist;");
        scripts.push("    }");
        scripts.push("});");
    }

    return scripts;
}

/**
 * Génère des données de test fictives basées sur un modèle
 */
function generateTestData(model) {
    const testData = {};

    if (!model || !model.fields) return testData;

    model.fields.forEach(field => {
        // Ne pas inclure les champs automatiquement générés
        if (field.name === '_id' || field.name === 'id' || field.name === 'createdAt' || field.name === 'updatedAt') {
            return;
        }

        switch (field.type.toLowerCase()) {
            case 'string':
                testData[field.name] = `Test ${field.name} ${Date.now()}`;
                break;
            case 'number':
                testData[field.name] = Math.floor(Math.random() * 100);
                break;
            case 'boolean':
                testData[field.name] = true;
                break;
            case 'date':
                testData[field.name] = new Date().toISOString();
                break;
            case 'objectid':
                // Laisser vide pour les relations, sauf si c'est requis
                if (field.required) {
                    testData[field.name] = "5f8f8f8f8f8f8f8f8f8f8f8f"; // ID fictif
                }
                break;
            case 'array':
                testData[field.name] = field.name === 'tags' ? ["test", "auto-generated"] : [];
                break;
            default:
                // Si type inconnu, assigner une valeur simple
                testData[field.name] = `Default value for ${field.name}`;
        }
    });

    return testData;
}

/**
 * Génère des fichiers de requêtes GraphQL à partir des types et requêtes détectés
 */
async function generateGraphQLTests() {
    console.log('[NINJA] Introspecting GraphQL schema...');
    const schema = await introspectGraphQLSchema();
    const queries = schema.types.find(t => t.name === schema.queryType.name).fields;
    const mutations = schema.mutationType ? schema.types.find(t => t.name === schema.mutationType.name).fields : [];
    const inputTypes = Object.fromEntries(schema.types.filter(t => t.kind === 'INPUT_OBJECT').map(t => [t.name, t]));

    await mkdir(TESTS_DIR, { recursive: true });
    const testFiles = [];

    // Generate queries
    for (const field of queries) {
        const { query, variables } = buildQueryOrMutationWithVars(field, 'query', inputTypes);
        const filePath = path.join(TESTS_DIR, `${field.name}.graphql`);
        await writeFile(filePath, `# Auto-generated test for query ${field.name}\n${query}\n\n# Variables:\n# ${JSON.stringify(variables, null, 2)}\n`);
        testFiles.push(filePath);
    }
    // Generate mutations
    for (const field of mutations) {
        const { query, variables } = buildQueryOrMutationWithVars(field, 'mutation', inputTypes);
        const filePath = path.join(TESTS_DIR, `${field.name}.graphql`);
        await writeFile(filePath, `# Auto-generated test for mutation ${field.name}\n${query}\n\n# Variables:\n# ${JSON.stringify(variables, null, 2)}\n`);
        testFiles.push(filePath);
    }
    console.log(`[NINJA] Generated ${testFiles.length} GraphQL test files in ${TESTS_DIR}`);
}

/**
 * Renvoie une valeur fictive adaptée au type GraphQL
 */
function getGraphqlMockValue(type) {
    switch (type.toLowerCase()) {
        case 'string':
            return '"Exemple de texte"';
        case 'int':
        case 'integer':
        case 'number':
            return '42';
        case 'float':
            return '3.14';
        case 'boolean':
            return 'true';
        case 'id':
            return '"5f8f8f8f8f8f8f8f8f8f8f8f"';
        case 'date':
        case 'datetime':
            return `"${new Date().toISOString()}"`;
        case '[string]':
            return '["item1", "item2"]';
        case '[int]':
        case '[integer]':
        case '[number]':
            return '[1, 2, 3]';
        default:
            return '"valeur"';
    }
}

/**
 * Fonction principale
 */
async function main() {
    const arg = process.argv[2];
    if (!arg || arg === '--help') {
        console.log(`\nUsage:\n  node tools/test-generator.js --graphql            # Regenerate GraphQL tests from live schema\n  node tools/test-generator.js --validate-graphql   # Validate GraphQL tests against live schema\n  node tools/test-generator.js --rest               # Regenerate REST/Postman tests from Express app\n  node tools/test-generator.js --validate-rest      # Validate Postman collection against Express app\n  node tools/test-generator.js --docs               # Auto-generate API documentation from schema and route definitions\n`);
        process.exit(0);
    }
    if (arg === '--graphql') {
        await generateGraphQLTests();
    } else if (arg === '--validate-graphql') {
        await validateGraphQLTests();
    } else if (arg === '--rest') {
        await generateRestTests();
    } else if (arg === '--validate-rest') {
        await validateRestTests();
    } else if (arg === '--docs') {
        await generateApiDocs();
        process.exit(0);
    } else {
        console.log('Unknown option:', arg);
        process.exit(1);
    }
}

async function introspectGraphQLSchema() {
    const introspectionQuery = {
        query: `{
            __schema {
                queryType { name }
                mutationType { name }
                types {
                    ...FullType
                }
            }
        }
        fragment FullType on __Type {
            kind
            name
            fields(includeDeprecated: true) {
                name
                args {
                    ...InputValue
                }
                type {
                    ...TypeRef
                }
            }
            inputFields {
                ...InputValue
            }
            interfaces { ...TypeRef }
            enumValues(includeDeprecated: true) { name }
            possibleTypes { ...TypeRef }
        }
        fragment InputValue on __InputValue {
            name
            type { ...TypeRef }
            defaultValue
        }
        fragment TypeRef on __Type {
            kind
            name
            ofType {
                kind
                name
                ofType {
                    kind
                    name
                    ofType {
                        kind
                        name
                    }
                }
            }
        }`
    };
    const res = await axios.post(GRAPHQL_URL, introspectionQuery, {
        headers: { 'Content-Type': 'application/json' }
    });
    return res.data.data.__schema;
}

function getTypeName(type) {
    if (!type) return '';
    if (type.kind === 'NON_NULL') return getTypeName(type.ofType);
    if (type.kind === 'LIST') return `[${getTypeName(type.ofType)}]`;
    return type.name;
}

function buildQueryOrMutation(field, type, inputTypes) {
    // type: 'query' or 'mutation'
    const args = (field.args || []).map(arg => {
        const typeStr = getTypeName(arg.type);
        return `$${arg.name}: ${typeStr}`;
    });
    const argStr = args.length ? `(${args.join(', ')})` : '';
    const callArgs = (field.args || []).map(arg => `${arg.name}: $${arg.name}`).join(', ');
    const callStr = callArgs ? `(${callArgs})` : '';
    return `${type} ${field.name}${argStr} {
        ${field.name}${callStr} {
            __typename
        }
    }`;
}

async function validateGraphQLTests() {
    console.log('[NINJA] Validating GraphQL test files against live schema...');
    const schema = await introspectGraphQLSchema();
    const validFields = new Set([
        ...schema.types.find(t => t.name === schema.queryType.name).fields.map(f => f.name),
        ...(schema.mutationType ? schema.types.find(t => t.name === schema.mutationType.name).fields.map(f => f.name) : [])
    ]);
    const files = await readdir(TESTS_DIR);
    let valid = true;
    for (const file of files) {
        if (!file.endsWith('.graphql')) continue;
        const name = file.replace('.graphql', '');
        if (!validFields.has(name)) {
            console.warn(`[NINJA] Test file ${file} does not match any field in schema. Consider removing.`);
            valid = false;
        }
    }
    if (valid) {
        console.log('[NINJA] All GraphQL test files are valid!');
    }
}

async function extractExpressRoutes() {
    // Dynamically require the Express app
    const app = require('../server');
    const routes = [];
    app._router.stack.forEach(middleware => {
        if (middleware.route) {
            // Route registered directly on the app
            routes.push({
                method: Object.keys(middleware.route.methods)[0].toUpperCase(),
                path: middleware.route.path
            });
        } else if (middleware.name === 'router' && middleware.handle.stack) {
            // Router middleware
            middleware.handle.stack.forEach(handler => {
                if (handler.route) {
                    routes.push({
                        method: Object.keys(handler.route.methods)[0].toUpperCase(),
                        path: handler.route.path
                    });
                }
            });
        }
    });
    return routes;
}

// Exécuter la fonction principale
main();

// [NINJA PRO IMPLEMENTATION] Realistic test data generation for GraphQL and REST

// Helper: Generate mock value for a given type and field name
function generateMockValue(type, fieldName) {
    if (!type) return null;
    const name = fieldName.toLowerCase();
    if (type === 'String') {
        if (name.includes('email')) return 'test@example.com';
        if (name.includes('url')) return 'https://example.com';
        if (name.includes('nom') || name.includes('name')) return 'Test Name';
        if (name.includes('titre') || name.includes('title')) return 'Titre Test';
        if (name.includes('description')) return 'Ceci est une description de test.';
        return 'Valeur de test';
    }
    if (type === 'Int' || type === 'Float' || type === 'Number') return 42;
    if (type === 'Boolean') return true;
    if (type === 'ID') return '5f8f8f8f8f8f8f8f8f8f8f8f';
    if (type.startsWith('[')) return [generateMockValue(type.replace(/\[|\]/g, ''), fieldName)];
    if (type === 'Date') return new Date().toISOString();
    return 'valeur';
}

// Helper: Recursively generate mock input for GraphQL input objects
function generateMockInput(inputType, inputTypes) {
    const obj = {};
    if (!inputType || !inputType.inputFields) return obj;
    for (const field of inputType.inputFields) {
        const typeName = getTypeName(field.type);
        if (typeName in inputTypes) {
            obj[field.name] = generateMockInput(inputTypes[typeName], inputTypes);
        } else {
            obj[field.name] = generateMockValue(typeName, field.name);
        }
    }
    return obj;
}

// Enhanced: Build query/mutation with variable set
function buildQueryOrMutationWithVars(field, type, inputTypes) {
    const args = (field.args || []).map(arg => {
        const typeStr = getTypeName(arg.type);
        return `$${arg.name}: ${typeStr}`;
    });
    const argStr = args.length ? `(${args.join(', ')})` : '';
    const callArgs = (field.args || []).map(arg => `${arg.name}: $${arg.name}`).join(', ');
    const callStr = callArgs ? `(${callArgs})` : '';
    // Generate variables
    const variables = {};
    for (const arg of field.args || []) {
        const typeName = getTypeName(arg.type);
        if (typeName in inputTypes) {
            variables[arg.name] = generateMockInput(inputTypes[typeName], inputTypes);
        } else {
            variables[arg.name] = generateMockValue(typeName, arg.name);
        }
    }
    return {
        query: `${type} ${field.name}${argStr} {\n  ${field.name}${callStr} {\n    __typename\n  }\n}`,
        variables
    };
}

// REST: Generate mock data for request bodies using Mongoose models
function generateRestMockData(model) {
    if (!model || !model.schema) return {};
    const obj = {};
    for (const [field, def] of Object.entries(model.schema.paths)) {
        if (field === '_id' || field === '__v') continue;
        if (def.isRequired || def.options.required) {
            const type = def.instance;
            obj[field] = generateMockValue(type, field);
        }
    }
    return obj;
}

// PATCH: Use mock data in REST test generation
async function generateRestTests() {
    console.log('[NINJA] Extracting Express routes...');
    const routes = await extractExpressRoutes();
    const collection = {
        info: {
            name: 'PROGEASE API Tests (Auto-generated)',
            schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
        },
        item: [],
        variable: [{ key: 'baseUrl', value: 'http://localhost:5000', type: 'string' }]
    };
    // Try to require models for mock data
    let models = {};
    try {
        const modelsDir = path.join(__dirname, '..', 'src', 'models');
        for (const file of fs.readdirSync(modelsDir)) {
            if (file.endsWith('.js')) {
                const modelName = file.replace('.model.js', '').replace('.js', '');
                models[modelName.toLowerCase()] = require(path.join(modelsDir, file));
            }
        }
    } catch (e) {}
    for (const route of routes) {
        const item = {
            name: `${route.method} ${route.path}`,
            request: {
                method: route.method,
                header: [{ key: 'Content-Type', value: 'application/json' }],
                url: `{{baseUrl}}${route.path}`
            }
        };
        // If POST/PUT/PATCH, add mock body
        if (['POST', 'PUT', 'PATCH'].includes(route.method)) {
            // Guess model from path
            const seg = route.path.split('/').filter(Boolean)[0];
            const model = models[seg && seg.toLowerCase()];
            if (model) {
                item.request.body = {
                    mode: 'raw',
                    raw: JSON.stringify(generateRestMockData(model), null, 2)
                };
            }
        }
        collection.item.push(item);
    }
    await mkdir(path.dirname(POSTMAN_COLLECTION_PATH), { recursive: true });
    await writeFile(POSTMAN_COLLECTION_PATH, JSON.stringify(collection, null, 2), 'utf8');
    console.log(`[NINJA] Generated Postman collection with ${routes.length} endpoints at ${POSTMAN_COLLECTION_PATH}`);
}

// [NINJA DOCS] Auto-generate API documentation from schema and route definitions
async function generateApiDocs() {
    const docsDir = path.join(__dirname, '..', 'docs');
    await mkdir(docsDir, { recursive: true });
    // --- GraphQL Docs ---
    const schema = await introspectGraphQLSchema();
    let md = `# GraphQL API Documentation\n\n`;
    md += `## Types\n`;
    for (const type of schema.types) {
        if (type.name.startsWith('__') || ['Query', 'Mutation', 'Subscription'].includes(type.name)) continue;
        md += `### ${type.name}\n`;
        if (type.fields) {
            md += '| Field | Type |\n|---|---|\n';
            for (const f of type.fields) {
                md += `| ${f.name} | ${getTypeName(f.type)} |\n`;
            }
        }
        if (type.inputFields) {
            md += '| Input Field | Type |\n|---|---|\n';
            for (const f of type.inputFields) {
                md += `| ${f.name} | ${getTypeName(f.type)} |\n`;
            }
        }
        md += '\n';
    }
    md += `## Queries\n`;
    const queries = schema.types.find(t => t.name === schema.queryType.name).fields;
    for (const q of queries) {
        md += `### ${q.name}\n`;
        if (q.args && q.args.length) {
            md += '**Arguments:**\n';
            md += '| Name | Type |\n|---|---|\n';
            for (const a of q.args) {
                md += `| ${a.name} | ${getTypeName(a.type)} |\n`;
            }
        }
        md += `**Returns:** ${getTypeName(q.type)}\n\n`;
    }
    if (schema.mutationType) {
        md += `## Mutations\n`;
        const mutations = schema.types.find(t => t.name === schema.mutationType.name).fields;
        for (const m of mutations) {
            md += `### ${m.name}\n`;
            if (m.args && m.args.length) {
                md += '**Arguments:**\n';
                md += '| Name | Type |\n|---|---|\n';
                for (const a of m.args) {
                    md += `| ${a.name} | ${getTypeName(a.type)} |\n`;
                }
            }
            md += `**Returns:** ${getTypeName(m.type)}\n\n`;
        }
    }
    await writeFile(path.join(docsDir, 'graphql-api.md'), md, 'utf8');
    console.log(`[NINJA] Generated GraphQL API docs at ${path.join(docsDir, 'graphql-api.md')}`);

    // --- REST Docs ---
    const routes = await extractExpressRoutes();
    let restMd = `# REST API Documentation\n\n`;
    restMd += '| Method | Path |\n|---|---|\n';
    for (const r of routes) {
        restMd += `| ${r.method} | ${r.path} |\n`;
    }
    restMd += '\n';
    // Try to require models for example bodies
    let models = {};
    try {
        const modelsDir = path.join(__dirname, '..', 'src', 'models');
        for (const file of fs.readdirSync(modelsDir)) {
            if (file.endsWith('.js')) {
                const modelName = file.replace('.model.js', '').replace('.js', '');
                models[modelName.toLowerCase()] = require(path.join(modelsDir, file));
            }
        }
    } catch (e) {}
    for (const r of routes) {
        if (['POST', 'PUT', 'PATCH'].includes(r.method)) {
            const seg = r.path.split('/').filter(Boolean)[0];
            const model = models[seg && seg.toLowerCase()];
            if (model) {
                restMd += `\n#### Example ${r.method} ${r.path} Body\n\n\`json\n${JSON.stringify(generateRestMockData(model), null, 2)}\n\n`;
            }
        }
    }
    await writeFile(path.join(docsDir, 'rest-api.md'), restMd, 'utf8');
    console.log(`[NINJA] Generated REST API docs at ${path.join(docsDir, 'rest-api.md')}`);
}