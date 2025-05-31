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
        'utilisateur-Agent': 'progease-app/2.0'
    }
});

// Configuration
const CONFIG = {
    GITHUB_TOKEN: process.env.GITHUB_TOKEN || '',
    RETRY_LIMIT: 3,
    RETRY_DELAY: 1000
};

/**
 * Attends un delai specifie
 * @param {number} ms - Delai en millisecondes
 * @returns {Promise<void>}
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Verifie si un depôt GitHub existe
 * @param {string} url - URL du depôt GitHub (format: https://github.com/owner/repo)
 * @returns {Promise<boolean>} - true si le depôt existe et est accessible
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

    // Preparer les headers avec token si disponible
    const headers = {
        'utilisateur-Agent': 'progease-app/2.0'
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

            // Validation du statut de reponse
            return response.status === 200;
        } catch (error) {
            retries++;

            // Log differencie selon le type d'erreur
            if (error.response) {
                // La requete a ete effectuee, mais le serveur a repondu avec un code d'erreur
                if (error.response.status === 404) {
                    // Depôt non trouve - ne pas retenter
                    logger.info(`Depôt GitHub non trouve: ${owner}/${repo}`);
                    return false;
                }

                if (error.response.status === 403 && error.response.headers['x-ratelimit-remaining'] === '0') {
                    logger.warn('Limite de taux GitHub atteinte. Attente avant nouvelle tentative...');
                } else {
                    logger.warn(`Erreur GitHub API: ${error.response.status} - ${error.response.statusText}`);
                }
            } else if (error.request) {
                // La requete a ete effectuee mais aucune reponse n'a ete reçue
                logger.warn('Aucune reponse de l\'API GitHub');
            } else {
                // Erreur lors de la configuration de la requete
                logger.warn(`Erreur de configuration de la requete GitHub: ${error.message}`);
            }

            // Si nous avons atteint la limite de tentatives, retourner false
            if (retries >= CONFIG.RETRY_LIMIT) {
                logger.error(`echec de verification du depôt GitHub apres ${CONFIG.RETRY_LIMIT} tentatives.`);
                return false;
            }

            // Attente exponentielle entre les tentatives
            const backoffMs = Math.pow(2, retries) * CONFIG.RETRY_DELAY;
            logger.debug(`Nouvelle tentative dans ${backoffMs}ms...`);
            await sleep(backoffMs);
        }
    }

    return false; // Par defaut, considerer que le depôt n'existe pas
}

/**
 * Recupere la liste des branches d'un depôt GitHub
 * @param {string} url - URL du depôt GitHub
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

    // Preparer les headers
    const headers = {
        'utilisateur-Agent': 'progease-app/2.0'
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
        logger.error(`Erreur lors de la recuperation des branches: ${error.message}`);
        return [];
    }
}

/**
 * Recupere les derniers commits d'un depôt
 * @param {string} url - URL du depôt GitHub
 * @param {number} limit - Nombre maximum de commits à recuperer
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

    // Preparer les headers
    const headers = {
        'utilisateur-Agent': 'progease-app/2.0'
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
        logger.error(`Erreur lors de la recuperation des commits: ${error.message}`);
        return [];
    }
}

module.exports = {
    checkGithubRepoExists,
    getGithubRepoBranches,
    getGithubRepoCommits
};
