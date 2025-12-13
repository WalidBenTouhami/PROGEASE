/**
 * Generateur d'enumerations GraphQL - Version amelioree
 */
'use strict';

const fs = require('fs');
require('path');
const { STATUTS_PROJET, STATUTS_LIVRABLE, DESCRIPTIONS_ENUM } = require('../../config/constants');

/**
 * Extraction centralisee des informations de constantes avec gestion d'erreurs
 */
function getConstants() {
    try {
        // Verifications sans throw d'exceptions
        const defaultStatutsProjet = {
            PROPOSE: 'PROPOSE',
            EN_COURS: 'EN_COURS',
            TERMINE: 'TERMINE',
            ARCHIVE: 'ARCHIVE',
            ANNULE: 'ANNULE',
        };

        const defaultStatutsLivrable = {
            EN_ATTENTE: 'EN_ATTENTE',
            EN_COURS: 'EN_COURS',
            A_VALIDER: 'A_VALIDER',
            VALIDE: 'VALIDE',
            REJETE: 'REJETE',
            EN_RETARD: 'EN_RETARD',
            TERMINE: 'TERMINE',
            PLANIFIE: 'PLANIFIE',
        };

        // Utiliser des conditions sans throw
        const statutsProjet =
            !STATUTS_PROJET || Object.keys(STATUTS_PROJET).length === 0
                ? defaultStatutsProjet
                : STATUTS_PROJET;

        const statutsLivrable =
            !STATUTS_LIVRABLE || Object.keys(STATUTS_LIVRABLE).length === 0
                ? defaultStatutsLivrable
                : STATUTS_LIVRABLE;

        // Ajouter des logs d'avertissement si necessaire
        if (!STATUTS_PROJET || Object.keys(STATUTS_PROJET).length === 0) {
            console.warn(
                'STATUTS_PROJET est vide ou non defini, utilisation des valeurs par defaut'
            );
        }
        if (!STATUTS_LIVRABLE || Object.keys(STATUTS_LIVRABLE).length === 0) {
            console.warn(
                'STATUTS_LIVRABLE est vide ou non defini, utilisation des valeurs par defaut'
            );
        }

        return {
            STATUTS_PROJET: statutsProjet,
            STATUTS_LIVRABLE: statutsLivrable,
            DESCRIPTIONS_ENUM: DESCRIPTIONS_ENUM || {},
        };
    } catch (error) {
        console.error(`Erreur lors du chargement des constantes: ${error.message}`);

        // Valeurs par defaut de secours
        return {
            STATUTS_PROJET: {
                PROPOSE: 'PROPOSE',
                EN_COURS: 'EN_COURS',
                TERMINE: 'TERMINE',
                ARCHIVE: 'ARCHIVE',
                ANNULE: 'ANNULE',
            },
            STATUTS_LIVRABLE: {
                EN_ATTENTE: 'EN_ATTENTE',
                EN_COURS: 'EN_COURS',
                A_VALIDER: 'A_VALIDER',
                VALIDE: 'VALIDE',
                REJETE: 'REJETE',
                EN_RETARD: 'EN_RETARD',
                TERMINE: 'TERMINE',
                PLANIFIE: 'PLANIFIE',
            },
            DESCRIPTIONS_ENUM: {},
        };
    }
}

/**
 * Genere une definition d'enumeration GraphQL avec documentation
 */
function generateEnumDefinition(name, values, descriptions = {}) {
    let definition = `"""
enumeration des statuts ${name === 'StatutProjet' ? 'de projet' : 'de livrable'}
"""
enum ${name} {\n`;

    // Pour chaque valeur, ajouter une description si disponible
    Object.keys(values).forEach(key => {
        if (descriptions && descriptions[key]) {
            definition += `    """${descriptions[key]}"""\n`;
        }
        definition += `    ${key}\n`;
    });

    definition += '}';
    return definition;
}

/**
 * Genere toutes les enumerations necessaires pour le schema GraphQL
 */
function generateAllEnums() {
    const constants = getConstants();

    const statutProjetEnum = generateEnumDefinition(
        'StatutProjet',
        constants.STATUTS_PROJET,
        constants.DESCRIPTIONS_ENUM.STATUTS_PROJET
    );

    const statutLivrableEnum = generateEnumDefinition(
        'StatutLivrable',
        constants.STATUTS_LIVRABLE,
        constants.DESCRIPTIONS_ENUM.STATUTS_LIVRABLE
    );

    return `${statutProjetEnum}\n\n${statutLivrableEnum}`;
}

/**
 * Injecte les enumerations generees dans le template de schema
 */
function injectEnumsInSchema(schemaPath) {
    try {
        // Generer toutes les enumerations
        const enums = generateAllEnums();

        // Lire le schema template
        const schemaTemplate = fs.readFileSync(schemaPath, 'utf-8');

        // Remplacer les balises de commentaire par les enumerations generees
        if (schemaTemplate.includes('# ENUM_DEFINITIONS')) {
            return schemaTemplate.replace('# ENUM_DEFINITIONS', `# ENUM_DEFINITIONS\n${enums}`);
        } else {
            console.warn(
                'Le marqueur \'# ENUM_DEFINITIONS\' n\'a pas ete trouve dans le schema template.'
            );
            // Ajouter apres les directives
            const parts = schemaTemplate.split('\n\n');
            const directives = parts[0];
            const rest = parts.slice(1).join('\n\n');

            return `${directives}\n\n# ENUM_DEFINITIONS\n${enums}\n\n${rest}`;
        }
    } catch (error) {
        console.error(`Erreur lors de la generation des enumerations: ${error.message}`);
        throw error;
    }
}

/**
 * Genere un fichier de schema complet avec les enumerations injectees
 */
function generateSchemaFile(inputPath, outputPath) {
    try {
        // Verification sans throw d'exception
        if (!fs.existsSync(inputPath)) {
            console.error(`Erreur: Le fichier template n'existe pas: ${inputPath}`);
            return null; // Retourner null pour indiquer l'echec
        }

        const schema = injectEnumsInSchema(inputPath);

        // Verification
        if (!schema.includes('enum StatutProjet') || !schema.includes('enum StatutLivrable')) {
            console.warn(
                'ATTENTION: Les enumerations StatutProjet et/ou StatutLivrable ne semblent pas etre presentes dans le schema genere.'
            );
        }

        fs.writeFileSync(outputPath, schema, 'utf-8');
        console.log(`Schema GraphQL genere avec succes: ${outputPath}`);

        return schema;
    } catch (error) {
        console.error(`Erreur lors de la generation du fichier de schema: ${error.message}`);
        throw error;
    }
}

module.exports = {
    generateEnumDefinition,
    generateAllEnums,
    injectEnumsInSchema,
    generateSchemaFile,
};
