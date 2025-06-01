/**
 * Wrapper pour les fonctions asynchrones qui gère automatiquement les erreurs
 * @param {Function} fn - La fonction asynchrone à wrapper
 * @returns {Function} - Une fonction middleware Express qui gère les erreurs
 */
exports.catchAsync = fn => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
}; 