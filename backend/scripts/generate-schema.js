/**
 * Script de génération du schéma GraphQL
 */
const path = require('path');
const schemaGenerator = require('../src/graphql/schema-enum-generator');

const templatePath = path.resolve(__dirname, '../src/graphql/schema-template.graphql');
const outputPath = path.resolve(__dirname, '../src/graphql/schema.graphql');

// Générer le schéma avec les énumérations injectées
schemaGenerator.generateSchemaFile(templatePath, outputPath);

console.log('Schéma GraphQL généré avec succès!');