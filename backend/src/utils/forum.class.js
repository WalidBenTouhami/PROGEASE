class Forum {
    constructor(id, titre, contenu, categorie, auteur) {
        this.id = id;
        this.titre = titre;
        this.contenu = contenu;
        this.categorie = categorie;
        this.auteur = auteur;
        this.reponses = [];
        this.vues = 0;
        this.votes = {
            positifs: [],
            negatifs: []
        };
        this.estResolu = false;
        this.creeLe = new Date();
        this.majLe = new Date();
    }

    ajouterReponse(reponse) {
        if (!reponse || !reponse.contenu || !reponse.auteur) {
            throw new Error('Réponse invalide.');
        }
        this.reponses.push({
            ...reponse,
            votes: {
                positifs: [],
                negatifs: []
            },
            estSolution: false,
            creeLe: new Date(),
            majLe: new Date()
        });
    }

    marquerCommeSolution(reponseId) {
        const reponse = this.reponses.find(r => r.id === reponseId);
        if (!reponse) {
            throw new Error('Réponse non trouvée.');
        }

        // Retirer le statut de solution des autres réponses
        this.reponses.forEach(r => {
            r.estSolution = false;
        });

        reponse.estSolution = true;
        this.estResolu = true;
    }

    voter(utilisateurId, type, cible = 'sujet', reponseId = null) {
        let votes;
        if (cible === 'sujet') {
            votes = this.votes;
        } else if (cible === 'reponse') {
            const reponse = this.reponses.find(r => r.id === reponseId);
            if (!reponse) {
                throw new Error('Réponse non trouvée.');
            }
            votes = reponse.votes;
        } else {
            throw new Error('Cible de vote invalide.');
        }

        const votePositif = votes.positifs.includes(utilisateurId);
        const voteNegatif = votes.negatifs.includes(utilisateurId);

        if (type === 'positif') {
            if (votePositif) {
                votes.positifs = votes.positifs.filter(id => id !== utilisateurId);
            } else {
                votes.positifs.push(utilisateurId);
                if (voteNegatif) {
                    votes.negatifs = votes.negatifs.filter(id => id !== utilisateurId);
                }
            }
        } else if (type === 'negatif') {
            if (voteNegatif) {
                votes.negatifs = votes.negatifs.filter(id => id !== utilisateurId);
            } else {
                votes.negatifs.push(utilisateurId);
                if (votePositif) {
                    votes.positifs = votes.positifs.filter(id => id !== utilisateurId);
                }
            }
        }
    }

    incrementerVues() {
        this.vues += 1;
    }

    calculerScore() {
        return this.votes.positifs.length - this.votes.negatifs.length;
    }

    calculerScoreReponse(reponseId) {
        const reponse = this.reponses.find(r => r.id === reponseId);
        if (!reponse) {
            throw new Error('Réponse non trouvée.');
        }
        return reponse.votes.positifs.length - reponse.votes.negatifs.length;
    }

    estAuteur(utilisateurId) {
        return this.auteur.toString() === utilisateurId.toString();
    }

    estAuteurReponse(utilisateurId, reponseId) {
        const reponse = this.reponses.find(r => r.id === reponseId);
        if (!reponse) {
            throw new Error('Réponse non trouvée.');
        }
        return reponse.auteur.toString() === utilisateurId.toString();
    }

    toJSON() {
        return {
            id: this.id,
            titre: this.titre,
            contenu: this.contenu,
            categorie: this.categorie,
            auteur: this.auteur,
            reponses: this.reponses,
            vues: this.vues,
            votes: this.votes,
            estResolu: this.estResolu,
            creeLe: this.creeLe,
            majLe: this.majLe
        };
    }
}

module.exports = Forum; 