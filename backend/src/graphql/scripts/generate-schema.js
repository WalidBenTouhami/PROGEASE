/**
 * Script de generation du schema GraphQL avance
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
    // 1. Generer uniquement les enumerations dans un fichier separe
    const allEnums = generateAllEnums();
    fs.writeFileSync(enumsOnlyPath, allEnums, 'utf8');
    console.log(`Fichier d'enumerations genere: ${enumsOnlyPath}`);

    // 2. Generer une definition d'enumeration personnalisee
    const customEnum = generateEnumDefinition('PrioriteLivrable', {
        BASSE: 'BASSE',
        NORMALE: 'NORMALE',
        HAUTE: 'HAUTE',
        URGENTE: 'URGENTE'
    }, {
        BASSE: 'Priorite basse - non urgent',
        HAUTE: 'Priorite haute - à traiter rapidement'
    });
    console.log('enumeration personnalisee generee:');
    console.log(customEnum);

    // 3. Injecter les enumerations dans le schema sans ecrire de fichier
    if (fs.existsSync(templatePath)) {
        // Option 1 : Utiliser la variable pour afficher un aperçu du schema
        const schemaWithEnums = injectEnumsInSchema(templatePath);
        console.log('Schema avec enumerations injectees genere en memoire');
        console.log('Aperçu des 200 premiers caracteres:');
        console.log(schemaWithEnums.substring(0, 200) + '...');


    }

    // 4. Generer le fichier de schema complet (comme actuellement)
    generateSchemaFile(templatePath, outputPath);
    console.log(`Schema GraphQL complet genere: ${outputPath}`);

} catch (error) {
    console.error(`Erreur: ${error.message}`);
    process.exit(1);
}