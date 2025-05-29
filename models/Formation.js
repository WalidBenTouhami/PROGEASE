// src/models/Formation.js
const mongoose = require('mongoose');
const Quiz = require('./Quiz');  // Assurez-vous que le chemin est correct

const formationSchema = new mongoose.Schema({
  titre: { type: String, required: true },
  description: String,
  categorie: {
    type: String,
    enum: ["Developpement", "IA", "Gestion de projet"],
    required: true
  },
  duree: { type: Number, required: true },
  contenu: {
    videos: [String],
    pdfs: [String],
    quiz: [{ type: mongoose.Schema.Types.ObjectId, ref: "Quiz" }]  // Reference au modèle Quiz
  },
  modules: [String],
  utilisateursInscrits: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  dateCreation: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Formation", formationSchema);
