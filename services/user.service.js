// src/modules/utilisateur-management/services/utilisateur.service.js

const utilisateur = require('../models/utilisateur');  // Utilisation de require pour le modèle
const bcrypt = require('bcryptjs');  // Utilisation de require pour bcrypt
const jwt = require('jsonwebtoken');  // Utilisation de require pour jsonwebtoken
const nodemailer = require('nodemailer');  // Utilisation de require pour nodemailer

const JWT_SECRET = process.env.JWT_SECRET;

// Générer un token JWT
const generateToken = (utilisateur) => {
  return jwt.sign(
    { utilisateurId: utilisateur._id, name: utilisateur.name, email: utilisateur.email, role: utilisateur.role },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
};

// Inscrire un nouvel utilisateur
const registerutilisateur = async ({ name, email, password, role }) => {
  const existingutilisateur = await utilisateur.findOne({ email });
  if (existingutilisateur) {
    throw new Error('utilisateur already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newutilisateur = new utilisateur({
    name,
    email,
    password: hashedPassword,
    role,
  });

  const verificationToken = newutilisateur.generateVerificationToken();
  await newutilisateur.save();
  await sendVerificationEmail(newutilisateur.email, verificationToken);

  const token = generateToken(newutilisateur);

  return { utilisateur: newutilisateur, token };
};

// Connexion d'un utilisateur
const loginutilisateur = async (email, password) => {
  const utilisateur = await utilisateur.findOne({ email });
  if (!utilisateur) {
    throw new Error('utilisateur not found');
  }

  const isMatch = await bcrypt.compare(password, utilisateur.password);
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  const token = generateToken(utilisateur);
  return { utilisateur, token };
};

// Fonction pour envoyer un email de vérification
const sendVerificationEmail = async (email, verificationToken) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      utilisateur: 'imenf902@gmail.com',  
      pass: 'wpkk qkty mnoz gbyb',        
    },
  });

  const verificationLink = `http://localhost:3000/api/verify-email?token=${verificationToken}`;

  const mailOptions = {
    from: 'attestationauto@gmail.com',  
    to: email,
    subject: 'Email Verification',
    html: `<p>Click the link to verify your email: <a href="${verificationLink}">${verificationLink}</a></p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Verification email sent!');
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

// Exporter le service avec module.exports
module.exports = { registerutilisateur, loginutilisateur };
