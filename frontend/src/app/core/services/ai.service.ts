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

  // Former des équipes optimisées
  formerEquipes(membres: any[]): Observable<{ success: boolean; data: any }> {
    return this.api.post(`${this.path}/form-teams`, { membres });
  }

  // Associer des tuteurs aux projets
  associerTuteurs(membres: any[]): Observable<{ success: boolean; data: any }> {
    return this.api.post(`${this.path}/match-tutors`, { membres });
  }

  // Obtenir des ressources d'apprentissage personnalisées
  obtenirRessourcesApprentissage(competences: string[]): Observable<{ success: boolean; data: any }> {
    return this.api.post(`${this.path}/learning-resources`, { competences });
  }

  // Prédire la performance d'un projet
  predirePerformance(projetId: string, historique?: any[]): Observable<{ success: boolean; data: any }> {
    return this.api.post(`${this.path}/predict-performance/${projetId}`, { historique });
  }

  // Suivre automatiquement la progression
  suivreProgression(taches: any[]): Observable<{ success: boolean; data: any }> {
    return this.api.post(`${this.path}/track-progress`, { taches });
  }

  // Générer un planning intelligent
  genererPlanning(taches: any[], dateDebut: Date, dateFin: Date): Observable<{ success: boolean; data: any }> {
    return this.api.post(`${this.path}/generate-schedule`, { taches, dateDebut, dateFin });
  }

  // Générer un rapport d'avancement
  genererRapportAvancement(projetId: string): Observable<{ success: boolean; data: any }> {
    return this.api.get(`${this.path}/progress-report/${projetId}`);
  }

  // Analyser les livrables d'un projet
  analyserLivrables(projetId: string): Observable<{ success: boolean; data: any }> {
    return this.api.post(`${this.path}/analyze-livrables/${projetId}`, {});
  }

  // Évaluer un livrable
  evaluerLivrable(livrableId: string): Observable<{ success: boolean; data: any }> {
    return this.api.post(`${this.path}/evaluate-livrable/${livrableId}`, {});
  }

  // Vérifier la santé du service
  checkHealth(): Observable<any> {
    return this.api.checkHealth(this.path);
  }
} 