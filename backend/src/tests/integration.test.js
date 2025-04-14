// src/tests/integration.test.js

import request from 'supertest';
import { app } from '../../app.js';
import { setupTestDB, teardownTestDB } from './testUtils.js';
import { mockRedis } from './mocks/redis.mock.js';

describe('API Integration Tests', () => {
    beforeAll(async () => {
        await setupTestDB();
        mockRedis();
    });

    afterAll(async () => {
        await teardownTestDB();
    });

    describe('Project Lifecycle', () => {
        let authToken;
        let projectId;

        beforeAll(async () => {
            // Authentification
            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 'test@example.com', password: 'validPassword' });

            authToken = res.body.token;
            expect(authToken).toBeDefined();
        });

        afterEach(async () => {
            // Nettoyage des projets créés
            if (projectId) {
                await request(app)
                    .delete(`/api/projects/${projectId}`)
                    .set('Authorization', `Bearer ${authToken}`);
            }
        });

        test('Full project creation flow', async () => {
            // Création de projet
            const createRes = await request(app)
                .post('/api/projects')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    title: 'Integration Test Project',
                    description: 'Project for integration testing'
                });

            expect(createRes.status).toBe(201);
            expect(createRes.body).toHaveProperty('id');
            projectId = createRes.body.id;

            // Ajout de livrable
            const deliverableRes = await request(app)
                .post(`/api/projects/${projectId}/deliverables`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    name: 'Initial Setup',
                    deadline: new Date(Date.now() + 86400000)
                });

            expect(deliverableRes.status).toBe(201);
            expect(deliverableRes.body).toHaveProperty('id');

            // Vérification du statut
            const getRes = await request(app)
                .get(`/api/projects/${projectId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(getRes.status).toBe(200);
            expect(getRes.body).toMatchObject({
                status: 'en_cours',
                deliverables: expect.arrayContaining([
                    expect.objectContaining({ name: 'Initial Setup' })
                ])
            });
        });
    });

    describe('Error Handling', () => {
        test('Invalid endpoint should return 404', async () => {
            const res = await request(app).get('/api/invalid-endpoint');
            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty('error.code', 'NOT_FOUND');
        });

        test('Unauthorized access should return 401', async () => {
            const res = await request(app).get('/api/projects');
            expect(res.status).toBe(401);
            expect(res.body).toHaveProperty('error.message', 'Unauthorized');
        });
    });
});