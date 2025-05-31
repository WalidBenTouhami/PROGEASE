import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Observable, map } from 'rxjs';
import { Livrable, CreateLivrableInput, UpdateLivrableInput, StatutLivrable } from '../models/livrable.model';
import { GET_LIVRABLES, GET_LIVRABLES_BY_PROJET, CREATE_LIVRABLE, UPDATE_LIVRABLE, DELETE_LIVRABLE } from '../graphql/livrable.queries';
import { ApiResponse } from '../models/api.model';

@Injectable({
  providedIn: 'root'
})
export class LivrableService {
  constructor(private apollo: Apollo) {}

  getLivrables(): Observable<ApiResponse<Livrable[]>> {
    return this.apollo.query<{ livrables: Livrable[] }>({
      query: GET_LIVRABLES
    }).pipe(
      map(result => ({
        success: true,
        data: result.data.livrables
      }))
    );
  }

  getLivrablesByProjet(projetId: string): Observable<ApiResponse<Livrable[]>> {
    return this.apollo.query<{ livrablesByProjet: Livrable[] }>({
      query: GET_LIVRABLES_BY_PROJET,
      variables: { projetId }
    }).pipe(
      map(result => ({
        success: true,
        data: result.data.livrablesByProjet
      }))
    );
  }

  createLivrable(livrable: CreateLivrableInput): Observable<ApiResponse<Livrable>> {
    return this.apollo.mutate<{ createLivrable: Livrable }>({
      mutation: CREATE_LIVRABLE,
      variables: { input: livrable }
    }).pipe(
      map(result => ({
        success: true,
        data: result.data!.createLivrable
      }))
    );
  }

  updateLivrable(id: string, livrable: UpdateLivrableInput): Observable<ApiResponse<Livrable>> {
    return this.apollo.mutate<{ updateLivrable: Livrable }>({
      mutation: UPDATE_LIVRABLE,
      variables: { id, input: livrable }
    }).pipe(
      map(result => ({
        success: true,
        data: result.data!.updateLivrable
      }))
    );
  }

  deleteLivrable(id: string): Observable<ApiResponse<boolean>> {
    return this.apollo.mutate<{ deleteLivrable: boolean }>({
      mutation: DELETE_LIVRABLE,
      variables: { id }
    }).pipe(
      map(result => ({
        success: true,
        data: result.data!.deleteLivrable
      }))
    );
  }
}
