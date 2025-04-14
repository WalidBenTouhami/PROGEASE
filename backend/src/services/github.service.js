// src/services/github.service.js


import axios from 'axios';

/**
 * Vérifie si un dépôt GitHub existe.
 * @param {string} url - L'URL du dépôt GitHub.
 * @returns {Promise<boolean>} - Retourne `true` si le dépôt existe, sinon `false`.
 */
export async function checkGithubRepoExists(url) {
    try {
        const response = await axios.head(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        return response.status === 200;
    } catch (error) {
        if (error.response && error.response.status === 404) {
            return false; // Dépôt non trouvé
        }
        throw new Error('Erreur lors de la vérification du dépôt GitHub.');
    }
}