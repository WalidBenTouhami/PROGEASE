/**
 * Utilitaires de validation pour les entrees utilisateur
 * @module utils/validators
 */

'use strict';

const { AppError, ERROR_CODES } = require('../middlewares/errorHandlers');

/**
 * Verifie si une valeur est definie (non undefined et non null)
 * @param {*} value - Valeur à verifier
 * @returns {boolean} True si la valeur est definie
 */
function isDefined(value) {
    return value !== undefined && value !== null;
}

/**
 * Verifie si une valeur est du type attendu
 * @param {*} value - Valeur à verifier
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
        return (
            value instanceof Date ||
                (typeof value === 'string' && !isNaN(new Date(value).getTime())) ||
                (typeof value === 'number' && !isNaN(new Date(value).getTime()))
        );
    default:
        return true; // Unknown type, skip validation
    }
}

/**
 * Valide une valeur selon les regles specifiees
 * @param {*} value - Valeur à valider
 * @param {string} field - Nom du champ (pour les messages d'erreur)
 * @param {Object} rules - Regles de validation
 * @throws {AppError} Si la validation echoue
 */
function validateField(value, field, rules) {
    // Verifier si requis
    if (rules.required && !isDefined(value)) {
        throw new AppError(`Le champ ${field} est requis`, 400, ERROR_CODES.VALIDATION);
    }

    // Ignorer les champs non definis et non requis
    if (!isDefined(value)) return;

    // Verifier le type
    if (rules.type && !isType(value, rules.type)) {
        throw new AppError(
            `Le champ ${field} doit etre de type ${rules.type}`,
            400,
            ERROR_CODES.VALIDATION
        );
    }

    // Verifier les contraintes specifiques au type
    switch (rules.type) {
    case 'string':
        // Verifier la longueur minimale
        if (rules.minLength !== undefined && value.length < rules.minLength) {
            throw new AppError(
                `Le champ ${field} doit contenir au moins ${rules.minLength} caracteres`,
                400,
                ERROR_CODES.VALIDATION
            );
        }

        // Verifier la longueur maximale
        if (rules.maxLength !== undefined && value.length > rules.maxLength) {
            throw new AppError(
                `Le champ ${field} ne doit pas depasser ${rules.maxLength} caracteres`,
                400,
                ERROR_CODES.VALIDATION
            );
        }

        // Verifier le pattern (regex)
        if (rules.pattern && !new RegExp(rules.pattern).test(value)) {
            throw new AppError(
                `Le champ ${field} ne respecte pas le format attendu`,
                400,
                ERROR_CODES.VALIDATION
            );
        }

        // Verifier l'enumeration
        if (rules.enum && !rules.enum.includes(value)) {
            throw new AppError(
                `Le champ ${field} doit etre l'une des valeurs suivantes: ${rules.enum.join(', ')}`,
                400,
                ERROR_CODES.VALIDATION
            );
        }
        break;

    case 'number':
        // Verifier la valeur minimale
        if (rules.min !== undefined && value < rules.min) {
            throw new AppError(
                `Le champ ${field} doit etre superieur ou egal à ${rules.min}`,
                400,
                ERROR_CODES.VALIDATION
            );
        }

        // Verifier la valeur maximale
        if (rules.max !== undefined && value > rules.max) {
            throw new AppError(
                `Le champ ${field} doit etre inferieur ou egal à ${rules.max}`,
                400,
                ERROR_CODES.VALIDATION
            );
        }
        break;

    case 'array':
        // Verifier la taille minimale
        if (rules.minItems !== undefined && value.length < rules.minItems) {
            throw new AppError(
                `Le champ ${field} doit contenir au moins ${rules.minItems} element(s)`,
                400,
                ERROR_CODES.VALIDATION
            );
        }

        // Verifier la taille maximale
        if (rules.maxItems !== undefined && value.length > rules.maxItems) {
            throw new AppError(
                `Le champ ${field} ne doit pas depasser ${rules.maxItems} element(s)`,
                400,
                ERROR_CODES.VALIDATION
            );
        }

        // Verifier le type des elements
        if (rules.itemType && value.length > 0) {
            value.forEach((item, index) => {
                if (!isType(item, rules.itemType)) {
                    throw new AppError(
                        `L'element ${index} du champ ${field} doit etre de type ${rules.itemType}`,
                        400,
                        ERROR_CODES.VALIDATION
                    );
                }
            });
        }
        break;

    case 'date':
        // Verifier la date minimale
        if (rules.minDate) {
            const minDate = new Date(rules.minDate);
            const dateValue = new Date(value);
            if (dateValue < minDate) {
                throw new AppError(
                    `Le champ ${field} doit etre apres ${minDate.toISOString().split('T')[0]}`,
                    400,
                    ERROR_CODES.VALIDATION
                );
            }
        }

        // Verifier la date maximale
        if (rules.maxDate) {
            const maxDate = new Date(rules.maxDate);
            const dateValue = new Date(value);
            if (dateValue > maxDate) {
                throw new AppError(
                    `Le champ ${field} doit etre avant ${maxDate.toISOString().split('T')[0]}`,
                    400,
                    ERROR_CODES.VALIDATION
                );
            }
        }
        break;
    }

    // Validation personnalisee (si definie)
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
 * Valide un objet d'entree selon un schema de validation
 * @param {Object} input - Objet d'entree à valider
 * @param {Object} schema - Schema de validation
 * @throws {AppError} Si la validation echoue
 */
function validateInput(input, schema) {
    if (!input || typeof input !== 'object') {
        throw new AppError(
            'Les donnees d\'entree doivent etre un objet',
            400,
            ERROR_CODES.VALIDATION
        );
    }

    // Valider chaque champ selon le schema
    Object.entries(schema).forEach(([field, rules]) => {
        validateField(input[field], field, rules);
    });

    return true;
}

module.exports = {
    validateInput,
    isDefined,
    isType,
};
