const { validationResult } = require('express-validator');

/**
 * Middleware de validation pour les requêtes liées aux livrables
 * Vérifie les erreurs de validation et retourne une réponse 400 si des erreurs sont présentes
 *
 * @param {Object} req - Objet requête Express
 * @param {Object} res - Objet réponse Express
 * @param {Function} next - Fonction next d'Express pour passer au prochain middleware
 * @returns {Object|void} - Réponse d'erreur 400 ou passe au middleware suivant
 */
module.exports = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ erreurs: errors.array() });
    }
    next();
};