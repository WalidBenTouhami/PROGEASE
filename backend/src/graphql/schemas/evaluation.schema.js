const { gql } = require('apollo-server-express');

const typeDefs = gql`
    type Critere {
        nom: String!
        note: Float!
        poids: Float!
    }

    type Evaluation {
        id: ID!
        projet: Projet!
        evaluateur: Utilisateur!
        note: Float!
        commentaire: String
        criteres: [Critere!]!
        dateEvaluation: DateTime!
        creeLe: DateTime!
        majLe: DateTime!
    }

    type EvaluationStats {
        moyenneScore: Float!
        scoreMax: Float!
        scoreMin: Float!
        totalEvaluations: Int!
    }

    input CritereInput {
        nom: String!
        note: Float!
        poids: Float!
    }

    input EvaluationInput {
        projetId: ID!
        note: Float!
        commentaire: String
        criteres: [CritereInput!]!
    }

    input EvaluationUpdateInput {
        note: Float
        commentaire: String
        criteres: [CritereInput!]
    }

    extend type Query {
        evaluations(projetId: ID): [Evaluation!]!
        evaluation(id: ID!): Evaluation
        getEvaluationStats(projetId: ID!): EvaluationStats!
    }

    extend type Mutation {
        creerEvaluation(input: EvaluationInput!): Evaluation!
        mettreAJourEvaluation(id: ID!, input: EvaluationUpdateInput!): Evaluation!
        supprimerEvaluation(id: ID!): Boolean!
    }
`;

module.exports = typeDefs; 