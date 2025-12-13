// src/controllers/scheduling.controller.js
const schedulingService = require('../services/scheduling.service');
const logger = require('../utils/logger');
const Projet = require('../models/projet.model');

const schedulingController = {
    /**
     * Génère des rappels pour un projet
     */
    genererRappels: async (req, res) => {
        try {
            const { projetId } = req.params;

            // Récupérer le projet avec ses livrables et tâches
            const projet = await Projet.findById(projetId).populate('livrables').lean();

            if (!projet) {
                return res.status(404).json({
                    success: false,
                    message: 'Projet non trouvé',
                });
            }

            const rappels = await schedulingService.genererRappels(projet);

            logger.info('Rappels générés pour le projet', {
                projetId,
                nombreRappels: rappels.length,
                utilisateur: req.utilisateur?.id,
            });

            res.status(200).json({
                success: true,
                message: 'Rappels générés avec succès',
                data: {
                    projet: {
                        id: projet._id,
                        titre: projet.titre,
                    },
                    rappels,
                    statistiques: {
                        total: rappels.length,
                        parPriorite: {
                            urgente: rappels.filter(r => r.priorite === 'URGENTE').length,
                            haute: rappels.filter(r => r.priorite === 'HAUTE').length,
                            moyenne: rappels.filter(r => r.priorite === 'MOYENNE').length,
                        },
                    },
                },
            });
        } catch (error) {
            logger.error('Erreur lors de la génération des rappels:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne lors de la génération des rappels',
                error: error.message,
            });
        }
    },

    /**
     * Planifie des événements pour un projet
     */
    planifierEvenements: async (req, res) => {
        try {
            const { projetId } = req.params;
            const { type, frequence } = req.body;

            // Récupérer le projet
            const projet = await Projet.findById(projetId).lean();

            if (!projet) {
                return res.status(404).json({
                    success: false,
                    message: 'Projet non trouvé',
                });
            }

            const planning = await schedulingService.planifierEvenements({
                projet,
                type: type || 'REUNION',
                frequence: frequence || 'HEBDOMADAIRE',
            });

            logger.info('Événements planifiés pour le projet', {
                projetId,
                nombreEvenements: planning.evenements.length,
                utilisateur: req.utilisateur?.id,
            });

            res.status(200).json({
                success: true,
                message: 'Événements planifiés avec succès',
                data: planning,
            });
        } catch (error) {
            logger.error('Erreur lors de la planification des événements:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne lors de la planification des événements',
                error: error.message,
            });
        }
    },

    /**
     * Envoie des notifications pour les rappels
     */
    envoyerNotifications: async (req, res) => {
        try {
            const { rappels } = req.body;

            if (!rappels || !Array.isArray(rappels)) {
                return res.status(400).json({
                    success: false,
                    message: 'La liste des rappels est requise',
                });
            }

            const resultat = await schedulingService.envoyerNotifications(rappels);

            logger.info('Notifications envoyées', {
                nombreNotifications: resultat.envoyes,
                utilisateur: req.utilisateur?.id,
            });

            res.status(200).json({
                success: true,
                message: resultat.message,
                data: resultat,
            });
        } catch (error) {
            logger.error("Erreur lors de l'envoi des notifications:", error);
            res.status(500).json({
                success: false,
                message: "Erreur interne lors de l'envoi des notifications",
                error: error.message,
            });
        }
    },

    /**
     * Détecte les conflits de planning
     */
    detecterConflits: async (req, res) => {
        try {
            const { evenements } = req.body;

            if (!evenements || !Array.isArray(evenements)) {
                return res.status(400).json({
                    success: false,
                    message: 'La liste des événements est requise',
                });
            }

            const conflits = schedulingService.detecterConflits(evenements);

            logger.info('Conflits de planning détectés', {
                nombreEvenements: evenements.length,
                nombreConflits: conflits.length,
                utilisateur: req.utilisateur?.id,
            });

            res.status(200).json({
                success: true,
                message: `${conflits.length} conflit(s) détecté(s)`,
                data: {
                    conflits,
                    statistiques: {
                        total: conflits.length,
                        parGravite: {
                            haute: conflits.filter(c => c.gravite === 'HAUTE').length,
                            moyenne: conflits.filter(c => c.gravite === 'MOYENNE').length,
                        },
                    },
                },
            });
        } catch (error) {
            logger.error('Erreur lors de la détection des conflits:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne lors de la détection des conflits',
                error: error.message,
            });
        }
    },

    /**
     * Génère un planning complet avec rappels et événements
     */
    genererPlanningComplet: async (req, res) => {
        try {
            const { projetId } = req.params;
            const { frequence } = req.body;

            // Récupérer le projet
            const projet = await Projet.findById(projetId).populate('livrables').lean();

            if (!projet) {
                return res.status(404).json({
                    success: false,
                    message: 'Projet non trouvé',
                });
            }

            // Générer rappels et événements
            const [rappels, planning] = await Promise.all([
                schedulingService.genererRappels(projet),
                schedulingService.planifierEvenements({
                    projet,
                    frequence: frequence || 'HEBDOMADAIRE',
                }),
            ]);

            // Détecter les conflits
            const conflits = schedulingService.detecterConflits(planning.evenements);

            logger.info('Planning complet généré', {
                projetId,
                nombreRappels: rappels.length,
                nombreEvenements: planning.evenements.length,
                nombreConflits: conflits.length,
                utilisateur: req.utilisateur?.id,
            });

            res.status(200).json({
                success: true,
                message: 'Planning complet généré avec succès',
                data: {
                    projet: {
                        id: projet._id,
                        titre: projet.titre,
                        dateDebut: projet.dateDebut,
                        dateFin: projet.dateFin,
                    },
                    rappels,
                    evenements: planning.evenements,
                    conflits,
                    statistiques: {
                        rappels: {
                            total: rappels.length,
                            urgents: rappels.filter(r => r.priorite === 'URGENTE').length,
                        },
                        evenements: planning.statistiques,
                        conflits: {
                            total: conflits.length,
                            graves: conflits.filter(c => c.gravite === 'HAUTE').length,
                        },
                    },
                },
            });
        } catch (error) {
            logger.error('Erreur lors de la génération du planning complet:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne lors de la génération du planning complet',
                error: error.message,
            });
        }
    },
};

module.exports = schedulingController;
