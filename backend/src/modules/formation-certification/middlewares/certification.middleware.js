// src/modules/formation-certification/middlewares/certification.middleware.js

const { checkQuizReussis } = require('../utils/certificatLogic');

exports.verifierEligibiliteCertificat = async (req, res, next) => {
  try {
    const { utilisateurId, formationsRequises } = req.body;

    // Vérifier si l'utilisateur a réussi les quiz requis
    const estEligible = await checkQuizReussis(utilisateurId, formationsRequises);
    if (!estEligible) {
      return res.status(403).json({ error: 'Conditions non remplies pour obtenir le certificat.' });
    }

    // Passer au middleware ou contrôleur suivant
    next();
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la vérification de l\'éligibilité.' });
  }
};