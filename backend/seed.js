// backend/seed.js
require('dotenv').config();
const mongoose = require('mongoose');
const Projet = require('./src/models/projet.model');
const Livrable = require('./src/models/livrable.model');
const { Enum } = require('./config/constants');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/progease';

// Helper to generate random ObjectId
function randomId() {
  return new mongoose.Types.ObjectId();
}

async function seed() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB for seeding.');

  // Clear existing data
  await Projet.deleteMany({});
  await Livrable.deleteMany({});

  // Générer des tuteurs et membres d'équipe
  const tuteurs = Array(5).fill().map(() => randomId());
  const membres = Array(15).fill().map(() => randomId());

  // Compétences possibles
  const toutesCompetences = [
    'JavaScript', 'TypeScript', 'Angular', 'React', 'Vue.js', 'Node.js',
    'Express', 'MongoDB', 'MySQL', 'PostgreSQL', 'Docker', 'AWS',
    'Firebase', 'Flutter', 'React Native', 'Python', 'Django', 'Java', 'Spring'
  ];

  // Liste de titres et descriptions de projets
  const projetTemplates = [
    {
      titre: 'Plateforme de gestion de projets',
      description: 'Développer une plateforme pour gérer les projets étudiants avec suivi en temps réel.'
    },
    {
      titre: 'Application mobile de suivi pédagogique',
      description: 'Créer une application mobile pour suivre le parcours pédagogique des étudiants.'
    },
    {
      titre: 'Système de réservation de salles',
      description: 'Développer un système permettant de réserver des salles et ressources pédagogiques.'
    },
    {
      titre: 'Dashboard analytique d\'apprentissage',
      description: 'Créer un tableau de bord pour visualiser les performances des étudiants.'
    },
    {
      titre: 'API de gestion documentaire',
      description: 'Concevoir une API REST pour la gestion de documents pédagogiques.'
    },
    {
      titre: 'Portail alumni',
      description: 'Développer un portail pour maintenir le contact avec les anciens étudiants.'
    },
    {
      titre: 'Système de notation automatisé',
      description: 'Créer un système qui automatise l\'évaluation des travaux pratiques.'
    },
    {
      titre: 'Application de gestion des stages',
      description: 'Développer une plateforme de mise en relation entre étudiants et entreprises.'
    },
    {
      titre: 'Chatbot d\'assistance pédagogique',
      description: 'Concevoir un assistant conversationnel pour répondre aux questions fréquentes.'
    },
    {
      titre: 'Système de e-learning interactif',
      description: 'Développer une plateforme d\'apprentissage avec contenu interactif et gamifié.'
    }
  ];

  // Génération de 10 projets
  const projetData = [];
  const now = new Date();

  for (let i = 0; i < 10; i++) {
    // Déterminer les dates et statuts de façon réaliste
    let dateDebut, dateFin, statut, progression;

    // Différents scénarios de projets basés sur l'index
    if (i < 2) {
      // Projets terminés
      dateDebut = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      dateFin = new Date(now.getFullYear() - 1, now.getMonth() + 3, now.getDate());
      statut = Enum.StatutProjet.TERMINE;
      progression = 100;
    } else if (i < 5) {
      // Projets en cours
      dateDebut = new Date(now.getFullYear(), now.getMonth() - 2, now.getDate());
      dateFin = new Date(now.getFullYear(), now.getMonth() + 4, now.getDate());
      statut = Enum.StatutProjet.EN_COURS;
      progression = Math.floor(Math.random() * 60) + 20; // Entre 20 et 80
    } else if (i < 7) {
      // Projets en retard
      dateDebut = new Date(now.getFullYear(), now.getMonth() - 5, now.getDate());
      dateFin = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      statut = Enum.StatutProjet.EN_RETARD;
      progression = Math.floor(Math.random() * 70) + 10; // Entre 10 et 80
    } else {
      // Projets à venir ou en brouillon
      dateDebut = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
      dateFin = new Date(now.getFullYear(), now.getMonth() + 6, now.getDate());
      statut = i % 2 === 0 ? Enum.StatutProjet.A_VENIR : Enum.StatutProjet.BROUILLON;
      progression = 0;
    }

    // Sélection aléatoire de compétences (3 à 6)
    const nbCompetences = Math.floor(Math.random() * 4) + 3;
    const competences = [];
    while (competences.length < nbCompetences) {
      const comp = toutesCompetences[Math.floor(Math.random() * toutesCompetences.length)];
      if (!competences.includes(comp)) {
        competences.push(comp);
      }
    }

    // Sélection aléatoire des membres d'équipe (1 à 4)
    const nbMembres = Math.floor(Math.random() * 4) + 1;
    const equipe = [];
    for (let j = 0; j < nbMembres; j++) {
      equipe.push(membres[Math.floor(Math.random() * membres.length)]);
    }

    // Création du projet
    projetData.push({
      ...projetTemplates[i],
      equipe,
      tuteur: tuteurs[Math.floor(Math.random() * tuteurs.length)],
      competences,
      dateDebut,
      dateFin,
      statut,
      progression
    });
  }

  // Insertion des projets
  const projets = await Projet.insertMany(projetData);

  // Liste de templates pour les livrables
  const livrableTemplates = [
    { intitule: 'Cahier des charges', description: 'Document de spécification détaillée du projet.' },
    { intitule: 'Maquettes', description: 'Wireframes et maquettes des interfaces utilisateurs.' },
    { intitule: 'Prototype', description: 'Version fonctionnelle avec les fonctionnalités essentielles.' },
    { intitule: 'Documentation technique', description: 'Documentation détaillée de l\'architecture technique.' },
    { intitule: 'Tests unitaires', description: 'Suite de tests unitaires pour valider les fonctionnalités.' },
    { intitule: 'Tests d\'intégration', description: 'Tests de bout en bout pour valider les flux utilisateurs.' },
    { intitule: 'Rapport intermédiaire', description: 'Compte-rendu d\'avancement à mi-parcours.' },
    { intitule: 'Rapport final', description: 'Document final présentant l\'ensemble du projet.' },
    { intitule: 'Présentation', description: 'Support de présentation pour la soutenance finale.' },
    { intitule: 'Code source', description: 'Code source complet avec documentation.' }
  ];

  // Création des 10 livrables
  const livrableData = [];

  for (let i = 0; i < 10; i++) {
    const projetAssocie = projets[Math.floor(i / 2)]; // Répartition : 2 livrables par projet pour les 5 premiers projets

    // Déterminer le statut du livrable en fonction du statut du projet
    let statut;
    if (projetAssocie.statut === Enum.StatutProjet.TERMINE) {
      statut = Enum.StatutLivrable.TERMINE;
    } else if (projetAssocie.statut === Enum.StatutProjet.EN_RETARD) {
      statut = Math.random() > 0.5 ? Enum.StatutLivrable.EN_RETARD : Enum.StatutLivrable.EN_COURS;
    } else if (projetAssocie.statut === Enum.StatutProjet.EN_COURS) {
      const rand = Math.random();
      if (rand < 0.4) statut = Enum.StatutLivrable.TERMINE;
      else if (rand < 0.7) statut = Enum.StatutLivrable.EN_COURS;
      else statut = Enum.StatutLivrable.EN_ATTENTE;
    } else {
      statut = Enum.StatutLivrable.EN_ATTENTE;
    }

    // Déterminer la date limite en fonction du statut du projet
    const dateLimite = new Date();
    if (projetAssocie.statut === Enum.StatutProjet.TERMINE) {
      dateLimite.setDate(projetAssocie.dateFin.getDate() - Math.floor(Math.random() * 30));
    } else if (projetAssocie.statut === Enum.StatutProjet.EN_RETARD) {
      dateLimite.setDate(now.getDate() - Math.floor(Math.random() * 30) - 5);
    } else if (projetAssocie.statut === Enum.StatutProjet.EN_COURS) {
      const jours = Math.floor(Math.random() * 60) - 20; // Entre -20 et 40 jours
      dateLimite.setDate(now.getDate() + jours);
    } else {
      dateLimite.setDate(projetAssocie.dateDebut.getDate() + Math.floor(Math.random() * 60) + 15);
    }

    livrableData.push({
      ...livrableTemplates[i],
      dateLimite,
      projetId: projetAssocie._id,
      statut
    });
  }

  // Insertion des livrables
  await Livrable.insertMany(livrableData);

  console.log('Base de données remplie avec succès: 10 projets et 10 livrables créés!');
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('Erreur pendant le seeding:', err);
  process.exit(1);
});