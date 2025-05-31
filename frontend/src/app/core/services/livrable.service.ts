import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { gql } from 'apollo-angular';
import { map, Observable } from 'rxjs';
import { Livrable, CreateLivrableInput, UpdateLivrableInput } from '../models/livrable.model';

const GET_LIVRABLES = gql`
  query GetLivrables($projetId: ID) {
    livrables(projetId: $projetId) {
      id
      titre
      description
      dateCreation
      dateLimite
      dateModification
      statut
      note
      commentaires
      fichiers
      projetId
      projet {
        id
        titre
      }
      auteurId
      auteur {
        id
        nom
        prenom
      }
    }
  }
`;

const GET_LIVRABLE = gql`
  query GetLivrable($id: ID!) {
    livrable(id: $id) {
      id
      titre
      description
      dateCreation
      dateLimite
      dateModification
      statut
      note
      commentaires
      fichiers
      projetId
      projet {
        id
        titre
      }
      auteurId
      auteur {
        id
        nom
        prenom
      }
    }
  }
`;

const CREATE_LIVRABLE = gql`
  mutation CreateLivrable($input: CreateLivrableInput!) {
    createLivrable(input: $input) {
      id
      titre
      description
      dateCreation
      dateLimite
      dateModification
      statut
      fichiers
      projetId
    }
  }
`;

const UPDATE_LIVRABLE = gql`
  mutation UpdateLivrable($id: ID!, $input: UpdateLivrableInput!) {
    updateLivrable(id: $id, input: $input) {
      id
      titre
      description
      dateCreation
      dateLimite
      dateModification
      statut
      note
      commentaires
      fichiers
      projetId
    }
  }
`;

const DELETE_LIVRABLE = gql`
  mutation DeleteLivrable($id: ID!) {
    deleteLivrable(id: $id) {
      id
    }
  }
`;

@Injectable({
  providedIn: 'root'
})
export class LivrableService {
  constructor(private apollo: Apollo) {}

  getLivrables(projetId?: string): Observable<Livrable[]> {
    return this.apollo
      .watchQuery<{ livrables: Livrable[] }>({
        query: GET_LIVRABLES,
        variables: projetId ? { projetId } : {},
      })
      .valueChanges.pipe(map((result) => result.data.livrables));
  }

  getLivrable(id: string): Observable<Livrable> {
    return this.apollo
      .watchQuery<{ livrable: Livrable }>({
        query: GET_LIVRABLE,
        variables: { id },
      })
      .valueChanges.pipe(map((result) => result.data.livrable));
  }

  createLivrable(input: CreateLivrableInput): Observable<Livrable> {
    return this.apollo
      .mutate<{ createLivrable: Livrable }>({
        mutation: CREATE_LIVRABLE,
        variables: { input },
        refetchQueries: [{ query: GET_LIVRABLES }],
      })
      .pipe(map((result) => result.data!.createLivrable));
  }

  updateLivrable(id: string, input: UpdateLivrableInput): Observable<Livrable> {
    return this.apollo
      .mutate<{ updateLivrable: Livrable }>({
        mutation: UPDATE_LIVRABLE,
        variables: { id, input },
        refetchQueries: [{ query: GET_LIVRABLES }],
      })
      .pipe(map((result) => result.data!.updateLivrable));
  }

  deleteLivrable(id: string): Observable<string> {
    return this.apollo
      .mutate<{ deleteLivrable: { id: string } }>({
        mutation: DELETE_LIVRABLE,
        variables: { id },
        refetchQueries: [{ query: GET_LIVRABLES }],
      })
      .pipe(map((result) => result.data!.deleteLivrable.id));
  }
}
