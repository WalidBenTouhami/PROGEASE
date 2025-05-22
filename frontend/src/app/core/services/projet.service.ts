import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Projet } from '../models/projet.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProjetService {
  private baseUrl = `${environment.apiUrl}/projets`;

  constructor(private http: HttpClient) {}

  recupererProjets(): Observable<Projet[]> {
    return this.http.get<Projet[]>(this.baseUrl).pipe(
      catchError(error => {
        console.error('Erreur lors de la récupération des projets:', error);
        return throwError(() => error);
      })
    );
  }

  recupererProjet(id: string): Observable<Projet> {
    return this.http.get<Projet>(`${this.baseUrl}/${id}`).pipe(
      catchError(error => {
        console.error(`Erreur lors de la récupération du projet ${id}:`, error);
        return throwError(() => error);
      })
    );
  }

  creerProjet(projet: Projet): Observable<Projet> {
    return this.http.post<Projet>(this.baseUrl, projet).pipe(
      catchError(error => {
        console.error('Erreur lors de la création du projet:', error);
        return throwError(() => error);
      })
    );
  }

  mettreAJourProjet(id: string, projet: Projet): Observable<Projet> {
    return this.http.put<Projet>(`${this.baseUrl}/${id}`, projet).pipe(
      catchError(error => {
        console.error(`Erreur lors de la mise à jour du projet ${id}:`, error);
        return throwError(() => error);
      })
    );
  }

  supprimerProjet(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      catchError(error => {
        console.error(`Erreur lors de la suppression du projet ${id}:`, error);
        return throwError(() => error);
      })
    );
  }
}
