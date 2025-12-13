const { expect } = require('chai');
const { LivrableService } = require('../../src/services/livrable.service');
const { DatabaseService } = require('../../src/services/database.service');
const { mockProjet, mockLivrable } = require('../mocks/data');

describe('LivrableService', () => {
    let livrableService;
    let dbService;

    beforeEach(() => {
        dbService = new DatabaseService();
        livrableService = new LivrableService(dbService);
    });

    describe('createLivrable', () => {
        it('should create a new livrable', async () => {
            const livrableData = {
                titre: 'Nouveau Livrable',
                description: 'Description du livrable',
                projetId: mockProjet.id,
                dateRendu: '2024-06-30',
                type: 'DOCUMENTATION',
                statut: 'EN_COURS',
            };

            const result = await livrableService.createLivrable(livrableData);
            expect(result).to.have.property('id');
            expect(result.titre).to.equal(livrableData.titre);
            expect(result.description).to.equal(livrableData.description);
            expect(result.projetId).to.equal(livrableData.projetId);
        });

        it('should throw an error if required fields are missing', async () => {
            const livrableData = {
                description: 'Description du livrable',
            };

            try {
                await livrableService.createLivrable(livrableData);
                expect.fail('Should have thrown an error');
            } catch (error) {
                expect(error.message).to.include('titre');
            }
        });
    });

    describe('getLivrables', () => {
        it('should return all livrables', async () => {
            const livrables = await livrableService.getLivrables();
            expect(livrables).to.be.an('array');
            livrables.forEach(livrable => {
                expect(livrable).to.have.property('id');
                expect(livrable).to.have.property('titre');
            });
        });

        it('should filter livrables by projetId', async () => {
            const projetId = mockProjet.id;
            const livrables = await livrableService.getLivrables({ projetId });
            expect(livrables).to.be.an('array');
            livrables.forEach(livrable => {
                expect(livrable.projetId).to.equal(projetId);
            });
        });

        it('should filter livrables by statut', async () => {
            const statut = 'EN_COURS';
            const livrables = await livrableService.getLivrables({ statut });
            expect(livrables).to.be.an('array');
            livrables.forEach(livrable => {
                expect(livrable.statut).to.equal(statut);
            });
        });
    });

    describe('getLivrableById', () => {
        it('should return a livrable by id', async () => {
            const livrable = await livrableService.getLivrableById(mockLivrable.id);
            expect(livrable).to.have.property('id', mockLivrable.id);
            expect(livrable).to.have.property('titre', mockLivrable.titre);
        });

        it('should return null for non-existent livrable', async () => {
            const livrable = await livrableService.getLivrableById('non-existent-id');
            expect(livrable).to.be.null;
        });
    });

    describe('updateLivrable', () => {
        it('should update a livrable', async () => {
            const updateData = {
                titre: 'Titre mis à jour',
                description: 'Description mise à jour',
                statut: 'TERMINE',
            };

            const result = await livrableService.updateLivrable(mockLivrable.id, updateData);
            expect(result).to.have.property('id', mockLivrable.id);
            expect(result.titre).to.equal(updateData.titre);
            expect(result.description).to.equal(updateData.description);
            expect(result.statut).to.equal(updateData.statut);
        });

        it('should throw an error for non-existent livrable', async () => {
            try {
                await livrableService.updateLivrable('non-existent-id', { titre: 'Test' });
                expect.fail('Should have thrown an error');
            } catch (error) {
                expect(error.message).to.include('not found');
            }
        });
    });

    describe('deleteLivrable', () => {
        it('should delete a livrable', async () => {
            const result = await livrableService.deleteLivrable(mockLivrable.id);
            expect(result).to.have.property('id', mockLivrable.id);
        });

        it('should throw an error for non-existent livrable', async () => {
            try {
                await livrableService.deleteLivrable('non-existent-id');
                expect.fail('Should have thrown an error');
            } catch (error) {
                expect(error.message).to.include('not found');
            }
        });
    });

    describe('soumettreRendu', () => {
        it('should submit a rendu for a livrable', async () => {
            const renduData = {
                url: 'https://example.com/rendu',
                commentaire: 'Voici mon rendu',
            };

            const result = await livrableService.soumettreRendu(mockLivrable.id, renduData);
            expect(result).to.have.property('id', mockLivrable.id);
            expect(result.rendus).to.be.an('array');
            const dernierRendu = result.rendus[result.rendus.length - 1];
            expect(dernierRendu.url).to.equal(renduData.url);
            expect(dernierRendu.commentaire).to.equal(renduData.commentaire);
        });

        it('should throw an error for non-existent livrable', async () => {
            try {
                await livrableService.soumettreRendu('non-existent-id', { url: 'test' });
                expect.fail('Should have thrown an error');
            } catch (error) {
                expect(error.message).to.include('not found');
            }
        });
    });
});
