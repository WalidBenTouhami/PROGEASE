// backend/seed.js
// Usage: node seed.js
// This script populates the MongoDB database with example data for development/testing.
// It will clear existing Projet and Livrable collections and insert new data.

require('dotenv').config();
const mongoose = require('mongoose');
const Projet = require('./src/models/projet.model');
const Livrable = require('./src/models/livrable.model');

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

  // Create projets
  const projets = await Projet.insertMany([
    {
      titre: 'Plateforme de gestion de projets',
      description: 'Developper une plateforme pour gerer les projets etudiants.',
      equipe: [randomId(), randomId()],
      tuteur: randomId(),
      competences: ['Node.js', 'Angular', 'MongoDB'],
      dateDebut: new Date('2024-01-10'),
      dateFin: new Date('2024-06-30'),
      statut: 'En cours',
      progression: 40
    },
    {
      titre: 'Application mobile de suivi',
      description: 'Creer une application mobile pour le suivi des livrables.',
      equipe: [randomId()],
      tuteur: randomId(),
      competences: ['Flutter', 'Firebase'],
      dateDebut: new Date('2024-02-01'),
      dateFin: new Date('2024-07-15'),
      statut: 'Brouillon',
      progression: 0
    }
  ]);

  // Create livrables
  const now = Date.now();
  await Livrable.insertMany([
    {
      intitule: 'Cahier des charges',
      description: 'Document de specification du projet.',
      dateLimite: new Date(now + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      projetId: projets[0]._id,
      statut: 'en_attente'
    },
    {
      intitule: 'Prototype',
      description: 'Premiere version fonctionnelle.',
      dateLimite: new Date(now + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      projetId: projets[0]._id,
      statut: 'en_retard'
    },
    {
      intitule: 'Rapport final',
      description: 'Rapport de fin de projet.',
      dateLimite: new Date(now + 60 * 24 * 60 * 60 * 1000), // 60 days from now
      projetId: projets[1]._id,
      statut: 'en_attente'
    }
  ]);

  console.log('Database seeded successfully!');
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
}); 