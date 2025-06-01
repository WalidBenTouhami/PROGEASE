const Utilisateur = require('../models/utilisateur.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
const { JWT_SECRET } = require('../../config/constants');
const { formatUtilisateurResponse } = require('../utils/formatters');
const { AppError } = require('../utils/appError');
const { MessagesErreur, StatutHttp, Enums } = require('../../config/constants');

class UtilisateurService {
    // Créer un nouvel utilisateur
    async creerUtilisateur(donneesUtilisateur) {
        const utilisateurExistant = await Utilisateur.findOne({ email: donneesUtilisateur.email });
        if (utilisateurExistant) {
            throw new AppError('Un utilisateur avec cet email existe déjà', 400);
        }

        const utilisateur = await Utilisateur.create(donneesUtilisateur);
        return utilisateur;
    }

    // Obtenir tous les utilisateurs
    async obtenirUtilisateurs(filtres = {}) {
        const utilisateurs = await Utilisateur.find(filtres).select('-motDePasse');
        return utilisateurs;
    }

    // Obtenir un utilisateur par ID
    async obtenirUtilisateurParId(id) {
        const utilisateur = await Utilisateur.findById(id).select('-motDePasse');
        if (!utilisateur) {
            throw new AppError(MessagesErreur.GENERAL.NON_TROUVE, StatutHttp.NON_TROUVE);
        }
        return utilisateur;
    }

    // Mettre à jour un utilisateur
    async mettreAJourUtilisateur(id, donneesMiseAJour) {
        const utilisateur = await Utilisateur.findByIdAndUpdate(
            id,
            { $set: donneesMiseAJour },
            { new: true, runValidators: true }
        ).select('-motDePasse');

        if (!utilisateur) {
            throw new AppError('Utilisateur non trouvé', 404);
        }
        return utilisateur;
    }

    // Supprimer un utilisateur
    async supprimerUtilisateur(id) {
        const utilisateur = await Utilisateur.findByIdAndDelete(id);
        if (!utilisateur) {
            throw new AppError('Utilisateur non trouvé', 404);
        }
        return utilisateur;
    }

    // Authentification
    async authentifier(email, motDePasse) {
        const utilisateur = await Utilisateur.findOne({ email }).select('+motDePasse');
        if (!utilisateur || !(await utilisateur.comparerMotDePasse(motDePasse))) {
            throw new AppError(MessagesErreur.AUTH.INVALID_CREDENTIALS, StatutHttp.NON_AUTORISE);
        }

        // Mettre à jour la dernière connexion
        utilisateur.derniereConnexion = new Date();
        await utilisateur.save({ validateBeforeSave: false });

        // Générer le token JWT
        const token = jwt.sign(
            { id: utilisateur._id, role: utilisateur.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        return { utilisateur, token };
    }

    // Vérifier le token JWT
    async verifierToken(token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const utilisateur = await Utilisateur.findById(decoded.id).select('-motDePasse');
            
            if (!utilisateur) {
                throw new AppError(MessagesErreur.GENERAL.NON_TROUVE, StatutHttp.NON_TROUVE);
            }

            return utilisateur;
        } catch (error) {
            throw new AppError(MessagesErreur.AUTH.TOKEN_INVALIDE, StatutHttp.NON_AUTORISE);
        }
    }
}

module.exports = new UtilisateurService();