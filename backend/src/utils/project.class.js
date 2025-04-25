class Projet {
    constructor(id, titre, description, dateDebut, dateFin, statut) {
        this.id = id;
        this.titre = titre;
        this.description = description;
        this.dateDebut = new Date(dateDebut);
        this.dateFin = new Date(dateFin);
        this.statut = statut;
        this.livrables = [];
    }

    ajouterLivrable(livrable) {
        if (!livrable || !livrable.name) {
            throw new Error('Livrable invalide.');
        }
        this.livrables.push(livrable);
    }

    calculerProgression() {
        const maintenant = new Date();
        if (maintenant < this.dateDebut) return 0;
        if (maintenant > this.dateFin) return 100;

        const dureeTotale = this.dateFin - this.dateDebut;
        const dureeEcoulee = maintenant - this.dateDebut;
        return Math.round((dureeEcoulee / dureeTotale) * 100);
    }
}
