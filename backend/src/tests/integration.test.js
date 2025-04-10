// src/tests/integration.test.js
const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const User = require('../modules/user-management/models/user.model');
const Project = require('../modules/project-management/models/project.model');
const Evaluation = require('../modules/evaluation-system/models/evaluation.model');
const IaService = require('../services/ia.service');

describe('Integration Tests', () => {
    let token;
    let projectId;
    let evaluationId;

    beforeAll(async () => {
        // Créer un utilisateur (tuteur)
        const tutor = await User.create({
            email: 'tutor@example.com',
            password: 'password',
            role: 'tuteur',
            experience: 85
        });

        // Authentification
        const authResponse = await request(app)
            .post('/api/users/login')
            .send({ email: tutor.email, password: 'password' });
        token = authResponse.body.token;
    });

    afterAll(async () => {
        await Project.deleteMany({});
        await User.deleteMany({});
        await Evaluation.deleteMany({});
        await mongoose.connection.close();
    });

    describe('Project-Evaluation Link', () => {
        it('should link project to evaluation', async () => {
            // Créer un projet
            const projectResponse = await request(app)
                .post('/api/projects/create')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    title: 'Projet de Test',
                    description: 'Description de test',
                    equipe: [new mongoose.Types.ObjectId()],
                    tuteur: new mongoose.Types.ObjectId(),
                    skills: ['Python', 'Machine Learning']
                });
            projectId = projectResponse.body._id;

            // Créer une évaluation
            const evaluationResponse = await request(app)
                .post('/api/evaluations/create')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    projet_id: projectId,
                    evaluateur_id: new mongoose.Types.ObjectId(),
                    score: 85,
                    comments: 'Évaluation réussie'
                });
            evaluationId = evaluationResponse.body._id;

            // Ajouter l'évaluation au projet via l'endpoint corrigé
            const response = await request(app)
                .post(`/api/projects/${projectId}/add-evaluation`)
                .set('Authorization', `Bearer ${token}`)
                .send({ evaluationId });

            // Vérifier la liaison
            expect(response.status).toBe(200);
            expect(response.body.project.evaluations).toContain(evaluationId);

            // Vérifier la mise à jour dans la base
            const updatedProject = await Project.findById(projectId);
            expect(updatedProject.evaluations).toContain(evaluationId);
        });
    });

    describe('IA Features', () => {
        it('should predict performance and track progress', async () => {
            // Créer un projet avec deliverables
            const projectResponse = await request(app)
                .post('/api/projects/create')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    title: 'Projet IA',
                    description: 'Projet pour tests IA',
                    equipe: [
                        new mongoose.Types.ObjectId(),
                        new mongoose.Types.ObjectId()
                    ],
                    tuteur: new mongoose.Types.ObjectId(),
                    deliverables: [
                        { name: 'Spécification', deadline: new Date('2025-12-31T23:59:59Z') },
                        { name: 'Prototype', deadline: new Date('2026-01-31T23:59:59Z') }
                    ],
                    skills: ['Python', 'Data Analysis']
                });
            const testProjectId = projectResponse.body._id;

            // Lancer la prédiction IA
            const predictResponse = await request(app)
                .post(`/api/projects/${testProjectId}/predict-performance`)
                .set('Authorization', `Bearer ${token}`);
            expect(predictResponse.status).toBe(200);

            // Vérifier la prédiction
            const project = await Project.findById(testProjectId);
            expect(project.predictedPerformance).toBeGreaterThan(0);

            // Suivi de progression (ex. marquer un deliverable comme terminé)
            await Project.findByIdAndUpdate(testProjectId, {
                $set: {
                    'deliverables.0.status': 'terminé'
                }
            });

            // Appeler le suivi IA
            await IaService.trackProgress(testProjectId);
            const updatedProject = await Project.findById(testProjectId);
            expect(updatedProject.progression).toBe(50); // 1/2 deliverables terminés
        });
    });

    describe('Tutor Matching', () => {
        it('should assign a smart tutor', async () => {
            // Créer des tuteurs avec compétences variées
            const tutor1 = await User.create({
                email: 'tutor1@example.com',
                password: 'password',
                role: 'tuteur',
                experience: 90,
                skills: ['Python', 'Machine Learning']
            });

            const tutor2 = await User.create({
                email: 'tutor2@example.com',
                password: 'password',
                role: 'tuteur',
                experience: 70,
                skills: ['Java', 'Cloud']
            });

            // Créer un projet avec des compétences requises
            const projectResponse = await request(app)
                .post('/api/projects/create')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    title: 'Projet avec Matching',
                    skills: ['Python', 'Machine Learning']
                });
            const testProjectId = projectResponse.body._id;

            // Assigner un tuteur intelligent
            const assignResponse = await request(app)
                .post(`/api/projects/${testProjectId}/assign-tutor`)
                .set('Authorization', `Bearer ${token}`);

            expect(assignResponse.status).toBe(200);
            expect(assignResponse.body.tutor._id).toBe(tutor1._id); // Tutor1 a les compétences requises
        });
    });
});