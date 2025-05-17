const dotenv = require('dotenv');
dotenv.config();

const axios = require('axios');

/**
 * Vérifie si un dépôt GitHub existe via l'API GitHub.
 * @param {string} url - L'URL du dépôt GitHub.
 * @returns {Promise<boolean>} - `true` si le dépôt existe, sinon `false`.
 */
async function verifierDepotGithubExiste(url) {
    try {
        const pattern = /^https:\/\/github\.com\/([^/]+)\/([^/]+)$/;
        const match = url.match(pattern);

        if (!match) {
            console.error('❌ URL GitHub invalide :', url);
            return false;
        }

        const [, proprietaire, depot] = match;
        const apiUrl = `https://api.github.com/repos/${proprietaire}/${depot}`;

        const headers = {
            'User-Agent': 'progease-app'
        };

        if (process.env.GITHUB_TOKEN) {
            headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
        }

        const reponse = await axios.get(apiUrl, { headers });
        console.log('✅ Réponse de l’API GitHub :', reponse.status);
        return reponse.status === 200;
    } catch (error) {
        console.error('❌ Erreur API GitHub :', error.response?.status, error.message);
        return false;
    }
}

module.exports = { verifierDepotGithubExiste };