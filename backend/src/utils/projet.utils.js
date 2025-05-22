const ProjetUtils = {
    genererCodeProjet: (tailleEquipe) => {
        const partieAleatoire = Math.random().toString(16).slice(2, 8).toUpperCase();
        const timestamp = Date.now();
        return `${tailleEquipe}-${timestamp}-${partieAleatoire}`;
    },

    calculerScoreRisque: ({ dureeJours, equipe }) => {
        if (!equipe || equipe.length === 0) {
            throw new Error("L'équipe doit contenir au moins un membre.");
        }
        const tailleEquipe = equipe.length;
        const scoreRisque = (dureeJours / 100) * (1 / tailleEquipe);
        return Math.min(scoreRisque, 1);
    }
};

module.exports = { ProjectUtils: ProjetUtils };