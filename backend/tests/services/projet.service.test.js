const { expect } = require('chai');
const { ProjetService } = require('../../src/services/projet.service');
const { DatabaseService } = require('../../src/services/database.service');
const { mockProjet, mockLivrable, mockEvaluation } = require('../mocks/data');

describe('ProjetService', () => {
    let projetService;
    let dbService;

    beforeEach(() => {
        dbService = new DatabaseService();
        projetService = new ProjetService(dbService);
    });

    describe('createProjet', () => {
        it('should create a new projet', async () => {
            const projetData = {
                titre: 'Nouveau Projet',
                description: 'Description du projet',
                dateDebut: '2024-01-01',
                dateFin: '2024-12-31',
                statut: 'EN_COURS',
            };

            const result = await projetService.createProjet(projetData);
            expect(result).to.have.property('id');
            expect(result.titre).to.equal(projetData.titre);
            expect(result.description).to.equal(projetData.description);
            expect(result.statut).to.equal(projetData.statut);
        });

        it('should throw an error if required fields are missing', async () => {
            const projetData = {
                description: 'Description du projet',
            };

            try {
                await projetService.createProjet(projetData);
                expect.fail('Should have thrown an error');
            } catch (error) {
                expect(error.message).to.include('titre');
            }
        });
    });

    describe('getProjets', () => {
        it('should return all projets', async () => {
            const projets = await projetService.getProjets();
            expect(projets).to.be.an('array');
            projets.forEach(projet => {
                expect(projet).to.have.property('id');
                expect(projet).to.have.property('titre');
            });
        });

        it('should filter projets by statut', async () => {
            const statut = 'EN_COURS';
            const projets = await projetService.getProjets({ statut });
            expect(projets).to.be.an('array');
            projets.forEach(projet => {
                expect(projet.statut).to.equal(statut);
            });
        });
    });

    describe('getProjetById', () => {
        it('should return a projet by id', async () => {
            const projet = await projetService.getProjetById(mockProjet.id);
            expect(projet).to.have.property('id', mockProjet.id);
            expect(projet).to.have.property('titre', mockProjet.titre);
        });

        it('should return null for non-existent projet', async () => {
            const projet = await projetService.getProjetById('non-existent-id');
            expect(projet).to.be.null;
        });
    });

    describe('updateProjet', () => {
        it('should update a projet', async () => {
            const updateData = {
                titre: 'Titre mis à jour',
                description: 'Description mise à jour',
            };

            const result = await projetService.updateProjet(mockProjet.id, updateData);
            expect(result).to.have.property('id', mockProjet.id);
            expect(result.titre).to.equal(updateData.titre);
            expect(result.description).to.equal(updateData.description);
        });

        it('should throw an error for non-existent projet', async () => {
            try {
                await projetService.updateProjet('non-existent-id', { titre: 'Test' });
                expect.fail('Should have thrown an error');
            } catch (error) {
                expect(error.message).to.include('not found');
            }
        });
    });

    describe('deleteProjet', () => {
        it('should delete a projet', async () => {
            const result = await projetService.deleteProjet(mockProjet.id);
            expect(result).to.have.property('id', mockProjet.id);
        });

        it('should throw an error for non-existent projet', async () => {
            try {
                await projetService.deleteProjet('non-existent-id');
                expect.fail('Should have thrown an error');
            } catch (error) {
                expect(error.message).to.include('not found');
            }
        });
    });

    describe('getProjetLivrables', () => {
        it('should return livrables for a projet', async () => {
            const livrables = await projetService.getProjetLivrables(mockProjet.id);
            expect(livrables).to.be.an('array');
            livrables.forEach(livrable => {
                expect(livrable).to.have.property('projetId', mockProjet.id);
            });
        });
    });

    describe('getProjetEvaluations', () => {
        it('should return evaluations for a projet', async () => {
            const evaluations = await projetService.getProjetEvaluations(mockProjet.id);
            expect(evaluations).to.be.an('array');
            evaluations.forEach(evaluation => {
                expect(evaluation).to.have.property('projetId', mockProjet.id);
            });
        });
    });
});
