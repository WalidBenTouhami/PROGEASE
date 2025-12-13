/**
 * Script de generation du schema GraphQL avance
 */
const path = require('path');
const fs = require('fs');
const {
    generateEnumDefinition,
    generateAllEnums,
    injectEnumsInSchema,
    generateSchemaFile,
} = require('../schema-enum-generator');
const { Enum } = require('../../../config/constants');

// Chemins des fichiers
const templatePath = path.resolve(__dirname, '../my-apollo-graph/graphql/schema-template.graphql');
const outputPath = path.resolve(__dirname, '../my-apollo-graph/graphql/schema.graphql');
const enumsOnlyPath = path.resolve(__dirname, '../my-apollo-graph/graphql/enums.graphql');

try {
    // 1. Generer uniquement les enumerations dans un fichier separe
    const allEnums = generateAllEnums();
    fs.writeFileSync(enumsOnlyPath, allEnums, 'utf8');
    console.log(`Fichier d'enumerations genere: ${enumsOnlyPath}`);

    // 2. Generer les enumerations personnalisees
    const statutProjetEnum = generateEnumDefinition('StatutProjet', Enum.StatutProjet, {
        BROUILLON: 'Projet en cours de creation',
        EN_COURS: 'Projet actif et en cours de realisation',
        TERMINE: 'Projet termine avec succes',
        ARCHIVE: 'Projet archive',
        EN_RETARD: 'Projet en retard sur le planning',
        A_VENIR: 'Projet planifie mais non demarre',
    });

    const statutLivrableEnum = generateEnumDefinition('StatutLivrable', Enum.StatutLivrable, {
        EN_ATTENTE: 'Livrable en attente de demarrage',
        EN_COURS: 'Livrable en cours de realisation',
        EN_RETARD: 'Livrable en retard sur le planning',
        TERMINE: 'Livrable termine',
        VALIDE: 'Livrable valide par le tuteur',
        REJETE: 'Livrable rejete, necessite des modifications',
    });

    console.log('Enumerations personnalisees generees:');
    console.log(statutProjetEnum);
    console.log(statutLivrableEnum);

    // 3. Injecter les enumerations dans le schema sans ecrire de fichier
    if (fs.existsSync(templatePath)) {
        const schemaWithEnums = injectEnumsInSchema(templatePath);
        console.log('Schema avec enumerations injectees genere en memoire');
        console.log('Aperçu des 200 premiers caracteres:');
        console.log(schemaWithEnums.substring(0, 200) + '...');

        // Valider les types obligatoires
        const requiredTypes = [
            'Projet',
            'Livrable',
            'ProjetInput',
            'LivrableInput',
            'ProjetUpdateInput',
            'LivrableUpdateInput',
            'Pagination',
            'ProjetResponse',
            'LivrableResponse',
            'RisqueAnalyse',
        ];

        const missingTypes = requiredTypes.filter(
            type => !schemaWithEnums.includes(`type ${type}`)
        );
        if (missingTypes.length > 0) {
            throw new Error(`Types manquants dans le schema: ${missingTypes.join(', ')}`);
        }
    }

    // 4. Generer le fichier de schema complet
    generateSchemaFile(templatePath, outputPath);
    console.log(`Schema GraphQL complet genere: ${outputPath}`);

    // 5. Verifier la presence des champs obligatoires
    const schemaContent = fs.readFileSync(outputPath, 'utf8');

    const requiredFields = {
        Projet: ['_id', 'titre', 'description', 'statut', 'progression', 'estEnRetard'],
        Livrable: ['_id', 'intitule', 'description', 'dateLimite', 'statut', 'estEnRetard'],
        Pagination: ['total', 'pages', 'page', 'limit', 'hasNextPage', 'hasPreviousPage'],
    };

    Object.entries(requiredFields).forEach(([type, fields]) => {
        const typeRegex = new RegExp(`type ${type} {([^}]+)}`);
        const typeMatch = typeRegex.exec(schemaContent);

        if (!typeMatch) {
            throw new Error(`Type ${type} non trouve dans le schema`);
        }

        const typeContent = typeMatch[1];
        fields.forEach(field => {
            if (!typeContent.includes(field)) {
                throw new Error(`Champ obligatoire '${field}' manquant dans le type ${type}`);
            }
        });
    });

    console.log('✅ Validation des champs obligatoires reussie');
} catch (error) {
    console.error(`❌ Erreur: ${error.message}`);
    process.exit(1);
}
