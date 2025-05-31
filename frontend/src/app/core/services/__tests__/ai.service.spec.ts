import { TestBed } from '@angular/core/testing';
import { AIService } from '../ai.service';
import { ApiService } from '../api.service';
import { AnalyseIA, ComplexiteProjet, RecommandationApprentissage } from '../../models/analyse-ia.model';
import { of } from 'rxjs';

describe('AIService', () => {
  let service: AIService;
  let apiServiceSpy: jasmine.SpyObj<ApiService>;

  const mockAnalyse: AnalyseIA = {
    analyse: {
      complexite: ComplexiteProjet.MOYENNE,
      dureeEstimee: '3 mois',
      risques: ['Délais serrés'],
      points_forts: ['Équipe expérimentée'],
      recommandations: ['Tests automatisés']
    },
    competences: {
      requises: ['Angular'],
      recommandees: ['TypeScript'],
      niveau: 'INTERMEDIAIRE'
    },
    planning: {
      phases: [{
        nom: 'Phase 1',
        duree: '2 semaines',
        livrables: ['Documentation']
      }],
      jalons: [{
        nom: 'Jalon 1',
        date: '2024-06-15'
      }]
    }
  };

  const mockRecommandation: RecommandationApprentissage = {
    competence: 'Angular',
    ressources: {
      cours: {
        titre: 'Angular Fundamentals',
        lien: 'https://example.com/course'
      },
      livre: {
        titre: 'Angular in Action',
        auteur: 'John Doe'
      },
      projet: {
        titre: 'Todo App',
        description: 'Application de gestion de tâches'
      },
      communaute: {
        nom: 'Angular Community',
        lien: 'https://example.com/community'
      }
    }
  };

  beforeEach(() => {
    const spy = jasmine.createSpyObj('ApiService', ['get', 'post', 'checkHealth']);
    TestBed.configureTestingModule({
      providers: [
        AIService,
        { provide: ApiService, useValue: spy }
      ]
    });
    service = TestBed.inject(AIService);
    apiServiceSpy = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('analyserProjet', () => {
    it('should analyze project', () => {
      const data = { text: 'Description', document: { key: 'value' } };
      const mockResponse = { success: true, data: mockAnalyse };
      apiServiceSpy.post.and.returnValue(of(mockResponse));

      service.analyserProjet(data).subscribe(response => {
        expect(response).toEqual(mockResponse);
        expect(apiServiceSpy.post).toHaveBeenCalledWith('/api/ai/analyze', data);
      });
    });
  });

  describe('genererTexte', () => {
    it('should generate French text', () => {
      const prompt = 'Générer du texte';
      const mockResponse = { success: true, data: 'Texte généré' };
      apiServiceSpy.post.and.returnValue(of(mockResponse));

      service.genererTexte(prompt).subscribe(response => {
        expect(response).toEqual(mockResponse);
        expect(apiServiceSpy.post).toHaveBeenCalledWith('/api/ai/generer-texte', { prompt });
      });
    });
  });

  describe('generateText', () => {
    it('should generate English text', () => {
      const prompt = 'Generate text';
      const mockResponse = { success: true, data: 'Generated text' };
      apiServiceSpy.post.and.returnValue(of(mockResponse));

      service.generateText(prompt).subscribe(response => {
        expect(response).toEqual(mockResponse);
        expect(apiServiceSpy.post).toHaveBeenCalledWith('/api/ai/generate-text', { prompt });
      });
    });
  });

  describe('getRecommandations', () => {
    it('should get learning recommendations', () => {
      const competences = ['Angular', 'TypeScript'];
      const mockResponse = { success: true, data: [mockRecommandation] };
      apiServiceSpy.post.and.returnValue(of(mockResponse));

      service.getRecommandations(competences).subscribe(response => {
        expect(response).toEqual(mockResponse);
        expect(apiServiceSpy.post).toHaveBeenCalledWith('/api/ai/recommandations', { competences });
      });
    });
  });

  describe('checkHealth', () => {
    it('should check service health', () => {
      const healthResponse = { status: 'ok' };
      apiServiceSpy.checkHealth.and.returnValue(of(healthResponse));

      service.checkHealth().subscribe(response => {
        expect(response).toEqual(healthResponse);
        expect(apiServiceSpy.checkHealth).toHaveBeenCalledWith('/api/ai');
      });
    });
  });
}); 