import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Livrable, StatutLivrable } from '../models/livrable.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LivrableService {
  private apiUrl = `${environment.apiUrl}/livrables`;

  constructor(private http: HttpClient) { }

  recupererLivrables(): Observable<Livrable[]> {
    return this.http.get<Livrable[]>(this.apiUrl).pipe(
      map(livrables => livrables.map(livrable => ({
        ...livrable,
        dateLimite: new Date(livrable.dateLimite),
        creeLe: livrable.creeLe ? new Date(livrable.creeLe) : undefined,
        majLe: livrable.majLe ? new Date(livrable.majLe) : undefined
      })))
    );
  }

  recupererLivrablesParProjet(projetId: string): Observable<Livrable[]> {
    return this.http.get<Livrable[]>(`${this.apiUrl}/projet/${projetId}`).pipe(
      map(livrables => livrables.map(livrable => ({
        ...livrable,
        dateLimite: new Date(livrable.dateLimite),
        creeLe: livrable.creeLe ? new Date(livrable.creeLe) : undefined,
        majLe: livrable.majLe ? new Date(livrable.majLe) : undefined
      })))
    );
  }

  recupererLivrable(id: string): Observable<Livrable> {
    return this.http.get<Livrable>(`${this.apiUrl}/${id}`).pipe(
      map(livrable => ({
        ...livrable,
        dateLimite: new Date(livrable.dateLimite),
        creeLe: livrable.creeLe ? new Date(livrable.creeLe) : undefined,
        majLe: livrable.majLe ? new Date(livrable.majLe) : undefined
      }))
    );
  }

  creerLivrable(livrable: Livrable): Observable<Livrable> {
    return this.http.post<Livrable>(this.apiUrl, livrable);
  }

  mettreAJourLivrable(id: string, livrable: Livrable): Observable<Livrable> {
    return this.http.put<Livrable>(`${this.apiUrl}/${id}`, livrable);
  }

  supprimerLivrable(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getStatutOptions(): string[] {
    return Object.values(StatutLivrable);
  }

  // Maintenir les alias pour la compatibilité
  getAllLivrables = this.recupererLivrables;
  getLivrableById = this.recupererLivrable;
  getLivrablesForProject = this.recupererLivrablesParProjet;
  createLivrable = this.creerLivrable;
  updateLivrable = this.mettreAJourLivrable;
  deleteLivrable = this.supprimerLivrable;
}
