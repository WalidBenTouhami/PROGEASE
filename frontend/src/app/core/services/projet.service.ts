import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { gql } from 'apollo-angular';
import { map, Observable } from 'rxjs';
import { Projet, CreateProjetInput, UpdateProjetInput } from '../models/projet.model';
import { ApiResponse } from '../models/api.model';

const GET_PROJETS = gql`
  query GetProjets {
    projets {
      id
      titre
      description
      dateDebut
      dateFin
      statut
      responsableId
      responsable {
        id
        nom
        prenom
      }
      membres {
        id
        nom
        prenom
        role
      }
      livrables {
        id
        titre
        dateLimite
        statut
      }
      evaluations {
        id
        note
        commentaires
        dateEvaluation
      }
      tags
      progression
      dateCreation
      dateModification
    }
  }
`;

const GET_PROJET = gql`
  query GetProjet($id: ID!) {
    projet(id: $id) {
      id
      titre
      description
      dateDebut
      dateFin
      statut
      responsableId
      responsable {
        id
        nom
        prenom
      }
      membres {
        id
        nom
        prenom
        role
      }
      livrables {
        id
        titre
        dateLimite
        statut
      }
      evaluations {
        id
        note
        commentaires
        dateEvaluation
      }
      tags
      progression
      dateCreation
      dateModification
    }
  }
`;

const CREATE_PROJET = gql`
  mutation CreateProjet($input: CreateProjetInput!) {
    createProjet(input: $input) {
      id
      titre
      description
      dateDebut
      dateFin
      statut
      responsableId
      tags
      dateCreation
    }
  }
`;

const UPDATE_PROJET = gql`
  mutation UpdateProjet($id: ID!, $input: UpdateProjetInput!) {
    updateProjet(id: $id, input: $input) {
      id
      titre
      description
      dateDebut
      dateFin
      statut
      responsableId
      membres {
        id
        nom
        prenom
        role
      }
      tags
      dateModification
    }
  }
`;

const DELETE_PROJET = gql`
  mutation DeleteProjet($id: ID!) {
    deleteProjet(id: $id) {
      id
    }
  }
`;

@Injectable({
  providedIn: 'root'
})
export class ProjetService {
  constructor(private apollo: Apollo) {}

  getProjets(): Observable<ApiResponse<Projet[]>> {
    return this.apollo
      .watchQuery<{ projets: Projet[] }>({
        query: GET_PROJETS
      })
      .valueChanges.pipe(
        map((result) => ({
          success: true,
          data: result.data.projets
        }))
      );
  }

  getProjet(id: string): Observable<ApiResponse<Projet>> {
    return this.apollo
      .watchQuery<{ projet: Projet }>({
        query: GET_PROJET,
        variables: { id }
      })
      .valueChanges.pipe(
        map((result) => ({
          success: true,
          data: result.data.projet
        }))
      );
  }

  createProjet(input: CreateProjetInput): Observable<ApiResponse<Projet>> {
    return this.apollo
      .mutate<{ createProjet: Projet }>({
        mutation: CREATE_PROJET,
        variables: { input },
        refetchQueries: [{ query: GET_PROJETS }]
      })
      .pipe(
        map((result) => ({
          success: true,
          data: result.data!.createProjet
        }))
      );
  }

  updateProjet(id: string, input: UpdateProjetInput): Observable<ApiResponse<Projet>> {
    return this.apollo
      .mutate<{ updateProjet: Projet }>({
        mutation: UPDATE_PROJET,
        variables: { id, input },
        refetchQueries: [{ query: GET_PROJETS }]
      })
      .pipe(
        map((result) => ({
          success: true,
          data: result.data!.updateProjet
        }))
      );
  }

  deleteProjet(id: string): Observable<ApiResponse<string>> {
    return this.apollo
      .mutate<{ deleteProjet: { id: string } }>({
        mutation: DELETE_PROJET,
        variables: { id },
        refetchQueries: [{ query: GET_PROJETS }]
      })
      .pipe(
        map((result) => ({
          success: true,
          data: result.data!.deleteProjet.id
        }))
      );
  }
}
