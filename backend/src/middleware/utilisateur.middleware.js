const { validationResult } = require('express-validator');
const { verifierToken: verifierJWT } = require('../utils/jwt');
const logger = require('../utils/logger');
const Utilisateur = require('../models/utilisateur.model');

// Middleware de validation des données d'inscription
const validateInscription = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      message: 'Données d\'inscription invalides',
      errors: errors.array() 
    });
  }
  next();
};

// Middleware de validation des données de connexion
const validateConnexion = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      message: 'Données de connexion invalides',
      errors: errors.array() 
    });
  }
  next();
};

// Middleware de validation des données de mise à jour du profil
const validateMiseAJourProfil = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      message: 'Données de mise à jour invalides',
      errors: errors.array() 
    });
  }
  next();
};

// Middleware de validation des données de changement de mot de passe
const validateChangementMotDePasse = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      message: 'Données de changement de mot de passe invalides',
      errors: errors.array() 
    });
  }
  next();
};

// Middleware de vérification du token JWT
const verifierToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token d\'authentification manquant' 
      });
    }

    const decoded = await verifierJWT(token);
    req.user = decoded;
    next();
  } catch (error) {
    logger.error('Erreur de vérification du token:', error);
    return res.status(401).json({ 
      success: false, 
      message: 'Token invalide ou expiré' 
    });
  }
};

// Middleware de vérification du rôle
const verifierRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Utilisateur non authentifié' 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Accès non autorisé' 
      });
    }

    next();
  };
};

// Middleware de vérification de l'unicité de l'email
const verifierEmailUnique = async (req, res, next) => {
  try {
    const { email } = req.body;
    const utilisateur = await Utilisateur.findOne({ email });
    
    if (utilisateur) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cet email est déjà utilisé' 
      });
    }
    
    next();
  } catch (error) {
    logger.error('Erreur de vérification de l\'email:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la vérification de l\'email' 
    });
  }
};

// Middleware de vérification du propriétaire de la ressource
const verifierProprietaire = async (req, res, next) => {
  try {
    const { id } = req.params;
    const utilisateur = await Utilisateur.findById(id);
    
    if (!utilisateur) {
      return res.status(404).json({ 
        success: false, 
        message: 'Utilisateur non trouvé' 
      });
    }

    if (req.user.id !== utilisateur.id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Accès non autorisé' 
      });
    }

    next();
  } catch (error) {
    logger.error('Erreur de vérification du propriétaire:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la vérification du propriétaire' 
    });
  }
};

module.exports = {
  validateInscription,
  validateConnexion,
  validateMiseAJourProfil,
  validateChangementMotDePasse,
  verifierToken,
  verifierRole,
  verifierEmailUnique,
  verifierProprietaire
}; 