import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AiService } from './ai.service';
import { environment } from '../../environments/environment';

describe('AiService', () => {
  let service: AiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AiService]
    });

    service = TestBed.inject(AiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should analyze project', () => {
    const projetId = '123';
    const mockResponse = { success: true, data: { analysis: 'test' } };

    service.analyserProjet(projetId).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/ai/analyze`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ projetId });
    req.flush(mockResponse);
  });

  it('should generate recommendations', () => {
    const projetId = '123';
    const mockResponse = { success: true, data: { recommendations: [] } };

    service.genererRecommandations(projetId).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/ai/recommendations/${projetId}`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should analyze deliverables', () => {
    const projetId = '123';
    const mockResponse = { success: true, data: { analysis: [] } };

    service.analyserLivrables(projetId).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/ai/analyze-livrables/${projetId}`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should evaluate deliverable', () => {
    const livrableId = '123';
    const criteres = { quality: 5, completeness: 4 };
    const mockResponse = { success: true, data: { evaluation: {} } };

    service.evaluerLivrable(livrableId, criteres).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/ai/evaluate-livrable/${livrableId}`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(criteres);
    req.flush(mockResponse);
  });

  it('should generate progress report', () => {
    const projetId = '123';
    const mockResponse = { success: true, data: { report: {} } };

    service.genererRapportAvancement(projetId).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/ai/progress-report/${projetId}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });
}); 