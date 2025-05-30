const { creerLivrable, recupererTousLivrables } = require('../../src/services/livrable.service');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { Enum } = require('../../config/constants');
require('../../src/models/projet.model'); // Importer le modèle Projet

let mongoServer;

jest.setTimeout(120000); // Augmenter le délai global à 2 minutes

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
}, 60000); // Augmenter le délai à 1 minute

afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }
    if (mongoServer) {
        await mongoServer.stop();
    }
}, 60000);

describe('LivrableService', () => {
    describe('creerLivrable', () => {
        it('devrait créer un nouveau livrable avec des données valides', async () => {
            const livrableData = {
                intitule: 'Test Livrable',
                description: 'Description détaillée du livrable de test pour validation',
                dateLimite: new Date(Date.now() + 86400000), // +1 jour
                statut: Enum.StatutLivrable.EN_ATTENTE,
                projetId: new mongoose.Types.ObjectId()
            };

            const livrableCree = await creerLivrable(livrableData);
            expect(livrableCree).toBeDefined();
            expect(livrableCree.intitule).toBe(livrableData.intitule);
            expect(livrableCree.description).toBe(livrableData.description);
            expect(livrableCree.statut).toBe(livrableData.statut);
            expect(livrableCree.projetId.toString()).toBe(livrableData.projetId.toString());
        }, 30000); // Augmenter le délai à 30 secondes
    });

    describe('recupererTousLivrables', () => {
        it('devrait récupérer tous les livrables avec pagination', async () => {
            const options = {
                page: 1,
                limit: 10
            };

            const resultat = await recupererTousLivrables(options);
            expect(resultat).toBeDefined();
            expect(resultat.livrables).toBeDefined();
            expect(Array.isArray(resultat.livrables)).toBe(true);
            expect(resultat.pagination).toBeDefined();
            expect(resultat.pagination.page).toBe(options.page);
            expect(resultat.pagination.limite).toBe(options.limit);
        }, 30000); // Augmenter le délai à 30 secondes
    });
}); 