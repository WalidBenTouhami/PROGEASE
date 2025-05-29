/**
 * Middleware pour gerer les exceptions dans les routes asynchrones
 * evite de repeter les blocs try/catch dans chaque contrôleur
 *
 * @param {Function} fn - Fonction de gestionnaire de route asynchrone
 * @returns {Function} Middleware Express
 */
const asyncHandler = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

module.exports = { asyncHandler };