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

  testRestConnection(): Observable<any> {
    return this.http.get(`${this.apiUrl}/projets`).pipe(
      catchError((error) => this.handleError(error))
    );
  }

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

  testAIService(prompt: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/ai/generer-texte`, { prompt }).pipe(
      catchError((error) => this.handleError(error))
    );
  }

  private handleError(error: any): Observable<never> {
    const errorMessage = 'Erreur lors de la requete API : ' + (error.message || error.statusText);
    this.alertService.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
