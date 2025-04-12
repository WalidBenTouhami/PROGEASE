const mongoose = require("mongoose");

const formationSchema = new mongoose.Schema({
  titre: { type: String, required: true },
  description: String,
  catégorie: {
    type: String,
    enum: ["Développement", "IA", "Gestion de projet"],
    required: true
  },
  durée: { type: Number, required: true }, // en heures
  contenu: {
    vidéos: [String],
    pdfs: [String],
    quiz: [{ type: mongoose.Schema.Types.ObjectId, ref: "Quiz" }]
  },
  dateCréation: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Formation", formationSchema);