// src/graphql/schema.js
const { gql } = require('graphql-tag');
const { resolvers } = require('./index');

// Definition du schema GraphQL aligné avec les constantes et modèles
const typeDefs = gql`
  type Query {
    health: Health!
    projets: [Projet!]!
    projet(id: ID!): Projet
    livrables: [Livrable!]!
    livrable(id: ID!): Livrable
  }

  type Mutation {
    createProjet(input: ProjetInput!): Projet!
    updateProjet(id: ID!, input: ProjetInput!): Projet!
    deleteProjet(id: ID!): Boolean!
    
    createLivrable(input: LivrableInput!): Livrable!
    updateLivrable(id: ID!, input: LivrableInput!): Livrable!
    deleteLivrable(id: ID!): Boolean!
  }

  type Health {
    status: String!
    timestamp: String!
    version: String!
    environment: String!
  }

  type Projet {
    id: ID!
    nom: String!
    description: String
    dateDebut: String!
    dateFin: String
    statut: StatutProjet!
    livrables: [Livrable!]!
    createdAt: String!
    updatedAt: String!
  }

  type Livrable {
    id: ID!
    intitule: String!
    description: String
    dateLimite: String!
    statut: StatutLivrable!
    projet: Projet!
    createdAt: String!
    updatedAt: String!
  }

  input ProjetInput {
    nom: String!
    description: String
    dateDebut: String!
    dateFin: String
    statut: StatutProjet
  }

  input LivrableInput {
    nom: String!
    description: String
    dateEcheance: String!
    statut: StatutLivrable
    projetId: ID!
  }

  enum StatutProjet {
    EN_COURS
    TERMINE
    EN_PAUSE
    ANNULE
  }

  enum StatutLivrable {
    A_FAIRE
    EN_COURS
    TERMINE
    EN_RETARD
    ANNULE
  }
`;

module.exports = { typeDefs, resolvers };