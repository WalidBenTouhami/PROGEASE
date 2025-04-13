const mongoose = require('mongoose');
const Evaluation = require('../models/Evaluation');
const evaluationService = require('../services/evaluationService');

// Mock mongoose
jest.mock('mongoose');

describe('Evaluation Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getEvaluations', () => {
        it('should return evaluations with pagination', async () => {
            const mockEvaluations = [
                { _id: '1', note: 15, projetId: 'p1', tuteurId: 't1' },
                { _id: '2', note: 18, projetId: 'p2', tuteurId: 't1' }
            ];

            Evaluation.find = jest.fn().mockReturnValue({
                where: jest.fn().mockReturnThis(),
                sort: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                populate: jest.fn().mockResolvedValue(mockEvaluations)
            });

            Evaluation.countDocuments = jest.fn().mockResolvedValue(2);

            const result = await evaluationService.getEvaluations(
                { minNote: 10, maxNote: 20, sort: 'note' },
                { page: 1, limit: 10 }
            );

            expect(result.evaluations).toEqual(mockEvaluations);
            expect(result.pagination.total).toBe(2);
        });
    });

    describe('createEvaluation', () => {
        it('should create a new evaluation', async () => {
            const evaluationData = {
                note: 15,
                projetId: 'p1',
                tuteurId: 't1',
                etudiantId: 'e1'
            };

            Evaluation.create = jest.fn().mockResolvedValue(evaluationData);

            const result = await evaluationService.createEvaluation(evaluationData);

            expect(result).toEqual(evaluationData);
            expect(Evaluation.create).toHaveBeenCalledWith(evaluationData);
        });
    });

    describe('updateEvaluation', () => {
        it('should update an existing evaluation', async () => {
            const existingEvaluation = {
                _id: '1',
                note: 15,
                commentaires: 'Bon travail',
                historique: []
            };

            const updateData = {
                note: 18,
                commentaires: 'Excellent travail',
                modifiePar: 't1'
            };

            Evaluation.findById = jest.fn().mockResolvedValue(existingEvaluation);
            Evaluation.findByIdAndUpdate = jest.fn().mockResolvedValue({
                ...existingEvaluation,
                ...updateData,
                historique: [{
                    note: 15,
                    commentaires: 'Bon travail',
                    modifiePar: 't1',
                    dateModification: expect.any(Date)
                }]
            });

            const result = await evaluationService.updateEvaluation('1', updateData);

            expect(result.historique).toHaveLength(1);
            expect(result.note).toBe(18);
        });

        it('should throw error if evaluation not found', async () => {
            Evaluation.findById = jest.fn().mockResolvedValue(null);

            await expect(evaluationService.updateEvaluation('1', { note: 18 }))
                .rejects
                .toThrow('Evaluation non trouvée');
        });
    });

    describe('getStatistics', () => {
        it('should return evaluation statistics', async () => {
            const mockStats = [{
                moyenneGenerale: 16.5,
                noteMaximum: 20,
                noteMinimum: 13,
                nombreEvaluations: 4
            }];

            Evaluation.aggregate = jest.fn().mockResolvedValue(mockStats);

            const result = await evaluationService.getStatistics();

            expect(result).toEqual(mockStats[0]);
        });

        it('should return default values when no evaluations exist', async () => {
            Evaluation.aggregate = jest.fn().mockResolvedValue([]);

            const result = await evaluationService.getStatistics();

            expect(result).toEqual({
                moyenneGenerale: 0,
                noteMaximum: 0,
                noteMinimum: 0,
                nombreEvaluations: 0
            });
        });
    });
});
