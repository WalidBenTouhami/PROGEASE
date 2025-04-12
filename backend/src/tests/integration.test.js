// src/tests/integration.test.js
const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const User = require('../modules/user-management/models/user.model');
const Project = require('../modules/project-management/models/project.model');
const Evaluation = require('../modules/evaluation-system/models/evaluation.model');
const IaService = require('../services/ia.service');

describe('🧪 Integration Tests - PROGEASE', () => {
    let token, tuteur, etudiant1, etudiant2;

    beforeAll(async () => {
        await mongoose.connect(process.env.MONGODB_URI);

        // 👤 Création de comptes utilisateurs
        tuteur = await User.create({
            email: 'tutor@example.com',
            password: 'password',
            role: 'tuteur',
            experience: 85,
            skills: ['Python', 'ML']
        });

        etudiant1 = await User.create({
            email: 'etudiant1@example.com',
            password: 'password',
            role: 'student'
        });

        etudiant2 = await User.create({
            email: 'etudiant2@example.com',
            password: 'password',
            role: 'student'
        });

        // 🔐 Authentification tuteur
        const auth = await request(app)
            .post('/api/users/login')
            .send({ email: tuteur.email, password: 'password' });

        token = auth.body.token;
    });

    afterAll(async () => {
        await Project.deleteMany({});
        await Evaluation.deleteMany({});
        await User.deleteMany({});
        await mongoose.connection.close();
    });

    const createProject = async (custom = {}) => {
        const res = await request(app)
            .post('/api/projects/create')
            .set('Authorization', `Bearer ${token}`)
            .send({
                titre: custom.titre || 'Projet de test',
                description: custom.description || 'Description de test avec plus de 50 caractères pour valider.',
                equipe: custom.equipe || [etudiant1._id, etudiant2._id],
                tuteur: custom.tuteur || tuteur._id,
                skills: custom.skills || ['Python', 'ML'],
                deliverables: custom.deliverables || [],
                ...custom
            });

        expect(res.status).toBe(201);
        return res.body;
    };

    describe('📎 Liaison Projet <-> Évaluation', () => {
        it('doit relier une évaluation à un projet', async () => {
            const project = await createProject();

            // ➕ Création évaluation
            const evalRes = await request(app)
                .post('/api/evaluations/create')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    projet_id: project._id,
                    evaluateur_id: tuteur._id,
                    score: 88,
                    comments: 'Bon projet'
                });

            const evaluationId = evalRes.body._id;

            // 🔗 Ajout au projet
            const linkRes = await request(app)
                .post(`/api/projects/${project._id}/add-evaluation`)
                .set('Authorization', `Bearer ${token}`)
                .send({ evaluationId });

            expect(linkRes.status).toBe(200);
            expect(linkRes.body.project.evaluations).toContain(evaluationId);

            const updated = await Project.findById(project._id);
            expect(updated.evaluations.map(e => e.toString())).toContain(evaluationId);
        });
    });

    describe('🧠 Fonctionnalités IA : Prédiction + Suivi', () => {
        it('doit prédire la performance et mettre à jour la progression', async () => {
            const deliverables = [
                { name: 'Livrable 1', deadline: new Date(Date.now() + 86400000), repositoryUrl: "https://github.com/WalidBenTouhami/PROGEASE" },
                { name: 'Livrable 2', deadline: new Date(Date.now() + 172800000), repositoryUrl: "https://github.com/WalidBenTouhami/PROGEASE" }
            ];

            const project = await createProject({ deliverables });

            // 📊 Lancer prédiction IA
            const predict = await request(app)
                .post(`/api/projects/${project._id}/predict-performance`)
                .set('Authorization', `Bearer ${token}`);
            expect(predict.status).toBe(200);

            const refreshed = await Project.findById(project._id);
            expect(refreshed.predictedPerformance).toBeGreaterThan(0);

            // ✅ Marquer 1 livrable comme terminé
            await Project.findByIdAndUpdate(project._id, {
                $set: { 'deliverables.0.status': 'terminé' }
            });

            // 🔁 Mise à jour progression
            await IaService.trackProgress(project._id);
            const updated = await Project.findById(project._id);
            expect(updated.progression).toBe(50);
        });
    });

    describe('🤖 Matching intelligent des tuteurs', () => {
        it('doit assigner automatiquement un tuteur qualifié', async () => {
            const project = await createProject({ tuteur: null });

            const matchRes = await request(app)
                .post(`/api/projects/${project._id}/assign-tutor`)
                .set('Authorization', `Bearer ${token}`);

            expect(matchRes.status).toBe(200);
            expect(matchRes.body.tutor).toBeDefined();
            expect(matchRes.body.tutor._id).toBe(tuteur._id.toString());
        });
    });
});
