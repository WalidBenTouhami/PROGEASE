const { creerProjet, recupererTousProjets } = require('../../src/services/projet.service');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { Enum } = require('../../config/constants');

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

describe('ProjetService', () => {
    describe('creerProjet', () => {
        it('devrait créer un nouveau projet avec des données valides', async () => {
            const projetData = {
                titre: 'Test Projet',
                description: 'Description détaillée du projet de test pour validation',
                dateDebut: new Date(),
                dateFin: new Date(Date.now() + 86400000), // +1 jour
                statut: Enum.StatutProjet.EN_COURS,
                competences: ['JavaScript', 'Node.js'],
                equipe: [],
                progression: 0,
                urlDepot: 'https://github.com/test/projet'
            };

            const projetCree = await creerProjet(projetData);
            expect(projetCree).toBeDefined();
            expect(projetCree.titre).toBe(projetData.titre);
            expect(projetCree.description).toBe(projetData.description);
            expect(projetCree.statut).toBe(projetData.statut);
            expect(projetCree.competences).toEqual(projetData.competences);
        }, 30000); // Augmenter le délai à 30 secondes
    });

    describe('recupererTousProjets', () => {
        it('devrait récupérer tous les projets avec pagination', async () => {
            const options = {
                page: 1,
                limit: 10
            };

            const resultat = await recupererTousProjets(options);
            expect(resultat).toBeDefined();
            expect(resultat.projets).toBeDefined();
            expect(Array.isArray(resultat.projets)).toBe(true);
            expect(resultat.pagination).toBeDefined();
            expect(resultat.pagination.page).toBe(options.page);
            expect(resultat.pagination.limite).toBe(options.limit);
        }, 30000); // Augmenter le délai à 30 secondes
    });
}); 