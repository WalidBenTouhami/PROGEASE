// src/modules/evaluation-system/tests/evaluation.test.js

import request from 'supertest';
import app from '../../../app.js'; // Assurez-vous que le chemin vers votre app Express est correct
import mongoose from 'mongoose';
import Evaluation from '../models/evaluation.model.js';

describe('Evaluation System API', () => {
    let projectId, evaluatorId;

    beforeAll(async () => {
        // Connectez-vous à une base de données de test
        await mongoose.connect(process.env.TEST_DATABASE_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        // Créez des données de test
        projectId = new mongoose.Types.ObjectId();
        evaluatorId = new mongoose.Types.ObjectId();
    });

    afterAll(async () => {
        // Nettoyez la base de données et fermez la connexion
        await Evaluation.deleteMany({});
        await mongoose.connection.close();
    });

    describe('POST /projects/:projectId/evaluations', () => {
        it('devrait créer une évaluation avec des données valides', async () => {
            const response = await request(app)
                .post(`/projects/${projectId}/evaluations`)
                .send({
                    criteria: {
                        technical: 80,
                        creativity: 90,
                        presentation: 85,
                    },
                    comments: 'Très bon projet.',
                })
                .set('Authorization', `Bearer token-test`); // Remplacez par un token valide si nécessaire

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('_id');
            expect(response.body.criteria.technical).toBe(80);
        });

        it('devrait retourner une erreur pour des données invalides', async () => {
            const response = await request(app)
                .post(`/projects/${projectId}/evaluations`)
                .send({
                    criteria: {},
                })
                .set('Authorization', `Bearer token-test`);

            expect(response.status).toBe(400);
            expect(response.body.code).toBe('INVALID_CRITERIA');
        });
    });

    describe('GET /projects/:projectId/report', () => {
        it('devrait retourner un rapport d\'évaluation', async () => {
            const response = await request(app)
                .get(`/projects/${projectId}/report`)
                .set('Authorization', `Bearer token-test`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('avgTechnical');
            expect(response.body).toHaveProperty('avgCreativity');
            expect(response.body).toHaveProperty('avgPresentation');
        });

        it('devrait retourner une erreur si le projet n\'existe pas', async () => {
            const invalidProjectId = new mongoose.Types.ObjectId();
            const response = await request(app)
                .get(`/projects/${invalidProjectId}/report`)
                .set('Authorization', `Bearer token-test`);

            expect(response.status).toBe(404);
            expect(response.body.code).toBe('REPORT_GENERATION_ERROR');
        });
    });
});