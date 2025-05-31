// backend/seed.js
require('dotenv').config();
const mongoose = require('mongoose');
const Projet = require('./src/models/projet.model');
const Livrable = require('./src/models/livrable.model');
const { Enum } = require('./config/constants');
const logger = require('./src/utils/logger');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/progease';

// Helper to generate random ObjectId
function randomId() {
    return new mongoose.Types.ObjectId();
}

async function seed() {
    try {
        await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        logger.info('Connected to MongoDB for seeding.');

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
                description: 'Développer une plateforme pour gérer les projets étudiants avec suivi en temps réel.',
                urlDepot: 'https://github.com/progease/gestion-projets'
            },
            {
                titre: 'Application mobile de suivi pédagogique',
                description: 'Créer une application mobile pour suivre le parcours pédagogique des étudiants.',
                urlDepot: 'https://github.com/progease/suivi-pedagogique'
            },
            {
                titre: 'Système de réservation de salles',
                description: 'Développer un système permettant de réserver des salles et ressources pédagogiques.',
                urlDepot: 'https://github.com/progease/reservation-salles'
            },
            {
                titre: 'Dashboard analytique d\'apprentissage',
                description: 'Créer un tableau de bord pour visualiser les performances des étudiants.',
                urlDepot: 'https://github.com/progease/dashboard-analytics'
            },
            {
                titre: 'API de gestion documentaire',
                description: 'Concevoir une API REST pour la gestion de documents pédagogiques.',
                urlDepot: 'https://github.com/progease/api-documents'
            },
            {
                titre: 'Portail alumni',
                description: 'Développer un portail pour maintenir le contact avec les anciens étudiants.',
                urlDepot: 'https://github.com/progease/portail-alumni'
            },
            {
                titre: 'Système de notation automatisé',
                description: 'Créer un système qui automatise l\'évaluation des travaux pratiques.',
                urlDepot: 'https://github.com/progease/notation-auto'
            },
            {
                titre: 'Application de gestion des stages',
                description: 'Développer une plateforme de mise en relation entre étudiants et entreprises.',
                urlDepot: 'https://github.com/progease/gestion-stages'
            },
            {
                titre: 'Chatbot d\'assistance pédagogique',
                description: 'Concevoir un assistant conversationnel pour répondre aux questions fréquentes.',
                urlDepot: 'https://github.com/progease/chatbot-assistant'
            },
            {
                titre: 'Système de e-learning interactif',
                description: 'Développer une plateforme d\'apprentissage avec contenu interactif et gamifié.',
                urlDepot: 'https://github.com/progease/elearning-platform'
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
                progression,
                creeLe: new Date(),
                majLe: new Date(),
                livrables: [],
                duree: Math.ceil((dateFin - dateDebut) / (1000 * 60 * 60 * 24)), // Durée en jours
                estEnRetard: statut === Enum.StatutProjet.EN_RETARD
            });
        }

        // Insertion des projets
        const projets = await Projet.insertMany(projetData);
        logger.info(`${projets.length} projets créés avec succès`);

        // Liste de templates pour les livrables
        const livrableTemplates = [
            {
                intitule: 'Cahier des charges',
                description: 'Document de spécification détaillée du projet.',
                urlDepot: 'https://docs.progease.com/cdc'
            },
            {
                intitule: 'Maquettes',
                description: 'Wireframes et maquettes des interfaces utilisateurs.',
                urlDepot: 'https://figma.com/progease/maquettes'
            },
            {
                intitule: 'Prototype',
                description: 'Version fonctionnelle avec les fonctionnalités essentielles.',
                urlDepot: 'https://github.com/progease/prototype'
            },
            {
                intitule: 'Documentation technique',
                description: 'Documentation détaillée de l\'architecture technique.',
                urlDepot: 'https://docs.progease.com/tech'
            },
            {
                intitule: 'Tests unitaires',
                description: 'Suite de tests unitaires pour valider les fonctionnalités.',
                urlDepot: 'https://github.com/progease/tests'
            },
            {
                intitule: 'Tests d\'intégration',
                description: 'Tests de bout en bout pour valider les flux utilisateurs.',
                urlDepot: 'https://github.com/progease/e2e'
            },
            {
                intitule: 'Rapport intermédiaire',
                description: 'Compte-rendu d\'avancement à mi-parcours.',
                urlDepot: 'https://docs.progease.com/rapport-intermediaire'
            },
            {
                intitule: 'Rapport final',
                description: 'Document final présentant l\'ensemble du projet.',
                urlDepot: 'https://docs.progease.com/rapport-final'
            },
            {
                intitule: 'Présentation',
                description: 'Support de présentation pour la soutenance finale.',
                urlDepot: 'https://slides.progease.com/soutenance'
            },
            {
                intitule: 'Code source',
                description: 'Code source complet avec documentation.',
                urlDepot: 'https://github.com/progease/source'
            }
        ];

        // Création des livrables
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
                statut,
                creeLe: new Date(),
                majLe: new Date(),
                estEnRetard: statut === Enum.StatutLivrable.EN_RETARD
            });
        }

        // Insertion des livrables
        const livrables = await Livrable.insertMany(livrableData);
        logger.info(`${livrables.length} livrables créés avec succès`);

        // Mise à jour des projets avec les références aux livrables
        for (const livrable of livrables) {
            await Projet.findByIdAndUpdate(
                livrable.projetId,
                { $push: { livrables: livrable._id } }
            );
        }

        logger.info('Base de données remplie avec succès!');
        await mongoose.disconnect();
    } catch (error) {
        logger.error('Erreur pendant le seeding:', error);
        await mongoose.disconnect();
        process.exit(1);
    }
}

seed().catch(err => {
    logger.error('Erreur non gérée pendant le seeding:', err);
    process.exit(1);
});