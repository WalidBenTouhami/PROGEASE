/**
 * Classe d'erreur personnalisée pour l'application
 * @extends Error
 */
class AppError extends Error {
    /**
     * Crée une nouvelle instance d'erreur
     * @param {string} message - Message d'erreur
     * @param {number} statusCode - Code de statut HTTP
     * @param {string} [code] - Code d'erreur personnalisé
     * @param {Object} [details] - Détails supplémentaires de l'erreur
     */
    constructor(message, statusCode, code = 'INTERNAL_SERVER_ERROR', details = {}) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'echec' : 'erreur';
        this.code = code;
        this.details = details;
        this.isOperational = true;
        this.timestamp = new Date().toISOString();

        // Capture de la stack trace
        Error.captureStackTrace(this, this.constructor);
    }

    /**
     * Convertit l'erreur en objet JSON
     * @returns {Object} Représentation JSON de l'erreur
     */
    toJSON() {
        return {
            succes: false,
            message: this.message,
            code: this.code,
            status: this.status,
            statusCode: this.statusCode,
            ...(Object.keys(this.details).length > 0 && { details: this.details }),
            ...(process.env.NODE_ENV === 'development' && {
                stack: this.stack,
                timestamp: this.timestamp
            })
        };
    }

    /**
     * Crée une erreur de validation
     * @param {string} message - Message d'erreur
     * @param {Object} details - Détails de validation
     * @returns {AppError} Instance d'erreur de validation
     */
    static validation(message, details) {
        return new AppError(message, 400, 'VALIDATION_ERROR', details);
    }

    /**
     * Crée une erreur d'authentification
     * @param {string} message - Message d'erreur
     * @returns {AppError} Instance d'erreur d'authentification
     */
    static authentification(message) {
        return new AppError(message, 401, 'AUTHENTICATION_ERROR');
    }

    /**
     * Crée une erreur d'autorisation
     * @param {string} message - Message d'erreur
     * @returns {AppError} Instance d'erreur d'autorisation
     */
    static autorisation(message) {
        return new AppError(message, 403, 'AUTHORIZATION_ERROR');
    }

    /**
     * Crée une erreur de ressource non trouvée
     * @param {string} message - Message d'erreur
     * @returns {AppError} Instance d'erreur de ressource non trouvée
     */
    static nonTrouve(message) {
        return new AppError(message, 404, 'NOT_FOUND');
    }

    /**
     * Crée une erreur de conflit
     * @param {string} message - Message d'erreur
     * @returns {AppError} Instance d'erreur de conflit
     */
    static conflit(message) {
        return new AppError(message, 409, 'CONFLICT');
    }

    /**
     * Crée une erreur de limite de taux
     * @param {string} message - Message d'erreur
     * @returns {AppError} Instance d'erreur de limite de taux
     */
    static limiteTaux(message) {
        return new AppError(message, 429, 'RATE_LIMIT_EXCEEDED');
    }
}

module.exports = { AppError }; 