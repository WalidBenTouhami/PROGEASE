/**
 * Schéma GraphQL pour les évaluations
 *
 * @module graphql/schemas/evaluation
 * @created 2025-06-01 par WalidBenTouhami
 */

'use strict';

const { gql } = require('apollo-server-express');

const typeDefs = gql`
    """
    Critère d'évaluation avec une note et un poids
    """
    type Critere {
        nom: String!
        note: Float!
        poids: Float!
    }

    """
    Évaluation d'un projet par un évaluateur
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
    Statistiques agrégées des évaluations
    """
    type EvaluationStats {
        moyenneScore: Float!
        scoreMax: Float!
        scoreMin: Float!
        totalEvaluations: Int!
    }

    """
    Input pour créer un critère d'évaluation
    """
    input CritereInput {
        nom: String!
        note: Float!
        poids: Float!
    }

    """
    Input pour créer une nouvelle évaluation
    """
    input EvaluationInput {
        projetId: ID!
        note: Float!
        commentaire: String
        criteres: [CritereInput!]!
    }

    """
    Input pour mettre à jour une évaluation existante
    """
    input EvaluationUpdateInput {
        note: Float
        commentaire: String
        criteres: [CritereInput!]
    }

    extend type Query {
        """
        Récupère toutes les évaluations, optionnellement filtrées par projet
        """
        evaluations(projetId: ID): [Evaluation!]!

        """
        Récupère une évaluation par son ID
        """
        evaluation(id: ID!): Evaluation

        """
        Récupère les statistiques d'évaluation pour un projet
        """
        getEvaluationStats(projetId: ID!): EvaluationStats!
    }

    extend type Mutation {
        """
        Crée une nouvelle évaluation pour un projet
        """
        creerEvaluation(input: EvaluationInput!): Evaluation!

        """
        Met à jour une évaluation existante
        """
        mettreAJourEvaluation(id: ID!, input: EvaluationUpdateInput!): Evaluation!

        """
        Supprime une évaluation par son ID
        Retourne true si la suppression a réussi
        """
        supprimerEvaluation(id: ID!): Boolean!
    }
`;

module.exports = typeDefs;
