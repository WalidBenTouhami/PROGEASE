// 📁 src/tests/db.test.js

import mongoose from 'mongoose';
import { connectToDatabase, closeDatabase } from '../core/db.js';
import { mockDatabase } from './mocks/database.mock.js';
import Project from '../models/Project.js'; // Assurez-vous que le modèle est correctement importé

beforeAll(async () => {
    await connectToDatabase();
    await mockDatabase();
});

afterAll(async () => {
    await closeDatabase();
});

describe('Database Operations', () => {
    it('should maintain connection pool', async () => {
        const connection = mongoose.connection;
        expect(connection.readyState).toBe(1); // 1 signifie connecté
    });

    it('should handle concurrent queries', async () => {
        const promises = Array(10).fill().map(() =>
            Project.find().lean().exec()
        );

        const results = await Promise.all(promises);
        expect(results.length).toBe(10);
    });

    it('should recover from connection loss', async () => {
        try {
            // Simuler une déconnexion
            await mongoose.connection.close();
            expect(mongoose.connection.readyState).toBe(0); // 0 signifie déconnecté

            // Tenter une reconnexion
            await connectToDatabase();
            expect(mongoose.connection.readyState).toBe(1); // 1 signifie reconnecté

            // Vérifier une requête après reconnexion
            const projects = await Project.find();
            expect(Array.isArray(projects)).toBe(true);
        } catch (error) {
            throw new Error(`Test failed: ${error.message}`);
        }
    });
});