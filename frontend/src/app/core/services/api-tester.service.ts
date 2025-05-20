import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { Apollo, gql } from 'apollo-angular';

@Injectable({
  providedIn: 'root'
})
export class ApiTesterService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private apollo: Apollo
  ) {}

  // Test REST API
  testRestConnection(): Observable<any> {
    return this.http.get(`${this.apiUrl}/projects`);
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
    });
  }

  // Test AI service - correction du nom de la route
  testAIService(prompt: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/ai/generer-texte`, { prompt });
  }
}
