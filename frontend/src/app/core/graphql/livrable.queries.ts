import { gql } from 'apollo-angular';

export const GET_LIVRABLES = gql`
  query GetLivrables {
    livrables {
      id
      intitule
      description
      dateCreation
      dateLimite
      dateModification
      statut
      fichiers
      commentaires
      projetId
    }
  }
`;

export const GET_LIVRABLES_BY_PROJET = gql`
  query GetLivrablesByProjet($projetId: ID!) {
    livrablesByProjet(projetId: $projetId) {
      id
      intitule
      description
      dateCreation
      dateLimite
      dateModification
      statut
      fichiers
      commentaires
      projetId
    }
  }
`;

export const CREATE_LIVRABLE = gql`
  mutation CreateLivrable($input: CreateLivrableInput!) {
    createLivrable(input: $input) {
      id
      intitule
      description
      dateCreation
      dateLimite
      dateModification
      statut
      fichiers
      commentaires
      projetId
    }
  }
`;

export const UPDATE_LIVRABLE = gql`
  mutation UpdateLivrable($id: ID!, $input: UpdateLivrableInput!) {
    updateLivrable(id: $id, input: $input) {
      id
      intitule
      description
      dateCreation
      dateLimite
      dateModification
      statut
      fichiers
      commentaires
      projetId
    }
  }
`;

export const DELETE_LIVRABLE = gql`
  mutation DeleteLivrable($id: ID!) {
    deleteLivrable(id: $id)
  }
`; 