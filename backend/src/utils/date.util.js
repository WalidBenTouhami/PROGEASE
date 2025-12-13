/**
 * Utilitaires pour la gestion des dates (affichage en français)
 */

function formaterDateFr(date) {
    const d = new Date(date);
    if (isNaN(d)) return '';
    return d.toLocaleDateString('fr-FR');
}

function differenceJours(dateDebut, dateFin) {
    const debut = new Date(dateDebut);
    const fin = new Date(dateFin);
    return Math.ceil((fin - debut) / (1000 * 60 * 60 * 24));
}

function estDatePassee(date) {
    return new Date(date) < new Date();
}

module.exports = {
    formaterDateFr,
    differenceJours,
    estDatePassee,
};
