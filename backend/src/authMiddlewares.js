const jwt = require('jsonwebtoken');
const config = require('./config');
const logger = require('./utils/logger');

// Middleware pour verifier le token
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false,
        error: {
          code: 'AUTH_HEADER_MISSING',
          message: 'En-tête d\'autorisation manquant ou invalide'
        }
      });
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        error: {
          code: 'TOKEN_MISSING',
          message: 'Token d\'authentification manquant'
        }
      });
    }

    jwt.verify(token, config.authentification.secret, {
      algorithms: [config.authentification.algorithme],
      issuer: config.authentification.issuer,
      audience: config.authentification.audience
    }, (err, decoded) => {
      if (err) {
        logger.warn('Échec de vérification du token', {
          error: err.message,
          ip: req.ip,
          path: req.path
        });

        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({
            success: false,
            error: {
              code: 'TOKEN_EXPIRED',
              message: 'Token expiré'
            }
          });
        }

        if (err.name === 'JsonWebTokenError') {
          return res.status(401).json({
            success: false,
            error: {
              code: 'TOKEN_INVALID',
              message: 'Token invalide'
            }
          });
        }

        return res.status(401).json({
          success: false,
          error: {
            code: 'AUTH_FAILED',
            message: 'Échec de l\'authentification'
          }
        });
      }

      if (!decoded || !decoded.utilisateurId) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_TOKEN_PAYLOAD',
            message: 'Données du token invalides'
          }
        });
      }

      // Vérification de la date d'expiration
      if (decoded.exp && Date.now() >= decoded.exp * 1000) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'TOKEN_EXPIRED',
            message: 'Token expiré'
          }
        });
      }

      // Ajout des informations utilisateur à la requête
      req.utilisateur = {
        id: decoded.utilisateurId,
        role: decoded.role,
        email: decoded.email
      };

      // Ajout du token pour une utilisation ultérieure
      req.token = token;

      next();
    });
  } catch (error) {
    logger.error('Erreur dans le middleware d\'authentification', {
      error: error.message,
      stack: error.stack,
      ip: req.ip,
      path: req.path
    });

    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Erreur interne du serveur'
      }
    });
  }
};

// Middleware pour vérifier les rôles
const roleMiddleware = (roles) => {
  return (req, res, next) => {
    if (!req.utilisateur) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_REQUIRED',
          message: 'Authentification requise'
        }
      });
    }

    if (!roles.includes(req.utilisateur.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Accès non autorisé'
        }
      });
    }

    next();
  };
};

module.exports = {
  authMiddleware,
  roleMiddleware
};
