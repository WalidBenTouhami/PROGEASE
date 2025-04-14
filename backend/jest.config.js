// backend/jest.config.js

export default {
    transform: {}, // Pas besoin de Babel ici
    testEnvironment: 'node',
    verbose: true,
    moduleNameMapper: { '^(\\.{1,2}/.*)\\.js$': '$1.js' },
    testMatch: ['**/tests/**/*.test.js'], // Tes fichiers de test
};

