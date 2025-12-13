const { ForbiddenError } = require('apollo-server-express');

/**
 * Vérifie l'autorisation de l'utilisateur pour une opération
 * @param {Object} context - Le contexte GraphQL contenant les informations de l'utilisateur
 * @param {string} requiredRole - Le rôle requis pour l'opération (optionnel)
 * @returns {boolean} - Retourne true si l'utilisateur est autorisé
 * @throws {ForbiddenError} - Lance une erreur si l'utilisateur n'est pas autorisé
 */
function checkAuthorization(context, requiredRole = null) {
    if (!context.currentutilisateur) {
        throw new ForbiddenError('Non autorisé: utilisateur non authentifié');
    }

    // Si un rôle spécifique est requis, vérifiez-le ici
    if (requiredRole && context.currentutilisateur.role !== requiredRole) {
        throw new ForbiddenError(`Non autorisé: rôle ${requiredRole} requis`);
    }

    return true;
}

module.exports = {
    checkAuthorization,
};
