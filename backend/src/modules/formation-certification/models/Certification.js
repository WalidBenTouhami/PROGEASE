const mongoose = require("mongoose");

const certificatSchema = new mongoose.Schema({
  titre: { type: String, required: true },
  description: String,
  conditions: {
    formationsRequises: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Formation",
      required: true
    }],
    scoreMinimum: { type: Number, default: 80 }
  },
  duréeValidité: { type: Number, required: true }, // en mois
  dateÉmission: { type: Date, default: Date.now },
  utilisateurId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Utilisateur",
    required: true
  }
});

module.exports = mongoose.model("Certificat", certificatSchema);
