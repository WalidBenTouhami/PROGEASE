import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { gql } from 'apollo-angular';
import { map, Observable, catchError, throwError } from 'rxjs';
import { Evaluation, EvaluationStats, UpdateEvaluationInput, EvaluationCritere, Projet, User, CreateEvaluationInput } from '../models/evaluation.model';

const GET_EVALUATIONS = gql`
  query GetEvaluations($projectId: ID) {
    evaluations(projectId: $projectId) {
      id
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
      score
      commentaires
      criteres {
        nom
        score
        poids
      }
      aiRecommendations
      creeLe
      majLe
    }
  }
`;

const GET_EVALUATION = gql`
  query GetEvaluation($id: ID!) {
    evaluation(id: $id) {
      id
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
      score
      commentaires
      criteres {
        nom
        score
        poids
      }
      aiRecommendations
      creeLe
      majLe
    }
  }
`;

const UPDATE_EVALUATION = gql`
  mutation UpdateEvaluation($id: ID!, $input: UpdateEvaluationInput!) {
    updateEvaluation(id: $id, input: $input) {
      id
      score
      commentaires
      criteres {
        nom
        score
        poids
      }
      projet {
        id
        titre
      }
      evaluateur {
        id
        nom
        prenom
      }
      aiRecommendations
      creeLe
      majLe
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
      score
      commentaires
      criteres {
        nom
        score
        poids
      }
      aiRecommendations
      creeLe
      majLe
    }
  }
`;

@Injectable({
  providedIn: 'root'
})
export class EvaluationService {
  constructor(private apollo: Apollo) {}

  getEvaluations(projectId?: string): Observable<Evaluation[]> {
    return this.apollo
      .watchQuery<{ evaluations: Evaluation[] }>({
        query: GET_EVALUATIONS,
        variables: projectId && projectId !== 'ALL' ? { projectId } : {},
      })
      .valueChanges.pipe(
        map((result) => result.data.evaluations),
        catchError((error) => {
          console.error('Erreur lors du chargement des évaluations:', error);
          return throwError(() => new Error('Impossible de charger les évaluations.'));
        })
      );
  }

  getEvaluation(id: string): Observable<Evaluation> {
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
          return result.data.evaluation;
        }),
        catchError((error) => {
          console.error('Erreur lors du chargement de l\'évaluation:', error);
          return throwError(() => new Error('Impossible de charger l\'évaluation.'));
        })
      );
  }

  updateEvaluation(id: string, input: UpdateEvaluationInput): Observable<Evaluation> {
    return this.apollo.mutate<{ updateEvaluation: Evaluation }>({
      mutation: UPDATE_EVALUATION,
      variables: { id, input }
    }).pipe(
      map(result => {
        if (!result.data) {
          throw new Error('Aucune donnée retournée par la mutation');
        }
        return result.data.updateEvaluation;
      }),
      catchError((error) => {
        console.error('Erreur lors de la mise à jour de l\'évaluation:', error);
        return throwError(() => new Error('Impossible de mettre à jour l\'évaluation'));
      })
    );
  }

  deleteEvaluation(id: string): Observable<string> {
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
          return result.data.deleteEvaluation.id;
        }),
        catchError((error) => {
          console.error('Erreur lors de la suppression de l\'évaluation:', error);
          return throwError(() => new Error('Impossible de supprimer l\'évaluation'));
        })
      );
  }

  getEvaluationStats(projetId: string): Observable<EvaluationStats> {
    return this.apollo.query<{ evaluationStats: EvaluationStats }>({
      query: gql`
        query GetEvaluationStats($projetId: ID!) {
          evaluationStats(projetId: $projetId) {
            moyenneGenerale
            nombreEvaluations
            meilleureNote
            pireNote
            distribution
          }
        }
      `,
      variables: { projetId }
    }).pipe(
      map(result => result.data.evaluationStats)
    );
  }

  createEvaluation(input: CreateEvaluationInput): Observable<Evaluation> {
    return this.apollo.mutate<{ createEvaluation: Evaluation }>({
      mutation: CREATE_EVALUATION,
      variables: { input }
    }).pipe(
      map(result => {
        if (!result.data) {
          throw new Error('Aucune donnée retournée par la mutation');
        }
        return result.data.createEvaluation;
      }),
      catchError((error) => {
        console.error('Erreur lors de la création de l\'évaluation:', error);
        return throwError(() => new Error('Impossible de créer l\'évaluation'));
      })
    );
  }
} 