// src/utils/healthcheck.js

import { checkConnection } from 'backend/src/core/db.js';

/**
 * Vérifie l'état de santé de l'application.
 * @param {Request} req - La requête HTTP.
 * @param {Response} res - La réponse HTTP.
 */
export const healthcheck = async (req, res) => {
    try {
        // Vérification de la connexion à la base de données
        const dbStatus = await checkConnection();

        res.status(200).json({
            status: 'OK',
            uptime: process.uptime(),
            timestamp: new Date(),
            database: dbStatus ? 'connected' : 'disconnected'
        });
    } catch (error) {
        res.status(500).json({
            status: 'ERROR',
            message: 'Erreur lors de la vérification de l\'état de santé.',
            error: error.message
        });
    }
};

/**
 * Planifie des vérifications régulières de l'état de santé.
 */
export const scheduleHealthChecks = () => {
    setInterval(async () => {
        try {
            const dbStatus = await checkConnection();
            console.log(`[HealthCheck] Database status: ${dbStatus ? 'connected' : 'disconnected'}`);
        } catch (error) {
            console.error(`[HealthCheck] Error: ${error.message}`);
        }
    }, 60000); // Vérification toutes les 60 secondes
};