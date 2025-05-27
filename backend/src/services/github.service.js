// src/services/github.service.js
const axios = require('axios');
const dotenv = require('dotenv');
const logger = require('../utils/logger');

// Charger les variables d'environnement
dotenv.config();

// Configuration du client HTTP avec timeout et retries
const client = axios.create({
    timeout: 10000, // 10s timeout
    headers: {
        'User-Agent': 'progease-app/2.0'
    }
});

// Configuration
const CONFIG = {
    GITHUB_TOKEN: process.env.GITHUB_TOKEN || '',
    RETRY_LIMIT: 3,
    RETRY_DELAY: 1000
};

/**
 * Attends un délai spécifié
 * @param {number} ms - Délai en millisecondes
 * @returns {Promise<void>}
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Vérifie si un dépôt GitHub existe
 * @param {string} url - URL du dépôt GitHub (format: https://github.com/owner/repo)
 * @returns {Promise<boolean>} - true si le dépôt existe et est accessible
 */
async function checkGithubRepoExists(url) {
    // Validation du format de l'URL
    const pattern = /^https:\/\/github\.com\/([^/]+)\/([^/]+)$/;
    const match = url.match(pattern);

    if (!match) {
        logger.warn(`URL GitHub invalide: ${url}`);
        return false;
    }

    const [, owner, repo] = match;
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}`;

    // Préparer les headers avec token si disponible
    const headers = {
        'User-Agent': 'progease-app/2.0'
    };

    if (CONFIG.GITHUB_TOKEN) {
        headers.Authorization = `Bearer ${CONFIG.GITHUB_TOKEN}`;
    }

    // Tentatives avec retries
    let retries = 0;
    while (retries < CONFIG.RETRY_LIMIT) {
        try {
            const response = await client.get(apiUrl, { headers });
            logger.debug(`GitHub API Response: Status ${response.status}`);

            // Validation du statut de réponse
            return response.status === 200;
        } catch (error) {
            retries++;

            // Log différencié selon le type d'erreur
            if (error.response) {
                // La requête a été effectuée, mais le serveur a répondu avec un code d'erreur
                if (error.response.status === 404) {
                    // Dépôt non trouvé - ne pas retenter
                    logger.info(`Dépôt GitHub non trouvé: ${owner}/${repo}`);
                    return false;
                }

                if (error.response.status === 403 && error.response.headers['x-ratelimit-remaining'] === '0') {
                    logger.warn('Limite de taux GitHub atteinte. Attente avant nouvelle tentative...');
                } else {
                    logger.warn(`Erreur GitHub API: ${error.response.status} - ${error.response.statusText}`);
                }
            } else if (error.request) {
                // La requête a été effectuée mais aucune réponse n'a été reçue
                logger.warn('Aucune réponse de l\'API GitHub');
            } else {
                // Erreur lors de la configuration de la requête
                logger.warn(`Erreur de configuration de la requête GitHub: ${error.message}`);
            }

            // Si nous avons atteint la limite de tentatives, retourner false
            if (retries >= CONFIG.RETRY_LIMIT) {
                logger.error(`Échec de vérification du dépôt GitHub après ${CONFIG.RETRY_LIMIT} tentatives.`);
                return false;
            }

            // Attente exponentielle entre les tentatives
            const backoffMs = Math.pow(2, retries) * CONFIG.RETRY_DELAY;
            logger.debug(`Nouvelle tentative dans ${backoffMs}ms...`);
            await sleep(backoffMs);
        }
    }

    return false; // Par défaut, considérer que le dépôt n'existe pas
}

/**
 * Récupère la liste des branches d'un dépôt GitHub
 * @param {string} url - URL du dépôt GitHub
 * @returns {Promise<string[]>} - Liste des branches ou []
 */
async function getGithubRepoBranches(url) {
    const pattern = /^https:\/\/github\.com\/([^/]+)\/([^/]+)$/;
    const match = url.match(pattern);

    if (!match) {
        logger.warn(`URL GitHub invalide: ${url}`);
        return [];
    }

    const [, owner, repo] = match;
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/branches`;

    // Préparer les headers
    const headers = {
        'User-Agent': 'progease-app/2.0'
    };

    if (CONFIG.GITHUB_TOKEN) {
        headers.Authorization = `Bearer ${CONFIG.GITHUB_TOKEN}`;
    }

    try {
        const response = await client.get(apiUrl, { headers });

        if (response.status === 200 && Array.isArray(response.data)) {
            return response.data.map(branch => branch.name);
        }

        return [];
    } catch (error) {
        logger.error(`Erreur lors de la récupération des branches: ${error.message}`);
        return [];
    }
}

/**
 * Récupère les derniers commits d'un dépôt
 * @param {string} url - URL du dépôt GitHub
 * @param {number} limit - Nombre maximum de commits à récupérer
 * @returns {Promise<Array>} - Liste des commits ou []
 */
async function getGithubRepoCommits(url, limit = 5) {
    const pattern = /^https:\/\/github\.com\/([^/]+)\/([^/]+)$/;
    const match = url.match(pattern);

    if (!match) {
        logger.warn(`URL GitHub invalide: ${url}`);
        return [];
    }

    const [, owner, repo] = match;
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/commits?per_page=${limit}`;

    // Préparer les headers
    const headers = {
        'User-Agent': 'progease-app/2.0'
    };

    if (CONFIG.GITHUB_TOKEN) {
        headers.Authorization = `Bearer ${CONFIG.GITHUB_TOKEN}`;
    }

    try {
        const response = await client.get(apiUrl, { headers });

        if (response.status === 200 && Array.isArray(response.data)) {
            return response.data.map(commit => ({
                sha: commit.sha,
                date: commit.commit.author.date,
                message: commit.commit.message,
                author: commit.commit.author.name
            }));
        }

        return [];
    } catch (error) {
        logger.error(`Erreur lors de la récupération des commits: ${error.message}`);
        return [];
    }
}

module.exports = {
    checkGithubRepoExists,
    getGithubRepoBranches,
    getGithubRepoCommits
};
