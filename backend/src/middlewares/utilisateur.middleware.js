const jwt = require('jsonwebtoken');
const config = require('../config');
const logger = require('../utils/logger');
const { UtilisateurModel } = require('../models/utilisateur.model');

/**
 * Middleware pour vérifier le token JWT et authentifier l'utilisateur
 */
const verifierToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Token manquant' });
    }

    const decoded = jwt.verify(token, config.jwtSecret);
    const utilisateur = await UtilisateurModel.findById(decoded.id);

    if (!utilisateur) {
      return res.status(401).json({ message: 'Utilisateur non trouvé' });
    }

    req.utilisateur = utilisateur;
    next();
  } catch (error) {
    logger.error('Erreur de vérification du token:', error);
    return res.status(401).json({ message: 'Token invalide' });
  }
};

/**
 * Middleware pour vérifier les rôles de l'utilisateur
 */
const verifierRole = (roles) => {
  return (req, res, next) => {
    if (!req.utilisateur) {
      return res.status(401).json({ message: 'Non authentifié' });
    }

    if (!roles.includes(req.utilisateur.role)) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    next();
  };
};

module.exports = {
  verifierToken,
  verifierRole
}; 