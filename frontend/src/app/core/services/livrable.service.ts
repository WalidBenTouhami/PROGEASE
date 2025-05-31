import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Livrable, StatutLivrable } from '../models/livrable.model';
import { environment } from '../../../environments/environment';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class LivrableService {
  private readonly path = '/api/livrables';

  constructor(private http: HttpClient, private api: ApiService) { }

  // Récupérer tous les livrables avec filtrage et pagination
  getLivrables(params: any = {}): Observable<{ success: boolean; data: Livrable[] }> {
    return this.api.get(this.path, params);
  }

  // Créer un nouveau livrable
  creerLivrable(livrable: Livrable): Observable<{ success: boolean; data: Livrable }> {
    return this.api.post(this.path, livrable);
  }

  // Récupérer un livrable par son ID
  getLivrableParId(id: string): Observable<{ success: boolean; data: Livrable }> {
    return this.api.get(`${this.path}/${id}`);
  }

  // Récupérer les livrables d'un projet
  getLivrablesByProjet(projetId: string): Observable<{ success: boolean; data: Livrable[] }> {
    return this.api.get(`${this.path}/projet/${projetId}`);
  }

  // Mettre à jour un livrable
  updateLivrable(id: string, livrable: Livrable): Observable<{ success: boolean; data: Livrable }> {
    return this.api.put(`${this.path}/${id}`, livrable);
  }

  // Supprimer un livrable
  deleteLivrable(id: string): Observable<{ success: boolean; message: string }> {
    return this.api.delete(`${this.path}/${id}`);
  }

  // Vérifier la santé du service
  checkHealth(): Observable<any> {
    return this.api.checkHealth(this.path);
  }

  recupererLivrables(): Observable<Livrable[]> {
    return this.http.get<Livrable[]>(`${environment.apiUrl}/livrables`).pipe(
      map(livrables => livrables.map(livrable => ({
        ...livrable,
        dateLimite: new Date(livrable.dateLimite),
        creeLe: livrable.creeLe ? new Date(livrable.creeLe) : undefined,
        majLe: livrable.majLe ? new Date(livrable.majLe) : undefined
      })))
    );
  }

  recupererLivrablesParProjet(projetId: string): Observable<Livrable[]> {
    return this.http.get<Livrable[]>(`${environment.apiUrl}/livrables/projet/${projetId}`).pipe(
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
