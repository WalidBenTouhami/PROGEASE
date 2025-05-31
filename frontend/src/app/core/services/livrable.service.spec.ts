import { TestBed } from '@angular/core/testing';
import { Apollo } from 'apollo-angular';
import { of } from 'rxjs';
import { LivrableService } from './livrable.service';
import { Livrable } from '../models/livrable.model';

describe('LivrableService', () => {
  let service: LivrableService;
  let apolloSpy: jasmine.SpyObj<Apollo>;

  const mockLivrable: Livrable = {
    id: '1',
    titre: 'Livrable Test',
    description: 'Description du livrable test',
    dateRendu: '2024-06-30',
    type: 'DOCUMENTATION',
    statut: 'EN_COURS',
    projetId: '1',
    rendus: []
  };

  beforeEach(() => {
    const spy = jasmine.createSpyObj('Apollo', ['watchQuery', 'mutate']);
    TestBed.configureTestingModule({
      providers: [
        LivrableService,
        { provide: Apollo, useValue: spy }
      ]
    });
    service = TestBed.inject(LivrableService);
    apolloSpy = TestBed.inject(Apollo) as jasmine.SpyObj<Apollo>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getLivrables', () => {
    it('should return an array of livrables', (done) => {
      const response = {
        data: {
          livrables: [mockLivrable]
        }
      };

      apolloSpy.watchQuery.and.returnValue({
        valueChanges: of(response)
      } as any);

      service.getLivrables().subscribe(result => {
        expect(result.data).toEqual([mockLivrable]);
        expect(result.success).toBeTrue();
        done();
      });
    });

    it('should handle errors', (done) => {
      apolloSpy.watchQuery.and.returnValue({
        valueChanges: of({
          data: null,
          errors: [{ message: 'Error fetching livrables' }]
        })
      } as any);

      service.getLivrables().subscribe(result => {
        expect(result.success).toBeFalse();
        expect(result.error).toBeTruthy();
        done();
      });
    });

    it('should filter by projetId', (done) => {
      const projetId = '1';
      const response = {
        data: {
          livrables: [mockLivrable]
        }
      };

      apolloSpy.watchQuery.and.returnValue({
        valueChanges: of(response)
      } as any);

      service.getLivrables({ projetId }).subscribe(result => {
        expect(result.data[0].projetId).toEqual(projetId);
        expect(result.success).toBeTrue();
        done();
      });
    });
  });

  describe('getLivrableById', () => {
    it('should return a livrable by id', (done) => {
      const response = {
        data: {
          livrable: mockLivrable
        }
      };

      apolloSpy.watchQuery.and.returnValue({
        valueChanges: of(response)
      } as any);

      service.getLivrableById('1').subscribe(result => {
        expect(result.data).toEqual(mockLivrable);
        expect(result.success).toBeTrue();
        done();
      });
    });

    it('should handle non-existent livrable', (done) => {
      apolloSpy.watchQuery.and.returnValue({
        valueChanges: of({
          data: {
            livrable: null
          }
        })
      } as any);

      service.getLivrableById('999').subscribe(result => {
        expect(result.success).toBeFalse();
        expect(result.error).toBeTruthy();
        done();
      });
    });
  });

  describe('createLivrable', () => {
    it('should create a new livrable', (done) => {
      const newLivrable = {
        titre: 'Nouveau Livrable',
        description: 'Description',
        dateRendu: '2024-06-30',
        type: 'DOCUMENTATION',
        statut: 'EN_COURS',
        projetId: '1'
      };

      const response = {
        data: {
          createLivrable: { ...newLivrable, id: '2' }
        }
      };

      apolloSpy.mutate.and.returnValue(of(response));

      service.createLivrable(newLivrable).subscribe(result => {
        expect(result.success).toBeTrue();
        expect(result.data.id).toBeTruthy();
        expect(result.data.titre).toEqual(newLivrable.titre);
        done();
      });
    });

    it('should handle creation errors', (done) => {
      apolloSpy.mutate.and.returnValue(of({
        data: null,
        errors: [{ message: 'Error creating livrable' }]
      }));

      service.createLivrable({} as any).subscribe(result => {
        expect(result.success).toBeFalse();
        expect(result.error).toBeTruthy();
        done();
      });
    });
  });

  describe('updateLivrable', () => {
    it('should update an existing livrable', (done) => {
      const updateData = {
        titre: 'Titre mis à jour',
        description: 'Description mise à jour',
        statut: 'TERMINE'
      };

      const response = {
        data: {
          updateLivrable: { ...mockLivrable, ...updateData }
        }
      };

      apolloSpy.mutate.and.returnValue(of(response));

      service.updateLivrable('1', updateData).subscribe(result => {
        expect(result.success).toBeTrue();
        expect(result.data.titre).toEqual(updateData.titre);
        expect(result.data.description).toEqual(updateData.description);
        expect(result.data.statut).toEqual(updateData.statut);
        done();
      });
    });

    it('should handle update errors', (done) => {
      apolloSpy.mutate.and.returnValue(of({
        data: null,
        errors: [{ message: 'Error updating livrable' }]
      }));

      service.updateLivrable('1', {}).subscribe(result => {
        expect(result.success).toBeFalse();
        expect(result.error).toBeTruthy();
        done();
      });
    });
  });

  describe('deleteLivrable', () => {
    it('should delete a livrable', (done) => {
      const response = {
        data: {
          deleteLivrable: { id: '1' }
        }
      };

      apolloSpy.mutate.and.returnValue(of(response));

      service.deleteLivrable('1').subscribe(result => {
        expect(result.success).toBeTrue();
        expect(result.data.id).toEqual('1');
        done();
      });
    });

    it('should handle deletion errors', (done) => {
      apolloSpy.mutate.and.returnValue(of({
        data: null,
        errors: [{ message: 'Error deleting livrable' }]
      }));

      service.deleteLivrable('999').subscribe(result => {
        expect(result.success).toBeFalse();
        expect(result.error).toBeTruthy();
        done();
      });
    });
  });

  describe('soumettreRendu', () => {
    it('should submit a rendu for a livrable', (done) => {
      const renduData = {
        url: 'https://example.com/rendu',
        commentaire: 'Voici mon rendu'
      };

      const response = {
        data: {
          soumettreRendu: {
            ...mockLivrable,
            rendus: [...mockLivrable.rendus, renduData]
          }
        }
      };

      apolloSpy.mutate.and.returnValue(of(response));

      service.soumettreRendu('1', renduData).subscribe(result => {
        expect(result.success).toBeTrue();
        expect(result.data.rendus).toContainEqual(renduData);
        done();
      });
    });

    it('should handle submission errors', (done) => {
      apolloSpy.mutate.and.returnValue(of({
        data: null,
        errors: [{ message: 'Error submitting rendu' }]
      }));

      service.soumettreRendu('1', {}).subscribe(result => {
        expect(result.success).toBeFalse();
        expect(result.error).toBeTruthy();
        done();
      });
    });
  });
});
