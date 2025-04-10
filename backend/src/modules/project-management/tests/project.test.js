const request = require('supertest');
const app = require('../../../app');
const mongoose = require('mongoose');
const Project = require('../models/project.model');
const User = require('../../user-management/models/user.model');
const Evaluation = require('../../evaluation-system/models/evaluation.model');

describe('Project Management', () => {
    let token;
    let tutorId;
    let regularUserId;
    let projectId;

    beforeAll(async () => {
        const regularUser = new User({
            email: 'user@example.com',
            password: 'password',
            role: 'etudiant',
            nom: 'Étudiant Alpha'
        });
        await regularUser.save();
        regularUserId = regularUser._id;

        const tutor = new User({
            email: 'tutor@example.com',
            password: 'password',
            role: 'tuteur',
            experience: 85,
            nom: 'Tuteur Pro'
        });
        await tutor.save();
        tutorId = tutor._id;

        const authResponse = await request(app)
            .post('/api/users/login')
            .send({ email: 'tutor@example.com', password: 'password' });
        token = authResponse.body.token;

        const projectResponse = await request(app)
            .post('/api/projects/create')
            .set('Authorization', `Bearer ${token}`)
            .send({
                titre: 'Projet de Test',
                description: 'Ceci est une description valide de plus de 50 caractères.',
                equipe: [regularUserId],
                tuteur: tutorId,
                skills: ['Python', 'Machine Learning']
            });
        projectId = projectResponse.body._id;
    });

    afterAll(async () => {
        await Project.deleteMany({});
        await User.deleteMany({});
        await Evaluation.deleteMany({});
        await mongoose.connection.close();
    });

    it('should create a project', async () => {
        const response = await request(app)
            .post('/api/projects/create')
            .set('Authorization', `Bearer ${token}`)
            .send({
                titre: 'Projet de Test 2',
                description: 'Une description bien longue pour satisfaire la validation Joi.',
                equipe: [regularUserId],
                tuteur: tutorId,
                deliverables: [
                    {
                        name: 'Spécification',
                        deadline: '2025-12-31T23:59:59Z',
                        repositoryUrl: 'https://github.com/testuser/projet-repo'
                    }
                ],
                skills: ['Node.js']
            });

        expect(response.status).toBe(201);
        expect(response.body.titre).toBe('Projet de Test 2');
        expect(response.body.equipe).toContainEqual(regularUserId.toString());
    });

    it('should add an evaluation', async () => {
        const evaluation = await Evaluation.create({
            projet_id: projectId,
            evaluateur_id: regularUserId,
            score: 85
        });

        const response = await request(app)
            .post(`/api/projects/${projectId}/add-evaluation`)
            .set('Authorization', `Bearer ${token}`)
            .send({ evaluationId: evaluation._id });

        expect(response.status).toBe(200);
        expect(response.body.project.evaluations).toContain(evaluation._id.toString());
    });

    describe('IA Features', () => {
        it('should predict performance', async () => {
            const predictResponse = await request(app)
                .post(`/api/projects/${projectId}/predict-performance`)
                .set('Authorization', `Bearer ${token}`);

            expect(predictResponse.status).toBe(200);

            const updatedProject = await Project.findById(projectId);
            expect(updatedProject.predictedPerformance).toBeGreaterThan(0);
        });

        it('should assign a smart tutor', async () => {
            const response = await request(app)
                .post(`/api/projects/${projectId}/assign-tutor`)
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.tutor.role).toBe('tuteur');
        });
    });

    it('should return all projects with formations', async () => {
        const response = await request(app)
            .get('/api/projects/all')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body[0].equipe.length).toBeGreaterThan(0);
        expect(response.body[0].equipe[0].nom).toBeDefined();
    });

    it('should handle validation errors', async () => {
        const invalidResponse = await request(app)
            .post('/api/projects/create')
            .set('Authorization', `Bearer ${token}`)
            .send({ description: 'Courte' }); // description trop courte + pas de titre

        expect(invalidResponse.status).toBe(400);
        expect(invalidResponse.body.errors).toBeDefined();
    });
});
