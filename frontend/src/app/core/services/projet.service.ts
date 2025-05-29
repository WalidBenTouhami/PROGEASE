import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap, catchError, throwError } from 'rxjs';
import { Projet, StatutProjet } from '../models/projet.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProjetService {
  private apiUrl = `${environment.apiUrl}/projets`;

  constructor(private http: HttpClient) { }

  getAllProjets(): Observable<Projet[]> {
    return this.http.get<Projet[]>(this.apiUrl).pipe(
      map(projets => projets.map(projet => ({
        ...projet,
        dateDebut: new Date(projet.dateDebut),
        dateFin: new Date(projet.dateFin),
        creeLe: projet.creeLe ? new Date(projet.creeLe) : undefined,
        majLe: projet.majLe ? new Date(projet.majLe) : undefined
      })))
    );
  }

  getProjetById(id: string): Observable<Projet> {
    return this.http.get<Projet>(`${this.apiUrl}/${id}`).pipe(
      map(projet => ({
        ...projet,
        dateDebut: new Date(projet.dateDebut),
        dateFin: new Date(projet.dateFin),
        creeLe: projet.creeLe ? new Date(projet.creeLe) : undefined,
        majLe: projet.majLe ? new Date(projet.majLe) : undefined
      }))
    );
  }

  createProjet(projet: Projet): Observable<Projet> {
    return this.http.post<Projet>(this.apiUrl, projet);
  }

  updateProjet(id: string, projet: Projet): Observable<Projet> {
    return this.http.put<Projet>(`${this.apiUrl}/${id}`, projet);
  }

  deleteProjet(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getStatutOptions(): string[] {
    return Object.values(StatutProjet);
  }
}
