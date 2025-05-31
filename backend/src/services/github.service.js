// src/services/github.service.js
const axios = require('axios');
const dotenv = require('dotenv');
const logger = require('../utils/logger');

// Charger les variables d'environnement
dotenv.config();

// Configuration
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
let useTestMode = false;

if (!GITHUB_TOKEN) {
    logger.warn('⚠️ La variable GITHUB_TOKEN est manquante, utilisation du mode test');
    useTestMode = true;
} else {
    logger.info('✅ Token GitHub chargé');
}

// Configuration du client HTTP avec timeout et retries
const client = axios.create({
    timeout: 10000, // 10s timeout
    headers: {
        'utilisateur-Agent': 'progease-app/2.0'
    }
});

// Configuration
const CONFIG = {
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
 * Vérifie si un dépôt GitHub existe
 * @param {string} url - URL du dépôt GitHub
 * @returns {Promise<boolean>} - true si le dépôt existe, false sinon
 */
async function checkGithubRepoExists(url) {
    try {
        if (useTestMode) {
            // En mode test, on considère que certaines URLs sont valides
            const validTestUrls = [
                'https://github.com/WalidBenTouhami/PROGEASE',
                'https://github.com/test/valid-repo'
            ];
            return validTestUrls.includes(url);
        }

        // Extraire le propriétaire et le nom du dépôt de l'URL
        const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
        if (!match) {
            throw new Error('URL GitHub invalide');
        }

        const [, owner, repo] = match;

        // Appel à l'API GitHub
        const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}`, {
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        return response.status === 200;
    } catch (error) {
        if (error.response && error.response.status === 404) {
            return false;
        }
        
        if (error.response && error.response.status === 401) {
            logger.warn('⚠️ Token GitHub invalide ou manquant');
            return false;
        }

        logger.error('Erreur lors de la vérification du dépôt GitHub:', error);
        return false;
    }
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

    if (GITHUB_TOKEN) {
        headers.Authorization = `Bearer ${GITHUB_TOKEN}`;
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

    if (GITHUB_TOKEN) {
        headers.Authorization = `Bearer ${GITHUB_TOKEN}`;
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
