import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProjetService } from './projet.service';
import { LivrableService } from './livrable.service';
import { environment } from '../../../environments/environment';
import { Projet, StatutProjet } from '../models/projet.model';
import { Livrable, StatutLivrable } from '../models/livrable.model';
import { HttpErrorResponse } from '@angular/common/http';
import { Apollo } from 'apollo-angular';
import { of } from 'rxjs';
import { CreateProjetInput } from '../models/projet.input';

describe('ProjetService Integration Tests', () => {
  let projetService: ProjetService;
  let livrableService: LivrableService;
  let httpMock: HttpTestingController;
  let apolloSpy: jasmine.SpyObj<Apollo>;

  const apiUrl = `${environment.apiUrl}/projets`;

  const mockProjet: Projet = {
    id: '1',
    titre: 'Projet Test',
    description: 'Description du projet test',
    dateDebut: '2024-01-01',
    dateFin: '2024-12-31',
    statut: StatutProjet.EN_COURS,
    equipe: ['utilisateur1', 'utilisateur2'],
    tuteur: 'tuteur1',
    competences: ['Angular', 'Node.js'],
    progression: 0,
    creeLe: '2024-01-01',
    majLe: '2024-01-01',
    livrables: ['1', '2'],
    responsableId: 'resp1'
  };

  const mockLivrables: Livrable[] = [
    {
      _id: '1',
      intitule: 'Livrable 1',
      description: 'Description du livrable 1',
      dateLimite: new Date('2024-06-30'),
      statut: StatutLivrable.EN_COURS,
      projetId: '1',
      creeLe: new Date(),
      majLe: new Date()
    },
    {
      _id: '2',
      intitule: 'Livrable 2',
      description: 'Description du livrable 2',
      dateLimite: new Date('2024-07-31'),
      statut: StatutLivrable.EN_ATTENTE,
      projetId: '1',
      creeLe: new Date(),
      majLe: new Date()
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ProjetService,
        LivrableService,
        { provide: Apollo, useValue: jasmine.createSpyObj('Apollo', ['watchQuery', 'mutate']) }
      ]
    });

    projetService = TestBed.inject(ProjetService);
    livrableService = TestBed.inject(LivrableService);
    httpMock = TestBed.inject(HttpTestingController);
    apolloSpy = TestBed.inject(Apollo) as jasmine.SpyObj<Apollo>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(projetService).toBeTruthy();
    expect(livrableService).toBeTruthy();
  });

  it('should retrieve a project with its deliverables', fakeAsync(() => {
    projetService.getProjet('1').subscribe((response) => {
      expect(response.data.id).toBe('1');
      expect(response.data.titre).toBe('Projet Test');
      expect(response.data.livrables.length).toBe(2);
    });

    const projetReq = httpMock.expectOne(`${apiUrl}/1`);
    expect(projetReq.request.method).toBe('GET');
    projetReq.flush({ data: mockProjet });
  }));

  it('should create a project and its deliverables', fakeAsync(() => {
    const { id, creeLe, majLe, ...nouveauProjet } = { ...mockProjet };
    const createInput: CreateProjetInput = nouveauProjet;

    projetService.createProjet(createInput).subscribe((response) => {
      expect(response.data.id).toBeDefined();
      expect(response.data.titre).toBe('Projet Test');
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    req.flush({ data: mockProjet });
  }));

  it('should update a project and its deliverables', fakeAsync(() => {
    const projetModifie = { ...mockProjet, titre: 'Projet Test Modifié' };

    projetService.mettreAJourProjet('1', projetModifie).subscribe(projet => {
      expect(projet.titre).toBe('Projet Test Modifié');
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('PUT');
    req.flush(projetModifie);
  }));

  it('should calculate project progress based on deliverables', fakeAsync(() => {
    const projetAvecLivrables = {
      ...mockProjet,
      livrablesComplets: [
        { ...mockLivrables[0], statut: StatutLivrable.TERMINE },
        { ...mockLivrables[1], statut: StatutLivrable.EN_COURS }
      ]
    };

    projetService.getProjet('1').subscribe(projet => {
      expect(projet.data.progression).toBeDefined();
      if (projet.data.progression) {
        expect(projet.data.progression).toBe(50); // 1 terminé sur 2 livrables
      }
    });

    const projetReq = httpMock.expectOne(`${apiUrl}/1`);
    expect(projetReq.request.method).toBe('GET');
    projetReq.flush(projetAvecLivrables);
  }));

  it('should handle project not found error', fakeAsync(() => {
    projetService.getProjet('999').subscribe({
      error: (error) => {
        expect(error.status).toBe(404);
        expect(error.error).toBe('Projet non trouvé');
      }
    });

    const req = httpMock.expectOne(`${apiUrl}/999`);
    expect(req.request.method).toBe('GET');
    req.flush('Projet non trouvé', { status: 404, statusText: 'Not Found' });
  }));

  it('should handle server errors gracefully', fakeAsync(() => {
    projetService.getProjets().subscribe({
      error: (error) => {
        expect(error.status).toBe(500);
        expect(error.error).toBe('Erreur serveur');
      }
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush('Erreur serveur', { status: 500, statusText: 'Server Error' });
  }));

  it('should handle timeout error', (done) => {
    projetService.getProjets().subscribe({
      error: (error) => {
        expect(error instanceof HttpErrorResponse).toBeTruthy();
        expect(error.error instanceof ErrorEvent).toBeTruthy();
        expect(error.error.message).toBe('Request timed out');
        done();
      }
    });

    const req = httpMock.expectOne(apiUrl);
    req.error(new ErrorEvent('timeout', { message: 'Request timed out' }));
  });
});

describe('ProjetService Error Handling', () => {
  let projetService: ProjetService;
  let httpMock: HttpTestingController;

  const apiUrl = `${environment.apiUrl}/projets`;

  const mockProjet: Projet = {
    titre: 'Projet Test',
    description: 'Description du projet test',
    dateDebut: new Date('2024-01-01'),
    dateFin: new Date('2024-12-31'),
    statut: StatutProjet.EN_COURS,
    equipe: ['utilisateur1', 'utilisateur2'],
    tuteur: 'tuteur1',
    competences: ['Angular', 'Node.js'],
    livrables: [],
    progression: 0,
    creeLe: new Date(),
    majLe: new Date()
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProjetService, LivrableService]
    });

    projetService = TestBed.inject(ProjetService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('Error Handling', () => {
    it('should handle 404 error when project not found', (done) => {
      projetService.getProjet('999').subscribe({
        error: (error) => {
          expect(error.status).toBe(404);
          expect(error.error).toBe('Projet non trouvé');
          done();
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/999`);
      req.flush('Projet non trouvé', { status: 404, statusText: 'Not Found' });
    });

    it('should handle 400 error when creating invalid project', (done) => {
      const invalidProjet: Partial<Projet> = {
        description: 'Description du projet test',
        dateDebut: new Date('2024-01-01'),
        dateFin: new Date('2024-12-31'),
        statut: StatutProjet.EN_COURS,
        equipe: ['utilisateur1', 'utilisateur2'],
        tuteur: 'tuteur1',
        competences: ['Angular', 'Node.js'],
        livrables: [],
        progression: 0,
        creeLe: new Date(),
        majLe: new Date()
      };

      projetService.createProjet(invalidProjet as Projet).subscribe({
        error: (error) => {
          expect(error.status).toBe(400);
          expect(error.error).toBe('Données de projet invalides');
          done();
        }
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush('Données de projet invalides', { status: 400, statusText: 'Bad Request' });
    });

    it('should handle 500 server error', (done) => {
      projetService.getProjets().subscribe({
        error: (error) => {
          expect(error.status).toBe(500);
          expect(error.error).toBe('Erreur serveur interne');
          done();
        }
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush('Erreur serveur interne', { status: 500, statusText: 'Internal Server Error' });
    });

    it('should handle network error', (done) => {
      projetService.getProjets().subscribe({
        error: (error) => {
          expect(error.status).toBe(0);
          expect(error.statusText).toBe('Unknown Error');
          done();
        }
      });

      const req = httpMock.expectOne(apiUrl);
      req.error(new ErrorEvent('Network error', {
        message: 'Connection refused'
      }));
    });

    it('should handle unauthorized error', (done) => {
      projetService.getProjets().subscribe({
        error: (error) => {
          expect(error.status).toBe(401);
          expect(error.error).toBe('Non autorisé');
          done();
        }
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush('Non autorisé', { status: 401, statusText: 'Unauthorized' });
    });

    it('should handle forbidden error', (done) => {
      projetService.getProjets().subscribe({
        error: (error) => {
          expect(error.status).toBe(403);
          expect(error.error).toBe('Accès interdit');
          done();
        }
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush('Accès interdit', { status: 403, statusText: 'Forbidden' });
    });

    it('should handle validation errors when updating project', (done) => {
      const invalidUpdate: Projet = {
        ...mockProjet,
        dateFin: new Date('2023-01-01')
      };

      projetService.mettreAJourProjet('1', invalidUpdate).subscribe({
        error: (error) => {
          expect(error.status).toBe(400);
          expect(error.error).toBe('Date de fin invalide');
          done();
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      req.flush('Date de fin invalide', { status: 400, statusText: 'Bad Request' });
    });

    it('should handle concurrent modification error', (done) => {
      projetService.mettreAJourProjet('1', mockProjet).subscribe({
        error: (error) => {
          expect(error.status).toBe(409);
          expect(error.error).toBe('Le projet a été modifié par un autre utilisateur');
          done();
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      req.flush('Le projet a été modifié par un autre utilisateur', { status: 409, statusText: 'Conflict' });
    });

    it('should handle invalid ID format', (done) => {
      projetService.getProjet('invalid-id').subscribe({
        error: (error) => {
          expect(error.status).toBe(400);
          expect(error.error).toBe('Format d\'ID invalide');
          done();
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/invalid-id`);
      req.flush('Format d\'ID invalide', { status: 400, statusText: 'Bad Request' });
    });
  });
});

describe('ProjetService', () => {
  let service: ProjetService;
  let apolloSpy: jasmine.SpyObj<Apollo>;

  const mockProjet: Projet = {
    id: '1',
    titre: 'Projet Test',
    description: 'Description du projet test',
    dateDebut: '2024-01-01',
    dateFin: '2024-12-31',
    statut: 'EN_COURS',
    equipe: []
  };

  beforeEach(() => {
    const spy = jasmine.createSpyObj('Apollo', ['watchQuery', 'mutate']);
    TestBed.configureTestingModule({
      providers: [
        ProjetService,
        { provide: Apollo, useValue: spy }
      ]
    });
    service = TestBed.inject(ProjetService);
    apolloSpy = TestBed.inject(Apollo) as jasmine.SpyObj<Apollo>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getProjets', () => {
    it('should return an array of projets', (done) => {
      const response = {
        data: {
          projets: [mockProjet]
        }
      };

      apolloSpy.watchQuery.and.returnValue({
        valueChanges: of(response)
      } as any);

      service.getProjets().subscribe(result => {
        expect(result.data).toEqual([mockProjet]);
        expect(result.success).toBeTrue();
        done();
      });
    });

    it('should handle errors', (done) => {
      apolloSpy.watchQuery.and.returnValue({
        valueChanges: of({
          data: null,
          errors: [{ message: 'Error fetching projets' }]
        })
      } as any);

      service.getProjets().subscribe(result => {
        expect(result.success).toBeFalse();
        expect(result.error).toBeTruthy();
        done();
      });
    });
  });

  describe('getProjet', () => {
    it('should return a projet by id', (done) => {
      const response = {
        data: {
          projet: mockProjet
        }
      };

      apolloSpy.watchQuery.and.returnValue({
        valueChanges: of(response)
      } as any);

      service.getProjet('1').subscribe(result => {
        expect(result.data).toEqual(mockProjet);
        expect(result.success).toBeTrue();
        done();
      });
    });

    it('should handle non-existent projet', (done) => {
      apolloSpy.watchQuery.and.returnValue({
        valueChanges: of({
          data: {
            projet: null
          }
        })
      } as any);

      service.getProjet('999').subscribe(result => {
        expect(result.success).toBeFalse();
        expect(result.error).toBeTruthy();
        done();
      });
    });
  });

  describe('createProjet', () => {
    it('should create a new projet', (done) => {
      const newProjet = {
        titre: 'Nouveau Projet',
        description: 'Description',
        dateDebut: '2024-01-01',
        dateFin: '2024-12-31',
        statut: 'EN_COURS'
      };

      const response = {
        data: {
          createProjet: { ...newProjet, id: '2' }
        }
      };

      apolloSpy.mutate.and.returnValue(of(response));

      service.createProjet(newProjet).subscribe(result => {
        expect(result.success).toBeTrue();
        expect(result.data.id).toBeTruthy();
        expect(result.data.titre).toEqual(newProjet.titre);
        done();
      });
    });

    it('should handle creation errors', (done) => {
      apolloSpy.mutate.and.returnValue(of({
        data: null,
        errors: [{ message: 'Error creating projet' }]
      }));

      service.createProjet({} as any).subscribe(result => {
        expect(result.success).toBeFalse();
        expect(result.error).toBeTruthy();
        done();
      });
    });
  });

  describe('updateProjet', () => {
    it('should update an existing projet', (done) => {
      const updateData = {
        titre: 'Titre mis à jour',
        description: 'Description mise à jour'
      };

      const response = {
        data: {
          updateProjet: { ...mockProjet, ...updateData }
        }
      };

      apolloSpy.mutate.and.returnValue(of(response));

      service.updateProjet('1', updateData).subscribe(result => {
        expect(result.success).toBeTrue();
        expect(result.data.titre).toEqual(updateData.titre);
        expect(result.data.description).toEqual(updateData.description);
        done();
      });
    });

    it('should handle update errors', (done) => {
      apolloSpy.mutate.and.returnValue(of({
        data: null,
        errors: [{ message: 'Error updating projet' }]
      }));

      service.updateProjet('1', {}).subscribe(result => {
        expect(result.success).toBeFalse();
        expect(result.error).toBeTruthy();
        done();
      });
    });
  });

  describe('deleteProjet', () => {
    it('should delete a projet', (done) => {
      const response = {
        data: {
          deleteProjet: { id: '1' }
        }
      };

      apolloSpy.mutate.and.returnValue(of(response));

      service.deleteProjet('1').subscribe(result => {
        expect(result.success).toBeTrue();
        expect(result.data.id).toEqual('1');
        done();
      });
    });

    it('should handle deletion errors', (done) => {
      apolloSpy.mutate.and.returnValue(of({
        data: null,
        errors: [{ message: 'Error deleting projet' }]
      }));

      service.deleteProjet('999').subscribe(result => {
        expect(result.success).toBeFalse();
        expect(result.error).toBeTruthy();
        done();
      });
    });
  });
});
