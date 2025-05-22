// src/middleware/errorHandlers.js

/**
 * Middleware pour gérer les routes non trouvées (404)
 */
const notFoundHandler = (req, res, next) => {
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

  // Enregistrer toutes les erreurs
  console.error(`[${new Date().toISOString()}] ${err.message}`, {
    path: req.originalUrl,
    method: req.method,
    statusCode: err.statusCode,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });

  // Gestion des erreurs MongoDB
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

// Exporter les deux middlewares
module.exports = {
  notFoundHandler,
  errorHandler
};