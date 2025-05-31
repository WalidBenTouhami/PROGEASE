import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Observable, map } from 'rxjs';

import { Livrable, CreateLivrableInput, UpdateLivrableInput, StatutLivrable } from '../models/livrable.model';
import { GET_LIVRABLES, GET_LIVRABLES_BY_PROJET, CREATE_LIVRABLE, UPDATE_LIVRABLE, DELETE_LIVRABLE } from '../graphql/livrable.queries';
=======
import { Livrable, StatutLivrable } from '../models/livrable.model';
import { environment } from '../../../environments/environment';
import { ApiService } from './api.service';


@Injectable({
  providedIn: 'root'
})
export class LivrableService {

  constructor(private apollo: Apollo) {}

  getLivrables(): Observable<Livrable[]> {
    return this.apollo.query<{ livrables: Livrable[] }>({
      query: GET_LIVRABLES
    }).pipe(
      map(result => result.data.livrables)
    );
  }

  getLivrablesByProjet(projetId: string): Observable<Livrable[]> {
    return this.apollo.query<{ livrablesByProjet: Livrable[] }>({
      query: GET_LIVRABLES_BY_PROJET,
      variables: { projetId }
    }).pipe(
      map(result => result.data.livrablesByProjet)
=======
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

  createLivrable(livrable: CreateLivrableInput): Observable<Livrable> {
    return this.apollo.mutate<{ createLivrable: Livrable }>({
      mutation: CREATE_LIVRABLE,
      variables: { input: livrable }
    }).pipe(
      map(result => result.data!.createLivrable)
    );
  }

  updateLivrable(id: string, livrable: UpdateLivrableInput): Observable<Livrable> {
    return this.apollo.mutate<{ updateLivrable: Livrable }>({
      mutation: UPDATE_LIVRABLE,
      variables: { id, input: livrable }
    }).pipe(
      map(result => result.data!.updateLivrable)
    );
  }

  deleteLivrable(id: string): Observable<boolean> {
    return this.apollo.mutate<{ deleteLivrable: boolean }>({
      mutation: DELETE_LIVRABLE,
      variables: { id }
    }).pipe(
      map(result => result.data!.deleteLivrable)
    );
  }
}
