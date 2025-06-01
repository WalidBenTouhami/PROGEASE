const Utilisateur = require('../models/utilisateur.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key';
const JWT_EXPIRES_IN = '7d';

// Inscription d’un utilisateur
async function registerutilisateur({ name, email, password, role, utilisateurId }) {
    // Vérifier si l’email existe déjà
    const existing = await Utilisateur.findOne({ email });
    if (existing) throw new Error('Email déjà utilisé');

    const hash = await bcrypt.hash(password, 10);

    // Générer un token de vérification d’email
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpiration = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const utilisateur = new Utilisateur({
        utilisateurId,
        name,
        email,
        password: hash,
        role,
        isVerified: false,
        verificationToken,
        verificationTokenExpiration,
        creeLe: new Date(),
        majLe: new Date()
    });

    await utilisateur.save();

    // Générer un JWT
    const token = jwt.sign({ id: utilisateur._id, role: utilisateur.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    // Ici, tu peux envoyer un email de vérification avec le token

    return { utilisateur, token };
}

// Connexion d’un utilisateur
async function loginutilisateur(email, password) {
    const utilisateur = await Utilisateur.findOne({ email });
    if (!utilisateur) throw new Error('Utilisateur non trouvé');
    if (!utilisateur.isVerified) throw new Error('Email non vérifié');

    const match = await bcrypt.compare(password, utilisateur.password);
    if (!match) throw new Error('Mot de passe incorrect');

    const token = jwt.sign({ id: utilisateur._id, role: utilisateur.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    return { utilisateur, token };
}

module.exports = {
    registerutilisateur,
    loginutilisateur
};