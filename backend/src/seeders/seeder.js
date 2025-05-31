const mongoose = require('mongoose');
const User = require('../models/user.model');
const Project = require('../models/project.model');
const Evaluation = require('../models/evaluation.model');
const Deliverable = require('../models/deliverable.model');
const { Enums } = require('../../config/constants');
const logger = require('../utils/logger');
require('dotenv').config();

// Helper function to add days to current date
function addDays(days) {
  const date = new Date();
  // Ensure at least 24 hours in the future
  date.setDate(date.getDate() + Math.max(days, 2));
  return date;
}

// Helper function to subtract days from current date
function subtractDays(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

// Sample data
const users = [
  // Students
  {
    nom: "Ben Ali",
    prenom: "Ahmed",
    email: "ahmed.benali@esprit.tn",
    role: Enums.UserRole.ETUDIANT
  },
  {
    nom: "Trabelsi",
    prenom: "Sarra",
    email: "sarra.trabelsi@esprit.tn",
    role: Enums.UserRole.ETUDIANT
  },
  {
    nom: "Gharbi",
    prenom: "Karim",
    email: "karim.gharbi@esprit.tn",
    role: Enums.UserRole.ETUDIANT
  },
  {
    nom: "Bouazizi",
    prenom: "Nour",
    email: "nour.bouazizi@esprit.tn",
    role: Enums.UserRole.ETUDIANT
  },
  {
    nom: "Mejri",
    prenom: "Amine",
    email: "amine.mejri@esprit.tn",
    role: Enums.UserRole.ETUDIANT
  },
  {
    nom: "Chaari",
    prenom: "Rania",
    email: "rania.chaari@esprit.tn",
    role: Enums.UserRole.ETUDIANT
  },
  {
    nom: "Oueslati",
    prenom: "Youssef",
    email: "youssef.oueslati@esprit.tn",
    role: Enums.UserRole.ETUDIANT
  },
  // Tutors
  {
    nom: "Karray",
    prenom: "Mohamed",
    email: "mohamed.karray@esprit.tn",
    role: Enums.UserRole.TUTEUR
  },
  {
    nom: "Ben Ayed",
    prenom: "Leila",
    email: "leila.benayed@esprit.tn",
    role: Enums.UserRole.TUTEUR
  },
  {
    nom: "Mansouri",
    prenom: "Yassine",
    email: "yassine.mansouri@esprit.tn",
    role: Enums.UserRole.TUTEUR
  },
  {
    nom: "Belhadj",
    prenom: "Asma",
    email: "asma.belhadj@esprit.tn",
    role: Enums.UserRole.TUTEUR
  },
  {
    nom: "Maaloul",
    prenom: "Slim",
    email: "slim.maaloul@esprit.tn",
    role: Enums.UserRole.TUTEUR
  }
];

const projects = [
  {
    title: "Plateforme E-commerce Tunisienne",
    description: "Développement d'une plateforme e-commerce adaptée au marché tunisien avec paiement en TND et intégration des services de livraison locaux. Le projet inclut une interface multilingue et un système de gestion des commandes avancé.",
    skills: ["React", "Node.js", "MongoDB", "GraphQL", "Payment Gateway Integration"],
    startDate: subtractDays(30),
    endDate: addDays(60),
    status: "IN_PROGRESS",
    deliverables: [
      {
        name: "Interface Utilisateur",
        description: "Développement de l'interface utilisateur avec support multilingue (Français/Arabe) et responsive design",
        deadline: addDays(15),
        repositoryUrl: "https://github.com/esprit/ecommerce-tn-frontend",
        status: "IN_PROGRESS"
      },
      {
        name: "API Backend",
        description: "Implémentation des endpoints RESTful avec intégration des services de paiement tunisiens",
        deadline: addDays(45),
        repositoryUrl: "https://github.com/esprit/ecommerce-tn-backend",
        status: "PENDING"
      }
    ]
  },
  {
    title: "Système de Gestion des Stages ESPRIT",
    description: "Développement d'une plateforme de gestion des stages pour les étudiants d'ESPRIT avec suivi des tuteurs et évaluation des rapports. Intégration avec le système académique existant.",
    skills: ["Python", "Django", "React", "PostgreSQL", "Docker"],
    startDate: subtractDays(60),
    endDate: addDays(30),
    status: "IN_PROGRESS",
    deliverables: [
      {
        name: "Module de Gestion des Stages",
        description: "Développement du système de suivi des stages et gestion des documents",
        deadline: subtractDays(15),
        repositoryUrl: "https://github.com/esprit/stage-management",
        status: "COMPLETED"
      },
      {
        name: "Interface d'Évaluation",
        description: "Système d'évaluation des rapports de stage avec workflow de validation",
        deadline: addDays(15),
        repositoryUrl: "https://github.com/esprit/stage-evaluation",
        status: "IN_PROGRESS"
      }
    ]
  },
  {
    title: "Application Mobile de Covoiturage",
    description: "Application mobile de covoiturage dédiée aux étudiants d'ESPRIT avec fonctionnalités de géolocalisation et système de réservation en temps réel.",
    skills: ["React Native", "Firebase", "Google Maps API", "Node.js"],
    startDate: subtractDays(45),
    endDate: addDays(45),
    status: "IN_PROGRESS",
    deliverables: [
      {
        name: "Application Mobile",
        description: "Développement de l'application mobile avec intégration des services de localisation",
        deadline: addDays(30),
        repositoryUrl: "https://github.com/esprit/covoiturage-app",
        status: "IN_PROGRESS"
      }
    ]
  },
  {
    title: "Système de Reconnaissance Faciale pour l'Accès au Campus",
    description: "Développement d'un système de contrôle d'accès utilisant la reconnaissance faciale pour sécuriser l'entrée au campus. Intégration avec le système de gestion des étudiants existant.",
    skills: ["Python", "OpenCV", "TensorFlow", "Raspberry Pi", "REST API"],
    startDate: subtractDays(90),
    endDate: addDays(15),
    status: "COMPLETED",
    deliverables: [
      {
        name: "Module de Reconnaissance",
        description: "Développement du système de reconnaissance faciale avec deep learning",
        deadline: subtractDays(30),
        repositoryUrl: "https://github.com/esprit/facial-recognition",
        status: "COMPLETED"
      },
      {
        name: "Interface de Gestion",
        description: "Interface web pour la gestion des accès et des utilisateurs",
        deadline: subtractDays(15),
        repositoryUrl: "https://github.com/esprit/access-management",
        status: "COMPLETED"
      }
    ]
  },
  {
    title: "Plateforme d'Apprentissage en Ligne ESPRIT",
    description: "Développement d'une plateforme e-learning personnalisée pour ESPRIT avec support des cours en direct, quiz interactifs et suivi de progression.",
    skills: ["Angular", "NestJS", "PostgreSQL", "WebRTC", "Docker"],
    startDate: subtractDays(75),
    endDate: addDays(90),
    status: "IN_PROGRESS",
    deliverables: [
      {
        name: "Module Visioconférence",
        description: "Implémentation du système de cours en direct avec WebRTC",
        deadline: addDays(30),
        repositoryUrl: "https://github.com/esprit/elearning-live",
        status: "IN_PROGRESS"
      },
      {
        name: "Système de Quiz",
        description: "Développement du module de quiz interactifs et évaluation",
        deadline: addDays(60),
        repositoryUrl: "https://github.com/esprit/quiz-system",
        status: "PENDING"
      }
    ]
  },
  {
    title: "Application de Gestion de la Bibliothèque",
    description: "Modernisation du système de gestion de la bibliothèque avec suivi des emprunts, réservations en ligne et notifications automatiques.",
    skills: ["Spring Boot", "Vue.js", "MySQL", "ElasticSearch"],
    startDate: subtractDays(120),
    endDate: subtractDays(30),
    status: "COMPLETED",
    deliverables: [
      {
        name: "Système de Réservation",
        description: "Module de réservation en ligne avec notifications",
        deadline: subtractDays(45),
        repositoryUrl: "https://github.com/esprit/library-booking",
        status: "COMPLETED"
      },
      {
        name: "Catalogue Numérique",
        description: "Catalogue en ligne avec recherche avancée",
        deadline: subtractDays(60),
        repositoryUrl: "https://github.com/esprit/digital-catalog",
        status: "COMPLETED"
      }
    ]
  },
  {
    title: "Système IoT de Surveillance des Salles",
    description: "Développement d'un système IoT pour la surveillance de la température, de l'occupation et de la consommation énergétique des salles de classe.",
    skills: ["Arduino", "Raspberry Pi", "MQTT", "Node.js", "InfluxDB"],
    startDate: addDays(15),
    endDate: addDays(120),
    status: "DRAFT",
    deliverables: [
      {
        name: "Réseau de Capteurs",
        description: "Installation et configuration des capteurs IoT",
        deadline: addDays(45),
        repositoryUrl: "https://github.com/esprit/iot-sensors",
        status: "PENDING"
      },
      {
        name: "Dashboard de Monitoring",
        description: "Interface de visualisation des données en temps réel",
        deadline: addDays(90),
        repositoryUrl: "https://github.com/esprit/monitoring-dashboard",
        status: "PENDING"
      }
    ]
  },
  {
    title: "Système de Gestion des Clubs ESPRIT",
    description: "Application web pour la gestion des clubs étudiants, événements, et activités parascolaires.",
    skills: ["React", "Express.js", "MongoDB", "Redux", "Material-UI"],
    startDate: subtractDays(45),
    endDate: addDays(30),
    status: "IN_PROGRESS",
    deliverables: [
      {
        name: "Portail des Clubs",
        description: "Interface de gestion des clubs et événements",
        deadline: addDays(20),
        repositoryUrl: "https://github.com/esprit/clubs-portal",
        status: "IN_PROGRESS"
      }
    ]
  },
  {
    title: "Application de Gestion des Salles",
    description: "Système de réservation et gestion des salles de cours et laboratoires.",
    skills: ["Angular", "Spring Boot", "PostgreSQL", "Docker"],
    startDate: subtractDays(60),
    endDate: addDays(15),
    status: "IN_PROGRESS",
    deliverables: [
      {
        name: "Système de Réservation",
        description: "Module de réservation des salles",
        deadline: addDays(10),
        repositoryUrl: "https://github.com/esprit/room-booking",
        status: "IN_PROGRESS"
      }
    ]
  },
  {
    title: "Plateforme Alumni ESPRIT",
    description: "Réseau social professionnel pour les anciens étudiants d'ESPRIT.",
    skills: ["Vue.js", "Node.js", "MongoDB", "AWS"],
    startDate: addDays(15),
    endDate: addDays(90),
    status: "DRAFT",
    deliverables: [
      {
        name: "Réseau Social",
        description: "Plateforme de networking pour alumni",
        deadline: addDays(60),
        repositoryUrl: "https://github.com/esprit/alumni-network",
        status: "PENDING"
      }
    ]
  },
  {
    title: "Système de Gestion des Examens",
    description: "Application pour la planification et gestion des examens et surveillances.",
    skills: ["Java", "Spring", "MySQL", "Thymeleaf"],
    startDate: subtractDays(30),
    endDate: addDays(45),
    status: "IN_PROGRESS",
    deliverables: [
      {
        name: "Planning des Examens",
        description: "Module de génération des plannings",
        deadline: addDays(30),
        repositoryUrl: "https://github.com/esprit/exam-planning",
        status: "IN_PROGRESS"
      }
    ]
  },
  {
    title: "Application Mobile ESPRIT",
    description: "Application mobile officielle pour les étudiants et enseignants d'ESPRIT.",
    skills: ["Flutter", "Firebase", "Node.js"],
    startDate: subtractDays(90),
    endDate: addDays(30),
    status: "IN_PROGRESS",
    deliverables: [
      {
        name: "Application Mobile",
        description: "Version initiale de l'application",
        deadline: addDays(20),
        repositoryUrl: "https://github.com/esprit/mobile-app",
        status: "IN_PROGRESS"
      }
    ]
  },
  {
    title: "Système de Gestion des Ressources Humaines",
    description: "Application de gestion RH pour le personnel administratif et enseignant.",
    skills: ["React", "Django", "PostgreSQL", "Docker"],
    startDate: subtractDays(150),
    endDate: subtractDays(30),
    status: "COMPLETED",
    deliverables: [
      {
        name: "Module RH",
        description: "Système complet de gestion RH",
        deadline: subtractDays(45),
        repositoryUrl: "https://github.com/esprit/hr-system",
        status: "COMPLETED"
      }
    ]
  },
  {
    title: "Plateforme de Gestion des Projets PFE",
    description: "Système de suivi et gestion des projets de fin d'études.",
    skills: ["Angular", "NestJS", "MongoDB", "Docker"],
    startDate: addDays(10),
    endDate: addDays(120),
    status: "DRAFT",
    deliverables: [
      {
        name: "Suivi des PFE",
        description: "Module de gestion des PFE",
        deadline: addDays(90),
        repositoryUrl: "https://github.com/esprit/pfe-management",
        status: "PENDING"
      }
    ]
  },
  {
    title: "Système de Gestion de la Restauration",
    description: "Application de gestion du restaurant universitaire et des services de restauration.",
    skills: ["Vue.js", "Express.js", "MongoDB", "Redis"],
    startDate: subtractDays(45),
    endDate: addDays(30),
    status: "IN_PROGRESS",
    deliverables: [
      {
        name: "Gestion Restaurant",
        description: "Système de gestion des repas et réservations",
        deadline: addDays(20),
        repositoryUrl: "https://github.com/esprit/restaurant-management",
        status: "IN_PROGRESS"
      }
    ]
  },
  {
    title: "Plateforme de Support Technique",
    description: "Système de ticketing et support technique pour les étudiants et le personnel.",
    skills: ["React", "Node.js", "PostgreSQL", "Redis"],
    startDate: subtractDays(60),
    endDate: addDays(15),
    status: "IN_PROGRESS",
    deliverables: [
      {
        name: "Système de Tickets",
        description: "Module de gestion des tickets de support",
        deadline: addDays(10),
        repositoryUrl: "https://github.com/esprit/support-system",
        status: "IN_PROGRESS"
      }
    ]
  },
  {
    title: "Système de Gestion des Certifications",
    description: "Plateforme de gestion des certifications professionnelles et formations.",
    skills: ["Angular", "Spring Boot", "MySQL", "Docker"],
    startDate: subtractDays(30),
    endDate: addDays(60),
    status: "IN_PROGRESS",
    deliverables: [
      {
        name: "Gestion Certifications",
        description: "Module de suivi des certifications",
        deadline: addDays(45),
        repositoryUrl: "https://github.com/esprit/certification-system",
        status: "IN_PROGRESS"
      }
    ]
  },
  {
    title: "Application de Gestion des Events",
    description: "Système de gestion des événements et conférences organisés par ESPRIT.",
    skills: ["Next.js", "NestJS", "PostgreSQL", "AWS"],
    startDate: addDays(15),
    endDate: addDays(75),
    status: "DRAFT",
    deliverables: [
      {
        name: "Gestion Events",
        description: "Plateforme de gestion des événements",
        deadline: addDays(60),
        repositoryUrl: "https://github.com/esprit/events-management",
        status: "PENDING"
      }
    ]
  },
  {
    title: "Système de Gestion du Parc Informatique",
    description: "Application de gestion et maintenance du matériel informatique.",
    skills: ["React", "FastAPI", "PostgreSQL", "Docker"],
    startDate: subtractDays(120),
    endDate: subtractDays(30),
    status: "COMPLETED",
    deliverables: [
      {
        name: "Gestion Matériel",
        description: "Module de suivi du matériel informatique",
        deadline: subtractDays(45),
        repositoryUrl: "https://github.com/esprit/it-inventory",
        status: "COMPLETED"
      }
    ]
  },
  {
    title: "Plateforme de Tutorat Entre Pairs",
    description: "Application de mise en relation entre étudiants pour du tutorat.",
    skills: ["Vue.js", "Django", "PostgreSQL", "Redis"],
    startDate: addDays(5),
    endDate: addDays(90),
    status: "DRAFT",
    deliverables: [
      {
        name: "Système de Tutorat",
        description: "Plateforme de mise en relation",
        deadline: addDays(75),
        repositoryUrl: "https://github.com/esprit/peer-tutoring",
        status: "PENDING"
      }
    ]
  }
];

const generateEvaluations = (projects, users) => {
  return projects.map(project => {
    const evaluateur = users.find(u => u.role === Enums.UserRole.TUTEUR);
    return {
      projetId: project._id,
      evaluateurId: evaluateur._id,
      note: Math.floor(Math.random() * 11) + 10, // Note entre 10 et 20
      commentaire: `Évaluation du projet ${project.title}`,
      criteres: [
        {
          nom: 'Qualité du code',
          note: Math.floor(Math.random() * 11) + 10,
          poids: 0.4
        },
        {
          nom: 'Documentation',
          note: Math.floor(Math.random() * 11) + 10,
          poids: 0.3
        },
        {
          nom: 'Tests',
          note: Math.floor(Math.random() * 11) + 10,
          poids: 0.3
        }
      ],
      dateEvaluation: new Date()
    };
  });
};

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
      // Randomly assign 2-3 students and 1 tutor to each project
      const studentIds = insertedUsers
        .filter(u => u.role === 'ETUDIANT')
        .sort(() => 0.5 - Math.random())
        .slice(0, 2 + Math.floor(Math.random() * 2))
        .map(u => u._id);
      
      const tutorId = insertedUsers
        .filter(u => u.role === 'TUTEUR')
        .sort(() => 0.5 - Math.random())[0]._id;

      return {
        ...projectData,
        team: studentIds,
        tutor: tutorId
      };
    });

    const insertedProjects = await Project.insertMany(projectsWithRefs);
    console.log('Inserted projects');

    // Create deliverables with project references and ensure proper deadlines
    const deliverablesWithRefs = projects.flatMap((project, index) => 
      project.deliverables.map(deliverable => {
        // For completed deliverables, set deadline to a future date
        if (deliverable.status === 'COMPLETED') {
          return {
            ...deliverable,
            deadline: addDays(30), // Set a future date even for completed deliverables
            projectId: insertedProjects[index]._id
          };
        }
        return {
          ...deliverable,
          projectId: insertedProjects[index]._id
        };
      })
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

    // Insert evaluations
    const evaluations = generateEvaluations(insertedProjects, insertedUsers);
    await Evaluation.insertMany(evaluations);
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