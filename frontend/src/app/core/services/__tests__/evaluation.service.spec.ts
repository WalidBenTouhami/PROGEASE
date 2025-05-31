/// <reference types="jasmine" />

import { TestBed } from '@angular/core/testing';
import { Apollo } from 'apollo-angular';
import { of } from 'rxjs';
import { EvaluationService } from '../evaluation.service';
import { Evaluation, EvaluationCritere, EvaluationStats } from '../../models/evaluation.model';

describe('EvaluationService', () => {
  let service: EvaluationService;
  let apolloSpy: jasmine.SpyObj<Apollo>;

  const mockCritere: EvaluationCritere = {
    nom: 'Qualité du code',
    note: 15,
    poids: 0.4
  };

  const mockEvaluation: Evaluation = {
    id: '123',
    projetId: 'projet1',
    evaluateurId: 'user1',
    note: 15,
    commentaire: 'Très bon travail',
    criteres: [mockCritere],
    dateEvaluation: '2024-03-15',
    creeLe: '2024-03-15',
    majLe: '2024-03-15',
    projet: {
      id: 'projet1',
      titre: 'Projet Test',
      description: 'Description du projet',
      statut: 'EN_COURS',
      dateDebut: '2024-01-01',
      dateFin: '2024-12-31'
    },
    evaluateur: {
      id: 'user1',
      nom: 'Doe',
      prenom: 'John',
      email: 'john.doe@example.com',
      role: 'TUTEUR'
    }
  };

  const mockEvaluationStats: EvaluationStats = {
    moyenneNote: 15,
    noteMax: 18,
    noteMin: 12,
    totalEvaluations: 5
  };

  beforeEach(() => {
    const spy = jasmine.createSpyObj('Apollo', ['watchQuery', 'query', 'mutate']);
    TestBed.configureTestingModule({
      providers: [
        EvaluationService,
        { provide: Apollo, useValue: spy }
      ]
    });
    service = TestBed.inject(EvaluationService);
    apolloSpy = TestBed.inject(Apollo) as jasmine.SpyObj<Apollo>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getEvaluations', () => {
    it('should return all evaluations when no projetId is provided', (done) => {
      const mockQueryRef = {
        valueChanges: of({ data: { evaluations: [mockEvaluation] } })
      };
      apolloSpy.watchQuery.and.returnValue(mockQueryRef as any);

      service.getEvaluations().subscribe({
        next: (evaluations) => {
          expect(evaluations).toEqual([mockEvaluation]);
          expect(apolloSpy.watchQuery).toHaveBeenCalledWith({
            query: jasmine.any(Object),
            variables: {}
          });
          done();
        },
        error: done.fail
      });
    });

    it('should return evaluations for a specific project', (done) => {
      const projetId = 'projet1';
      const mockQueryRef = {
        valueChanges: of({ data: { evaluations: [mockEvaluation] } })
      };
      apolloSpy.watchQuery.and.returnValue(mockQueryRef as any);

      service.getEvaluations(projetId).subscribe({
        next: (evaluations) => {
          expect(evaluations).toEqual([mockEvaluation]);
          expect(apolloSpy.watchQuery).toHaveBeenCalledWith({
            query: jasmine.any(Object),
            variables: { projetId }
          });
          done();
        },
        error: done.fail
      });
    });
  });

  describe('getEvaluation', () => {
    it('should return a single evaluation', (done) => {
      const id = '123';
      const mockQueryRef = {
        valueChanges: of({ data: { evaluation: mockEvaluation } })
      };
      apolloSpy.watchQuery.and.returnValue(mockQueryRef as any);

      service.getEvaluation(id).subscribe({
        next: (evaluation) => {
          expect(evaluation).toEqual(mockEvaluation);
          expect(apolloSpy.watchQuery).toHaveBeenCalledWith({
            query: jasmine.any(Object),
            variables: { id }
          });
          done();
        },
        error: done.fail
      });
    });
  });

  describe('updateEvaluation', () => {
    it('should update an evaluation', (done) => {
      const id = '123';
      const input = {
        note: 16,
        commentaire: 'Mise à jour du commentaire',
        criteres: [mockCritere]
      };

      apolloSpy.mutate.and.returnValue(of({
        data: { updateEvaluation: { ...mockEvaluation, ...input } },
        loading: false,
        context: {},
        errors: undefined
      }));

      service.updateEvaluation(id, input).subscribe({
        next: (evaluation) => {
          expect(evaluation).toEqual({ ...mockEvaluation, ...input });
          expect(apolloSpy.mutate).toHaveBeenCalledWith({
            mutation: jasmine.any(Object),
            variables: { id, input }
          });
          done();
        },
        error: done.fail
      });
    });
  });

  describe('deleteEvaluation', () => {
    it('should delete an evaluation', (done) => {
      const id = '123';
      apolloSpy.mutate.and.returnValue(of({
        data: { deleteEvaluation: { id } },
        loading: false,
        context: {},
        errors: undefined
      }));

      service.deleteEvaluation(id).subscribe({
        next: (deletedId) => {
          expect(deletedId).toEqual(id);
          expect(apolloSpy.mutate).toHaveBeenCalledWith({
            mutation: jasmine.any(Object),
            variables: { id },
            refetchQueries: [{ query: jasmine.any(Object) }]
          });
          done();
        },
        error: done.fail
      });
    });
  });

  describe('getEvaluationStats', () => {
    it('should return evaluation statistics', (done) => {
      const projetId = 'projet1';
      apolloSpy.query.and.returnValue(of({
        data: { evaluationStats: mockEvaluationStats },
        loading: false,
        networkStatus: 7,
        context: {},
        errors: undefined
      }));

      service.getEvaluationStats(projetId).subscribe({
        next: (stats) => {
          expect(stats).toEqual(mockEvaluationStats);
          expect(apolloSpy.query).toHaveBeenCalledWith({
            query: jasmine.any(Object),
            variables: { projetId }
          });
          done();
        },
        error: done.fail
      });
    });
  });

  describe('createEvaluation', () => {
    it('should create a new evaluation', (done) => {
      const input = {
        projetId: 'projet1',
        evaluateurId: 'user1',
        note: 15,
        commentaire: 'Nouvelle évaluation',
        criteres: [mockCritere]
      };

      apolloSpy.mutate.and.returnValue(of({
        data: { createEvaluation: mockEvaluation },
        loading: false,
        context: {},
        errors: undefined
      }));

      service.createEvaluation(input).subscribe({
        next: (evaluation) => {
          expect(evaluation).toEqual(mockEvaluation);
          expect(apolloSpy.mutate).toHaveBeenCalledWith({
            mutation: jasmine.any(Object),
            variables: { input }
          });
          done();
        },
        error: done.fail
      });
    });
  });
}); 