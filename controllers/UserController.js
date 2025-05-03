// src/modules/user-management/controllers/UserController.js

const User = require('../models/User.js');  // Remplacer import par require
const userService = require('../services/user.service.js');  // Remplacer import par require

// Créer un nouvel utilisateur
const createUser = async (req, res) => {
  try {
    const { userId, name, email, role } = req.body;
    const newUser = new User({ userId, name, email, role });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Obtenir tous les utilisateurs
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtenir un utilisateur par son ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mettre à jour un utilisateur par son ID
const updateUser = async (req, res) => {
  try {
    const { userId, name, email, role } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { userId, name, email, role },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Supprimer un utilisateur par son ID
const deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Inscrire un nouvel utilisateur
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, userId } = req.body;

    // Vérification que tous les champs requis sont envoyés
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Tous les champs sont requis' });
    }

    const { user, token } = await userService.registerUser({
      name,
      email,
      password,
      role,
      userId, // Ceci sera généré automatiquement si laissé vide
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        userId: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Connexion d'un utilisateur
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await userService.loginUser(email, password);
    res.status(200).json({
      message: 'Login successful',
      user: {
        userId: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
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
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpiration: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Activer l'utilisateur
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiration = undefined;
    await user.save();

    res.status(200).json({ message: 'Email successfully verified' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Exporter les contrôleurs avec module.exports
module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  registerUser,
  loginUser,
  verifyEmail
};
