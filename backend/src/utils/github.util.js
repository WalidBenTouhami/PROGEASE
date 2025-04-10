// src/utils/github.util.js

const axios = require('axios');

/**
 * Vérifie si un dépôt GitHub public existe
 * @param {string} url - Lien GitHub du dépôt (ex: https://github.com/user/repo)
 * @returns {Promise<boolean>}
 */
exports.checkGithubRepoExists = async (url) => {
    try {
        if (!/^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(url)) {
            return false; // 🔒 Protection : éviter les faux liens ou injections
        }

        const cleanUrl = url.replace('https://github.com/', '');
        const apiUrl = `https://api.github.com/repos/${cleanUrl}`;

        const response = await axios.get(apiUrl, {
            headers: {
                'Accept': 'application/vnd.github+json',
                'User-Agent': 'progease-verifier' // GitHub recommande de spécifier un UA
            },
            timeout: 4000
        });

        return response.status === 200;
    } catch (error) {
        // Log possible pour debug (optionnel)
        // console.error('GitHub check error:', error.response?.status || error.message);
        return false;
    }
};
