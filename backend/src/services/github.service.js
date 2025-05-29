const dotenv = require('dotenv');
dotenv.config();

const axios = require('axios');

/**
 * Vérifie si un dépôt GitHub existe via l'API GitHub.
 * @param {string} url - L'URL du dépôt GitHub.
 * @returns {Promise<boolean>} - `true` si le dépôt existe, sinon `false`.
 */
async function checkGithubRepoExists(url) {
    try {
        // Vérifie si l'URL est valide
        const pattern = /^https:\/\/github\.com\/([^/]+)\/([^/]+)$/;
        const match = url.match(pattern);

        if (!match) {
            console.error('❌ URL GitHub invalide :', url);
            return false;
        }

        const [, owner, repo] = match;
        const apiUrl = `https://api.github.com/repos/${owner}/${repo}`;

        // 🔐 Ajouter authentification si token dispo
        const headers = {
            'User-Agent': 'progease-app'
        };

        if (process.env.GITHUB_TOKEN) {
            headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
        }

        const response = await axios.get(apiUrl, { headers });

        // ✅ Ajout du log pour la réponse de l'API
        console.log('✅ GitHub API Response:', response.status);
        return response.status === 200;
    } catch (error) {
        // ❌ Ajout du log pour les erreurs
        console.error('❌ Erreur GitHub API:', error.response?.status, error.message);
        return false; // Ne pas throw, sinon ça bloque la validation Mongoose
    }
}

module.exports = { checkGithubRepoExists };