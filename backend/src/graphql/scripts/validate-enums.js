const fs = require('fs');
const path = require('path');
const { Enum } = require('../../../config/constants');

console.log('Verification des enumerations...');

// Lire le schema GraphQL
const schemaPath = path.resolve(__dirname, '../my-apollo-graph/graphql/schema.graphql');
const schemaContent = fs.readFileSync(schemaPath, 'utf8');

// Extraire les enumerations du schema
function extractEnum(name, content) {
    const regex = new RegExp(`enum ${name} \\{([\\s\\S]*?)\\}`, 'g');
    const match = regex.exec(content);
    if (!match) return [];

    return match[1]
        .split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('"'))
        .map(line => line.split('#')[0].trim());
}

// Extraire toutes les enumerations du schema
const schemaEnums = {
    StatutProjet: extractEnum('StatutProjet', schemaContent),
    StatutLivrable: extractEnum('StatutLivrable', schemaContent)
};

// Verifier la correspondance
function checkSync(schemaValues, constantValues, name) {
    const constKeys = Object.keys(constantValues);

    const missingInSchema = constKeys.filter(key => !schemaValues.includes(key));
    const missingInConst = schemaValues.filter(key => !constKeys.includes(key));

    if (missingInSchema.length || missingInConst.length) {
        console.error(`❌ ${name}: Les enumerations ne sont pas synchronisees!`);

        if (missingInSchema.length) {
            console.error(`   Valeurs manquantes dans schema.graphql: ${missingInSchema.join(', ')}`);
        }

        if (missingInConst.length) {
            console.error(`   Valeurs manquantes dans constants.js: ${missingInConst.join(', ')}`);
        }

        return false;
    }

    // Verifier l'ordre des valeurs
    const schemaOrder = schemaValues.join(',');
    const constOrder = constKeys.join(',');
    if (schemaOrder !== constOrder) {
        console.warn(`⚠️ ${name}: L'ordre des enumerations differe entre le schema et les constantes`);
        console.warn('   Schema  :', schemaOrder);
        console.warn('   Constantes:', constOrder);
    }

    console.log(`✅ ${name}: Les enumerations sont synchronisees`);
    return true;
}

// Verifier toutes les enumerations
const enumResults = {
    projet: checkSync(schemaEnums.StatutProjet, Enum.StatutProjet, 'StatutProjet'),
    livrable: checkSync(schemaEnums.StatutLivrable, Enum.StatutLivrable, 'StatutLivrable')
};

// Verifier les references aux enumerations dans les types
const typeFields = {
    Projet: ['statut: StatutProjet!'],
    Livrable: ['statut: StatutLivrable!'],
    ProjetInput: ['statut: StatutProjet'],
    LivrableInput: ['statut: StatutLivrable'],
    ProjetUpdateInput: ['statut: StatutProjet'],
    LivrableUpdateInput: ['statut: StatutLivrable']
};

Object.entries(typeFields).forEach(([type, fields]) => {
    const typeRegex = new RegExp(`type ${type} {([^}]+)}`);
    const typeMatch = typeRegex.exec(schemaContent);

    if (!typeMatch) {
        console.error(`❌ Type ${type} non trouve dans le schema`);
        process.exit(1);
    }

    const typeContent = typeMatch[1];
    fields.forEach(field => {
        if (!typeContent.includes(field)) {
            console.error(`❌ Champ ${field} manquant dans le type ${type}`);
            process.exit(1);
        }
    });
});

if (Object.values(enumResults).every(result => result)) {
    console.log('✅ Toutes les enumerations sont synchronisees!');
    process.exit(0);
} else {
    console.error('❌ Certaines enumerations ne sont pas synchronisees!');
    process.exit(1);
}