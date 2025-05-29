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

  getAllLivrables(): Observable<Livrable[]> {
    return this.http.get<Livrable[]>(this.apiUrl).pipe(
      map(livrables => livrables.map(livrable => ({
        ...livrable,
        dateLimite: new Date(livrable.dateLimite),
        creeLe: livrable.creeLe ? new Date(livrable.creeLe) : undefined,
        majLe: livrable.majLe ? new Date(livrable.majLe) : undefined
      })))
    );
  }

  getLivrablesForProject(projetId: string): Observable<Livrable[]> {
    return this.http.get<Livrable[]>(`${this.apiUrl}/projet/${projetId}`).pipe(
      map(livrables => livrables.map(livrable => ({
        ...livrable,
        dateLimite: new Date(livrable.dateLimite),
        creeLe: livrable.creeLe ? new Date(livrable.creeLe) : undefined,
        majLe: livrable.majLe ? new Date(livrable.majLe) : undefined
      })))
    );
  }

  getLivrableById(id: string): Observable<Livrable> {
    return this.http.get<Livrable>(`${this.apiUrl}/${id}`).pipe(
      map(livrable => ({
        ...livrable,
        dateLimite: new Date(livrable.dateLimite),
        creeLe: livrable.creeLe ? new Date(livrable.creeLe) : undefined,
        majLe: livrable.majLe ? new Date(livrable.majLe) : undefined
      }))
    );
  }

  createLivrable(livrable: Livrable): Observable<Livrable> {
    return this.http.post<Livrable>(this.apiUrl, livrable);
  }

  updateLivrable(id: string, livrable: Livrable): Observable<Livrable> {
    return this.http.put<Livrable>(`${this.apiUrl}/${id}`, livrable);
  }

  deleteLivrable(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getStatutOptions(): string[] {
    return Object.values(StatutLivrable);
  }
}
