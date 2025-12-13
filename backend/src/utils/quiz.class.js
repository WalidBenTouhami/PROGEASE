/**
 * Classe utilitaire pour les opérations sur les quiz
 * @class Quiz
 */
class Quiz {
    constructor(id, titre, description, categorie, niveau, duree, questions, auteur) {
        this.id = id;
        this.titre = titre;
        this.description = description;
        this.categorie = categorie;
        this.niveau = niveau;
        this.duree = duree;
        this.questions = questions || [];
        this.auteur = auteur;
        this.estPublic = true;
        this.tags = [];
        this.participations = [];
        this.nombreParticipations = 0;
        this.scoreTotal = 0;
        this.scoreMoyen = 0;
        this.creeLe = new Date();
        this.majLe = new Date();
    }

    /**
     * Ajoute une question au quiz
     * @param {Object} question - Question à ajouter
     */
    ajouterQuestion(question) {
        this.questions.push({
            ...question,
            points: question.points || 1,
        });
        this.majLe = new Date();
    }

    /**
     * Supprime une question du quiz
     * @param {string} questionId - ID de la question à supprimer
     */
    supprimerQuestion(questionId) {
        this.questions = this.questions.filter(q => q.id !== questionId);
        this.majLe = new Date();
    }

    /**
     * Met à jour une question du quiz
     * @param {string} questionId - ID de la question à mettre à jour
     * @param {Object} donnees - Nouvelles données de la question
     */
    mettreAJourQuestion(questionId, donnees) {
        const index = this.questions.findIndex(q => q.id === questionId);
        if (index !== -1) {
            this.questions[index] = {
                ...this.questions[index],
                ...donnees,
                points: donnees.points || this.questions[index].points || 1,
            };
            this.majLe = new Date();
        }
    }

    /**
     * Ajoute un tag au quiz
     * @param {string} tag - Tag à ajouter
     */
    ajouterTag(tag) {
        if (!this.tags.includes(tag)) {
            this.tags.push(tag);
            this.majLe = new Date();
        }
    }

    /**
     * Supprime un tag du quiz
     * @param {string} tag - Tag à supprimer
     */
    supprimerTag(tag) {
        this.tags = this.tags.filter(t => t !== tag);
        this.majLe = new Date();
    }

    /**
     * Enregistre une participation au quiz
     * @param {Object} participation - Données de la participation
     */
    enregistrerParticipation(participation) {
        this.participations.push(participation);
        this.nombreParticipations++;
        this.scoreTotal += participation.score;
        this.scoreMoyen = this.scoreTotal / this.nombreParticipations;
        this.majLe = new Date();
    }

    /**
     * Calcule les statistiques du quiz
     * @returns {Object} - Statistiques du quiz
     */
    calculerStatistiques() {
        const scoreMaximum = this.questions.reduce((total, q) => total + (q.points || 1), 0);
        const stats = {
            nombreParticipations: this.nombreParticipations,
            scoreMoyen: this.scoreMoyen,
            scoreMaximum,
            tauxReussite:
                this.nombreParticipations > 0
                    ? (this.participations.filter(p => p.score >= scoreMaximum * 0.7).length /
                          this.nombreParticipations) *
                      100
                    : 0,
            repartitionScores: {
                excellent: this.participations.filter(p => p.score >= scoreMaximum * 0.9).length,
                bon: this.participations.filter(
                    p => p.score >= scoreMaximum * 0.7 && p.score < scoreMaximum * 0.9
                ).length,
                moyen: this.participations.filter(
                    p => p.score >= scoreMaximum * 0.5 && p.score < scoreMaximum * 0.7
                ).length,
                faible: this.participations.filter(p => p.score < scoreMaximum * 0.5).length,
            },
            questionsStats: this.questions.map((question, index) => ({
                texte: question.texte,
                tauxReussite:
                    this.nombreParticipations > 0
                        ? (this.participations.filter(p => p.resultatsDetailles[index].estCorrecte)
                              .length /
                              this.nombreParticipations) *
                          100
                        : 0,
            })),
        };

        return stats;
    }

    /**
     * Vérifie si un utilisateur a déjà participé au quiz
     * @param {string} utilisateurId - ID de l'utilisateur
     * @returns {boolean} - True si l'utilisateur a déjà participé
     */
    utilisateurAParticipe(utilisateurId) {
        return this.participations.some(p => p.utilisateur.toString() === utilisateurId);
    }

    /**
     * Récupère le résultat d'un utilisateur
     * @param {string} utilisateurId - ID de l'utilisateur
     * @returns {Object|null} - Résultat de l'utilisateur
     */
    recupererResultatUtilisateur(utilisateurId) {
        return this.participations.find(p => p.utilisateur.toString() === utilisateurId) || null;
    }

    /**
     * Vérifie si le quiz est modifiable
     * @param {string} utilisateurId - ID de l'utilisateur
     * @param {Array} roles - Rôles de l'utilisateur
     * @returns {boolean} - True si le quiz est modifiable
     */
    estModifiable(utilisateurId, roles) {
        return this.auteur.toString() === utilisateurId || roles.includes('ADMIN');
    }

    /**
     * Vérifie si le quiz est accessible
     * @param {string} utilisateurId - ID de l'utilisateur
     * @param {Array} roles - Rôles de l'utilisateur
     * @returns {boolean} - True si le quiz est accessible
     */
    estAccessible(utilisateurId, roles) {
        return (
            this.estPublic || this.auteur.toString() === utilisateurId || roles.includes('ADMIN')
        );
    }

    /**
     * Convertit l'instance en objet simple
     * @returns {Object} - Objet simple
     */
    toJSON() {
        return {
            id: this.id,
            titre: this.titre,
            description: this.description,
            categorie: this.categorie,
            niveau: this.niveau,
            duree: this.duree,
            questions: this.questions,
            auteur: this.auteur,
            estPublic: this.estPublic,
            tags: this.tags,
            participations: this.participations,
            nombreParticipations: this.nombreParticipations,
            scoreTotal: this.scoreTotal,
            scoreMoyen: this.scoreMoyen,
            creeLe: this.creeLe,
            majLe: this.majLe,
        };
    }

    /**
     * Crée une instance à partir d'un objet simple
     * @param {Object} data - Données du quiz
     * @returns {Quiz} - Instance de la classe Quiz
     */
    static fromJSON(data) {
        const quiz = new Quiz(
            data.id,
            data.titre,
            data.description,
            data.categorie,
            data.niveau,
            data.duree,
            data.questions,
            data.auteur
        );
        quiz.estPublic = data.estPublic;
        quiz.tags = data.tags;
        quiz.participations = data.participations;
        quiz.nombreParticipations = data.nombreParticipations;
        quiz.scoreTotal = data.scoreTotal;
        quiz.scoreMoyen = data.scoreMoyen;
        quiz.creeLe = new Date(data.creeLe);
        quiz.majLe = new Date(data.majLe);
        return quiz;
    }
}

module.exports = Quiz;
