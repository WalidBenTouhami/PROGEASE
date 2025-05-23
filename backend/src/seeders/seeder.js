const mongoose = require('mongoose');
const User = require('../models/user.model');
const Project = require('../models/project.model');
const Evaluation = require('../models/evaluation.model');
const Deliverable = require('../models/deliverable.model');
require('dotenv').config();

// Helper function to add days to current date
function addDays(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

// Sample data
const users = [
  {
    nom: "Ahmed",
    prenom: "Ben Ali",
    email: "ahmed.benali@esprit.tn",
    role: "ETUDIANT",
  },
  {
    nom: "Sarra",
    prenom: "Trabelsi",
    email: "sarra.trabelsi@esprit.tn",
    role: "ETUDIANT",
  },
  {
    nom: "Mohamed",
    prenom: "Karray",
    email: "mohamed.karray@esprit.tn",
    role: "TUTEUR",
  },
  {
    nom: "Leila",
    prenom: "Ben Ayed",
    email: "leila.benayed@esprit.tn",
    role: "TUTEUR",
  }
];

const projects = [
  {
    title: "Plateforme E-commerce Tunisienne",
    description: "Développement d'une plateforme e-commerce adaptée au marché tunisien avec paiement en TND et intégration des services de livraison locaux",
    skills: ["React", "Node.js", "MongoDB", "GraphQL", "Payment Gateway Integration"],
    startDate: addDays(1),
    endDate: addDays(90),
    status: "IN_PROGRESS",
    deliverables: [
      {
        name: "Interface Utilisateur",
        description: "Développement de l'interface utilisateur avec support multilingue (Français/Arabe)",
        deadline: addDays(45),
        repositoryUrl: "https://github.com/esprit/ecommerce-tn-frontend",
        status: "PENDING"
      },
      {
        name: "API Backend",
        description: "Implémentation des endpoints RESTful avec intégration des services de paiement tunisiens",
        deadline: addDays(75),
        repositoryUrl: "https://github.com/esprit/ecommerce-tn-backend",
        status: "PENDING"
      }
    ]
  },
  {
    title: "Système de Gestion des Stages ESPRIT",
    description: "Développement d'une plateforme de gestion des stages pour les étudiants d'ESPRIT avec suivi des tuteurs et évaluation des rapports",
    skills: ["Python", "Django", "React", "PostgreSQL", "Docker"],
    startDate: addDays(15),
    endDate: addDays(120),
    status: "DRAFT",
    deliverables: [
      {
        name: "Module de Gestion des Stages",
        description: "Développement du système de suivi des stages et gestion des documents",
        deadline: addDays(60),
        repositoryUrl: "https://github.com/esprit/stage-management",
        status: "PENDING"
      }
    ]
  }
];

const evaluations = [
  {
    score: 17,
    comments: "Bon travail sur l'interface utilisateur. Suggestion: Ajouter plus de tests unitaires et améliorer la documentation.",
    criteria: [
      {
        name: "Qualité du code",
        score: 18,
        weight: 0.4
      },
      {
        name: "Documentation",
        score: 16,
        weight: 0.3
      },
      {
        name: "Tests",
        score: 17,
        weight: 0.3
      }
    ]
  },
  {
    score: 18,
    comments: "Excellent travail sur la conception du système. La structure de la base de données est particulièrement bien pensée.",
    criteria: [
      {
        name: "Architecture",
        score: 19,
        weight: 0.5
      },
      {
        name: "Performance",
        score: 17,
        weight: 0.3
      },
      {
        name: "Documentation",
        score: 18,
        weight: 0.2
      }
    ]
  }
];

// Seeder function
async function seed() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Project.deleteMany({});
    await Evaluation.deleteMany({});
    await Deliverable.deleteMany({});
    console.log('Cleared existing data');

    // Insert users
    const insertedUsers = await User.insertMany(users);
    console.log('Inserted users');

    // Insert projects and deliverables
    const projectsWithRefs = projects.map(project => {
      const { deliverables, ...projectData } = project;
      return {
        ...projectData,
        team: [insertedUsers[0]._id, insertedUsers[1]._id], // Assign students
        tutor: insertedUsers[2]._id // Assign tutor
      };
    });

    const insertedProjects = await Project.insertMany(projectsWithRefs);
    console.log('Inserted projects');

    // Create deliverables with project references
    const deliverablesWithRefs = projects.flatMap((project, index) => 
      project.deliverables.map(deliverable => ({
        ...deliverable,
        projectId: insertedProjects[index]._id
      }))
    );

    const insertedDeliverables = await Deliverable.insertMany(deliverablesWithRefs);
    console.log('Inserted deliverables');

    // Update projects with deliverable references
    for (let i = 0; i < insertedProjects.length; i++) {
      const projectDeliverables = insertedDeliverables.filter(
        d => d.projectId.toString() === insertedProjects[i]._id.toString()
      );
      await Project.findByIdAndUpdate(
        insertedProjects[i]._id,
        { deliverables: projectDeliverables.map(d => d._id) }
      );
    }
    console.log('Updated projects with deliverable references');

    // Create evaluations
    const evaluationsWithRefs = evaluations.map((evaluation, index) => ({
      ...evaluation,
      projectId: insertedProjects[index]._id,
      evaluatorId: insertedUsers[3]._id // Assign evaluator
    }));

    await Evaluation.insertMany(evaluationsWithRefs);
    console.log('Inserted evaluations');

    console.log('Seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Run seeder
seed(); 