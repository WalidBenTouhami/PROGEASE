// Import des dépendances
    import mongoose from 'mongoose';
    import Redis from 'ioredis';
    import User from '../src/modules/user-management/models/user.model.js';
    import Project from '../src/modules/project-management/models/project.model.js';
    import Evaluation from '../src/modules/evaluation-system/models/evaluation.model.js';
    import Formation from '../src/modules/formation-certification/models/formation.model.js';
    import Certificat from '../src/modules/formation-certification/models/certification.model.js';
    import Forum from '../src/modules/forum-management/models/forum.model.js';
    import { RoleEnum } from "../src/config/constants.js";

    // Connexion à MongoDB Atlas
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/PROGEASE';
    mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
      .then(() => console.log('Connecté à MongoDB Atlas'))
      .catch((err) => console.error('Erreur de connexion à MongoDB :', err));

    // Connexion à Redis
    const redis = new Redis({
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: process.env.REDIS_PORT || 6379,
    });
    redis.on('connect', () => console.log('Connecté à Redis'));
    redis.on('error', (err) => console.error('Erreur de connexion à Redis :', err));

    // Fonction principale
    async function seedDatabase() {
      try {
        // Suppression des données existantes
        await User.deleteMany({});
        await Project.deleteMany({});
        await Evaluation.deleteMany({});
        await Formation.deleteMany({});
        await Certificat.deleteMany({});
        await Forum.deleteMany({});
        await redis.flushall();

        // Insertion des utilisateurs
        const users = await User.insertMany([
          { email: 'admin@example.com', password: 'admin123', role: RoleEnum.ADMIN, experience: 5, skills: ['Node.js', 'MongoDB'] },
          { email: 'tutor@example.com', password: 'tutor123', role: RoleEnum.TUTOR, experience: 3, skills: ['GraphQL', 'React'] },
          { email: 'student@example.com', password: 'student123', role: RoleEnum.STUDENT, experience: 1, skills: ['JavaScript'] },
        ]);

        // Définir une URL GitHub valide
        const validRepositoryUrl = 'https://github.com/WalidBenTouhami/PROGEASE';

        // Insertion des projets
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 2); // Ajoute 2 jours

        const projects = await Project.insertMany([
          {
            titre: 'Projet IA',
            description: 'Développement d\'un modèle de prédiction',
            equipe: [users[2]._id],
            tuteur: users[1]._id,
            status: 'En cours',
            deliverables: [
              {
                name: 'Rapport initial',
                deadline: futureDate, // Date valide (au moins 24h dans le futur)
                status: 'Terminé',
                repositoryUrl: validRepositoryUrl, // URL GitHub valide
              },
            ],
            evaluations: [],
            progression: 50,
            predictedPerformance: 85,
          },
        ]);

        // Insertion des évaluations
        const evaluations = await Evaluation.insertMany([
          {
            projet_id: projects[0]._id,
            evaluateur_id: users[1]._id,
            score: 90,
            comments: 'Bon travail',
          },
        ]);

        // Mise à jour des projets avec les évaluations
        projects[0].evaluations.push(evaluations[0]._id);
        await projects[0].save();

        // Insertion des formations
        const formations = await Formation.insertMany([
          { titre: 'Formation Node.js', description: 'Apprenez les bases de Node.js', duree: 10 },
          { titre: 'Formation MongoDB', description: 'Introduction à MongoDB', duree: 8 },
        ]);

        // Vérification des données
        if (!formations[0] || !formations[1]) {
          throw new Error("Les formations nécessaires pour les certifications sont manquantes.");
        }
        if (!users[2] || !users[1]) {
          throw new Error("Les utilisateurs nécessaires pour les forums sont manquants.");
        }

        // Insertion des certifications
        await Certificat.insertMany([
          { titre: 'Certification Node.js', description: 'Certification avancée en Node.js', formation_id: formations[0]._id },
          { titre: 'Certification MongoDB', description: 'Certification pour MongoDB', formation_id: formations[1]._id },
        ]);

        // Insertion des forums
        await Forum.insertMany([
          { sujet: 'Problème avec GraphQL', contenu: 'Comment gérer les erreurs ?', auteur: users[2]._id },
          { sujet: 'Meilleures pratiques Node.js', contenu: 'Partagez vos astuces', auteur: users[1]._id },
        ]);

        // Ajout de données dans Redis
        await redis.set('project:progress:' + projects[0]._id, JSON.stringify({ progress: 50 }));
        await redis.set('user:role:' + users[0]._id, 'admin');

        console.log('Base de données initialisée avec succès');
      } catch (error) {
        console.error('Erreur lors de l\'initialisation de la base de données :', error);
      } finally {
        // Fermeture des connexions
        if (mongoose.connection.readyState === 1) {
          await mongoose.connection.close();
        }
        redis.quit();
      }
    }

    // Exécution du script
    seedDatabase();