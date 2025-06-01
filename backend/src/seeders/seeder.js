const mongoose = require('mongoose');
const Utilisateur = require('../models/utilisateur.model');
const Projet = require('../models/projet.model');
const Livrable = require('../models/livrable.model');
const Evaluation = require('../models/evaluation.model');
const { Enum } = require('../../config/constants');
const logger = require('../utils/logger');
require('dotenv').config();
const { ObjectId } = require('mongodb');

// Helpers
function addDays(days) {
  const date = new Date();
  date.setDate(date.getDate() + Math.max(days, 2));
  return date;
}
function subtractDays(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

// Exemples d'utilisateurs
const utilisateurs = [
  { nom: "Ben Ali", prenom: "Ahmed", email: "ahmed.benali@esprit.tn", role: Enum.UtilisateurRole.ETUDIANT },
  { nom: "Trabelsi", prenom: "Sarra", email: "sarra.trabelsi@esprit.tn", role: Enum.UtilisateurRole.ETUDIANT },
  { nom: "Gharbi", prenom: "Karim", email: "karim.gharbi@esprit.tn", role: Enum.UtilisateurRole.ETUDIANT },
  { nom: "Bouazizi", prenom: "Nour", email: "nour.bouazizi@esprit.tn", role: Enum.UtilisateurRole.ETUDIANT },
  { nom: "Mejri", prenom: "Amine", email: "amine.mejri@esprit.tn", role: Enum.UtilisateurRole.ETUDIANT },
  { nom: "Karray", prenom: "Mohamed", email: "mohamed.karray@esprit.tn", role: Enum.UtilisateurRole.TUTEUR },
  { nom: "Ben Ayed", prenom: "Leila", email: "leila.benayed@esprit.tn", role: Enum.UtilisateurRole.TUTEUR }
];

// Exemples de projets (structure conforme)
const projets = [
  {
    titre: "Plateforme de gestion de projets",
    description: "Développer une plateforme pour gérer les projets étudiants avec suivi en temps réel.",
    competences: ["Node.js", "Angular", "MongoDB"],
    dateDebut: subtractDays(60),
    dateFin: addDays(30),
    statut: Enum.StatutProjet.EN_COURS,
    progression: 60,
    urlDepot: "https://github.com/progease/gestion-projets"
  },
  {
    titre: "Application mobile de suivi pédagogique",
    description: "Créer une application mobile pour suivre le parcours pédagogique des étudiants.",
    competences: ["Flutter", "Firebase"],
    dateDebut: subtractDays(120),
    dateFin: subtractDays(10),
    statut: Enum.StatutProjet.TERMINE,
    progression: 100,
    urlDepot: "https://github.com/progease/suivi-pedagogique"
  }
];

// Exemples de livrables (structure conforme)
const livrableTemplates = [
  {
    intitule: "Cahier des charges",
    description: "Document de spécification détaillée du projet.",
    urlDepot: "https://docs.progease.com/cdc"
  },
  {
    intitule: "Maquettes",
    description: "Wireframes et maquettes des interfaces utilisateurs.",
    urlDepot: "https://figma.com/progease/maquettes"
  }
];

// Seeder principal
async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    logger.info('Connected to MongoDB');

    await Utilisateur.deleteMany({});
    await Projet.deleteMany({});
    await Livrable.deleteMany({});
    await Evaluation.deleteMany({});
    logger.info('Collections vidées');

    // Création des utilisateurs
    const insertedUtilisateurs = await Utilisateur.insertMany(utilisateurs);

    // Attribution des équipes et tuteurs
    const etudiants = insertedUtilisateurs.filter(u => u.role === Enum.UtilisateurRole.ETUDIANT).map(u => u._id);
    const tuteurs = insertedUtilisateurs.filter(u => u.role === Enum.UtilisateurRole.TUTEUR).map(u => u._id);

    // Création des projets avec équipes et tuteur
    const projetsToInsert = projets.map((p, i) => ({
      ...p,
      equipe: etudiants.slice(i, i + 2),
      tuteur: tuteurs[i % tuteurs.length],
      creeLe: new Date(),
      majLe: new Date(),
      livrables: []
    }));

    const insertedProjets = await Projet.insertMany(projetsToInsert);

    // Création des livrables et association aux projets
    let livrablesToInsert = [];
    insertedProjets.forEach((projet, idx) => {
      livrableTemplates.forEach((template, lidx) => {
        livrablesToInsert.push({
          ...template,
          dateLimite: addDays(15 + lidx * 10),
          projetId: projet._id,
          statut: idx % 2 === 0 ? Enum.StatutLivrable.EN_COURS : Enum.StatutLivrable.TERMINE,
          creeLe: new Date(),
          majLe: new Date()
        });
      });
    });

    const insertedLivrables = await Livrable.insertMany(livrablesToInsert);

    // Mise à jour des projets avec les livrables
    for (const projet of insertedProjets) {
      const livrablesIds = insertedLivrables.filter(l => l.projetId.toString() === projet._id.toString()).map(l => l._id);
      await Projet.findByIdAndUpdate(projet._id, { livrables: livrablesIds });
    }

    logger.info('Seeding terminé avec succès');
    process.exit(0);
  } catch (error) {
    logger.error('Erreur pendant le seeding:', error);
    process.exit(1);
  }
}

seed();