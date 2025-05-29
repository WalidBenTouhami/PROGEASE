// src/utils/project.utils.js

const ProjectUtils = {
    /**
     * Génère un code unique pour un projet.
     * @param {number} teamSize - Taille de l'équipe.
     * @returns {string} - Code unique du projet.
     */
    generateProjectCode: (teamSize) => {
        const randomPart = Math.random().toString(16).slice(2, 8).toUpperCase();
        const timestamp = Date.now();
        return `${teamSize}-${timestamp}-${randomPart}`;
    },

    /**
     * Calcule le score de risque d'un projet.
     * @param {Object} project - Détails du projet.
     * @param {number} project.durationDays - Durée du projet en jours.
     * @param {Array} project.team - Liste des membres de l'équipe.
     * @returns {number} - Score de risque (entre 0 et 1).
     */
    calculateRiskScore: ({ durationDays, team }) => {
        if (!team || team.length === 0) {
            throw new Error("L'équipe doit contenir au moins un membre.");
        }
        const teamSize = team.length;
        const riskScore = (durationDays / 100) * (1 / teamSize);
        return Math.min(riskScore, 1); // Limite le score à 1
    }
};

module.exports = { ProjectUtils };