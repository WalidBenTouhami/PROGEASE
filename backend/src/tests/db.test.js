// 📁 test/db-test.js

import { connectToDatabase, closeDatabase } from '../core/db.js';
import { mockDatabase } from './mocks/database.mock.js';

beforeAll(async () => {
    await connectToDatabase();
    await mockDatabase();
});

afterAll(async () => {
    await closeDatabase();
});

describe('Database Operations', () => {
    it('should maintain connection pool', async () => {
        const connection = await connectToDatabase();
        expect(connection.readyState).toBe(1);
    });

    it('should handle concurrent queries', async () => {
        const promises = Array(10).fill().map(() =>
            Project.find().lean().exec()
        );

        const results = await Promise.all(promises);
        expect(results.length).toBe(10);
    });

    it('should recover from connection loss', async () => {
        // Simuler une déconnexion
        await mongoose.connection.close();

        // Tenter une nouvelle requête
        const projects = await Project.find();
        expect(Array.isArray(projects)).toBe(true);
    });
});
