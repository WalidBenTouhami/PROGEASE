import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AnalyseIA, RecommandationApprentissage } from '../models/analyse-ia.model';

@Injectable({
  providedIn: 'root'
})
export class AIService {
  private readonly path = '/api/ai';

  constructor(private api: ApiService) {}

  // Analyser un projet avec l'IA
  analyserProjet(data: { text: string; document: any }): Observable<{ success: boolean; data: AnalyseIA }> {
    return this.api.post(`${this.path}/analyze`, data);
  }

  // Générer du texte en français
  genererTexte(prompt: string): Observable<{ success: boolean; data: string }> {
    return this.api.post(`${this.path}/generer-texte`, { prompt });
  }

  // Generate text in English
  generateText(prompt: string): Observable<{ success: boolean; data: string }> {
    return this.api.post(`${this.path}/generate-text`, { prompt });
  }

  // Obtenir des recommandations d'apprentissage
  getRecommandations(competences: string[]): Observable<{ success: boolean; data: RecommandationApprentissage[] }> {
    return this.api.post(`${this.path}/recommandations`, { competences });
  }

  // Vérifier la santé du service
  checkHealth(): Observable<any> {
    return this.api.checkHealth(this.path);
  }
} 