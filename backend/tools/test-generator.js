/**
 * PROGEASE - Générateur de tests automatiques
 * Ce script analyse les fichiers du projet pour générer des tests Newman/Postman et GraphQL
 * Auteur: WalidBenTouhami
 * Date: 2025-05-27 19:27:50
 */

const fs = require('fs');
const path = require('path');
const util = require('util');

const readdir = util.promisify(fs.readdir);
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const mkdir = util.promisify(fs.mkdir);

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
        scripts.push("    // Stocker l'ID pour les tests suivants");
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
    console.log('Génération des tests GraphQL...');

    if (projectStructure.graphqlTypes.length === 0) {
        console.log('Aucun type GraphQL détecté. Génération de tests GraphQL ignorée.');
        return;
    }

    // Créer le répertoire de sortie s'il n'existe pas
    await mkdir(config.paths.output.graphql, { recursive: true });

    // Générer un fichier pour chaque type avec ses requêtes associées
    for (const type of projectStructure.graphqlTypes) {
        // Ignorer les types internes comme Query et Mutation
        if (['Query', 'Mutation', 'Subscription', 'Schema', '__Schema', '__Type'].includes(type.name)) {
            continue;
        }

        let testContent = `# Tests GraphQL pour ${type.name}
# Générés automatiquement le ${config.metadata.date}
# Auteur: ${config.metadata.author}

`;

        // Ajouter une requête pour récupérer tous les éléments du type
        const pluralName = type.name.toLowerCase() + 's';
        const queriesForType = projectStructure.graphqlQueries.filter(q =>
            q.returnType === type.name || q.name.toLowerCase() === pluralName || q.name.toLowerCase() === type.name.toLowerCase()
        );

        if (queriesForType.length > 0) {
            testContent += `# Requête pour récupérer tous les ${pluralName}
query GetAll${pluralName.charAt(0).toUpperCase() + pluralName.slice(1)} {
  ${queriesForType[0].name} {
    _id
${type.fields.map(f => `    ${f.name}`).join('\n')}
  }
}

`;

            // Ajouter une requête pour récupérer un élément spécifique
            const singularQueryName = projectStructure.graphqlQueries.find(q =>
                q.name.toLowerCase() === type.name.toLowerCase() ||
                q.name.toLowerCase() === `get${type.name.toLowerCase()}` ||
                q.name.toLowerCase() === `get${type.name.toLowerCase()}byid`
            );

            if (singularQueryName) {
                testContent += `# Requête pour récupérer un ${type.name.toLowerCase()} spécifique
query Get${type.name}ById($id: ID!) {
  ${singularQueryName.name}(id: $id) {
    _id
${type.fields.map(f => `    ${f.name}`).join('\n')}
  }
}

# Variables:
# {
#   "id": "5f8f8f8f8f8f8f8f8f8f8f8f"
# }

`;
            }
        }

        // Ajouter des mutations associées à ce type
        const mutationsForType = projectStructure.graphqlMutations.filter(m =>
            m.returnType === type.name ||
            m.name.toLowerCase().includes(type.name.toLowerCase())
        );

        if (mutationsForType.length > 0) {
            // Créer une mutation
            const createMutation = mutationsForType.find(m =>
                m.name.toLowerCase().startsWith('create') ||
                m.name.toLowerCase().startsWith('add')
            );

            if (createMutation) {
                testContent += `# Mutation pour créer un ${type.name.toLowerCase()}
mutation Create${type.name}($input: ${type.name}Input!) {
  ${createMutation.name}(input: $input) {
    _id
${type.fields.map(f => `    ${f.name}`).join('\n')}
  }
}

# Variables:
# {
#   "input": {
${type.fields
                    .filter(f => f.name !== '_id' && f.name !== 'id' && f.name !== 'createdAt' && f.name !== 'updatedAt')
                    .map(f => `#     "${f.name}": ${getGraphqlMockValue(f.type)}`)
                    .join(',\n')}
#   }
# }

`;
            }

            // Mettre à jour une mutation
            const updateMutation = mutationsForType.find(m =>
                m.name.toLowerCase().startsWith('update') ||
                m.name.toLowerCase().startsWith('edit')
            );

            if (updateMutation) {
                testContent += `# Mutation pour mettre à jour un ${type.name.toLowerCase()}
mutation Update${type.name}($id: ID!, $input: ${type.name}Input!) {
  ${updateMutation.name}(id: $id, input: $input) {
    _id
${type.fields.map(f => `    ${f.name}`).join('\n')}
  }
}

# Variables:
# {
#   "id": "5f8f8f8f8f8f8f8f8f8f8f8f",
#   "input": {
${type.fields
                    .filter(f => f.name !== '_id' && f.name !== 'id' && f.name !== 'createdAt' && f.name !== 'updatedAt')
                    .map(f => `#     "${f.name}": ${getGraphqlMockValue(f.type)}`)
                    .join(',\n')}
#   }
# }

`;
            }

            // Supprimer une mutation
            const deleteMutation = mutationsForType.find(m =>
                m.name.toLowerCase().startsWith('delete') ||
                m.name.toLowerCase().startsWith('remove')
            );

            if (deleteMutation) {
                testContent += `# Mutation pour supprimer un ${type.name.toLowerCase()}
mutation Delete${type.name}($id: ID!) {
  ${deleteMutation.name}(id: $id) {
    success
    message
  }
}

# Variables:
# {
#   "id": "5f8f8f8f8f8f8f8f8f8f8f8f"
# }

`;
            }
        }

        // Écrire le fichier de test GraphQL
        const outputPath = path.join(config.paths.output.graphql, `${type.name.toLowerCase()}.graphql`);
        await writeFile(outputPath, testContent, 'utf8');
    }

    console.log(`Tests GraphQL générés dans: ${config.paths.output.graphql}`);
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
    console.log('Démarrage du générateur de tests PROGEASE...');
    console.log(`Date d'exécution: ${config.metadata.date}`);
    console.log(`Utilisateur: ${config.metadata.author}`);
    console.log('-------------------------------------------');

    try {
        await analyzeModels();
        await analyzeRoutes();
        await analyzeGraphQL();

        await generateNewmanCollection();
        await generateGraphQLTests();

        console.log('-------------------------------------------');
        console.log('Génération de tests terminée avec succès!');
        console.log(`Tests Postman/Newman: ${config.paths.output.newman}`);
        console.log(`Tests GraphQL: ${config.paths.output.graphql}`);
    } catch (err) {
        console.error('Erreur lors de la génération des tests:', err);
        process.exit(1);
    }
}

// Exécuter la fonction principale
main();