/**
 * Utilitaires pour GitHub (affichage et messages en français)
 */

function extraireNomDepot(url) {
    const match = url.match(/^https:\/\/github\.com\/([^/]+\/[^/]+)$/);
    return match ? match[1] : '';
}

function creerLienGithub(url, texte = 'Voir sur GitHub') {
    return `<a href="${url}" target="_blank" rel="noopener">${texte}</a>`;
}

function estUrlDepotGithub(url) {
    return /^https:\/\/github\.com\/[^/]+\/[^/]+$/.test(url);
}

module.exports = {
    extraireNomDepot,
    creerLienGithub,
    estUrlDepotGithub,
};
