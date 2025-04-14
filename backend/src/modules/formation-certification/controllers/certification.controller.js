const Certificat = require("../models/Certificat");
const { checkQuizReussis } = require("../utils/certificatLogic");

// Émettre un certificat
exports.createCertificat = async (req, res) => {
  try {
    const { utilisateurId, formationsRequises } = req.body;

    // Vérifier si l'utilisateur a réussi les quiz
    const estEligible = await checkQuizReussis(utilisateurId, formationsRequises);
    if (!estEligible) return res.status(403).json({ error: "Conditions non remplies" });

    const nouveauCertificat = await Certificat.create(req.body);
    res.status(201).json(nouveauCertificat);
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
};