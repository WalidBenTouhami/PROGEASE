// src/modules/utilisateur-management/controllers/utilisateurController.js

const utilisateur = require('../models/utilisateur.js');  // Remplacer import par require
const utilisateurService = require('../services/utilisateur.service.js');  // Remplacer import par require

// Créer un nouvel utilisateur
const createutilisateur = async (req, res) => {
  try {
    const { utilisateurId, name, email, role } = req.body;
    const newutilisateur = new utilisateur({ utilisateurId, name, email, role });
    await newutilisateur.save();
    res.status(201).json(newutilisateur);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Obtenir tous les utilisateurs
const getAllutilisateurs = async (req, res) => {
  try {
    const utilisateurs = await utilisateur.find();
    res.status(200).json(utilisateurs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtenir un utilisateur par son ID
const getutilisateurById = async (req, res) => {
  try {
    const utilisateur = await utilisateur.findById(req.params.id);
    if (!utilisateur) {
      return res.status(404).json({ message: 'utilisateur not found' });
    }
    res.status(200).json(utilisateur);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mettre à jour un utilisateur par son ID
const updateutilisateur = async (req, res) => {
  try {
    const { utilisateurId, name, email, role } = req.body;
    const updatedutilisateur = await utilisateur.findByIdAndUpdate(
      req.params.id,
      { utilisateurId, name, email, role },
      { new: true }
    );
    if (!updatedutilisateur) {
      return res.status(404).json({ message: 'utilisateur not found' });
    }
    res.status(200).json(updatedutilisateur);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Supprimer un utilisateur par son ID
const deleteutilisateur = async (req, res) => {
  try {
    const deletedutilisateur = await utilisateur.findByIdAndDelete(req.params.id);
    if (!deletedutilisateur) {
      return res.status(404).json({ message: 'utilisateur not found' });
    }
    res.status(200).json({ message: 'utilisateur deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Inscrire un nouvel utilisateur
const registerutilisateur = async (req, res) => {
  try {
    const { name, email, password, role, utilisateurId } = req.body;

    // Vérification que tous les champs requis sont envoyés
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Tous les champs sont requis' });
    }

    const { utilisateur, token } = await utilisateurService.registerutilisateur({
      name,
      email,
      password,
      role,
      utilisateurId, // Ceci sera généré automatiquement si laissé vide
    });

    res.status(201).json({
      message: 'utilisateur registered successfully',
      utilisateur: {
        utilisateurId: utilisateur._id,
        name: utilisateur.name,
        email: utilisateur.email,
        role: utilisateur.role,
      },
      token,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Connexion d'un utilisateur
const loginutilisateur = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { utilisateur, token } = await utilisateurService.loginutilisateur(email, password);
    res.status(200).json({
      message: 'Login successful',
      utilisateur: {
        utilisateurId: utilisateur._id,
        name: utilisateur.name,
        email: utilisateur.email,
        role: utilisateur.role,
      },
      token,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Vérification de l'email
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    // Vérifier le token
    const utilisateur = await utilisateur.findOne({
      verificationToken: token,
      verificationTokenExpiration: { $gt: Date.now() },
    });

    if (!utilisateur) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Activer l'utilisateur
    utilisateur.isVerified = true;
    utilisateur.verificationToken = undefined;
    utilisateur.verificationTokenExpiration = undefined;
    await utilisateur.save();

    res.status(200).json({ message: 'Email successfully verified' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Exporter les contrôleurs avec module.exports
module.exports = {
  createutilisateur,
  getAllutilisateurs,
  getutilisateurById,
  updateutilisateur,
  deleteutilisateur,
  registerutilisateur,
  loginutilisateur,
  verifyEmail
};
