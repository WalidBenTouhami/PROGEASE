import { TestBed } from '@angular/core/testing';
import { LivrableService } from '../livrable.service';
import { ApiService } from '../api.service';
import { Livrable, StatutLivrable } from '../../models/livrable.model';
import { of } from 'rxjs';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

describe('LivrableService', () => {
  let service: LivrableService;
  let apiServiceSpy: jasmine.SpyObj<ApiService>;

  const mockLivrable: Livrable = {
    _id: '123',
    intitule: 'Livrable Test',
    description: 'Description du livrable',
    dateLimite: new Date('2024-12-31'),
    projetId: 'projet1',
    statut: StatutLivrable.EN_COURS,
    creeLe: new Date('2024-01-01'),
    majLe: new Date('2024-01-02')
  };

  const mockResponse: ApiResponse<Livrable> = {
    success: true,
    data: mockLivrable
  };

  const mockListResponse: ApiResponse<Livrable[]> = {
    success: true,
    data: [mockLivrable]
  };

  beforeEach(() => {
    const spy = jasmine.createSpyObj('ApiService', ['get', 'post', 'put', 'delete', 'checkHealth']);
    TestBed.configureTestingModule({
      providers: [
        LivrableService,
        { provide: ApiService, useValue: spy }
      ]
    });
    service = TestBed.inject(LivrableService);
    apiServiceSpy = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getLivrables', () => {
    it('should return all deliverables', () => {
      apiServiceSpy.get.and.returnValue(of(mockListResponse));

      service.getLivrables().subscribe({
        next: (response: ApiResponse<Livrable[]>) => {
          expect(response).toEqual(mockListResponse);
          expect(apiServiceSpy.get).toHaveBeenCalledWith('/api/livrables', {});
        }
      });
    });

    it('should handle pagination params', () => {
      const params = { page: 1, limit: 10 };
      const mockPaginatedResponse: ApiResponse<Livrable[]> = { success: true, data: [] };
      apiServiceSpy.get.and.returnValue(of(mockPaginatedResponse));

      service.getLivrables(params).subscribe({
        next: (response: ApiResponse<Livrable[]>) => {
          expect(response).toEqual(mockPaginatedResponse);
          expect(apiServiceSpy.get).toHaveBeenCalledWith('/api/livrables', params);
        }
      });
    });
  });

  describe('getLivrableParId', () => {
    it('should get deliverable by id', () => {
      const id = '123';
      apiServiceSpy.get.and.returnValue(of(mockResponse));

      service.getLivrableParId(id).subscribe({
        next: (response: ApiResponse<Livrable>) => {
          expect(response).toEqual(mockResponse);
          expect(apiServiceSpy.get).toHaveBeenCalledWith(`/api/livrables/${id}`);
        }
      });
    });
  });

  describe('creerLivrable', () => {
    it('should create a new deliverable', () => {
      const newLivrable: Livrable = {
        intitule: 'Nouveau Livrable',
        description: 'Description du nouveau livrable',
        dateLimite: new Date('2024-12-31'),
        projetId: 'projet1',
        statut: StatutLivrable.EN_ATTENTE
      };

      const createResponse: ApiResponse<Livrable> = {
        success: true,
        data: { ...newLivrable, _id: '456', creeLe: new Date(), majLe: new Date() }
      };

      apiServiceSpy.post.and.returnValue(of(createResponse));

      service.creerLivrable(newLivrable).subscribe({
        next: (response: ApiResponse<Livrable>) => {
          expect(response).toEqual(createResponse);
          expect(apiServiceSpy.post).toHaveBeenCalledWith('/api/livrables', newLivrable);
        }
      });
    });
  });

  describe('updateLivrable', () => {
    it('should update deliverable', () => {
      const id = '123';
      const updateLivrable: Livrable = {
        ...mockLivrable,
        description: 'Description mise à jour'
      };

      const updateResponse: ApiResponse<Livrable> = {
        success: true,
        data: { ...updateLivrable, majLe: new Date() }
      };

      apiServiceSpy.put.and.returnValue(of(updateResponse));

      service.updateLivrable(id, updateLivrable).subscribe({
        next: (response: ApiResponse<Livrable>) => {
          expect(response).toEqual(updateResponse);
          expect(apiServiceSpy.put).toHaveBeenCalledWith(`/api/livrables/${id}`, updateLivrable);
        }
      });
    });
  });

  describe('deleteLivrable', () => {
    it('should delete deliverable', () => {
      const id = '123';
      const deleteResponse = { success: true, message: 'Deleted' };
      apiServiceSpy.delete.and.returnValue(of(deleteResponse));

      service.deleteLivrable(id).subscribe({
        next: (response) => {
          expect(response).toEqual(deleteResponse);
          expect(apiServiceSpy.delete).toHaveBeenCalledWith(`/api/livrables/${id}`);
        }
      });
    });
  });

  describe('getLivrablesByProjet', () => {
    it('should get deliverables by project id', () => {
      const projetId = '123';
      apiServiceSpy.get.and.returnValue(of(mockListResponse));

      service.getLivrablesByProjet(projetId).subscribe({
        next: (response: ApiResponse<Livrable[]>) => {
          expect(response).toEqual(mockListResponse);
          expect(apiServiceSpy.get).toHaveBeenCalledWith(`/api/livrables/projet/${projetId}`);
        }
      });
    });
  });

  describe('checkHealth', () => {
    it('should check service health', () => {
      const healthResponse = { status: 'ok' };
      apiServiceSpy.checkHealth.and.returnValue(of(healthResponse));

      service.checkHealth().subscribe({
        next: (response) => {
          expect(response).toEqual(healthResponse);
          expect(apiServiceSpy.checkHealth).toHaveBeenCalledWith('/api/livrables');
        }
      });
    });
  });
}); 