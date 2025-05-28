/**
 * Script de génération du schéma GraphQL avancé
 */
const path = require('path');
const fs = require('fs');
const {
    generateEnumDefinition,
    generateAllEnums,
    injectEnumsInSchema,
    generateSchemaFile
} = require('../schema-enum-generator');

// Chemins des fichiers
const templatePath = path.resolve(__dirname, '../my-apollo-graph/graphql/schema-template.graphql');
const outputPath = path.resolve(__dirname, '../my-apollo-graph/graphql/schema.graphql');
const enumsOnlyPath = path.resolve(__dirname, '../my-apollo-graph/graphql/enums.graphql');

try {
    // 1. Générer uniquement les énumérations dans un fichier séparé
    const allEnums = generateAllEnums();
    fs.writeFileSync(enumsOnlyPath, allEnums, 'utf8');
    console.log(`Fichier d'énumérations généré: ${enumsOnlyPath}`);

    // 2. Générer une définition d'énumération personnalisée
    const customEnum = generateEnumDefinition('PrioriteLivrable', {
        BASSE: 'BASSE',
        NORMALE: 'NORMALE',
        HAUTE: 'HAUTE',
        URGENTE: 'URGENTE'
    }, {
        BASSE: 'Priorité basse - non urgent',
        HAUTE: 'Priorité haute - à traiter rapidement'
    });
    console.log('Énumération personnalisée générée:');
    console.log(customEnum);

    // 3. Injecter les énumérations dans le schéma sans écrire de fichier
    if (fs.existsSync(templatePath)) {
        // Option 1 : Utiliser la variable pour afficher un aperçu du schéma
        const schemaWithEnums = injectEnumsInSchema(templatePath);
        console.log('Schéma avec énumérations injectées généré en mémoire');
        console.log('Aperçu des 200 premiers caractères:');
        console.log(schemaWithEnums.substring(0, 200) + '...');


    }

    // 4. Générer le fichier de schéma complet (comme actuellement)
    generateSchemaFile(templatePath, outputPath);
    console.log(`Schéma GraphQL complet généré: ${outputPath}`);

} catch (error) {
    console.error(`Erreur: ${error.message}`);
    process.exit(1);
}