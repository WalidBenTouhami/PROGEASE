import { TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { LivrableService } from './livrable.service';
import { environment } from '../../../environments/environment';
import { Livrable, StatutLivrable } from '../models/livrable.model';
import { provideRouter } from '@angular/router';

describe('LivrableService', () => {
  let service: LivrableService;
  let httpMock: HttpTestingController;

  const apiUrl = `${environment.apiUrl}/livrables`;

  const mockLivrable: Livrable = {
    _id: '1',
    intitule: 'Livrable 1',
    description: 'Description du livrable',
    dateLimite: new Date('2023-03-15'),
    projetId: '123',
    statut: StatutLivrable.EN_ATTENTE,
    creeLe: new Date(),
    majLe: new Date()
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        LivrableService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    });

    service = TestBed.inject(LivrableService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('doit récupérer tous les livrables', () => {
    service.getAllLivrables().subscribe((livrables: Livrable[]) => {
      expect(livrables.length).toBe(1);
      expect(livrables[0].intitule).toBe('Livrable 1');
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush([mockLivrable]);
  });

  it('doit récupérer un livrable par ID', () => {
    service.recupererLivrable('1').subscribe((livrable: Livrable) => {
      expect(livrable._id).toBe('1');
      expect(livrable.intitule).toBe('Livrable 1');
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockLivrable);
  });

  it('doit créer un livrable', () => {
    service.creerLivrable(mockLivrable).subscribe((livrable: Livrable) => {
      expect(livrable.intitule).toBe('Livrable 1');
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    req.flush(mockLivrable);
  });

  it('doit mettre à jour un livrable', () => {
    const updated = { ...mockLivrable, intitule: 'Livrable Modifié' };
    service.mettreAJourLivrable('1', updated).subscribe((livrable: Livrable) => {
      expect(livrable.intitule).toBe('Livrable Modifié');
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('PUT');
    req.flush(updated);
  });

  it('doit supprimer un livrable', () => {
    service.supprimerLivrable('1').subscribe((response: any) => {
      expect(response).toBeTruthy();
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ success: true });
  });

  it('doit gérer une erreur serveur (500)', () => {
    service.getAllLivrables().subscribe({
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
