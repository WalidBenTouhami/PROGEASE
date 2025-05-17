const Projet = require('../models/project.model');

exports.creerProjet = async (data) => {
    const projet = new Projet(data);
    return await projet.save();
};

exports.recupererTousLesProjets = async () => {
    return await Projet.find().populate('equipe tuteur');
};

exports.recupererProjetParId = async (id) => {
    return await Projet.findById(id).populate('equipe tuteur livrables');
};

exports.mettreAJourProjet = async (id, data) => {
    return await Projet.findByIdAndUpdate(id, data, { new: true });
};

exports.supprimerProjet = async (id) => {
    return await Projet.findByIdAndDelete(id);
};

exports.ajouterLivrable = async (projetId, dataLivrable) => {
    const projet = await Projet.findById(projetId);
    if (!projet) throw new Error('Projet introuvable');
    projet.livrables.push(dataLivrable);
    return await projet.save();
};

exports.mettreAJourLivrable = async (projetId, livrableId, dataLivrable) => {
    const projet = await Projet.findById(projetId);
    if (!projet) throw new Error('Projet introuvable');
    const livrable = projet.livrables.id(livrableId);
    if (!livrable) throw new Error('Livrable introuvable');
    Object.assign(livrable, dataLivrable);
    return await projet.save();
};

exports.supprimerLivrable = async (projetId, livrableId) => {
    const projet = await Projet.findById(projetId);
    if (!projet) throw new Error('Projet introuvable');
    projet.livrables.id(livrableId).remove();
    return await projet.save();
};

exports.analyserRisques = async ({ descriptionProjet, jalons, ressources }) => {
    if (!descriptionProjet) {
        throw new Error('La description du projet est requise pour l\'analyse des risques.');
    }
    const risques = [
        { risque: 'Manque de ressources', gravite: 'Élevée', recommandation: 'Allouez des ressources supplémentaires.' },
        { risque: 'Retard dans les jalons', gravite: 'Moyenne', recommandation: 'Revoir les échéances et les priorités.' },
        { risque: 'Défi technique', gravite: 'Faible', recommandation: 'Planifiez une formation technique pour l\'équipe.' }
    ];
    return risques;
};

exports.suiviTaches = async (taches, filtre = {}) => {
    if (!taches || taches.length === 0) {
        throw new Error('La liste des tâches est vide. Impossible de générer un rapport.');
    }
    const tachesFiltrees = taches.filter(tache => {
        const statutOK = filtre.statut ? tache.statut === filtre.statut : true;
        const responsableOK = filtre.responsable ? tache.responsable === filtre.responsable : true;
        return statutOK && responsableOK;
    });

    const total = tachesFiltrees.length;
    const terminee = tachesFiltrees.filter(t => t.statut === 'Terminé').length;
    const enCours = tachesFiltrees.filter(t => t.statut === 'En cours').length;
    const aFaire = tachesFiltrees.filter(t => t.statut === 'À faire').length;
    const enRetard = tachesFiltrees.filter(t => new Date(t.dateLimite) < new Date()).length;

    const progression = total > 0 ? Math.round((terminee / total) * 100) : 0;

    return {
        total,
        terminee,
        enCours,
        aFaire,
        enRetard,
        progression,
        taches: tachesFiltrees
    };
};