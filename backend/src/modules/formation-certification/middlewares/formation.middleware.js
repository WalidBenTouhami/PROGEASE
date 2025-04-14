// src/modules/formation-certification/middlewares/formation.middleware.js

export const validateFormationData = (req, res, next) => {
  const { title, description, category, duration, content } = req.body;

  // Vérification des champs obligatoires
  if (!title || !description || !category) {
    return res.status(400).json({
      error: 'Les champs title, description et category sont obligatoires.'
    });
  }

  // Vérification de la catégorie
  const validCategories = ['development', 'ai', 'project_management'];
  if (!validCategories.includes(category)) {
    return res.status(400).json({
      error: `La catégorie doit être l'une des suivantes : ${validCategories.join(', ')}.`
    });
  }

  // Vérification de la durée
  if (duration) {
    if (duration.hours < 1 || duration.weeks < 1) {
      return res.status(400).json({
        error: 'La durée (heures et semaines) doit être supérieure ou égale à 1.'
      });
    }
  }

  // Vérification du contenu
  if (content) {
    if (content.videos && !Array.isArray(content.videos)) {
      return res.status(400).json({
        error: 'Le champ content.videos doit être un tableau.'
      });
    }
    if (content.documents && !Array.isArray(content.documents)) {
      return res.status(400).json({
        error: 'Le champ content.documents doit être un tableau.'
      });
    }
  }

  // Si toutes les validations passent
  next();
};