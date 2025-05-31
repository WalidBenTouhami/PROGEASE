import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { gql } from 'apollo-angular';
import { map, Observable, catchError, throwError } from 'rxjs';
import { Evaluation, EvaluationStats, UpdateEvaluationInput, EvaluationCritere, Projet, User, CreateEvaluationInput } from '../models/evaluation.model';

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

const GET_EVALUATIONS = gql`
  query GetEvaluations($projetId: ID) {
    evaluations(projetId: $projetId) {
      id
      projetId
      evaluateurId
      note
      commentaire
      criteres {
        nom
        note
        poids
      }
      dateEvaluation
      creeLe
      majLe
      projet {
        id
        titre
        description
      }
      evaluateur {
        id
        nom
        prenom
      }
    }
  }
`;

const GET_EVALUATION = gql`
  query GetEvaluation($id: ID!) {
    evaluation(id: $id) {
      id
      projetId
      evaluateurId
      note
      commentaire
      criteres {
        nom
        note
        poids
      }
      dateEvaluation
      creeLe
      majLe
      projet {
        id
        titre
        description
      }
      evaluateur {
        id
        nom
        prenom
      }
    }
  }
`;

const UPDATE_EVALUATION = gql`
  mutation UpdateEvaluation($id: ID!, $input: UpdateEvaluationInput!) {
    updateEvaluation(id: $id, input: $input) {
      id
      projetId
      evaluateurId
      note
      commentaire
      criteres {
        nom
        note
        poids
      }
      dateEvaluation
      creeLe
      majLe
      projet {
        id
        titre
      }
      evaluateur {
        id
        nom
        prenom
      }
    }
  }
`;

const DELETE_EVALUATION = gql`
  mutation DeleteEvaluation($id: ID!) {
    deleteEvaluation(id: $id) {
      id
    }
  }
`;

const CREATE_EVALUATION = gql`
  mutation CreateEvaluation($input: CreateEvaluationInput!) {
    createEvaluation(input: $input) {
      id
      projetId
      evaluateurId
      note
      commentaire
      criteres {
        nom
        note
        poids
      }
      dateEvaluation
      creeLe
      majLe
      projet {
        id
        titre
        description
      }
      evaluateur {
        id
        nom
        prenom
      }
    }
  }
`;

@Injectable({
  providedIn: 'root'
})
export class EvaluationService {
  constructor(private apollo: Apollo) {}

  getEvaluations(projetId?: string): Observable<ApiResponse<Evaluation[]>> {
    return this.apollo
      .watchQuery<{ evaluations: Evaluation[] }>({
        query: GET_EVALUATIONS,
        variables: projetId && projetId !== 'ALL' ? { projetId } : {},
      })
      .valueChanges.pipe(
        map((result) => ({
          success: true,
          data: result.data.evaluations
        })),
        catchError((error) => {
          console.error('Erreur lors du chargement des évaluations:', error);
          return throwError(() => new Error('Impossible de charger les évaluations.'));
        })
      );
  }

  getEvaluation(id: string): Observable<ApiResponse<Evaluation>> {
    return this.apollo
      .watchQuery<{ evaluation: Evaluation }>({
        query: GET_EVALUATION,
        variables: { id }
      })
      .valueChanges.pipe(
        map((result) => {
          if (!result.data.evaluation) {
            throw new Error('Évaluation non trouvée');
          }
          return {
            success: true,
            data: result.data.evaluation
          };
        }),
        catchError((error) => {
          console.error('Erreur lors du chargement de l\'évaluation:', error);
          return throwError(() => new Error('Impossible de charger l\'évaluation.'));
        })
      );
  }

  updateEvaluation(id: string, input: UpdateEvaluationInput): Observable<ApiResponse<Evaluation>> {
    return this.apollo.mutate<{ updateEvaluation: Evaluation }>({
      mutation: UPDATE_EVALUATION,
      variables: { id, input }
    }).pipe(
      map(result => {
        if (!result.data) {
          throw new Error('Aucune donnée retournée par la mutation');
        }
        return {
          success: true,
          data: result.data.updateEvaluation
        };
      }),
      catchError((error) => {
        console.error('Erreur lors de la mise à jour de l\'évaluation:', error);
        return throwError(() => new Error('Impossible de mettre à jour l\'évaluation'));
      })
    );
  }

  deleteEvaluation(id: string): Observable<ApiResponse<string>> {
    return this.apollo
      .mutate<{ deleteEvaluation: { id: string } }>({
        mutation: DELETE_EVALUATION,
        variables: { id },
        refetchQueries: [
          { query: GET_EVALUATIONS }
        ]
      })
      .pipe(
        map(result => {
          if (!result.data) {
            throw new Error('Aucune donnée retournée par la mutation');
          }
          return {
            success: true,
            data: result.data.deleteEvaluation.id
          };
        }),
        catchError((error) => {
          console.error('Erreur lors de la suppression de l\'évaluation:', error);
          return throwError(() => new Error('Impossible de supprimer l\'évaluation'));
        })
      );
  }

  getEvaluationStats(projetId: string): Observable<ApiResponse<EvaluationStats>> {
    return this.apollo.query<{ evaluationStats: EvaluationStats }>({
      query: gql`
        query GetEvaluationStats($projetId: ID!) {
          evaluationStats(projetId: $projetId) {
            moyenneNote
            noteMax
            noteMin
            totalEvaluations
          }
        }
      `,
      variables: { projetId }
    }).pipe(
      map(result => ({
        success: true,
        data: result.data.evaluationStats
      }))
    );
  }

  createEvaluation(input: CreateEvaluationInput): Observable<ApiResponse<Evaluation>> {
    return this.apollo.mutate<{ createEvaluation: Evaluation }>({
      mutation: CREATE_EVALUATION,
      variables: { input }
    }).pipe(
      map(result => {
        if (!result.data) {
          throw new Error('Aucune donnée retournée par la mutation');
        }
        return {
          success: true,
          data: result.data.createEvaluation
        };
      }),
      catchError((error) => {
        console.error('Erreur lors de la création de l\'évaluation:', error);
        return throwError(() => new Error('Impossible de créer l\'évaluation'));
      })
    );
  }
} 