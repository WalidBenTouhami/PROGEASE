import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { gql } from 'apollo-angular';
import { map, Observable, catchError, throwError } from 'rxjs';

export interface EvaluationCriteria {
  name: string;
  score: number;
  weight: number;
}

export interface Project {
  id: string;
  title: string;
}

export interface User {
  id: string;
  nom: string;
  prenom: string;
}

export interface Evaluation {
  id: string;
  projectId: string;
  project: Project;
  evaluatorId: string;
  evaluator: User;
  score: number;
  comments: string;
  criteria: EvaluationCriteria[];
  aiRecommendations: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateEvaluationInput {
  score: number;
  comments: string;
  criteria: EvaluationCriteria[];
}

interface UpdateEvaluationResponse {
  updateEvaluation: Evaluation;
}

const GET_EVALUATIONS = gql`
  query GetEvaluations($projectId: ID!) {
    evaluations(projectId: $projectId) {
      id
      projectId
      project {
        id
        title
      }
      evaluatorId
      evaluator {
        id
        nom
        prenom
      }
      score
      comments
      criteria {
        name
        score
        weight
      }
      aiRecommendations
      createdAt
      updatedAt
    }
  }
`;

const GET_EVALUATION = gql`
  query GetEvaluation($id: ID!) {
    evaluation(id: $id) {
      id
      projectId
      project {
        id
        title
      }
      evaluatorId
      evaluator {
        id
        nom
        prenom
      }
      score
      comments
      criteria {
        name
        score
        weight
      }
      aiRecommendations
      createdAt
      updatedAt
    }
  }
`;

const UPDATE_EVALUATION = gql`
  mutation UpdateEvaluation($id: ID!, $input: UpdateEvaluationInput!) {
    updateEvaluation(id: $id, input: $input) {
      id
      score
      comments
      criteria {
        name
        score
        weight
      }
      project {
        id
        title
      }
      evaluator {
        id
        nom
        prenom
      }
      aiRecommendations
      createdAt
      updatedAt
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

@Injectable({
  providedIn: 'root'
})
export class EvaluationService {
  constructor(private apollo: Apollo) {}

  getEvaluations(projectId: string): Observable<Evaluation[]> {
    return this.apollo
      .watchQuery<{ evaluations: Evaluation[] }>({
        query: GET_EVALUATIONS,
        variables: { projectId },
        fetchPolicy: 'network-only' // Always fetch fresh data
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
    if (id === 'new') {
      return throwError(() => new Error('Invalid evaluation ID'));
    }
    
    return this.apollo
      .watchQuery<{ evaluation: Evaluation }>({
        query: GET_EVALUATION,
        variables: { id },
        fetchPolicy: 'network-only' // Always fetch fresh data
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
    return this.apollo.mutate<UpdateEvaluationResponse>({
      mutation: UPDATE_EVALUATION,
      variables: {
        id,
        input: {
          score: input.score,
          comments: input.comments,
          criteria: input.criteria
        }
      }
    }).pipe(
      map(result => {
        if (!result.data) {
          throw new Error('No data returned from update mutation');
        }
        return result.data.updateEvaluation;
      }),
      catchError((error) => {
        console.error('Error updating evaluation:', error);
        return throwError(() => new Error('Failed to update evaluation'));
      })
    );
  }

  deleteEvaluation(id: string): Observable<string> {
    return this.apollo
      .mutate<{ deleteEvaluation: { id: string } }>({
        mutation: DELETE_EVALUATION,
        variables: { id },
        refetchQueries: [
          { query: GET_EVALUATIONS, variables: { projectId: 'ALL' } }
        ]
      })
      .pipe(
        map((result) => {
          if (!result.data?.deleteEvaluation) {
            throw new Error('Erreur lors de la suppression de l\'évaluation');
          }
          return result.data.deleteEvaluation.id;
        }),
        catchError((error) => {
          console.error('Erreur lors de la suppression de l\'évaluation:', error);
          return throwError(() => new Error('Impossible de supprimer l\'évaluation.'));
        })
      );
  }
} 