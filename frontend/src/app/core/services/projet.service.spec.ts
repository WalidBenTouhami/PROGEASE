import { TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ProjetService } from './projet.service';
import { LivrableService } from './livrable.service';
import { environment } from '../../../environments/environment';
import { Projet, StatutProjet } from '../models/projet.model';
import { provideRouter } from '@angular/router';
import { Livrable, StatutLivrable } from '../models/livrable.model';

describe('ProjetService', () => {
  let service: ProjetService;
  let livrableService: LivrableService;
  let httpMock: HttpTestingController;

  const apiUrl = `${environment.apiUrl}/projets`;
  const livrablesUrl = `${environment.apiUrl}/livrables`;

  const mockProjet: Projet = {
    _id: '1',
    titre: 'Projet Test',
    description: 'Description du projet test',
    dateDebut: new Date('2023-01-01'),
    dateFin: new Date('2023-12-31'),
    statut: StatutProjet.EN_COURS,
    equipe: ['user1', 'user2'],
    tuteur: 'tuteur1',
    competences: ['Angular', 'Node.js'],
    progression: 0,
    creeLe: new Date(),
    majLe: new Date(),
    livrables: []
  };

  const mockLivrables: Livrable[] = [
    {
      _id: '1',
      intitule: 'Livrable 1',
      description: 'Description du livrable 1',
      creeLe: new Date(),
      dateLimite: new Date(),
      statut: StatutLivrable.EN_COURS,
      projetId: '1'
    },
    {
      _id: '2',
      intitule: 'Livrable 2',
      description: 'Description du livrable 2',
      creeLe: new Date(),
      dateLimite: new Date(),
      statut: StatutLivrable.EN_COURS,
      projetId: '2'
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ProjetService,
        LivrableService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    });

    service = TestBed.inject(ProjetService);
    livrableService = TestBed.inject(LivrableService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('doit récupérer tous les projets', () => {
    service.recupererProjets().subscribe((projets: Projet[]) => {
      expect(projets.length).toBe(1);
      expect(projets[0].titre).toBe('Projet Test');
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush([mockProjet]);
  });

  it('doit récupérer un projet par ID', () => {
    service.recupererProjetParId('1').subscribe((projet: Projet) => {
      expect(projet._id).toBe('1');
      expect(projet.titre).toBe('Projet Test');
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockProjet);
  });

  it('doit créer un projet', () => {
    service.creerProjet(mockProjet).subscribe((projet: Projet) => {
      expect(projet.titre).toBe('Projet Test');
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    req.flush(mockProjet);
  });

  it('doit mettre à jour un projet', () => {
    const updated = { ...mockProjet, titre: 'Projet Modifié' };
    service.mettreAJourProjet('1', updated).subscribe((projet: Projet) => {
      expect(projet.titre).toBe('Projet Modifié');
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('PUT');
    req.flush(updated);
  });

  it('doit supprimer un projet', () => {
    service.supprimerProjet('1').subscribe((response: any) => {
      expect(response).toBeTruthy();
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ success: true });
  });

  it('doit récupérer les options de statut', () => {
    const options = service.getStatutOptions();
    expect(options).toEqual(Object.values(StatutProjet));
  });

  it('doit vérifier que les alias fonctionnent correctement', () => {
    expect(service.getAllProjets).toBe(service.recupererProjets);
    expect(service.getProjetById).toBe(service.recupererProjetParId);
    expect(service.createProjet).toBe(service.creerProjet);
    expect(service.updateProjet).toBe(service.mettreAJourProjet);
    expect(service.deleteProjet).toBe(service.supprimerProjet);
  });

  it('doit récupérer les livrables d\'un projet', () => {
    service.getLivrablesByProjetId('1').subscribe((livrables: Livrable[]) => {
      expect(livrables).toBeTruthy();
      expect(livrables.length).toBe(1);
      expect(livrables[0].projetId).toBe('1');
      expect(livrables[0].intitule).toBe('Livrable 1');
    });

    const req = httpMock.expectOne(livrablesUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockLivrables);
  });

  it('doit gérer une erreur serveur (500)', () => {
    service.recupererProjets().subscribe({
      next: () => fail('appel devait échouer'),
      error: (err: any) => {
        expect(err.status).toBe(500);
        expect(err.statusText).toBe('Erreur interne');
      }
    });

    const req = httpMock.expectOne(apiUrl);
    req.flush('Erreur serveur', { status: 500, statusText: 'Erreur interne' });
  });
});
