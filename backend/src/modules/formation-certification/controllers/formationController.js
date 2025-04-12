const Formation = require("../models/Formation");
const { validationResult } = require("express-validator");

// Créer une formation (Admin)
exports.createFormation = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const nouvelleFormation = await Formation.create(req.body);
    res.status(201).json(nouvelleFormation);
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// Lister toutes les formations
exports.getAllFormations = async (req, res) => {
  try {
    const formations = await Formation.find().populate("contenu.quiz");
    res.status(200).json(formations);
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
};