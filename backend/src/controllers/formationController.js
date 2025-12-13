const Formation = require('../Formation');
const Certificat = require('../Certification');
const Utilisateur = require('../models/utilisateur');
const QuizResult = require('../QuizResult');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const logger = require('../utils/logger');

const checkQuizReussis = async (utilisateurId, formationsRequises) => {
    try {
        const formations = await Formation.find({
            _id: { $in: formationsRequises },
        }).populate('contenu.quiz');

        for (const formation of formations) {
            const quizIds = formation.contenu.quiz;

            for (const quizId of quizIds) {
                const quizResult = await QuizResult.findOne({
                    utilisateurId: utilisateurId,
                    quizId: quizId,
                });

                if (!quizResult || !quizResult.isPassed) {
                    return false;
                }
            }
        }

        return true;
    } catch (error) {
        logger.error('Erreur lors de la verification des quiz:', error);
        return false;
    }
};

const createFormation = async (req, res) => {
    try {
        const nouvelleFormation = await Formation.create(req.body);
        res.status(201).json({
            message: 'Formation creee avec succès',
            formation: nouvelleFormation,
        });
    } catch (error) {
        logger.error('Erreur creation formation :', error);
        res.status(500).json({ error: 'Erreur serveur lors de la creation de la formation' });
    }
};

const getAllFormations = async (req, res) => {
    try {
        // Recuperer toutes les formations depuis la base de donnees
        const formations = await Formation.find().populate('contenu.quiz');
        res.status(200).json(formations);
    } catch (error) {
        logger.error('Erreur serveur lors de la recuperation des formations:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

const addutilisateurToFormation = async (req, res) => {
    const { formationId } = req.params;
    const { utilisateurId } = req.body;

    if (!utilisateurId) {
        return res.status(400).json({ error: 'utilisateurId est requis' });
    }

    try {
        const utilisateur = await Utilisateur.findById(utilisateurId);
        if (!utilisateur) return res.status(404).json({ error: 'Utilisateur non trouvé' });

        if (utilisateur.role !== 'student') {
            return res.status(400).json({
                error: "Seuls les étudiants peuvent s'inscrire à une formation.",
            });
        }

        const formation = await Formation.findById(formationId);
        if (!formation) return res.status(404).json({ error: 'Formation non trouvée' });

        const isAlreadyEnrolled = formation.utilisateursInscrits.some(
            id => id.toString() === utilisateurId
        );
        if (isAlreadyEnrolled) {
            return res.status(400).json({ error: 'Utilisateur déjà inscrit à cette formation.' });
        }

        formation.utilisateursInscrits.push(utilisateurId);
        await Formation.updateOne(
            { _id: formationId },
            { $addToSet: { utilisateursInscrits: utilisateurId } }
        );
        res.status(200).json({ message: 'Utilisateur inscrit avec succès', formation });
    } catch (error) {
        logger.error('Erreur serveur:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

// Ajouter un module à une formation
const addModuleToFormation = async (req, res) => {
    const { formationId } = req.params;
    const { moduleTitre } = req.body;

    try {
        // Recherche de la formation
        const formation = await Formation.findById(formationId);
        if (!formation) return res.status(404).json({ error: 'Formation non trouvee' });

        // Ajouter le module à la formation
        formation.modules.push(moduleTitre);
        await formation.save();

        res.status(200).json({ message: 'Module ajoute avec succès', formation });
    } catch (error) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

// Fonction pour generer un certificat en verifiant l'eligibilite
// Fonction pour generer le certificat en PDF
// Fonction pour generer le certificat

const path = require('path');

const genererCertificat = async (req, res) => {
    const utilisateurId = req.utilisateur.utilisateurId;

    if (!utilisateurId) {
        return res.status(400).json({ error: 'ID utilisateur manquant dans le token.' });
    }

    const { formationsRequises, titre, description, dureeValidite } = req.body;

    try {
        logger.info('Donnees de la requête : ', {
            utilisateurId,
            formationsRequises,
            titre,
            description,
            dureeValidite,
        });

        const estEligible = await checkQuizReussis(utilisateurId, formationsRequises);
        if (!estEligible) {
            return res.status(403).json({ error: "L'utilisateur n'a pas rempli les conditions." });
        }

        const nouveauCertificat = await Certificat.create({
            utilisateurId,
            titre,
            description,
            dureeValidite,
            conditions: { formationsRequises },
        });

        // 🔧 Creation du dossier s'il n'existe pas
        const certDir = path.join(__dirname, '../certificat');
        if (!fs.existsSync(certDir)) {
            fs.mkdirSync(certDir, { recursive: true });
        }

        // ✅ Generation d’un nom de fichier unique
        const timestamp = Date.now();
        const filename = `certificat-${timestamp}.pdf`;
        const filePath = path.join(certDir, filename);

        const doc = new PDFDocument();
        doc.pipe(fs.createWriteStream(filePath));
        doc.fontSize(25).text(`Certificat : ${titre}`, 100, 100);
        doc.fontSize(16).text(`Description : ${description}`, 100, 140);
        doc.fontSize(12).text(`Validite : ${dureeValidite} mois`, 100, 180);
        doc.fontSize(12).text(`Utilisateur ID : ${utilisateurId}`, 100, 220);
        doc.end();

        res.status(201).json({
            message: 'Certificat genere avec succès',
            certificat: nouveauCertificat,
            pdfPath: `/certificat/${filename}`, // chemin relatif si tu veux le servir plus tard
        });
    } catch (error) {
        logger.error('Erreur serveur : ', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

const getFormationById = async (req, res) => {
    const { formationId } = req.params;

    try {
        const formation = await Formation.findById(formationId).populate('contenu.quiz');

        if (!formation) {
            return res.status(404).json({ error: 'Formation non trouvée' });
        }

        res.status(200).json(formation);
    } catch (error) {
        logger.error('Erreur lors de la récupération de la formation :', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

// Exporter les fonctions
module.exports = {
    createFormation,
    getAllFormations,
    addutilisateurToFormation,
    addModuleToFormation,
    genererCertificat,
    getFormationById,
};
