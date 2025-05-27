/**
 * Configuration GraphQL Code Generator
 */

const fs = require('fs');
const { STATUTS_PROJET, STATUTS_LIVRABLE } = require('./config/constants');

/**
 * Extrait les commentaires JSDoc d'un fichier
 */
function extractJSDocDescriptions(filePath, objectName) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const regex = new RegExp(`const\\s+${objectName}\\s*=\\s*Object\\.freeze\\(\\{([\\s\\S]*?)\\}\\)`, 'g');
        const match = regex.exec(content);

        if (!match) return {};

        const blockContent = match[1];
        const lines = blockContent.split('\n');

        const descriptions = {};
        let currentKey = null;
        let description = '';

        for (const line of lines) {
            const keyMatch = line.match(/^\s*(\w+):/);

            if (keyMatch) {
                if (currentKey && description) {
                    descriptions[currentKey] = description.trim();
                }

                currentKey = keyMatch[1];
                description = '';

                const commentMatch = line.match(/\/\/\s*(.*)/);
                if (commentMatch) {
                    description = commentMatch[1];
                }
            }
            else if (currentKey && line.includes('//')) {
                const commentMatch = line.match(/\/\/\s*(.*)/);
                if (commentMatch) {
                    if (description) {
                        description += ' ' + commentMatch[1];
                    } else {
                        description = commentMatch[1];
                    }
                }
            }
        }

        if (currentKey && description) {
            descriptions[currentKey] = description.trim();
        }

        return descriptions;
    } catch (error) {
        console.error(`Erreur lors de l'extraction des descriptions: ${error.message}`);
        return {};
    }
}

/**
 * Génère une définition d'énumération GraphQL
 */
function generateEnum(name, values, descriptions = {}) {
    let result = `"""
Énumération des statuts ${name === 'StatutProjet' ? 'de projet' : 'de livrable'}
"""
enum ${name} {\n`;

    for (const key of Object.keys(values)) {
        if (descriptions[key]) {
            result += `  """${descriptions[key]}"""\n`;
        }
        result += `  ${key}\n`;
    }

    result += '}';
    return result;
}

// Extraire les descriptions des constantes
const projetDescriptions = extractJSDocDescriptions('./config/constants.js', 'STATUTS_PROJET');
const livrableDescriptions = extractJSDocDescriptions('./config/constants.js', 'STATUTS_LIVRABLE');

// Générer les définitions d'énumérations
const statutProjetEnum = generateEnum('StatutProjet', STATUTS_PROJET, projetDescriptions);
const statutLivrableEnum = generateEnum('StatutLivrable', STATUTS_LIVRABLE, livrableDescriptions);

module.exports = {
    schema: [
        // Schéma de base (sans les énumérations)
        {
            './src/graphql/schema-template.graphql': {
                noRequire: true,
            }
        },
        // Ajouter les énumérations générées dynamiquement
        statutProjetEnum,
        statutLivrableEnum,
    ],
    generates: {
        // Générer le fichier schema.graphql final
        './src/graphql/schema.graphql': {
            plugins: ['schema-ast'],
            config: {
                includeDirectives: true,
                commentDescriptions: true,
                disableDescriptions: false,
                enumValues: {
                    StatutProjet: STATUTS_PROJET,
                    StatutLivrable: STATUTS_LIVRABLE,
                }
            }
        },
        // Générer des types TypeScript
        './src/graphql/types.ts': {
            plugins: ['typescript', 'typescript-resolvers'],
            config: {
                enumsAsTypes: false,
                constEnums: true,
                skipTypename: false,
                declarationKind: 'interface',
                scalars: {
                    Date: 'string',
                    JSON: '{ [key: string]: any }',
                }
            }
        }
    },
    hooks: {
        afterAllFileWrite: ['prettier --write "src/graphql/**/*.{ts,graphql}"']
    }
};