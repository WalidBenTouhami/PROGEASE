import { gql } from 'apollo-angular';

export const GET_EVALUATIONS = gql`
  query GetEvaluations($projetId: ID, $evaluateurId: ID) {
    evaluations(projetId: $projetId, evaluateurId: $evaluateurId) {
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

export const DELETE_EVALUATION = gql`
  mutation DeleteEvaluation($id: ID!) {
    deleteEvaluation(id: $id) {
      id
    }
  }
`; 