const fs = require('fs');
const path = require('path');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const { resolvers } = require('./index');

// Chargement du schéma depuis le fichier généré par generate schema.js
let typeDefs;

try {
    console.log("[GraphQL] Tentative de chargement du schéma...");

    // Utiliser directement le fichier schema.graphql généré
    const schemaPath = path.join(__dirname, 'my-apollo-graph/graphql/schema.graphql');

    if (!fs.existsSync(schemaPath)) {
        console.log("[GraphQL] Fichier de schéma non trouvé. Génération du schéma...");

        // Exécuter le script de génération de schéma
        const generateSchemaPath = path.join(__dirname, 'scripts/generate-schema.js');
        require(generateSchemaPath);

        // Vérifier à nouveau l'existence du fichier
        if (!fs.existsSync(schemaPath)) {
            throw new Error(`Le fichier schema.graphql n'existe pas à l'emplacement: ${schemaPath}`);
        }
    }

    // Charger le fichier schema.graphql
    typeDefs = fs.readFileSync(schemaPath, 'utf8');
    console.log("[GraphQL] Schéma chargé avec succès depuis:", schemaPath);

} catch (error) {
    console.error("[GraphQL] Erreur lors du chargement du schéma:", error);
    throw new Error("Impossible de charger le schéma GraphQL: " + error.message);
}

// Création du schéma exécutable
const schema = makeExecutableSchema({ typeDefs, resolvers });

console.log("[GraphQL] Schéma exécutable créé avec succès");
module.exports = { schema };