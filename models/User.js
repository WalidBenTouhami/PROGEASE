// src/modules/user-management/models/User.js

const mongoose = require('mongoose');  // Remplacer import par require
const crypto = require('crypto');  // Remplacer import par require

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    default: function() {
      return this._id.toString();  // Utiliser l'_id de Mongoose comme userId
    }
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
    enum: ["student", "tutor", "admin"],
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationToken: {
    type: String,
  },
  verificationTokenExpiration: {
    type: Date,
  },
});

// Générer un token de vérification
userSchema.methods.generateVerificationToken = function () {
  const token = crypto.randomBytes(32).toString("hex");
  this.verificationToken = token;
  this.verificationTokenExpiration = Date.now() + 3600000; // Le token expire dans 1 heure
  return token;
};

const User = mongoose.model('User', userSchema);

// Exporter le modèle User avec module.exports
module.exports = User;
