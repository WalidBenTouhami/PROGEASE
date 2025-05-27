const fs = require('fs');
const path = require('path');
const { STATUTS_PROJET, STATUTS_LIVRABLE } = require('../config/constants');

console.log('Vérification des énumérations...');

// Lire le schéma GraphQL
const schemaPath = path.resolve(__dirname, '../src/graphql/schema-template.graphql');
const schemaContent = fs.readFileSync(schemaPath, 'utf8');

// Extraire les énumérations du schéma
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

const schemaStatutProjet = extractEnum('StatutProjet', schemaContent);
const schemaStatutLivrable = extractEnum('StatutLivrable', schemaContent);

// Vérifier la correspondance
function checkSync(schemaValues, constantValues, name) {
    const constKeys = Object.keys(constantValues);

    const missingInSchema = constKeys.filter(key => !schemaValues.includes(key));
    const missingInConst = schemaValues.filter(key => !constKeys.includes(key));

    if (missingInSchema.length || missingInConst.length) {
        console.error(`❌ ${name}: Les énumérations ne sont pas synchronisées!`);

        if (missingInSchema.length) {
            console.error(`   Valeurs manquantes dans schema.graphql: ${missingInSchema.join(', ')}`);
        }

        if (missingInConst.length) {
            console.error(`   Valeurs manquantes dans constants.js: ${missingInConst.join(', ')}`);
        }

        return false;
    }

    console.log(`✅ ${name}: Les énumérations sont synchronisées`);
    return true;
}

const projetSync = checkSync(schemaStatutProjet, STATUTS_PROJET, 'StatutProjet');
const livrableSync = checkSync(schemaStatutLivrable, STATUTS_LIVRABLE, 'StatutLivrable');

if (projetSync && livrableSync) {
    console.log('✅ Toutes les énumérations sont synchronisées!');
    process.exit(0);
} else {
    console.error('❌ Certaines énumérations ne sont pas synchronisées!');
    process.exit(1);
}