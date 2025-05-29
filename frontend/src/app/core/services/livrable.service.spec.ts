import { TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { LivrableService } from './livrable.service';
import { environment } from '../../../environments/environment';
import { RouterTestingModule} from '@angular/router/testing';
import { CommonModule } from '@angular/common';

describe('LivrableService', () => {
  let service: LivrableService;
  let httpMock: HttpTestingController;

  const apiUrl = `${environment.apiUrl}/livrables`;

  const mockLivrable = {
    _id: '1',
    titre: 'Livrable 1',
    description: 'Description du livrable',
    projetId: '123',
    dateRendu: new Date('2023-05-15'),
    statut: 'SOUMIS',
    commentaires: [],
    fichiers: []
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        LivrableService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(LivrableService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('doit récupérer tous les livrables', () => {
    service.recupererLivrables().subscribe(livrables => {
      expect(livrables.length).toBe(1);
      expect(livrables[0].titre).toBe('Livrable 1');
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush([mockLivrable]);
  });

  it('doit récupérer un livrable par ID', () => {
    service.recupererLivrable('1').subscribe(livrable => {
      expect(livrable._id).toBe('1');
      expect(livrable.titre).toBe('Livrable 1');
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockLivrable);
  });

  it('doit créer un livrable', () => {
    service.creerLivrable(mockLivrable).subscribe(livrable => {
      expect(livrable.titre).toBe('Livrable 1');
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    req.flush(mockLivrable);
  });

  it('doit mettre à jour un livrable', () => {
    const updated = { ...mockLivrable, titre: 'Livrable Modifié' };

    service.mettreAJourLivrable('1', updated).subscribe(livrable => {
      expect(livrable.titre).toBe('Livrable Modifié');
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('PUT');
    req.flush(updated);
  });

  it('doit supprimer un livrable', () => {
    service.supprimerLivrable('1').subscribe(response => {
      expect(response).toBeTruthy();
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ success: true });
  });

  it('doit gérer une erreur serveur (500)', () => {
    service.recupererLivrables().subscribe({
      next: () => fail('appel devait échouer'),
      error: (err) => {
        expect(err.status).toBe(500);
        expect(err.statusText).toBe('Erreur interne');
      }
    });

    const req = httpMock.expectOne(apiUrl);
    req.flush('Erreur serveur', { status: 500, statusText: 'Erreur interne' });
  });
});
