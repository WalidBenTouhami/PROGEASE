const { Sujet } = require('../models/forum.model');
const logger = require('../utils/logger');

/**
 * Récupérer tous les sujets avec pagination
 */
exports.recupererSujets = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limite = parseInt(req.query.limite) || 10;
        const skip = (page - 1) * limite;

        const sujets = await Sujet.find()
            .sort({ creeLe: -1 })
            .skip(skip)
            .limit(limite)
            .populate('auteur', 'nom prenom avatar')
            .lean();

        const total = await Sujet.countDocuments();

        res.status(200).json({
            success: true,
            data: {
                sujets,
                page,
                totalPages: Math.ceil(total / limite),
                total
            }
        });
    } catch (error) {
        logger.error('Erreur lors de la récupération des sujets:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des sujets'
        });
    }
};

/**
 * Récupérer un sujet par son ID
 */
exports.recupererSujetParId = async (req, res) => {
    try {
        const sujet = await Sujet.findById(req.params.sujetId)
            .populate('auteur', 'nom prenom avatar')
            .populate('reponses.auteur', 'nom prenom avatar')
            .lean();

        if (!sujet) {
            return res.status(404).json({
                success: false,
                message: 'Sujet non trouvé'
            });
        }

        // Incrémenter le compteur de vues
        await Sujet.findByIdAndUpdate(req.params.sujetId, { $inc: { vues: 1 } });

        res.status(200).json({
            success: true,
            data: sujet
        });
    } catch (error) {
        logger.error('Erreur lors de la récupération du sujet:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération du sujet'
        });
    }
};

/**
 * Créer un nouveau sujet
 */
exports.creerSujet = async (req, res) => {
    try {
        const sujet = new Sujet({
            ...req.body,
            auteur: req.utilisateur.id
        });

        await sujet.save();

        res.status(201).json({
            success: true,
            message: 'Sujet créé avec succès',
            data: sujet
        });
    } catch (error) {
        logger.error('Erreur lors de la création du sujet:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la création du sujet'
        });
    }
};

/**
 * Modifier un sujet
 */
exports.modifierSujet = async (req, res) => {
    try {
        const sujet = await Sujet.findByIdAndUpdate(
            req.params.sujetId,
            {
                $set: {
                    titre: req.body.titre,
                    contenu: req.body.contenu,
                    categorie: req.body.categorie,
                    tags: req.body.tags,
                    majLe: new Date()
                }
            },
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: 'Sujet modifié avec succès',
            data: sujet
        });
    } catch (error) {
        logger.error('Erreur lors de la modification du sujet:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la modification du sujet'
        });
    }
};

/**
 * Supprimer un sujet
 */
exports.supprimerSujet = async (req, res) => {
    try {
        await Sujet.findByIdAndDelete(req.params.sujetId);

        res.status(200).json({
            success: true,
            message: 'Sujet supprimé avec succès'
        });
    } catch (error) {
        logger.error('Erreur lors de la suppression du sujet:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la suppression du sujet'
        });
    }
};

/**
 * Ajouter une réponse à un sujet
 */
exports.ajouterReponse = async (req, res) => {
    try {
        const sujet = await Sujet.findById(req.params.sujetId);

        if (!sujet) {
            return res.status(404).json({
                success: false,
                message: 'Sujet non trouvé'
            });
        }

        sujet.reponses.push({
            contenu: req.body.contenu,
            auteur: req.utilisateur.id
        });

        await sujet.save();

        res.status(201).json({
            success: true,
            message: 'Réponse ajoutée avec succès',
            data: sujet.reponses[sujet.reponses.length - 1]
        });
    } catch (error) {
        logger.error('Erreur lors de l\'ajout de la réponse:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'ajout de la réponse'
        });
    }
};

/**
 * Modifier une réponse
 */
exports.modifierReponse = async (req, res) => {
    try {
        const sujet = await Sujet.findById(req.params.sujetId);
        const reponse = sujet.reponses.id(req.params.reponseId);

        reponse.contenu = req.body.contenu;
        reponse.majLe = new Date();

        await sujet.save();

        res.status(200).json({
            success: true,
            message: 'Réponse modifiée avec succès',
            data: reponse
        });
    } catch (error) {
        logger.error('Erreur lors de la modification de la réponse:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la modification de la réponse'
        });
    }
};

/**
 * Supprimer une réponse
 */
exports.supprimerReponse = async (req, res) => {
    try {
        const sujet = await Sujet.findById(req.params.sujetId);
        sujet.reponses.id(req.params.reponseId).remove();
        await sujet.save();

        res.status(200).json({
            success: true,
            message: 'Réponse supprimée avec succès'
        });
    } catch (error) {
        logger.error('Erreur lors de la suppression de la réponse:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la suppression de la réponse'
        });
    }
};

/**
 * Voter pour un sujet
 */
exports.voterSujet = async (req, res) => {
    try {
        const { type } = req.body; // 'positif' ou 'negatif'
        const sujet = await Sujet.findById(req.params.sujetId);

        if (!sujet) {
            return res.status(404).json({
                success: false,
                message: 'Sujet non trouvé'
            });
        }

        const utilisateurId = req.utilisateur.id;
        const votePositif = sujet.votes.positifs.includes(utilisateurId);
        const voteNegatif = sujet.votes.negatifs.includes(utilisateurId);

        // Gérer les votes
        if (type === 'positif') {
            if (votePositif) {
                sujet.votes.positifs.pull(utilisateurId);
            } else {
                sujet.votes.positifs.push(utilisateurId);
                if (voteNegatif) sujet.votes.negatifs.pull(utilisateurId);
            }
        } else if (type === 'negatif') {
            if (voteNegatif) {
                sujet.votes.negatifs.pull(utilisateurId);
            } else {
                sujet.votes.negatifs.push(utilisateurId);
                if (votePositif) sujet.votes.positifs.pull(utilisateurId);
            }
        }

        await sujet.save();

        res.status(200).json({
            success: true,
            message: 'Vote enregistré avec succès',
            data: sujet.votes
        });
    } catch (error) {
        logger.error('Erreur lors du vote sur le sujet:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors du vote sur le sujet'
        });
    }
};

/**
 * Voter pour une réponse
 */
exports.voterReponse = async (req, res) => {
    try {
        const { type } = req.body; // 'positif' ou 'negatif'
        const sujet = await Sujet.findById(req.params.sujetId);
        const reponse = sujet.reponses.id(req.params.reponseId);

        if (!reponse) {
            return res.status(404).json({
                success: false,
                message: 'Réponse non trouvée'
            });
        }

        const utilisateurId = req.utilisateur.id;
        const votePositif = reponse.votes.positifs.includes(utilisateurId);
        const voteNegatif = reponse.votes.negatifs.includes(utilisateurId);

        // Gérer les votes
        if (type === 'positif') {
            if (votePositif) {
                reponse.votes.positifs.pull(utilisateurId);
            } else {
                reponse.votes.positifs.push(utilisateurId);
                if (voteNegatif) reponse.votes.negatifs.pull(utilisateurId);
            }
        } else if (type === 'negatif') {
            if (voteNegatif) {
                reponse.votes.negatifs.pull(utilisateurId);
            } else {
                reponse.votes.negatifs.push(utilisateurId);
                if (votePositif) reponse.votes.positifs.pull(utilisateurId);
            }
        }

        await sujet.save();

        res.status(200).json({
            success: true,
            message: 'Vote enregistré avec succès',
            data: reponse.votes
        });
    } catch (error) {
        logger.error('Erreur lors du vote sur la réponse:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors du vote sur la réponse'
        });
    }
};

/**
 * Marquer une réponse comme solution
 */
exports.marquerCommeSolution = async (req, res) => {
    try {
        const sujet = await Sujet.findById(req.params.sujetId);
        const reponse = sujet.reponses.id(req.params.reponseId);

        if (!reponse) {
            return res.status(404).json({
                success: false,
                message: 'Réponse non trouvée'
            });
        }

        // Retirer le statut de solution des autres réponses
        sujet.reponses.forEach(r => {
            r.estSolution = false;
        });

        // Marquer cette réponse comme solution
        reponse.estSolution = true;
        sujet.estResolu = true;

        await sujet.save();

        res.status(200).json({
            success: true,
            message: 'Réponse marquée comme solution',
            data: reponse
        });
    } catch (error) {
        logger.error('Erreur lors du marquage de la solution:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors du marquage de la solution'
        });
    }
};

/**
 * Rechercher des sujets
 */
exports.rechercherSujets = async (req, res) => {
    try {
        const { q } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limite = parseInt(req.query.limite) || 10;
        const skip = (page - 1) * limite;

        const sujets = await Sujet.find(
            { $text: { $search: q } },
            { score: { $meta: 'textScore' } }
        )
            .sort({ score: { $meta: 'textScore' } })
            .skip(skip)
            .limit(limite)
            .populate('auteur', 'nom prenom avatar')
            .lean();

        const total = await Sujet.countDocuments({ $text: { $search: q } });

        res.status(200).json({
            success: true,
            data: {
                sujets,
                page,
                totalPages: Math.ceil(total / limite),
                total
            }
        });
    } catch (error) {
        logger.error('Erreur lors de la recherche des sujets:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la recherche des sujets'
        });
    }
};

/**
 * Récupérer les sujets par catégorie
 */
exports.recupererSujetsParCategorie = async (req, res) => {
    try {
        const { categorie } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limite = parseInt(req.query.limite) || 10;
        const skip = (page - 1) * limite;

        const sujets = await Sujet.find({ categorie })
            .sort({ creeLe: -1 })
            .skip(skip)
            .limit(limite)
            .populate('auteur', 'nom prenom avatar')
            .lean();

        const total = await Sujet.countDocuments({ categorie });

        res.status(200).json({
            success: true,
            data: {
                sujets,
                page,
                totalPages: Math.ceil(total / limite),
                total
            }
        });
    } catch (error) {
        logger.error('Erreur lors de la récupération des sujets par catégorie:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des sujets par catégorie'
        });
    }
};

/**
 * Récupérer les sujets d'un utilisateur
 */
exports.recupererSujetsParUtilisateur = async (req, res) => {
    try {
        const { utilisateurId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limite = parseInt(req.query.limite) || 10;
        const skip = (page - 1) * limite;

        const sujets = await Sujet.find({ auteur: utilisateurId })
            .sort({ creeLe: -1 })
            .skip(skip)
            .limit(limite)
            .populate('auteur', 'nom prenom avatar')
            .lean();

        const total = await Sujet.countDocuments({ auteur: utilisateurId });

        res.status(200).json({
            success: true,
            data: {
                sujets,
                page,
                totalPages: Math.ceil(total / limite),
                total
            }
        });
    } catch (error) {
        logger.error('Erreur lors de la récupération des sujets de l\'utilisateur:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des sujets de l\'utilisateur'
        });
    }
}; 