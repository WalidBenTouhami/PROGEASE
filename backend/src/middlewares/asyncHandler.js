/**
 * Wrapper pour gérer les erreurs asynchrones dans les routes
 * @param {Function} fn - Fonction asynchrone à wrapper
 * @returns {Function} Middleware Express
 */
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

module.exports = {
    asyncHandler
};