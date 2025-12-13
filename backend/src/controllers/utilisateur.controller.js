// backend/src/controllers/utilisateur.controller.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('../config');
const Utilisateur = require('../models/utilisateur.model');
const logger = require('../utils/logger');
const utilisateurService = require('../services/utilisateur.service');
const { AppError } = require('../utils/appError');
const { catchAsync } = require('../utils/catchAsync');
const { genererToken } = require('../utils/jwt');

class UtilisateurController {
    // Récupérer tous les utilisateurs
    static async obtenirUtilisateurs(req, res, next) {
        const utilisateurs = await utilisateurService.obtenirUtilisateurs(req.query);
        res.status(200).json({
            status: 'success',
            results: utilisateurs.length,
            data: {
                utilisateurs,
            },
        });
    }

    // Récupérer un utilisateur par son ID
    static async obtenirUtilisateur(req, res, next) {
        const utilisateur = await utilisateurService.obtenirUtilisateurParId(req.params.id);
        res.status(200).json({
            status: 'success',
            data: {
                utilisateur,
            },
        });
    }

    // Créer un nouvel utilisateur
    static async creerUtilisateur(req, res, next) {
        const utilisateur = await utilisateurService.creerUtilisateur(req.body);
        res.status(201).json({
            status: 'success',
            data: {
                utilisateur,
            },
        });
    }

    // Mettre à jour un utilisateur
    static async mettreAJourUtilisateur(req, res, next) {
        const utilisateur = await utilisateurService.mettreAJourUtilisateur(
            req.params.id,
            req.body
        );
        res.status(200).json({
            status: 'success',
            data: {
                utilisateur,
            },
        });
    }

    // Supprimer un utilisateur
    static async supprimerUtilisateur(req, res, next) {
        await utilisateurService.supprimerUtilisateur(req.params.id);
        res.status(204).json({
            status: 'success',
            data: null,
        });
    }

    // Inscription d'un nouvel utilisateur
    static async inscription(req, res) {
        try {
            const { email, motDePasse, nom, prenom } = req.body;

            // Vérifier si l'utilisateur existe déjà
            const utilisateurExistant = await Utilisateur.findOne({ email });
            if (utilisateurExistant) {
                return res.status(400).json({
                    success: false,
                    message: 'Cet email est déjà utilisé',
                });
            }

            // Créer le nouvel utilisateur
            const utilisateur = await Utilisateur.create({
                email,
                motDePasse,
                nom,
                prenom,
                role: 'UTILISATEUR',
            });

            // Générer le token
            const token = genererToken(utilisateur);

            res.status(201).json({
                success: true,
                token,
                utilisateur: {
                    id: utilisateur._id,
                    email: utilisateur.email,
                    nom: utilisateur.nom,
                    prenom: utilisateur.prenom,
                    role: utilisateur.role,
                },
            });
        } catch (error) {
            logger.error("Erreur lors de l'inscription:", error);
            res.status(500).json({
                success: false,
                message: "Erreur lors de l'inscription",
            });
        }
    }

    // Connexion d'un utilisateur
    static async connexion(req, res) {
        try {
            const { email, motDePasse } = req.body;

            // Vérifier si l'utilisateur existe
            const utilisateur = await Utilisateur.findOne({ email }).select('+motDePasse');
            if (!utilisateur) {
                return res.status(401).json({
                    success: false,
                    message: 'Email ou mot de passe incorrect',
                });
            }

            // Vérifier le mot de passe
            const motDePasseCorrect = await utilisateur.verifierMotDePasse(motDePasse);
            if (!motDePasseCorrect) {
                return res.status(401).json({
                    success: false,
                    message: 'Email ou mot de passe incorrect',
                });
            }

            // Générer le token
            const token = genererToken(utilisateur);

            res.json({
                success: true,
                token,
                utilisateur: {
                    id: utilisateur._id,
                    email: utilisateur.email,
                    nom: utilisateur.nom,
                    prenom: utilisateur.prenom,
                    role: utilisateur.role,
                },
            });
        } catch (error) {
            logger.error('Erreur lors de la connexion:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la connexion',
            });
        }
    }

    // Vérification de l'email
    static async verifierEmail(req, res, next) {
        const { token } = req.params;
        await utilisateurService.verifierEmail(token);

        res.status(200).json({
            success: true,
            message: 'Email vérifié avec succès',
        });
    }

    // Obtenir le profil de l'utilisateur connecté
    static async getProfil(req, res) {
        try {
            const utilisateur = await Utilisateur.findById(req.utilisateur.id);
            res.json({
                success: true,
                utilisateur: {
                    id: utilisateur._id,
                    email: utilisateur.email,
                    nom: utilisateur.nom,
                    prenom: utilisateur.prenom,
                    role: utilisateur.role,
                },
            });
        } catch (error) {
            logger.error('Erreur lors de la récupération du profil:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération du profil',
            });
        }
    }

    // Mettre à jour le profil de l'utilisateur connecté
    static async mettreAJourProfil(req, res) {
        try {
            const { nom, prenom, email } = req.body;
            const utilisateur = await Utilisateur.findByIdAndUpdate(
                req.utilisateur.id,
                { nom, prenom, email },
                { new: true, runValidators: true }
            );

            res.json({
                success: true,
                utilisateur: {
                    id: utilisateur._id,
                    email: utilisateur.email,
                    nom: utilisateur.nom,
                    prenom: utilisateur.prenom,
                    role: utilisateur.role,
                },
            });
        } catch (error) {
            logger.error('Erreur lors de la mise à jour du profil:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la mise à jour du profil',
            });
        }
    }

    // Changer le mot de passe
    static async changerMotDePasse(req, res) {
        try {
            const { ancienMotDePasse, nouveauMotDePasse } = req.body;
            const utilisateur = await Utilisateur.findById(req.utilisateur.id).select(
                '+motDePasse'
            );

            // Vérifier l'ancien mot de passe
            const motDePasseCorrect = await utilisateur.verifierMotDePasse(ancienMotDePasse);
            if (!motDePasseCorrect) {
                return res.status(401).json({
                    success: false,
                    message: 'Ancien mot de passe incorrect',
                });
            }

            // Mettre à jour le mot de passe
            utilisateur.motDePasse = nouveauMotDePasse;
            await utilisateur.save();

            res.json({
                success: true,
                message: 'Mot de passe modifié avec succès',
            });
        } catch (error) {
            logger.error('Erreur lors du changement de mot de passe:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors du changement de mot de passe',
            });
        }
    }

    // Mot de passe oublié
    static async motDePasseOublie(req, res) {
        try {
            const { email } = req.body;
            const utilisateur = await Utilisateur.findOne({ email });

            if (!utilisateur) {
                return res.status(404).json({
                    success: false,
                    message: 'Aucun utilisateur trouvé avec cet email',
                });
            }

            // Générer un token de réinitialisation
            const resetToken = crypto.randomBytes(32).toString('hex');
            utilisateur.resetPasswordToken = crypto
                .createHash('sha256')
                .update(resetToken)
                .digest('hex');
            utilisateur.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

            await utilisateur.save();

            // TODO: Envoyer l'email avec le lien de réinitialisation
            // Pour l'instant, on renvoie juste le token
            res.json({
                success: true,
                message: 'Un email de réinitialisation a été envoyé',
                resetToken, // À retirer en production
            });
        } catch (error) {
            logger.error('Erreur lors de la demande de réinitialisation:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la demande de réinitialisation',
            });
        }
    }

    // Réinitialiser le mot de passe
    static async reinitialiserMotDePasse(req, res) {
        try {
            const { token } = req.params;
            const { motDePasse } = req.body;

            const utilisateur = await Utilisateur.findOne({
                resetPasswordToken: crypto.createHash('sha256').update(token).digest('hex'),
                resetPasswordExpires: { $gt: Date.now() },
            });

            if (!utilisateur) {
                return res.status(400).json({
                    success: false,
                    message: 'Token invalide ou expiré',
                });
            }

            utilisateur.motDePasse = motDePasse;
            utilisateur.resetPasswordToken = undefined;
            utilisateur.resetPasswordExpires = undefined;
            await utilisateur.save();

            res.json({
                success: true,
                message: 'Mot de passe réinitialisé avec succès',
            });
        } catch (error) {
            logger.error('Erreur lors de la réinitialisation du mot de passe:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la réinitialisation du mot de passe',
            });
        }
    }

    // Obtenir tous les utilisateurs (admin)
    static async getAllUtilisateurs(req, res) {
        try {
            const utilisateurs = await Utilisateur.find().select('-motDePasse');
            res.json({
                success: true,
                utilisateurs,
            });
        } catch (error) {
            logger.error('Erreur lors de la récupération des utilisateurs:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération des utilisateurs',
            });
        }
    }

    // Obtenir un utilisateur par ID (admin)
    static async getUtilisateurById(req, res) {
        try {
            const utilisateur = await Utilisateur.findById(req.params.id).select('-motDePasse');
            if (!utilisateur) {
                return res.status(404).json({
                    success: false,
                    message: 'Utilisateur non trouvé',
                });
            }
            res.json({
                success: true,
                utilisateur,
            });
        } catch (error) {
            logger.error("Erreur lors de la récupération de l'utilisateur:", error);
            res.status(500).json({
                success: false,
                message: "Erreur lors de la récupération de l'utilisateur",
            });
        }
    }

    // Mettre à jour un utilisateur (admin)
    static async mettreAJourUtilisateur(req, res) {
        try {
            const { nom, prenom, email, role } = req.body;
            const utilisateur = await Utilisateur.findById(req.params.id);

            if (!utilisateur) {
                return res.status(404).json({
                    success: false,
                    message: 'Utilisateur non trouvé',
                });
            }

            utilisateur.nom = nom || utilisateur.nom;
            utilisateur.prenom = prenom || utilisateur.prenom;
            utilisateur.email = email || utilisateur.email;
            if (role) utilisateur.role = role;

            await utilisateur.save();

            res.json({
                success: true,
                utilisateur: {
                    id: utilisateur._id,
                    email: utilisateur.email,
                    nom: utilisateur.nom,
                    prenom: utilisateur.prenom,
                    role: utilisateur.role,
                },
            });
        } catch (error) {
            logger.error("Erreur lors de la mise à jour de l'utilisateur:", error);
            res.status(500).json({
                success: false,
                message: "Erreur lors de la mise à jour de l'utilisateur",
            });
        }
    }

    // Supprimer un utilisateur (admin)
    static async supprimerUtilisateur(req, res) {
        try {
            const utilisateur = await Utilisateur.findByIdAndDelete(req.params.id);
            if (!utilisateur) {
                return res.status(404).json({
                    success: false,
                    message: 'Utilisateur non trouvé',
                });
            }
            res.json({
                success: true,
                message: 'Utilisateur supprimé avec succès',
            });
        } catch (error) {
            logger.error("Erreur lors de la suppression de l'utilisateur:", error);
            res.status(500).json({
                success: false,
                message: "Erreur lors de la suppression de l'utilisateur",
            });
        }
    }
}

module.exports = UtilisateurController;
