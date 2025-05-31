const { expect } = require('chai');
const { EvaluationService } = require('../../src/services/evaluation.service');
const { DatabaseService } = require('../../src/services/database.service');
const { mockProjet, mockEvaluation, mockUser } = require('../mocks/data');

describe('EvaluationService', () => {
  let evaluationService;
  let dbService;

  beforeEach(() => {
    dbService = new DatabaseService();
    evaluationService = new EvaluationService(dbService);
  });

  describe('createEvaluation', () => {
    it('should create a new evaluation', async () => {
      const evaluationData = {
        projetId: mockProjet.id,
        evaluateurId: mockUser.id,
        note: 15,
        commentaire: 'Très bon travail',
        criteres: [
          {
            nom: 'Qualité du code',
            note: 16,
            poids: 40
          },
          {
            nom: 'Documentation',
            note: 14,
            poids: 60
          }
        ]
      };

      const result = await evaluationService.createEvaluation(evaluationData);
      expect(result).to.have.property('id');
      expect(result.projetId).to.equal(evaluationData.projetId);
      expect(result.evaluateurId).to.equal(evaluationData.evaluateurId);
      expect(result.note).to.equal(evaluationData.note);
      expect(result.criteres).to.have.lengthOf(2);
    });

    it('should throw an error if required fields are missing', async () => {
      const evaluationData = {
        commentaire: 'Commentaire sans note'
      };

      try {
        await evaluationService.createEvaluation(evaluationData);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.include('required');
      }
    });

    it('should validate criteria weights sum to 100', async () => {
      const evaluationData = {
        projetId: mockProjet.id,
        evaluateurId: mockUser.id,
        note: 15,
        commentaire: 'Test',
        criteres: [
          {
            nom: 'Critère 1',
            note: 15,
            poids: 30
          },
          {
            nom: 'Critère 2',
            note: 15,
            poids: 30
          }
        ]
      };

      try {
        await evaluationService.createEvaluation(evaluationData);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.include('100');
      }
    });
  });

  describe('getEvaluations', () => {
    it('should return all evaluations', async () => {
      const evaluations = await evaluationService.getEvaluations();
      expect(evaluations).to.be.an('array');
      evaluations.forEach(evaluation => {
        expect(evaluation).to.have.property('id');
        expect(evaluation).to.have.property('note');
      });
    });

    it('should filter evaluations by projetId', async () => {
      const projetId = mockProjet.id;
      const evaluations = await evaluationService.getEvaluations({ projetId });
      expect(evaluations).to.be.an('array');
      evaluations.forEach(evaluation => {
        expect(evaluation.projetId).to.equal(projetId);
      });
    });

    it('should filter evaluations by evaluateurId', async () => {
      const evaluateurId = mockUser.id;
      const evaluations = await evaluationService.getEvaluations({ evaluateurId });
      expect(evaluations).to.be.an('array');
      evaluations.forEach(evaluation => {
        expect(evaluation.evaluateurId).to.equal(evaluateurId);
      });
    });
  });

  describe('getEvaluationById', () => {
    it('should return an evaluation by id', async () => {
      const evaluation = await evaluationService.getEvaluationById(mockEvaluation.id);
      expect(evaluation).to.have.property('id', mockEvaluation.id);
      expect(evaluation).to.have.property('note');
      expect(evaluation).to.have.property('criteres');
    });

    it('should return null for non-existent evaluation', async () => {
      const evaluation = await evaluationService.getEvaluationById('non-existent-id');
      expect(evaluation).to.be.null;
    });
  });

  describe('updateEvaluation', () => {
    it('should update an evaluation', async () => {
      const updateData = {
        note: 16,
        commentaire: 'Commentaire mis à jour',
        criteres: [
          {
            nom: 'Critère mis à jour',
            note: 16,
            poids: 100
          }
        ]
      };

      const result = await evaluationService.updateEvaluation(mockEvaluation.id, updateData);
      expect(result).to.have.property('id', mockEvaluation.id);
      expect(result.note).to.equal(updateData.note);
      expect(result.commentaire).to.equal(updateData.commentaire);
      expect(result.criteres).to.have.lengthOf(1);
    });

    it('should throw an error for non-existent evaluation', async () => {
      try {
        await evaluationService.updateEvaluation('non-existent-id', { note: 15 });
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.include('not found');
      }
    });
  });

  describe('deleteEvaluation', () => {
    it('should delete an evaluation', async () => {
      const result = await evaluationService.deleteEvaluation(mockEvaluation.id);
      expect(result).to.have.property('id', mockEvaluation.id);
    });

    it('should throw an error for non-existent evaluation', async () => {
      try {
        await evaluationService.deleteEvaluation('non-existent-id');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.include('not found');
      }
    });
  });

  describe('getEvaluationStats', () => {
    it('should return evaluation statistics for a project', async () => {
      const stats = await evaluationService.getEvaluationStats(mockProjet.id);
      expect(stats).to.have.property('moyenneNote');
      expect(stats).to.have.property('noteMax');
      expect(stats).to.have.property('noteMin');
      expect(stats).to.have.property('totalEvaluations');
    });

    it('should return zero stats for a project with no evaluations', async () => {
      const stats = await evaluationService.getEvaluationStats('empty-project-id');
      expect(stats.moyenneNote).to.equal(0);
      expect(stats.noteMax).to.equal(0);
      expect(stats.noteMin).to.equal(0);
      expect(stats.totalEvaluations).to.equal(0);
    });
  });
}); 