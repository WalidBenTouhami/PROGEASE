/**
 * Schéma GraphQL pour les évaluations
 *
 * @module graphql/schemas/evaluation
 * @created 2024-12-13
 */

'use strict';

const { gql } = require('apollo-server-express');

const typeDefs = gql`
    """
    Critère d'évaluation
    """
    type Critere {
        nom: String!
        note: Float!
        poids: Float!
    }

    """
    Type Evaluation
    """
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

    """
    Statistiques d'évaluation pour un projet
    """
    type EvaluationStats {
        moyenneScore: Float!
        scoreMax: Float!
        scoreMin: Float!
        totalEvaluations: Int!
    }

    """
    Input pour un critère d'évaluation
    """
    input CritereInput {
        nom: String!
        note: Float!
        poids: Float!
    }

    """
    Input pour la création d'une évaluation
    """
    input EvaluationInput {
        projetId: ID!
        note: Float!
        commentaire: String
        criteres: [CritereInput!]
    }

    """
    Input pour la mise à jour d'une évaluation
    """
    input EvaluationUpdateInput {
        note: Float
        commentaire: String
        criteres: [CritereInput!]
    }

    extend type Query {
        """
        Récupère une évaluation par son ID
        """
        evaluation(id: ID!): Evaluation

        """
        Récupère toutes les évaluations, optionnellement filtrées par projet
        """
        evaluations(projetId: ID): [Evaluation!]!

        """
        Récupère les statistiques d'évaluation pour un projet
        """
        getEvaluationStats(projetId: ID!): EvaluationStats!
    }

    extend type Mutation {
        """
        Crée une nouvelle évaluation
        """
        creerEvaluation(input: EvaluationInput!): Evaluation!

        """
        Met à jour une évaluation
        """
        mettreAJourEvaluation(id: ID!, input: EvaluationUpdateInput!): Evaluation!

        """
        Supprime une évaluation
        """
        supprimerEvaluation(id: ID!): Boolean!
    }
`;

module.exports = typeDefs;