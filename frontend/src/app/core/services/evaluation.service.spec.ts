import { TestBed } from '@angular/core/testing';
import { Apollo } from 'apollo-angular';
import { of } from 'rxjs';
import { EvaluationService } from './evaluation.service';
import { Evaluation } from '../models/evaluation.model';

describe('EvaluationService', () => {
  let service: EvaluationService;
  let apolloSpy: jasmine.SpyObj<Apollo>;

  const mockEvaluation: Evaluation = {
    id: '1',
    projetId: '1',
    evaluateurId: '1',
    note: 15,
    commentaire: 'Très bon travail',
    dateEvaluation: '2024-03-15',
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

  beforeEach(() => {
    const spy = jasmine.createSpyObj('Apollo', ['watchQuery', 'mutate']);
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
    it('should return an array of evaluations', (done) => {
      const response = {
        data: {
          evaluations: [mockEvaluation]
        }
      };

      apolloSpy.watchQuery.and.returnValue({
        valueChanges: of(response)
      } as any);

      service.getEvaluations().subscribe(result => {
        expect(result.data).toEqual([mockEvaluation]);
        expect(result.success).toBeTrue();
        done();
      });
    });

    it('should handle errors', (done) => {
      apolloSpy.watchQuery.and.returnValue({
        valueChanges: of({
          data: null,
          errors: [{ message: 'Error fetching evaluations' }]
        })
      } as any);

      service.getEvaluations().subscribe(result => {
        expect(result.success).toBeFalse();
        expect(result.error).toBeTruthy();
        done();
      });
    });

    it('should filter by projetId', (done) => {
      const projetId = '1';
      const response = {
        data: {
          evaluations: [mockEvaluation]
        }
      };

      apolloSpy.watchQuery.and.returnValue({
        valueChanges: of(response)
      } as any);

      service.getEvaluations({ projetId }).subscribe(result => {
        expect(result.data[0].projetId).toEqual(projetId);
        expect(result.success).toBeTrue();
        done();
      });
    });
  });

  describe('getEvaluationById', () => {
    it('should return an evaluation by id', (done) => {
      const response = {
        data: {
          evaluation: mockEvaluation
        }
      };

      apolloSpy.watchQuery.and.returnValue({
        valueChanges: of(response)
      } as any);

      service.getEvaluationById('1').subscribe(result => {
        expect(result.data).toEqual(mockEvaluation);
        expect(result.success).toBeTrue();
        done();
      });
    });

    it('should handle non-existent evaluation', (done) => {
      apolloSpy.watchQuery.and.returnValue({
        valueChanges: of({
          data: {
            evaluation: null
          }
        })
      } as any);

      service.getEvaluationById('999').subscribe(result => {
        expect(result.success).toBeFalse();
        expect(result.error).toBeTruthy();
        done();
      });
    });
  });

  describe('createEvaluation', () => {
    it('should create a new evaluation', (done) => {
      const newEvaluation = {
        projetId: '1',
        evaluateurId: '1',
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

      const response = {
        data: {
          createEvaluation: { ...newEvaluation, id: '2' }
        }
      };

      apolloSpy.mutate.and.returnValue(of(response));

      service.createEvaluation(newEvaluation).subscribe(result => {
        expect(result.success).toBeTrue();
        expect(result.data.id).toBeTruthy();
        expect(result.data.note).toEqual(newEvaluation.note);
        done();
      });
    });

    it('should handle creation errors', (done) => {
      apolloSpy.mutate.and.returnValue(of({
        data: null,
        errors: [{ message: 'Error creating evaluation' }]
      }));

      service.createEvaluation({} as any).subscribe(result => {
        expect(result.success).toBeFalse();
        expect(result.error).toBeTruthy();
        done();
      });
    });
  });

  describe('updateEvaluation', () => {
    it('should update an existing evaluation', (done) => {
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

      const response = {
        data: {
          updateEvaluation: { ...mockEvaluation, ...updateData }
        }
      };

      apolloSpy.mutate.and.returnValue(of(response));

      service.updateEvaluation('1', updateData).subscribe(result => {
        expect(result.success).toBeTrue();
        expect(result.data.note).toEqual(updateData.note);
        expect(result.data.commentaire).toEqual(updateData.commentaire);
        expect(result.data.criteres).toEqual(updateData.criteres);
        done();
      });
    });

    it('should handle update errors', (done) => {
      apolloSpy.mutate.and.returnValue(of({
        data: null,
        errors: [{ message: 'Error updating evaluation' }]
      }));

      service.updateEvaluation('1', {}).subscribe(result => {
        expect(result.success).toBeFalse();
        expect(result.error).toBeTruthy();
        done();
      });
    });
  });

  describe('deleteEvaluation', () => {
    it('should delete an evaluation', (done) => {
      const response = {
        data: {
          deleteEvaluation: { id: '1' }
        }
      };

      apolloSpy.mutate.and.returnValue(of(response));

      service.deleteEvaluation('1').subscribe(result => {
        expect(result.success).toBeTrue();
        expect(result.data.id).toEqual('1');
        done();
      });
    });

    it('should handle deletion errors', (done) => {
      apolloSpy.mutate.and.returnValue(of({
        data: null,
        errors: [{ message: 'Error deleting evaluation' }]
      }));

      service.deleteEvaluation('999').subscribe(result => {
        expect(result.success).toBeFalse();
        expect(result.error).toBeTruthy();
        done();
      });
    });
  });

  describe('getEvaluationStats', () => {
    it('should return evaluation statistics for a project', (done) => {
      const response = {
        data: {
          evaluationStats: {
            moyenneNote: 15,
            noteMax: 18,
            noteMin: 12,
            totalEvaluations: 5
          }
        }
      };

      apolloSpy.watchQuery.and.returnValue({
        valueChanges: of(response)
      } as any);

      service.getEvaluationStats('1').subscribe(result => {
        expect(result.success).toBeTrue();
        expect(result.data.moyenneNote).toBeDefined();
        expect(result.data.noteMax).toBeDefined();
        expect(result.data.noteMin).toBeDefined();
        expect(result.data.totalEvaluations).toBeDefined();
        done();
      });
    });

    it('should handle stats errors', (done) => {
      apolloSpy.watchQuery.and.returnValue({
        valueChanges: of({
          data: null,
          errors: [{ message: 'Error fetching stats' }]
        })
      } as any);

      service.getEvaluationStats('1').subscribe(result => {
        expect(result.success).toBeFalse();
        expect(result.error).toBeTruthy();
        done();
      });
    });
  });
}); 