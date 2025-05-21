import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Apollo, gql } from 'apollo-angular';
import { AlertService } from './atert.service';

@Injectable({
  providedIn: 'root'
})
export class ApiTesterService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private apollo: Apollo,
    private alertService: AlertService
  ) {}

  // Test REST API
  testRestConnection(): Observable<any> {
    return this.http.get(`${this.apiUrl}/projects`).pipe(
      catchError((error) => this.handleError(error))
    );
  }

  // Test GraphQL
  testGraphQLConnection(): Observable<any> {
    return this.apollo.query({
      query: gql`
        query {
          projets {
            _id
            titre
            description
          }
        }
      `
    }).pipe(
      catchError((error) => this.handleError(error))
    );
  }

  // Test AI service
  testAIService(prompt: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/ai/generer-texte`, { prompt }).pipe(
      catchError((error) => this.handleError(error))
    );
  }

  // Gestion des erreurs
  private handleError(error: any): Observable<never> {
    const errorMessage = 'Erreur lors de la requête API : ' + (error.message || error.statusText);
    this.alertService.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
