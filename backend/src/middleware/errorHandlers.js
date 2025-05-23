// src/middleware/errorHandlers.js
const logger = require('../utils/logger');

/**
 * Middleware pour gérer les routes non trouvées (404)
 */
const notFoundHandler = (req, res, next) => {
  logger.warn(`Route non trouvée: ${req.originalUrl}`, {
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  res.status(404).json({
    status: 'fail',
    message: `Route non trouvée: ${req.originalUrl}`
  });
};

/**
 * Middleware pour gérer les erreurs globales
 */
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Utiliser le logger pour enregistrer les erreurs de manière structurée
  logger.error(`${err.statusCode} - ${err.message}`, {
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userId: req.user?.id,
    body: req.body,
    params: req.params,
    query: req.query,
    errorName: err.name,
    errorCode: err.code,
    stack: err.stack
  });

  // Traitement spécifique des erreurs MongoDB
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(el => el.message);
    err.message = `Données invalides. ${errors.join('. ')}`;
    err.statusCode = 400;
  }

  // Gestion des erreurs de doublons MongoDB
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    err.message = `Valeur en doublon pour ${field}. Veuillez utiliser une autre valeur`;
    err.statusCode = 400;
  }

  // Gestion des erreurs de cast MongoDB
  if (err.name === 'CastError') {
    err.message = `ID invalide: ${err.value}`;
    err.statusCode = 400;
  }

  // Réponse en production
  if (process.env.NODE_ENV === 'production') {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.isOperational ? err.message : 'Une erreur inattendue est survenue'
    });
  }

  // Réponse en développement
  return res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stack: err.stack,
    error: err
  });
};

module.exports = {
  notFoundHandler,
  errorHandler
};