import { TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ProjetService } from './projet.service';
import { environment } from '../../../environments/environment';
import { Projet, StatutProjet } from '../models/projet.model';

describe('ProjetService', () => {
  let service: ProjetService;
  let httpMock: HttpTestingController;

  const apiUrl = `${environment.apiUrl}/projets`;

  const mockprojet: Projet = {
    _id: '1',
    titre: 'Projet 1',
    description: 'Description',
    equipe: [],
    tuteur: '123',
    competences: ['Angular', 'Express'],
    dateDebut: new Date('2023-01-01'),
    dateFin: new Date('2023-06-30'),
    statut: StatutProjet.BROUILLON,
    livrables: []
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ProjetService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(ProjetService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('doit recuperer tous les projets', () => {
    service.recupererProjets().subscribe(projets => {
      expect(projets.length).toBe(1);
      expect(projets[0].titre).toBe('Projet 1');
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush([mockprojet]);
  });

  it('doit recuperer un projet par ID', () => {
    service.recupererProjet('1').subscribe(projet => {
      expect(projet._id).toBe('1');
      expect(projet.titre).toBe('Projet 1');
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockprojet);
  });

  it('doit creer un projet', () => {
    service.creerProjet(mockprojet).subscribe(projet => {
      expect(projet.titre).toBe('Projet 1');
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    req.flush(mockprojet);
  });

  it('doit mettre à jour un projet', () => {
    const updated = { ...mockprojet, titre: 'Projet Modifie' };
    service.mettreAJourProjet('1', updated).subscribe(projet => {
      expect(projet.titre).toBe('Projet Modifie');
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('PUT');
    req.flush(updated);
  });

  it('doit supprimer un projet', () => {
    service.supprimerProjet('1').subscribe(response => {
      expect(response).toBeTruthy();
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ success: true });
  });

  it('doit gerer une erreur serveur (500)', () => {
    service.recupererProjets().subscribe({
      next: () => fail('appel devait echouer'),
      error: (err) => {
        expect(err.status).toBe(500);
        expect(err.statusText).toBe('Erreur interne');
      }
    });

    const req = httpMock.expectOne(apiUrl);
    req.flush('Erreur serveur', { status: 500, statusText: 'Erreur interne' });
  });
});
