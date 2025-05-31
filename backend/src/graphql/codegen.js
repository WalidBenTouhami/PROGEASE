const fs = require('fs');
const path = require('path');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const { resolvers } = require('./index');

// Chargement du schema depuis le fichier genere par generate schema.js
let typeDefs;

try {
    console.log('[GraphQL] Tentative de chargement du schema...');

    // Utiliser directement le fichier schema.graphql genere
    const schemaPath = path.join(__dirname, 'my-apollo-graph/graphql/schema.graphql');

    if (!fs.existsSync(schemaPath)) {
        console.log('[GraphQL] Fichier de schema non trouve. Generation du schema...');

        // Executer le script de generation de schema
        const generateSchemaPath = path.join(__dirname, 'scripts/generate-schema.js');
        require(generateSchemaPath);

        // Verifier à nouveau l'existence du fichier
        if (!fs.existsSync(schemaPath)) {
            throw new Error(`Le fichier schema.graphql n'existe pas à l'emplacement: ${schemaPath}`);
        }
    }

    // Charger le fichier schema.graphql
    typeDefs = fs.readFileSync(schemaPath, 'utf8');
    console.log('[GraphQL] Schema charge avec succes depuis:', schemaPath);

} catch (error) {
    console.error('[GraphQL] Erreur lors du chargement du schema:', error);
    throw new Error('Impossible de charger le schema GraphQL: ' + error.message);
}

// Creation du schema executable
const schema = makeExecutableSchema({ typeDefs, resolvers });

console.log('[GraphQL] Schema executable cree avec succes');
module.exports = { schema };