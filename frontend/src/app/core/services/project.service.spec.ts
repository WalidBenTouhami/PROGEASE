import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProjectService } from './project.service';
import { environment } from '../../../environments/environment';
import { Project } from '../models/project.model';

describe('ProjectService', () => {
  let service: ProjectService;
  let httpMock: HttpTestingController;

  const API = `${environment.apiUrl}/projects`;

  const mockProject: Project = {
    _id: '1',
    titre: 'Projet 1',
    description: 'Description',
    equipe: [],
    tuteur: '123',
    competences: ['Angular', 'Express'],
    dateDebut: '2023-01-01',
    dateFin: '2023-06-30',
    statut: 'Brouillon'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProjectService]
    });

    service = TestBed.inject(ProjectService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('doit récupérer tous les projets', (done) => {
    service.recupererProjets().subscribe(projects => {
      expect(projects.length).toBe(1);
      expect(projects[0].titre).toBe('Projet 1');
      done();
    });

    const req = httpMock.expectOne(API);
    expect(req.request.method).toBe('GET');
    req.flush([mockProject]);
  });

  it('doit récupérer un projet par ID', (done) => {
    service.recupererProjet('1').subscribe(project => {
      expect(project._id).toBe('1');
      expect(project.titre).toBe('Projet 1');
      done();
    });

    const req = httpMock.expectOne(`${API}/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockProject);
  });

  it('doit créer un projet', (done) => {
    service.creerProjet(mockProject).subscribe(project => {
      expect(project.titre).toBe('Projet 1');
      done();
    });

    const req = httpMock.expectOne(API);
    expect(req.request.method).toBe('POST');
    req.flush(mockProject);
  });

  it('doit mettre à jour un projet', (done) => {
    const updated = { ...mockProject, titre: 'Projet Modifié' };
    service.mettreAJourProjet('1', updated).subscribe(project => {
      expect(project.titre).toBe('Projet Modifié');
      done();
    });

    const req = httpMock.expectOne(`${API}/1`);
    expect(req.request.method).toBe('PUT');
    req.flush(updated);
  });

  it('doit supprimer un projet', (done) => {
    service.supprimerProjet('1').subscribe(response => {
      expect(response).toBeTruthy();
      done();
    });

    const req = httpMock.expectOne(`${API}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ success: true });
  });

  it('doit gérer une erreur serveur (500)', (done) => {
    service.recupererProjets().subscribe({
      next: () => fail('appel devait échouer'),
      error: (err) => {
        expect(err.status).toBe(500);
        expect(err.message).toContain('Erreur serveur');
        done();
      }
    });

    const req = httpMock.expectOne(API);
    req.flush({}, { status: 500, statusText: 'Erreur interne' });
  });
});
