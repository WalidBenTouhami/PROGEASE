/**
 * Utilitaires de validation pour les entrées utilisateur
 * @module utils/validators
 */

'use strict';

const { AppError, ERROR_CODES } = require('../middleware/errorHandlers');

/**
 * Vérifie si une valeur est définie (non undefined et non null)
 * @param {*} value - Valeur à vérifier
 * @returns {boolean} True si la valeur est définie
 */
function isDefined(value) {
    return value !== undefined && value !== null;
}

/**
 * Vérifie si une valeur est du type attendu
 * @param {*} value - Valeur à vérifier
 * @param {string} type - Type attendu
 * @returns {boolean} True si la valeur correspond au type
 */
function isType(value, type) {
    if (!isDefined(value)) return true; // Skip validation if not defined

    switch (type) {
        case 'string':
            return typeof value === 'string';
        case 'number':
            return typeof value === 'number' && !isNaN(value);
        case 'boolean':
            return typeof value === 'boolean';
        case 'array':
            return Array.isArray(value);
        case 'object':
            return typeof value === 'object' && !Array.isArray(value) && value !== null;
        case 'date':
            return value instanceof Date ||
                (typeof value === 'string' && !isNaN(new Date(value).getTime())) ||
                (typeof value === 'number' && !isNaN(new Date(value).getTime()));
        default:
            return true; // Unknown type, skip validation
    }
}

/**
 * Valide une valeur selon les règles spécifiées
 * @param {*} value - Valeur à valider
 * @param {string} field - Nom du champ (pour les messages d'erreur)
 * @param {Object} rules - Règles de validation
 * @throws {AppError} Si la validation échoue
 */
function validateField(value, field, rules) {
    // Vérifier si requis
    if (rules.required && !isDefined(value)) {
        throw new AppError(
            `Le champ ${field} est requis`,
            400,
            ERROR_CODES.VALIDATION
        );
    }

    // Ignorer les champs non définis et non requis
    if (!isDefined(value)) return;

    // Vérifier le type
    if (rules.type && !isType(value, rules.type)) {
        throw new AppError(
            `Le champ ${field} doit être de type ${rules.type}`,
            400,
            ERROR_CODES.VALIDATION
        );
    }

    // Vérifier les contraintes spécifiques au type
    switch (rules.type) {
        case 'string':
            // Vérifier la longueur minimale
            if (rules.minLength !== undefined && value.length < rules.minLength) {
                throw new AppError(
                    `Le champ ${field} doit contenir au moins ${rules.minLength} caractères`,
                    400,
                    ERROR_CODES.VALIDATION
                );
            }

            // Vérifier la longueur maximale
            if (rules.maxLength !== undefined && value.length > rules.maxLength) {
                throw new AppError(
                    `Le champ ${field} ne doit pas dépasser ${rules.maxLength} caractères`,
                    400,
                    ERROR_CODES.VALIDATION
                );
            }

            // Vérifier le pattern (regex)
            if (rules.pattern && !new RegExp(rules.pattern).test(value)) {
                throw new AppError(
                    `Le champ ${field} ne respecte pas le format attendu`,
                    400,
                    ERROR_CODES.VALIDATION
                );
            }

            // Vérifier l'énumération
            if (rules.enum && !rules.enum.includes(value)) {
                throw new AppError(
                    `Le champ ${field} doit être l'une des valeurs suivantes: ${rules.enum.join(', ')}`,
                    400,
                    ERROR_CODES.VALIDATION
                );
            }
            break;

        case 'number':
            // Vérifier la valeur minimale
            if (rules.min !== undefined && value < rules.min) {
                throw new AppError(
                    `Le champ ${field} doit être supérieur ou égal à ${rules.min}`,
                    400,
                    ERROR_CODES.VALIDATION
                );
            }

            // Vérifier la valeur maximale
            if (rules.max !== undefined && value > rules.max) {
                throw new AppError(
                    `Le champ ${field} doit être inférieur ou égal à ${rules.max}`,
                    400,
                    ERROR_CODES.VALIDATION
                );
            }
            break;

        case 'array':
            // Vérifier la taille minimale
            if (rules.minItems !== undefined && value.length < rules.minItems) {
                throw new AppError(
                    `Le champ ${field} doit contenir au moins ${rules.minItems} élément(s)`,
                    400,
                    ERROR_CODES.VALIDATION
                );
            }

            // Vérifier la taille maximale
            if (rules.maxItems !== undefined && value.length > rules.maxItems) {
                throw new AppError(
                    `Le champ ${field} ne doit pas dépasser ${rules.maxItems} élément(s)`,
                    400,
                    ERROR_CODES.VALIDATION
                );
            }

            // Vérifier le type des éléments
            if (rules.itemType && value.length > 0) {
                value.forEach((item, index) => {
                    if (!isType(item, rules.itemType)) {
                        throw new AppError(
                            `L'élément ${index} du champ ${field} doit être de type ${rules.itemType}`,
                            400,
                            ERROR_CODES.VALIDATION
                        );
                    }
                });
            }
            break;

        case 'date':
            // Vérifier la date minimale
            if (rules.minDate) {
                const minDate = new Date(rules.minDate);
                const dateValue = new Date(value);
                if (dateValue < minDate) {
                    throw new AppError(
                        `Le champ ${field} doit être après ${minDate.toISOString().split('T')[0]}`,
                        400,
                        ERROR_CODES.VALIDATION
                    );
                }
            }

            // Vérifier la date maximale
            if (rules.maxDate) {
                const maxDate = new Date(rules.maxDate);
                const dateValue = new Date(value);
                if (dateValue > maxDate) {
                    throw new AppError(
                        `Le champ ${field} doit être avant ${maxDate.toISOString().split('T')[0]}`,
                        400,
                        ERROR_CODES.VALIDATION
                    );
                }
            }
            break;
    }

    // Validation personnalisée (si définie)
    if (rules.validate && typeof rules.validate === 'function') {
        const isValid = rules.validate(value);
        if (!isValid) {
            throw new AppError(
                rules.message || `Le champ ${field} n'est pas valide`,
                400,
                ERROR_CODES.VALIDATION
            );
        }
    }
}

/**
 * Valide un objet d'entrée selon un schéma de validation
 * @param {Object} input - Objet d'entrée à valider
 * @param {Object} schema - Schéma de validation
 * @throws {AppError} Si la validation échoue
 */
function validateInput(input, schema) {
    if (!input || typeof input !== 'object') {
        throw new AppError(
            'Les données d\'entrée doivent être un objet',
            400,
            ERROR_CODES.VALIDATION
        );
    }

    // Valider chaque champ selon le schéma
    Object.entries(schema).forEach(([field, rules]) => {
        validateField(input[field], field, rules);
    });

    return true;
}

module.exports = {
    validateInput,
    isDefined,
    isType
};