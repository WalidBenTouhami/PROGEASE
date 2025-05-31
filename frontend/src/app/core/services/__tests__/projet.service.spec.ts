import { TestBed } from '@angular/core/testing';
import { ProjetService } from '../projet.service';
import { ApiService } from '../api.service';
import { LivrableService } from '../livrable.service';
import { Projet, StatutProjet } from '../../models/projet.model';
import { Livrable, StatutLivrable } from '../../models/livrable.model';
import { of } from 'rxjs';

describe('ProjetService', () => {
  let service: ProjetService;
  let apiServiceSpy: jasmine.SpyObj<ApiService>;
  let livrableServiceSpy: jasmine.SpyObj<LivrableService>;

  const mockProjet: Projet = {
    titre: 'Projet Test',
    description: 'Description du projet',
    equipe: ['user1', 'user2'],
    competences: ['Angular', 'Node.js'],
    dateDebut: new Date(),
    dateFin: new Date(),
    livrables: ['livrable1'],
    statut: StatutProjet.EN_COURS
  };

  const mockLivrable: Livrable = {
    intitule: 'Livrable 1',
    description: 'Description du livrable',
    dateLimite: new Date(),
    projetId: 'projet1',
    statut: StatutLivrable.EN_COURS
  };

  const mockResponse = {
    success: true,
    data: mockProjet
  };

  beforeEach(() => {
    const apiSpy = jasmine.createSpyObj('ApiService', ['get', 'post', 'put', 'delete', 'checkHealth']);
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
    it('should return a list of projects', () => {
      const mockProjets = { success: true, data: [mockProjet] };
      apiServiceSpy.get.and.returnValue(of(mockProjets));

      service.getProjets().subscribe(response => {
        expect(response).toEqual(mockProjets);
        expect(apiServiceSpy.get).toHaveBeenCalledWith('/api/projets', {});
      });
    });

    it('should handle pagination params', () => {
      const params = { page: 1, limit: 10 };
      apiServiceSpy.get.and.returnValue(of({ success: true, data: [] }));

      service.getProjets(params).subscribe(() => {
        expect(apiServiceSpy.get).toHaveBeenCalledWith('/api/projets', params);
      });
    });
  });

  describe('creerProjet', () => {
    it('should create a new project', () => {
      apiServiceSpy.post.and.returnValue(of(mockResponse));

      service.creerProjet(mockProjet).subscribe(response => {
        expect(response).toEqual(mockResponse);
        expect(apiServiceSpy.post).toHaveBeenCalledWith('/api/projets', mockProjet);
      });
    });
  });

  describe('getProjetParId', () => {
    it('should get project by id', () => {
      const id = '123';
      apiServiceSpy.get.and.returnValue(of(mockResponse));

      service.getProjetParId(id).subscribe(response => {
        expect(response).toEqual(mockResponse);
        expect(apiServiceSpy.get).toHaveBeenCalledWith(`/api/projets/${id}`);
      });
    });
  });

  describe('updateProjet', () => {
    it('should update project', () => {
      const id = '123';
      apiServiceSpy.put.and.returnValue(of(mockResponse));

      service.updateProjet(id, mockProjet).subscribe(response => {
        expect(response).toEqual(mockResponse);
        expect(apiServiceSpy.put).toHaveBeenCalledWith(`/api/projets/${id}`, mockProjet);
      });
    });
  });

  describe('deleteProjet', () => {
    it('should delete project', () => {
      const id = '123';
      const deleteResponse = { success: true, message: 'Deleted' };
      apiServiceSpy.delete.and.returnValue(of(deleteResponse));

      service.deleteProjet(id).subscribe(response => {
        expect(response).toEqual(deleteResponse);
        expect(apiServiceSpy.delete).toHaveBeenCalledWith(`/api/projets/${id}`);
      });
    });
  });

  describe('getLivrables', () => {
    it('should get project deliverables', () => {
      const projetId = '123';
      const mockLivrables = { success: true, data: [mockLivrable] };
      apiServiceSpy.get.and.returnValue(of(mockLivrables));

      service.getLivrables(projetId).subscribe(response => {
        expect(response).toEqual(mockLivrables);
        expect(apiServiceSpy.get).toHaveBeenCalledWith(`/api/projets/${projetId}/livrables`);
      });
    });
  });

  describe('analyserRisques', () => {
    it('should analyze project risks', () => {
      const projetId = '123';
      const mockAnalyse = { success: true, data: { niveau: 'FAIBLE', details: [] } };
      apiServiceSpy.post.and.returnValue(of(mockAnalyse));

      service.analyserRisques(projetId).subscribe(response => {
        expect(response).toEqual(mockAnalyse);
        expect(apiServiceSpy.post).toHaveBeenCalledWith('/api/projets/analyse-risques', { projetId });
      });
    });
  });

  describe('suiviTaches', () => {
    it('should get task tracking', () => {
      const projetId = '123';
      const mockSuivi = { success: true, data: { progression: 75, taches: [] } };
      apiServiceSpy.post.and.returnValue(of(mockSuivi));

      service.suiviTaches(projetId).subscribe(response => {
        expect(response).toEqual(mockSuivi);
        expect(apiServiceSpy.post).toHaveBeenCalledWith('/api/projets/suivi-taches', { projetId });
      });
    });
  });

  describe('checkHealth', () => {
    it('should check service health', () => {
      const healthResponse = { status: 'ok' };
      apiServiceSpy.checkHealth.and.returnValue(of(healthResponse));

      service.checkHealth().subscribe(response => {
        expect(response).toEqual(healthResponse);
        expect(apiServiceSpy.checkHealth).toHaveBeenCalledWith('/api/projets');
      });
    });
  });

  describe('getStatutOptions', () => {
    it('should return all project status options', () => {
      const statuts = service.getStatutOptions();
      expect(statuts).toEqual(Object.values(StatutProjet));
    });
  });
}); 