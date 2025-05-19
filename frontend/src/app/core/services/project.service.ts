// src/app/core/services/project.service.ts

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

  /**
   * Récupérer la liste de tous les projets
   */
  recupererProjets(): Observable<Project[]> {
    return this.http.get<Project[]>(this.baseUrl).pipe(
      retry(1), // En cas d’erreur temporaire
      catchError(this.handleError)
    );
  }

  /**
   * Récupérer les détails d’un projet par son ID
   */
  recupererProjet(id: string): Observable<Project> {
    return this.http.get<Project>(`${this.baseUrl}/${id}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  /**
   * Créer un nouveau projet
   */
  creerProjet(data: Project): Observable<Project> {
    return this.http.post<Project>(this.baseUrl, data).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Mettre à jour un projet existant
   */
  mettreAJourProjet(id: string, data: Project): Observable<Project> {
    return this.http.put<Project>(`${this.baseUrl}/${id}`, data).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Supprimer un projet par son ID
   */
  supprimerProjet(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  /**
   * Gérer les erreurs réseau ou API de manière centralisée
   */
  private handleError(error: any) {
    let message = 'Une erreur est survenue';

    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      message = `Erreur client : ${error.error.message}`;
    } else {
      // Erreur côté serveur
      message = `Erreur serveur - code : ${error.status}, message : ${error.message}`;
    }

    console.error(`[ProjectService] ${message}`);
    return throwError(() => ({
      status: error.status,
      message
    }));
  }
}
