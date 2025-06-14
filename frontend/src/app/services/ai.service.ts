import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private apiUrl = `${environment.apiUrl}/ai`;

  constructor(private http: HttpClient) {}

  analyserProjet(projetId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/analyze`, { projetId });
  }

  genererRecommandations(projetId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/recommendations/${projetId}`, {});
  }

  analyserLivrables(projetId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/analyze-livrables/${projetId}`, {});
  }

  evaluerLivrable(livrableId: string, criteres: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/evaluate-livrable/${livrableId}`, criteres);
  }

  genererRapportAvancement(projetId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/progress-report/${projetId}`);
  }

  verifierSante(): Observable<any> {
    return this.http.get(`${this.apiUrl}/health`);
  }
} 