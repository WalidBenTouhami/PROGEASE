/**
  * Contrôleur pour la gestion des projets
  * @module controllers/projet
  * @requires models/projet
  * @author WalidBenTouhami
  * @version 2.0.0
  * @updated 2025-05-27
  */

 'use strict';

 // Imports
 const Projet = require('../models/projet.model');
 const { StatusCodes } = require('http-status-codes');
 const { validationResult, body } = require('express-validator');
 const logger = require('../utils/logger');
 const mongoose = require('mongoose');

 /**
  * Fonction utilitaire pour gérer les erreurs MongoDB
  * @param {Error} error - L'erreur MongoDB à traiter
  * @returns {Object} Objet contenant le code de statut HTTP et le message d'erreur
  */
 const handleMongoError = (error) => {
     logger.error('Erreur MongoDB :', { error: error.message, stack: error.stack });

     if (error.name === 'ValidationError') {
         const errors = Object.values(error.errors).map(err => err.message);
         return { status: StatusCodes.BAD_REQUEST, message: errors.join(', ') };
     }

     if (error.name === 'CastError') {
         return { status: StatusCodes.BAD_REQUEST, message: 'Format d\'identifiant invalide.' };
     }

     if (error.code === 11000) {
         const field = Object.keys(error.keyPattern)[0];
         return { status: StatusCodes.CONFLICT, message: `Un projet avec ce ${field} existe déjà.` };
     }

     return { status: StatusCodes.INTERNAL_SERVER_ERROR, message: 'Erreur interne du serveur.' };
 };

 /**
  * Fonction utilitaire pour standardiser les réponses API
  * @param {Response} res - Objet de réponse Express
  * @param {number} statusCode - Code de statut HTTP
  * @param {Object|Array} data - Données à retourner
  * @param {string} message - Message informatif optionnel
  * @param {Object} extras - Données supplémentaires à inclure dans la réponse
  */
 const sendResponse = (res, statusCode, data = null, message = null, extras = {}) => {
     const response = {
         success: statusCode >= 200 && statusCode < 300,
         data,
         message,
         timestamp: new Date().toISOString(),
         ...extras
     };

     return res.status(statusCode).json(response);
 };

 /**
  * Middleware de validation des résultats
  * @param {Request} req - Requête Express
  * @param {Response} res - Réponse Express
  * @param {Function} next - Fonction next d'Express
  */
 const validateRequest = (req, res, next) => {
     const errors = validationResult(req);
     if (!errors.isEmpty()) {
         return sendResponse(
             res,
             StatusCodes.BAD_REQUEST,
             null,
             'Données invalides',
             { errors: errors.array() }
         );
     }
     next();
 };

 /**
  * Création d'un nouveau projet
  * @param {Request} req - Requête Express
  * @param {Response} res - Réponse Express
  */
 exports.creerProjet = async (req, res) => {
     let session = null;

     try {
         // Démarrer une session de transaction
         session = await mongoose.startSession();
         session.startTransaction();

         // Compléter les données avec les informations de l'utilisateur
         const donneeProjet = {
             ...req.body,
             createur: req.user?._id,
             majPar: req.user?._id
         };

         const projet = new Projet(donneeProjet);
         const projetEnregistre = await projet.save({ session });

         // Valider et commit la transaction
         await session.commitTransaction();
         session.endSession();
         session = null;

         logger.info(`Projet créé avec succès: ${projetEnregistre._id}`, {
             userId: req.user?._id,
             projetId: projetEnregistre._id
         });

         sendResponse(res, StatusCodes.CREATED, projetEnregistre, 'Projet créé avec succès');
     } catch (error) {
         // Annuler la transaction en cas d'erreur
         if (session) {
             await session.abortTransaction();
             session.endSession();
         }

         const { status, message } = handleMongoError(error);
         sendResponse(res, status, null, message);
     }
 };

 /**
  * Récupération de tous les projets avec pagination et filtres
  * @param {Request} req - Requête Express
  * @param {Response} res - Réponse Express
  */
 exports.recupererProjets = async (req, res) => {
     try {
         // Extraire et valider les paramètres de requête
         const {
             page = 1,
             limit = 10,
             statut,
             tri = '-creeLe',
             recherche,
             dateDebut,
             dateFin,
             tuteurId
         } = req.query;

         // Construire la requête de filtrage
         const query = {};

         if (statut) query.statut = statut;
         if (tuteurId) query.tuteur = tuteurId;

         // Filtrage par période
         if (dateDebut || dateFin) {
             if (dateDebut) {
                 query.dateDebut = { $gte: new Date(dateDebut) };
             }
             if (dateFin) {
                 query.dateFin = { $lte: new Date(dateFin) };
             }
         }

         // Recherche textuelle
         if (recherche) {
             query.$text = { $search: recherche };
         }

         // Pagination et récupération des données
         const pageNum = Number(page);
         const limitNum = Number(limit);
         const skip = (pageNum - 1) * limitNum;

         // Utilisation de Promise.all pour les requêtes parallèles
         const [projets, total] = await Promise.all([
             Projet.find(query)
                 .sort(tri)
                 .limit(limitNum)
                 .skip(skip)
                 .populate('tuteur', 'nom prenom email')
                 .populate('livrables', 'nom statut dateLimite')
                 .populate('createur', 'nom prenom')
                 .lean(),
             Projet.countDocuments(query)
         ]);

         // Transformer les données si nécessaire
         const projetsEnriches = projets.map(projet => ({
             ...projet,
             estActif: new Projet(projet).isActif(),
             estEnRetard: new Projet(projet).isEnRetard()
         }));

         sendResponse(res, StatusCodes.OK, {
             items: projetsEnriches,
             pagination: {
                 total,
                 page: pageNum,
                 limit: limitNum,
                 pages: Math.ceil(total / limitNum)
             }
         });
     } catch (error) {
         const { status, message } = handleMongoError(error);
         sendResponse(res, status, null, message);
     }
 };

 /**
  * Récupération d'un projet par son ID
  * @param {Request} req - Requête Express
  * @param {Response} res - Réponse Express
  */
 exports.recupererProjetParId = async (req, res) => {
     try {
         const projet = await Projet.findById(req.params.id)
             .populate('tuteur', 'nom prenom email')
             .populate('equipe', 'nom prenom email')
             .populate({
                 path: 'livrables',
                 select: 'nom description statut dateLimite urlDepot commentaires',
                 populate: {
                     path: 'commentaires.auteur',
                     select: 'nom prenom'
                 }
             })
             .populate('createur', 'nom prenom')
             .populate('majPar', 'nom prenom');

         if (!projet) {
             return sendResponse(res, StatusCodes.NOT_FOUND, null, 'Projet introuvable');
         }

         // Ajouter des propriétés calculées
         const estActif = projet.isActif();
         const estEnRetard = projet.isEnRetard();

         sendResponse(res, StatusCodes.OK, {
             ...projet.toObject(),
             estActif,
             estEnRetard
         });
     } catch (error) {
         const { status, message } = handleMongoError(error);
         sendResponse(res, status, null, message);
     }
 };

 /**
  * Mise à jour d'un projet existant
  * @param {Request} req - Requête Express
  * @param {Response} res - Réponse Express
  */
 exports.mettreAJourProjet = async (req, res) => {
     let session = null;

     try {
         session = await mongoose.startSession();
         session.startTransaction();

         // Compléter les données avec les informations de mise à jour
         const donneesMAJ = {
             ...req.body,
             majPar: req.user?._id,
             majLe: new Date()
         };

         // Utiliser findOne d'abord pour vérifier les autorisations
         const projet = await Projet.findById(req.params.id);

         if (!projet) {
             if (session) {
                 await session.abortTransaction();
                 session.endSession();
             }
             return sendResponse(res, StatusCodes.NOT_FOUND, null, 'Projet introuvable');
         }

         // Vérification d'autorisation avancée (exemple)
         // const isAuthorized = req.user.isAdmin || projet.createur.equals(req.user._id) || projet.tuteur.equals(req.user._id);
         // if (!isAuthorized) {
         //     await session.abortTransaction();
         //     session.endSession();
         //     return sendResponse(res, StatusCodes.FORBIDDEN, null, 'Autorisation insuffisante');
         // }

         // Appliquer les mises à jour
         Object.assign(projet, donneesMAJ);
         const projetMisAJour = await projet.save({ session });

         // Si tout est OK, valider la transaction
         await session.commitTransaction();
         session.endSession();
         session = null;

         logger.info(`Projet mis à jour avec succès: ${projetMisAJour._id}`, {
             userId: req.user?._id,
             projetId: projetMisAJour._id
         });

         // Récupérer le projet avec les relations pour la réponse
         const projetComplet = await Projet.findById(req.params.id)
             .populate('tuteur', 'nom prenom email')
             .populate('livrables', 'nom statut')
             .populate('createur', 'nom prenom')
             .populate('majPar', 'nom prenom');

         sendResponse(res, StatusCodes.OK, projetComplet, 'Projet mis à jour avec succès');
     } catch (error) {
         if (session) {
             await session.abortTransaction();
             session.endSession();
         }

         const { status, message } = handleMongoError(error);
         sendResponse(res, status, null, message);
     }
 };

 /**
  * Suppression d'un projet
  * @param {Request} req - Requête Express
  * @param {Response} res - Réponse Express
  */
 exports.supprimerProjet = async (req, res) => {
     let session = null;

     try {
         session = await mongoose.startSession();
         session.startTransaction();

         // Utiliser findById pour les vérifications
         const projet = await Projet.findById(req.params.id);

         if (!projet) {
             if (session) {
                 await session.abortTransaction();
                 session.endSession();
             }
             return sendResponse(res, StatusCodes.NOT_FOUND, null, 'Projet introuvable');
         }

         // Utiliser deleteOne au lieu de remove (deprecated)
         await Projet.deleteOne({ _id: req.params.id }, { session });

         // Valider la transaction
         await session.commitTransaction();
         session.endSession();
         session = null;

         logger.info(`Projet supprimé avec succès: ${req.params.id}`, {
             userId: req.user?._id,
             projetId: req.params.id
         });

         sendResponse(res, StatusCodes.OK, null, 'Projet supprimé avec succès');
     } catch (error) {
         if (session) {
             await session.abortTransaction();
             session.endSession();
         }

         // Gérer spécifiquement l'erreur de dépendance (livrables existants)
         if (error.message && error.message.includes('livrable')) {
             return sendResponse(res, StatusCodes.CONFLICT, null, error.message);
         }

         const { status, message } = handleMongoError(error);
         sendResponse(res, status, null, message);
     }
 };

 /**
  * Récupération des projets par tuteur
  * @param {Request} req - Requête Express
  * @param {Response} res - Réponse Express
  */
 exports.recupererProjetParTuteur = async (req, res) => {
     try {
         const tuteurId = req.params.tuteurId;
         const projets = await Projet.findByTuteur(tuteurId);

         sendResponse(res, StatusCodes.OK, projets);
     } catch (error) {
         const { status, message } = handleMongoError(error);
         sendResponse(res, status, null, message);
     }
 };

 /**
  * Récupération des projets par compétence
  * @param {Request} req - Requête Express
  * @param {Response} res - Réponse Express
  */
 exports.recupererProjetParCompetence = async (req, res) => {
     try {
         const competence = req.params.competence;
         const projets = await Projet.findByCompetence(competence);

         sendResponse(res, StatusCodes.OK, projets);
     } catch (error) {
         const { status, message } = handleMongoError(error);
         sendResponse(res, status, null, message);
     }
 };

 /**
  * Récupère un tableau de bord avec des statistiques sur les projets
  * @param {Request} req - Requête Express
  * @param {Response} res - Réponse Express
  */
 exports.recupererTableauDeBord = async (req, res) => {
     try {
         // Statistiques globales
         const [
             totalProjets,
             projetsActifs,
             projetsTermines,
             projetsEnRetard,
             livrablesPrevusCetteSemaine
         ] = await Promise.all([
             // Total des projets
             Projet.countDocuments({}),

             // Projets actifs (en cours)
             Projet.countDocuments({
                 dateDebut: { $lte: new Date() },
                 dateFin: { $gte: new Date() }
             }),

             // Projets terminés
             Projet.countDocuments({ statut: 'TERMINE' }),

             // Projets en retard
             Projet.find({
                 dateFin: { $lt: new Date() },
                 statut: { $ne: 'TERMINE' }
             }).countDocuments(),

             // Livrables prévus cette semaine
             (async () => {
                 // Calculer le début et la fin de la semaine
                 const today = new Date();
                 const startOfWeek = new Date(today);
                 startOfWeek.setDate(today.getDate() - today.getDay());
                 startOfWeek.setHours(0, 0, 0, 0);

                 const endOfWeek = new Date(startOfWeek);
                 endOfWeek.setDate(startOfWeek.getDate() + 6);
                 endOfWeek.setHours(23, 59, 59, 999);

                 // Utiliser le modèle Livrable pour la requête
                 const Livrable = mongoose.model('Livrable');
                 return await Livrable.countDocuments({
                     dateLimite: {
                         $gte: startOfWeek,
                         $lte: endOfWeek
                     }
                 });
             })()
         ]);

         // Projets par statut (pour un graphique)
         const projetParStatut = await Projet.aggregate([
             { $group: { _id: "$statut", count: { $sum: 1 } } }
         ]);

         // Projets créés par mois (pour un graphique de tendance)
         const projetParMois = await Projet.aggregate([
             {
                 $group: {
                     _id: {
                         year: { $year: "$creeLe" },
                         month: { $month: "$creeLe" }
                     },
                     count: { $sum: 1 }
                 }
             },
             { $sort: { "_id.year": 1, "_id.month": 1 } }
         ]);

         // Transformer les données pour la lisibilité
         const statistiquesParStatut = projetParStatut.reduce((acc, curr) => {
             acc[curr._id] = curr.count;
             return acc;
         }, {});

         const statistiquesParMois = projetParMois.map(item => ({
             date: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`,
             count: item.count
         }));

         sendResponse(res, StatusCodes.OK, {
             resume: {
                 totalProjets,
                 projetsActifs,
                 projetsTermines,
                 projetsEnRetard,
                 livrablesPrevusCetteSemaine
             },
             statistiquesParStatut,
             statistiquesParMois
         });
     } catch (error) {
         const { status, message } = handleMongoError(error);
         sendResponse(res, status, null, message);
     }
 };

 // Exporter les validateurs pour utilisation dans les routes
 exports.validators = {
     validateRequest,
     createProjet: [
         // Validation pour la création d'un projet
         body('titre')
             .isLength({ min: 5, max: 100 })
             .withMessage('Le titre doit contenir entre 5 et 100 caractères'),
         body('description')
             .isLength({ min: 20 })
             .withMessage('La description doit contenir au moins 20 caractères'),
         body('dateDebut')
             .isISO8601()
             .withMessage('La date de début doit être une date valide au format ISO8601'),
         body('dateFin')
             .isISO8601()
             .withMessage('La date de fin doit être une date valide au format ISO8601')
             .custom((value, { req }) => {
                 if (new Date(value) <= new Date(req.body.dateDebut)) {
                     throw new Error('La date de fin doit être postérieure à la date de début');
                 }
                 return true;
             }),
         body('competences')
             .optional()
             .isArray()
             .withMessage('Les compétences doivent être un tableau'),
         body('competences.*')
             .optional()
             .isString()
             .isLength({ min: 2, max: 30 })
             .withMessage('Chaque compétence doit contenir entre 2 et 30 caractères'),
         validateRequest
     ],
     updateProjet: [
         // Validations pour la mise à jour d'un projet
         validateRequest
     ]
 };

 module.exports = exports;