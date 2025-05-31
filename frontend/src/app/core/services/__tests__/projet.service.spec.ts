import { TestBed } from '@angular/core/testing';
import { ProjetService } from '../projet.service';
import { ApiService } from '../api.service';
import { LivrableService } from '../livrable.service';
import { Projet, StatutProjet } from '../../models/projet.model';
import { Livrable, StatutLivrable } from '../../models/livrable.model';
import { of } from 'rxjs';

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

type DeleteResponse = {
  success: boolean;
  message: string;
};

describe('ProjetService', () => {
  let service: ProjetService;
  let apiServiceSpy: jasmine.SpyObj<ApiService>;
  let livrableServiceSpy: jasmine.SpyObj<LivrableService>;

  const mockProjet: Projet = {
    titre: 'Projet Test',
    description: 'Description du projet',
    equipe: ['user1', 'user2'],
    competences: ['Angular', 'Node.js'],
    dateDebut: '2024-01-01',
    dateFin: '2024-12-31',
    livrables: ['livrable1'],
    statut: StatutProjet.EN_COURS
  };

  const mockLivrable: Livrable = {
    titre: 'Livrable 1',
    description: 'Description du livrable',
    dateLimite: '2024-12-31',
    projetId: 'projet1',
    statut: StatutLivrable.EN_COURS
  };

  const mockResponse: ApiResponse<Projet> = {
    success: true,
    data: mockProjet
  };

  const mockListResponse: ApiResponse<Projet[]> = {
    success: true,
    data: [mockProjet]
  };

  beforeEach(() => {
    const apiSpy = jasmine.createSpyObj<ApiService>('ApiService', ['get', 'post', 'put', 'delete', 'checkHealth']);
    const livrableSpy = jasmine.createSpyObj('LivrableService', ['getAllLivrables']);
    
    TestBed.configureTestingModule({
      providers: [
        ProjetService,
        { provide: ApiService, useValue: apiSpy },
        { provide: LivrableService, useValue: livrableSpy }
      ]
    });

    service = TestBed.inject(ProjetService);
    apiServiceSpy = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    livrableServiceSpy = TestBed.inject(LivrableService) as jasmine.SpyObj<LivrableService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getProjets', () => {
    it('should return all projects', () => {
      apiServiceSpy.get.and.returnValue(of(mockListResponse));

      service.getProjets().subscribe({
        next: (response: ApiResponse<Projet[]>) => {
          expect(response).toEqual(mockListResponse);
          expect(apiServiceSpy.get).toHaveBeenCalledWith('/api/projets', {});
        }
      });
    });

    it('should handle pagination params', () => {
      const params = { page: 1, limit: 10 };
      const mockPaginatedResponse: ApiResponse<Projet[]> = { success: true, data: [] };
      apiServiceSpy.get.and.returnValue(of(mockPaginatedResponse));

      service.getProjets(params).subscribe({
        next: (response: ApiResponse<Projet[]>) => {
          expect(response).toEqual(mockPaginatedResponse);
          expect(apiServiceSpy.get).toHaveBeenCalledWith('/api/projets', params);
        }
      });
    });
  });

  describe('getProjetById', () => {
    it('should get project by id', () => {
      const id = '123';
      apiServiceSpy.get.and.returnValue(of(mockResponse));

      service.getProjetById(id).subscribe({
        next: (response: ApiResponse<Projet>) => {
          expect(response).toEqual(mockResponse);
          expect(apiServiceSpy.get).toHaveBeenCalledWith(`/api/projets/${id}`);
        }
      });
    });
  });

  describe('creerProjet', () => {
    it('should create a new project', () => {
      const newProjet: Projet = {
        titre: 'Nouveau Projet',
        description: 'Description du nouveau projet',
        equipe: ['user1'],
        competences: ['Angular'],
        dateDebut: '2024-01-01',
        dateFin: '2024-12-31',
        livrables: [],
        statut: StatutProjet.EN_ATTENTE
      };

      const createResponse: ApiResponse<Projet> = {
        success: true,
        data: { ...newProjet, id: '456' }
      };

      apiServiceSpy.post.and.returnValue(of(createResponse));

      service.creerProjet(newProjet).subscribe({
        next: (response: ApiResponse<Projet>) => {
          expect(response).toEqual(createResponse);
          expect(apiServiceSpy.post).toHaveBeenCalledWith('/api/projets', newProjet);
        }
      });
    });
  });

  describe('updateProjet', () => {
    it('should update project', () => {
      const id = '123';
      const updateProjet: Projet = {
        ...mockProjet,
        description: 'Description mise à jour'
      };

      const updateResponse: ApiResponse<Projet> = {
        success: true,
        data: updateProjet
      };

      apiServiceSpy.put.and.returnValue(of(updateResponse));

      service.updateProjet(id, updateProjet).subscribe({
        next: (response: ApiResponse<Projet>) => {
          expect(response).toEqual(updateResponse);
          expect(apiServiceSpy.put).toHaveBeenCalledWith(`/api/projets/${id}`, updateProjet);
        }
      });
    });
  });

  describe('deleteProjet', () => {
    it('should delete project', () => {
      const id = '123';
      const deleteResponse = { success: true, message: 'Deleted' };
      apiServiceSpy.delete.and.returnValue(of(deleteResponse));

      service.deleteProjet(id).subscribe({
        next: (response) => {
          expect(response).toEqual(deleteResponse);
          expect(apiServiceSpy.delete).toHaveBeenCalledWith(`/api/projets/${id}`);
        }
      });
    });
  });

  describe('getLivrables', () => {
    it('should get project deliverables', () => {
      const projetId = '123';
      const mockLivrableResponse: ApiResponse<Livrable[]> = {
        success: true,
        data: [mockLivrable]
      };
      apiServiceSpy.get.and.returnValue(of(mockLivrableResponse));

      service.getLivrables(projetId).subscribe({
        next: (response: ApiResponse<Livrable[]>) => {
          expect(response).toEqual(mockLivrableResponse);
          expect(apiServiceSpy.get).toHaveBeenCalledWith(`/api/projets/${projetId}/livrables`);
        }
      });
    });
  });

  describe('analyserRisques', () => {
    it('should analyze project risks', () => {
      const projetId = '123';
      const mockAnalyseResponse: ApiResponse<any> = {
        success: true,
        data: {
          risques: ['Délais serrés'],
          impact: 'MOYEN',
          recommandations: ['Ajouter des ressources']
        }
      };
      apiServiceSpy.post.and.returnValue(of(mockAnalyseResponse));

      service.analyserRisques(projetId).subscribe({
        next: (response: ApiResponse<any>) => {
          expect(response).toEqual(mockAnalyseResponse);
          expect(apiServiceSpy.post).toHaveBeenCalledWith('/api/projets/analyse-risques', { projetId });
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
          expect(apiServiceSpy.checkHealth).toHaveBeenCalledWith('/api/projets');
        }
      });
    });
  });
}); 