const Formation = require('../Formation');
const Certificat = require('../Certification'); // Assurez-vous que le modèle Certificat est bien importe
const Utilisateur = require('../models/utilisateur'); // Assurez-vous que le modèle utilisateur est bien importe
const QuizResult = require('../QuizResult'); // Modèle pour les resultats des quiz
const logger = require('../utils/logger');

// Fonction pour verifier si l'utilisateur a reussi tous les quiz associes aux formations requises
const checkQuizReussis = async (utilisateurId, formationsRequises) => {
    try {
        const formations = await Formation.find({
            _id: { $in: formationsRequises },
        }).populate('contenu.quiz'); // Assurez-vous que les quiz sont bien peuples dans chaque formation

        for (const formation of formations) {
            const quizIds = formation.contenu.quiz; // Liste des quiz associes à la formation

            for (const quizId of quizIds) {
                const quizResult = await QuizResult.findOne({
                    utilisateurId: { $eq: utilisateurId },
                    quizId: quizId,
                });

                if (!quizResult || !quizResult.isPassed) {
                    return false; // L'utilisateur n'a pas reussi tous les quiz necessaires
                }
            }
        }

        return true;
    } catch (error) {
        logger.error('Erreur lors de la verification des quiz:', error);
        return false;
    }
};

// Fonction pour creer un certificat
const createCertificat = async (req, res) => {
    try {
        const { utilisateurId, formationsRequises, titre, description, dureeValidite } = req.body;

        // Validation pour eviter les injections NoSQL sur l'identifiant utilisateur
        if (typeof utilisateurId !== 'string') {
            return res.status(400).json({ error: 'Identifiant utilisateur invalide' });
        }

        // Verifiez que l'utilisateur a reussi tous les quiz pour les formations requises
        const estEligible = await checkQuizReussis(utilisateurId, formationsRequises);
        if (!estEligible) {
            return res.status(403).json({ error: 'L\'utilisateur n\'a pas rempli les conditions.' });
        }

        // Creer un nouveau certificat si l'utilisateur est eligible
        const nouveauCertificat = new Certificat({
            utilisateurId,
            titre,
            description,
            dureeValidite,
            conditions: { formationsRequises },
        });

        // Sauvegarder le certificat
        await nouveauCertificat.save();

        res.status(201).json({
            message: 'Certificat cree avec succès',
            certificat: nouveauCertificat,
        });
    } catch (error) {
        logger.error('Erreur serveur:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

// Fonction pour generer un certificat en verifiant l'eligibilite
const genererCertificat = async (req, res) => {
    const utilisateurId = req.utilisateur._id; // Assumes JWT middleware sets req.utilisateur
    const { formationsRequises, titre, description, dureeValidite } = req.body;

    try {
        // Verifiez si l'utilisateur a reussi tous les quiz pour les formations requises
        const estEligible = await checkQuizReussis(utilisateurId, formationsRequises);
        if (!estEligible) {
            return res.status(403).json({ error: 'L\'utilisateur n\'a pas rempli les conditions.' });
        }

        // Creer un nouveau certificat si l'utilisateur est eligible
        const nouveauCertificat = await Certificat.create({
            utilisateurId,
            titre,
            description,
            dureeValidite,
            conditions: { formationsRequises },
        });

        res.status(201).json({
            message: 'Certificat genere avec succès',
            certificat: nouveauCertificat,
        });
    } catch (error) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

// Creer une formation (Admin)
const createFormation = async (req, res) => {
    try {
        const { titre, description, categorie, duree } = req.body;

        if (!titre || !description || !categorie || !duree) {
            return res.status(400).json({ error: 'Tous les champs sont requis.' });
        }

        const nouvelleFormation = await Formation.create(req.body);
        res.status(201).json(nouvelleFormation);
    } catch (error) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

// Ajouter un utilisateur à une formation (s'il est etudiant)
const addutilisateurToFormation = async (req, res) => {
    const { formationId } = req.params;
    const { utilisateurId } = req.body;

    try {
        const utilisateur = await Utilisateur.findById(utilisateurId);
        if (!utilisateur) return res.status(404).json({ error: 'Utilisateur non trouve' });

        if (utilisateur.role !== 'student') {
            return res.status(400).json({
                error: 'Seuls les etudiants peuvent s\'inscrire à une formation.',
            });
        }

        const formation = await Formation.findById(formationId);
        if (!formation) return res.status(404).json({ error: 'Formation non trouvee' });

        if (formation.utilisateursInscrits.includes(utilisateurId)) {
            return res.status(400).json({ error: 'Utilisateur dejà inscrit à cette formation.' });
        }

        formation.utilisateursInscrits.push(utilisateurId);
        await formation.save();

        res.status(200).json({ message: 'Utilisateur inscrit avec succès', formation });
    } catch (error) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

// Ajouter un module à une formation
const addModuleToFormation = async (req, res) => {
    const { formationId } = req.params;
    const { moduleTitre } = req.body;

    try {
        const formation = await Formation.findById(formationId);
        if (!formation) return res.status(404).json({ error: 'Formation non trouvee' });

        formation.modules.push(moduleTitre);
        await formation.save();

        res.status(200).json({ message: 'Module ajoute avec succès', formation });
    } catch (error) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

// Fonction pour verifier la validite d'un certificat
const verifierValiditeCertificat = async (req, res) => {
    try {
        const { certificatId } = req.params;

        // Chercher le certificat dans la base de donnees
        const certificat = await Certificat.findById(certificatId);

        // Verifier si le certificat existe
        if (!certificat) {
            return res.status(404).json({ error: 'Certificat non trouve' });
        }

        // Calculer la date d'expiration du certificat
        const dateExpiration = new Date(certificat.dateemission);
        dateExpiration.setMonth(dateExpiration.getMonth() + certificat.dureeValidite);

        // Verifier si le certificat est toujours valide
        const estValide = new Date() <= dateExpiration;

        // Retourner la reponse
        res.status(200).json({
            valide: estValide,
            expireLe: dateExpiration,
            certificat,
        });
    } catch (error) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

// Exporter les fonctions
module.exports = {
    createFormation,
    addutilisateurToFormation,
    addModuleToFormation,
    genererCertificat,
    verifierValiditeCertificat,
    createCertificat,
};
