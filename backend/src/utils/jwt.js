const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * Génère un token JWT pour un utilisateur
 * @param {Object} utilisateur - L'utilisateur pour lequel générer le token
 * @returns {string} Le token JWT
 */
const genererToken = utilisateur => {
    return jwt.sign({ id: utilisateur._id }, config.jwt.secret, {
        expiresIn: config.jwt.expiresIn,
    });
};

/**
 * Vérifie un token JWT
 * @param {string} token - Le token à vérifier
 * @returns {Object} Les données décodées du token
 */
const verifierToken = token => {
    try {
        return jwt.verify(token, config.jwt.secret);
    } catch (error) {
        throw new Error('Token invalide ou expiré');
    }
};

module.exports = {
    genererToken,
    verifierToken,
};
