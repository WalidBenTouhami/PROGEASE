// src/modules/formation-certification/utils/certificatLogic.js

import Formation from "../models/formation.model.js";
import QuizResult from "../models/quizResult.model.js";

/**
 * Vérifie si un utilisateur a réussi les quiz requis pour obtenir un certificat.
 * @param {String} utilisateurId - L'ID de l'utilisateur.
 * @param {Array<String>} formationsRequises - Les IDs des formations requises.
 * @returns {Promise<Boolean>} - Retourne true si toutes les conditions sont remplies, sinon false.
 */
export async function checkQuizReussis(utilisateurId, formationsRequises) {
  try {
    // Récupérer les résultats des quiz pour l'utilisateur
    const quizResults = await QuizResult.find({
      utilisateurId,
      formationId: { $in: formationsRequises }
    });

    // Vérifier si l'utilisateur a réussi tous les quiz requis
    const formationsReussies = quizResults.filter(result => result.score >= result.scoreMinimum)
                                          .map(result => result.formationId.toString());

    return formationsRequises.every(formationId => formationsReussies.includes(formationId));
  } catch (error) {
    console.error("Erreur lors de la vérification des quiz :", error);
    throw new Error("Impossible de vérifier les résultats des quiz.");
  }
}