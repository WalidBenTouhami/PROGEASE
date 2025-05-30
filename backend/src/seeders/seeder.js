const mongoose = require('mongoose');
const User = require('../models/user.model');
const Project = require('../models/project.model');
const Evaluation = require('../models/evaluation.model');
const Deliverable = require('../models/deliverable.model');
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
    role: "ETUDIANT"
  },
  {
    nom: "Trabelsi",
    prenom: "Sarra",
    email: "sarra.trabelsi@esprit.tn",
    role: "ETUDIANT"
  },
  {
    nom: "Gharbi",
    prenom: "Karim",
    email: "karim.gharbi@esprit.tn",
    role: "ETUDIANT"
  },
  {
    nom: "Bouazizi",
    prenom: "Nour",
    email: "nour.bouazizi@esprit.tn",
    role: "ETUDIANT"
  },
  {
    nom: "Mejri",
    prenom: "Amine",
    email: "amine.mejri@esprit.tn",
    role: "ETUDIANT"
  },
  {
    nom: "Chaari",
    prenom: "Rania",
    email: "rania.chaari@esprit.tn",
    role: "ETUDIANT"
  },
  {
    nom: "Oueslati",
    prenom: "Youssef",
    email: "youssef.oueslati@esprit.tn",
    role: "ETUDIANT"
  },
  // Tutors
  {
    nom: "Karray",
    prenom: "Mohamed",
    email: "mohamed.karray@esprit.tn",
    role: "TUTEUR"
  },
  {
    nom: "Ben Ayed",
    prenom: "Leila",
    email: "leila.benayed@esprit.tn",
    role: "TUTEUR"
  },
  {
    nom: "Mansouri",
    prenom: "Yassine",
    email: "yassine.mansouri@esprit.tn",
    role: "TUTEUR"
  },
  {
    nom: "Belhadj",
    prenom: "Asma",
    email: "asma.belhadj@esprit.tn",
    role: "TUTEUR"
  },
  {
    nom: "Maaloul",
    prenom: "Slim",
    email: "slim.maaloul@esprit.tn",
    role: "TUTEUR"
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

const evaluations = [
  // E-commerce Platform Evaluations
  {
    score: 17,
    comments: "Excellent travail sur l'interface utilisateur. La gestion du multilingue est particulièrement bien implémentée. Points d'amélioration : ajouter plus de tests unitaires et optimiser les performances de rendu.",
    criteria: [
      { name: "Qualité du code", score: 18, weight: 0.3 },
      { name: "Documentation", score: 16, weight: 0.2 },
      { name: "Tests", score: 15, weight: 0.2 },
      { name: "Performance", score: 19, weight: 0.3 }
    ],
    createdAt: subtractDays(15),
    updatedAt: subtractDays(15)
  },
  {
    score: 15,
    comments: "Bonne structure de la base de données et architecture solide. La documentation API est complète. Suggestions : améliorer la gestion des erreurs et ajouter plus de validations.",
    criteria: [
      { name: "Architecture", score: 16, weight: 0.4 },
      { name: "Performance", score: 14, weight: 0.3 },
      { name: "Documentation", score: 15, weight: 0.3 }
    ],
    createdAt: subtractDays(10),
    updatedAt: subtractDays(10)
  },
  // Stage Management System Evaluations
  {
    score: 18,
    comments: "Implémentation remarquable du module de gestion des stages. L'intégration avec le système existant est parfaite. Le code est propre et bien documenté.",
    criteria: [
      { name: "Intégration", score: 19, weight: 0.4 },
      { name: "Qualité du code", score: 18, weight: 0.3 },
      { name: "Documentation", score: 17, weight: 0.3 }
    ],
    createdAt: subtractDays(5),
    updatedAt: subtractDays(5)
  },
  {
    score: 16,
    comments: "L'interface d'évaluation est intuitive et répond bien aux besoins. Quelques améliorations possibles sur l'UX des formulaires.",
    criteria: [
      { name: "Design UI/UX", score: 17, weight: 0.4 },
      { name: "Fonctionnalités", score: 16, weight: 0.3 },
      { name: "Performance", score: 15, weight: 0.3 }
    ],
    createdAt: subtractDays(2),
    updatedAt: subtractDays(2)
  },
  // Carpooling App Evaluations
  {
    score: 14,
    comments: "L'application mobile montre un bon potentiel. L'intégration de la géolocalisation est bien faite. Points à améliorer : gestion du cache et des états hors ligne.",
    criteria: [
      { name: "Fonctionnalités", score: 15, weight: 0.3 },
      { name: "Performance", score: 13, weight: 0.3 },
      { name: "UX Mobile", score: 14, weight: 0.2 },
      { name: "Tests", score: 14, weight: 0.2 }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  // Facial Recognition System Evaluations
  {
    score: 19,
    comments: "Excellente implémentation du système de reconnaissance faciale. La précision est remarquable et le temps de traitement est optimal.",
    criteria: [
      { name: "Précision", score: 19, weight: 0.4 },
      { name: "Performance", score: 18, weight: 0.3 },
      { name: "Sécurité", score: 20, weight: 0.3 }
    ],
    createdAt: subtractDays(20),
    updatedAt: subtractDays(20)
  },
  {
    score: 17,
    comments: "Interface de gestion très bien conçue. La documentation technique est exhaustive. Suggestion : ajouter des rapports d'accès plus détaillés.",
    criteria: [
      { name: "UI/UX", score: 17, weight: 0.3 },
      { name: "Documentation", score: 18, weight: 0.3 },
      { name: "Fonctionnalités", score: 16, weight: 0.4 }
    ],
    createdAt: subtractDays(18),
    updatedAt: subtractDays(18)
  },
  // E-learning Platform Evaluations
  {
    score: 16,
    comments: "Le module de visioconférence fonctionne très bien. La qualité audio/vidéo est excellente. Suggestions pour l'amélioration de la gestion de la bande passante.",
    criteria: [
      { name: "Qualité Streaming", score: 17, weight: 0.4 },
      { name: "Performance", score: 15, weight: 0.3 },
      { name: "Stabilité", score: 16, weight: 0.3 }
    ],
    createdAt: subtractDays(8),
    updatedAt: subtractDays(8)
  },
  // Library Management System Evaluations
  {
    score: 18,
    comments: "Système de réservation très efficace. L'intégration des notifications est particulièrement bien pensée. Interface utilisateur intuitive.",
    criteria: [
      { name: "Fonctionnalités", score: 18, weight: 0.4 },
      { name: "UX", score: 19, weight: 0.3 },
      { name: "Performance", score: 17, weight: 0.3 }
    ],
    createdAt: subtractDays(40),
    updatedAt: subtractDays(40)
  },
  {
    score: 17,
    comments: "Excellent travail sur le catalogue numérique. La recherche est rapide et précise. Suggestions pour améliorer les filtres de recherche avancée.",
    criteria: [
      { name: "Performance", score: 17, weight: 0.3 },
      { name: "Fonctionnalités", score: 18, weight: 0.4 },
      { name: "UI", score: 16, weight: 0.3 }
    ],
    createdAt: subtractDays(35),
    updatedAt: subtractDays(35)
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

    // Create evaluations with different evaluators
    const evaluationsWithRefs = evaluations.map((evaluation, index) => {
      const projectIndex = Math.floor(index / 2); // Two evaluations per project
      const evaluator = insertedUsers
        .filter(u => u.role === 'TUTEUR')
        .sort(() => 0.5 - Math.random())[0];

      return {
        ...evaluation,
        projectId: insertedProjects[projectIndex]._id,
        evaluatorId: evaluator._id
      };
    });

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