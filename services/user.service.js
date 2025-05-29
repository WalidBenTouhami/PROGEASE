// src/modules/user-management/services/user.service.js

const User = require('../models/User');  // Utilisation de require pour le modèle
const bcrypt = require('bcryptjs');  // Utilisation de require pour bcrypt
const jwt = require('jsonwebtoken');  // Utilisation de require pour jsonwebtoken
const nodemailer = require('nodemailer');  // Utilisation de require pour nodemailer

const JWT_SECRET = process.env.JWT_SECRET;

// Générer un token JWT
const generateToken = (user) => {
  return jwt.sign(
    { userId: user._id, name: user.name, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
};

// Inscrire un nouvel utilisateur
const registerUser = async ({ name, email, password, role }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error('User already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({
    name,
    email,
    password: hashedPassword,
    role,
  });

  const verificationToken = newUser.generateVerificationToken();
  await newUser.save();
  await sendVerificationEmail(newUser.email, verificationToken);

  const token = generateToken(newUser);

  return { user: newUser, token };
};

// Connexion d'un utilisateur
const loginUser = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('User not found');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  const token = generateToken(user);
  return { user, token };
};

// Fonction pour envoyer un email de vérification
const sendVerificationEmail = async (email, verificationToken) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'imenf902@gmail.com',  
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
module.exports = { registerUser, loginUser };
