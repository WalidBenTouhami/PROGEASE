const Formation = require('../models/formation.model');
const logger = require('../utils/logger');
const { formatFormationResponse } = require('../utils/formatters');

/**
 * Crée une nouvelle formation
 * @param {Object} data - Données de la formation
 * @returns {Promise<Object>} - Formation créée
 */
async function creerFormation(data) {
    try {
        const formation = new Formation({
            ...data,
            creeLe: new Date(),
            majLe: new Date()
        });

        const formationSauvegardee = await formation.save();
        return formatFormationResponse(formationSauvegardee);
    } catch (error) {
        logger.error(`Erreur lors de la création de la formation: ${error.message}`, { stack: error.stack });
        throw error;
    }
}

/**
 * Récupère toutes les formations avec pagination et filtres
 * @param {Object} options - Options de filtrage et pagination
 * @returns {Promise<Object>} - Liste des formations et métadonnées
 */
async function recupererFormations(options = {}) {
    try {
        const {
            page = 1,
            limite = 10,
            recherche,
            categorie,
            niveau,
            auteur,
            tri = 'recent'
        } = options;

        const query = {};
        if (recherche) {
            query.$or = [
                { titre: { $regex: recherche, $options: 'i' } },
                { description: { $regex: recherche, $options: 'i' } }
            ];
        }
        if (categorie) query.categorie = categorie;
        if (niveau) query.niveau = niveau;
        if (auteur) query.auteur = auteur;

        const skip = (page - 1) * limite;
        let sort = {};
        switch (tri) {
            case 'recent':
                sort = { creeLe: -1 };
                break;
            case 'populaire':
                nombreInscrits: -1;
                break;
            case 'note':
                sort = { noteMoyenne: -1 };
                break;
            default:
                sort = { creeLe: -1 };
        }

        const [formations, total] = await Promise.all([
            Formation.find(query)
                .populate('auteur', 'nom prenom avatar')
                .sort(sort)
                .skip(skip)
                .limit(limite)
                .lean(),
            Formation.countDocuments(query)
        ]);

        return {
            formations: formations.map(formatFormationResponse),
            page,
            totalPages: Math.ceil(total / limite),
            total
        };
    } catch (error) {
        logger.error(`Erreur lors de la récupération des formations: ${error.message}`, { stack: error.stack });
        throw error;
    }
}

/**
 * Récupère une formation par son ID
 * @param {string} id - ID de la formation
 * @returns {Promise<Object>} - Formation trouvée
 */
async function recupererFormationParId(id) {
    try {
        const formation = await Formation.findById(id)
            .populate('auteur', 'nom prenom avatar')
            .populate('modules.quiz')
            .populate('modules.ressources')
            .lean();

        if (!formation) {
            throw new Error('Formation non trouvée');
        }

        return formatFormationResponse(formation);
    } catch (error) {
        logger.error(`Erreur lors de la récupération de la formation: ${error.message}`, { stack: error.stack });
        throw error;
    }
}

/**
 * Met à jour une formation
 * @param {string} id - ID de la formation
 * @param {Object} data - Données à mettre à jour
 * @returns {Promise<Object>} - Formation mise à jour
 */
async function mettreAJourFormation(id, data) {
    try {
        const formation = await Formation.findByIdAndUpdate(
            id,
            {
                ...data,
                majLe: new Date()
            },
            { new: true, runValidators: true }
        )
        .populate('auteur', 'nom prenom avatar')
        .populate('modules.quiz')
        .populate('modules.ressources');

        if (!formation) {
            throw new Error('Formation non trouvée');
        }

        return formatFormationResponse(formation);
    } catch (error) {
        logger.error(`Erreur lors de la mise à jour de la formation: ${error.message}`, { stack: error.stack });
        throw error;
    }
}

/**
 * Supprime une formation
 * @param {string} id - ID de la formation
 * @returns {Promise<boolean>} - Succès de la suppression
 */
async function supprimerFormation(id) {
    try {
        const formation = await Formation.findByIdAndDelete(id);
        if (!formation) {
            throw new Error('Formation non trouvée');
        }
        return true;
    } catch (error) {
        logger.error(`Erreur lors de la suppression de la formation: ${error.message}`, { stack: error.stack });
        throw error;
    }
}

/**
 * Inscrit un utilisateur à une formation
 * @param {string} formationId - ID de la formation
 * @param {string} utilisateurId - ID de l'utilisateur
 * @returns {Promise<Object>} - Formation mise à jour
 */
async function inscrireUtilisateur(formationId, utilisateurId) {
    try {
        const formation = await Formation.findById(formationId);
        if (!formation) {
            throw new Error('Formation non trouvée');
        }

        if (formation.inscrits.includes(utilisateurId)) {
            throw new Error('Utilisateur déjà inscrit');
        }

        formation.inscrits.push(utilisateurId);
        formation.nombreInscrits = formation.inscrits.length;
        formation.majLe = new Date();

        await formation.save();
        return formatFormationResponse(formation);
    } catch (error) {
        logger.error(`Erreur lors de l'inscription à la formation: ${error.message}`, { stack: error.stack });
        throw error;
    }
}

/**
 * Désinscrit un utilisateur d'une formation
 * @param {string} formationId - ID de la formation
 * @param {string} utilisateurId - ID de l'utilisateur
 * @returns {Promise<Object>} - Formation mise à jour
 */
async function desinscrireUtilisateur(formationId, utilisateurId) {
    try {
        const formation = await Formation.findById(formationId);
        if (!formation) {
            throw new Error('Formation non trouvée');
        }

        if (!formation.inscrits.includes(utilisateurId)) {
            throw new Error('Utilisateur non inscrit');
        }

        formation.inscrits = formation.inscrits.filter(id => id.toString() !== utilisateurId);
        formation.nombreInscrits = formation.inscrits.length;
        formation.majLe = new Date();

        await formation.save();
        return formatFormationResponse(formation);
    } catch (error) {
        logger.error(`Erreur lors de la désinscription de la formation: ${error.message}`, { stack: error.stack });
        throw error;
    }
}

/**
 * Ajoute une note à une formation
 * @param {string} formationId - ID de la formation
 * @param {string} utilisateurId - ID de l'utilisateur
 * @param {Object} note - Données de la note
 * @returns {Promise<Object>} - Formation mise à jour
 */
async function ajouterNote(formationId, utilisateurId, note) {
    try {
        const formation = await Formation.findById(formationId);
        if (!formation) {
            throw new Error('Formation non trouvée');
        }

        if (!formation.inscrits.includes(utilisateurId)) {
            throw new Error('Utilisateur non inscrit');
        }

        const noteExistante = formation.notes.find(n => n.utilisateur.toString() === utilisateurId);
        if (noteExistante) {
            noteExistante.valeur = note.valeur;
            noteExistante.commentaire = note.commentaire;
            noteExistante.majLe = new Date();
        } else {
            formation.notes.push({
                utilisateur: utilisateurId,
                valeur: note.valeur,
                commentaire: note.commentaire,
                creeLe: new Date(),
                majLe: new Date()
            });
        }

        formation.noteMoyenne = formation.notes.reduce((acc, n) => acc + n.valeur, 0) / formation.notes.length;
        formation.majLe = new Date();

        await formation.save();
        return formatFormationResponse(formation);
    } catch (error) {
        logger.error(`Erreur lors de l'ajout de la note: ${error.message}`, { stack: error.stack });
        throw error;
    }
}

/**
 * Met à jour la progression d'un utilisateur
 * @param {string} formationId - ID de la formation
 * @param {string} utilisateurId - ID de l'utilisateur
 * @param {Object} progression - Données de progression
 * @returns {Promise<Object>} - Formation mise à jour
 */
async function mettreAJourProgression(formationId, utilisateurId, progression) {
    try {
        const formation = await Formation.findById(formationId);
        if (!formation) {
            throw new Error('Formation non trouvée');
        }

        if (!formation.inscrits.includes(utilisateurId)) {
            throw new Error('Utilisateur non inscrit');
        }

        const progressionExistante = formation.progressions.find(p => p.utilisateur.toString() === utilisateurId);
        if (progressionExistante) {
            progressionExistante.modulesCompletes = progression.modulesCompletes;
            progressionExistante.quizCompletes = progression.quizCompletes;
            progressionExistante.ressourcesConsultees = progression.ressourcesConsultees;
            progressionExistante.pourcentageCompletion = 
                (progression.modulesCompletes.length / formation.modules.length) * 100;
            progressionExistante.majLe = new Date();
        } else {
            formation.progressions.push({
                utilisateur: utilisateurId,
                modulesCompletes: progression.modulesCompletes,
                quizCompletes: progression.quizCompletes,
                ressourcesConsultees: progression.ressourcesConsultees,
                pourcentageCompletion:
                    (progression.modulesCompletes.length / formation.modules.length) * 100,
                creeLe: new Date(),
                majLe: new Date()
            });
        }

        formation.majLe = new Date();

        await formation.save();
        return formatFormationResponse(formation);
    } catch (error) {
        logger.error(`Erreur lors de la mise à jour de la progression: ${error.message}`, { stack: error.stack });
        throw error;
    }
}

module.exports = {
    creerFormation,
    recupererFormations,
    recupererFormationParId,
    mettreAJourFormation,
    supprimerFormation,
    inscrireUtilisateur,
    desinscrireUtilisateur,
    ajouterNote,
    mettreAJourProgression
}; 