import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, retry, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Project } from '../models/project.model';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private baseUrl = `${environment.apiUrl}/projects`;

  constructor(private http: HttpClient) {}

  recupererProjets(): Observable<Project[]> {
    return this.http.get<Project[]>(this.baseUrl).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  recupererProjet(id: string): Observable<Project> {
    return this.http.get<Project>(`${this.baseUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  creerProjet(data: Project): Observable<Project> {
    return this.http.post<Project>(this.baseUrl, data).pipe(
      catchError(this.handleError)
    );
  }

  mettreAJourProjet(id: string, data: Project): Observable<Project> {
    return this.http.put<Project>(`${this.baseUrl}/${id}`, data).pipe(
      catchError(this.handleError)
    );
  }

  supprimerProjet(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  private handleError(error: any): Observable<never> {
    let message = 'Une erreur est survenue';

    if (error.error instanceof ErrorEvent) {
      message = `Erreur client : ${error.error.message}`;
    } else {
      message = `Erreur serveur - code : ${error.status}, message : ${error.message}`;
    }

    console.error(`[ProjectService] ${message}`);
    return throwError(() => new Error(message));
  }
}
