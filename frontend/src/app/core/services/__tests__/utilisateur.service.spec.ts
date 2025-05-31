import { TestBed } from '@angular/core/testing';
import { UtilisateurService } from '../utilisateur.service';
import { ApiService } from '../api.service';
import { Utilisateur, RoleUtilisateur } from '../../models/utilisateur.model';
import { of } from 'rxjs';

describe('UtilisateurService', () => {
  let service: UtilisateurService;
  let apiServiceSpy: jasmine.SpyObj<ApiService>;

  const mockUtilisateur: Utilisateur = {
    nom: 'John Doe',
    email: 'john@example.com',
    role: RoleUtilisateur.ETUDIANT,
    competences: ['Angular', 'TypeScript']
  };

  const mockResponse = {
    success: true,
    data: mockUtilisateur
  };

  beforeEach(() => {
    const spy = jasmine.createSpyObj('ApiService', ['get', 'post', 'put', 'delete', 'checkHealth']);
    TestBed.configureTestingModule({
      providers: [
        UtilisateurService,
        { provide: ApiService, useValue: spy }
      ]
    });
    service = TestBed.inject(UtilisateurService);
    apiServiceSpy = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getUtilisateurs', () => {
    it('should return a list of users', () => {
      const mockUsers = { success: true, data: [mockUtilisateur] };
      apiServiceSpy.get.and.returnValue(of(mockUsers));

      service.getUtilisateurs().subscribe(response => {
        expect(response).toEqual(mockUsers);
        expect(apiServiceSpy.get).toHaveBeenCalledWith('/api/utilisateurs', {});
      });
    });

    it('should handle pagination params', () => {
      const params = { page: 1, limit: 10 };
      apiServiceSpy.get.and.returnValue(of({ success: true, data: [] }));

      service.getUtilisateurs(params).subscribe(() => {
        expect(apiServiceSpy.get).toHaveBeenCalledWith('/api/utilisateurs', params);
      });
    });
  });

  describe('creerUtilisateur', () => {
    it('should create a new user', () => {
      apiServiceSpy.post.and.returnValue(of(mockResponse));

      service.creerUtilisateur(mockUtilisateur).subscribe(response => {
        expect(response).toEqual(mockResponse);
        expect(apiServiceSpy.post).toHaveBeenCalledWith('/api/utilisateurs', mockUtilisateur);
      });
    });
  });

  describe('getUtilisateurParId', () => {
    it('should get user by id', () => {
      const id = '123';
      apiServiceSpy.get.and.returnValue(of(mockResponse));

      service.getUtilisateurParId(id).subscribe(response => {
        expect(response).toEqual(mockResponse);
        expect(apiServiceSpy.get).toHaveBeenCalledWith(`/api/utilisateurs/${id}`);
      });
    });
  });

  describe('updateUtilisateur', () => {
    it('should update user', () => {
      const id = '123';
      apiServiceSpy.put.and.returnValue(of(mockResponse));

      service.updateUtilisateur(id, mockUtilisateur).subscribe(response => {
        expect(response).toEqual(mockResponse);
        expect(apiServiceSpy.put).toHaveBeenCalledWith(`/api/utilisateurs/${id}`, mockUtilisateur);
      });
    });
  });

  describe('deleteUtilisateur', () => {
    it('should delete user', () => {
      const id = '123';
      const deleteResponse = { success: true, message: 'Deleted' };
      apiServiceSpy.delete.and.returnValue(of(deleteResponse));

      service.deleteUtilisateur(id).subscribe(response => {
        expect(response).toEqual(deleteResponse);
        expect(apiServiceSpy.delete).toHaveBeenCalledWith(`/api/utilisateurs/${id}`);
      });
    });
  });

  describe('checkHealth', () => {
    it('should check service health', () => {
      const healthResponse = { status: 'ok' };
      apiServiceSpy.checkHealth.and.returnValue(of(healthResponse));

      service.checkHealth().subscribe(response => {
        expect(response).toEqual(healthResponse);
        expect(apiServiceSpy.checkHealth).toHaveBeenCalledWith('/api/utilisateurs');
      });
    });
  });
}); 