const { gql } = require('apollo-server-express');

const typeDefs = gql`
    # Custom scalar for Date handling
    scalar Date

    # Types for risk analysis
    type RiskAnalysis {
        retard: Boolean!
        progression: Boolean!
        livrables: Boolean!
        equipe: Boolean!
        niveauRisque: Int!
        recommandations: [String!]!
    }

    type Utilisateur {
        id: ID!
        nom: String!
        prenom: String!
        email: String!
        role: UtilisateurRole!
        createdAt: Date!
        updatedAt: Date!
    }

    type Projet {
        id: ID!
        titre: String!
        description: String!
        statut: ProjetStatus!
        equipe: [Utilisateur!]!
        tuteur: Utilisateur
        competences: [String!]!
        dateDebut: Date!
        dateFin: Date!
        livrables: [Livrable!]!
        evaluations: [Evaluation!]!
        progression: Float!
        moyenneEvaluations: Float!
        performancePredite: Float!
        creeLe: Date!
        majLe: Date!
    }

    type Livrable {
        id: ID!
        intitule: String!
        description: String!
        dateLimite: Date!
        urlDepot: String!
        statut: LivrableStatus!
        projetId: ID!
        projet: Projet
        creeLe: Date!
        majLe: Date!
        estEnRetard: Boolean!
    }

    type Evaluation {
        id: ID!
        projetId: ID!
        projet: Projet!
        evaluateurId: ID!
        evaluateur: Utilisateur!
        score: Float!
        commentaires: String
        criteres: [EvaluationCritere!]!
        aiRecommendations: String
        creeLe: Date!
        majLe: Date!
    }

    type EvaluationCritere {
        nom: String!
        score: Float!
        poids: Float!
    }

    type EvaluationStats {
        moyenneScore: Float!
        scoreMax: Float!
        scoreMin: Float!
        totalEvaluations: Int!
    }

    type AiRecommendationResult {
        recommendations: String!
        score: Float
        confidence: Float
        metadata: AiMetadata
    }

    type AiMetadata {
        modelUsed: String!
        timestamp: Date!
        processingTime: Float!
    }

    type PaginatedLivrables {
        items: [Livrable!]!
        pagination: PaginationInfo!
    }

    type PaginationInfo {
        page: Int!
        limit: Int!
        total: Int!
        pages: Int!
        hasNextPage: Boolean!
        hasPreviousPage: Boolean!
    }

    enum UtilisateurRole {
        ETUDIANT
        TUTEUR
        ADMIN
    }

    enum ProjetStatus {
        BROUILLON
        EN_COURS
        TERMINE
        EN_PAUSE
        ANNULE
    }

    enum LivrableStatus {
        EN_ATTENTE
        EN_COURS
        TERMINE
        VALIDE
        EN_RETARD
        ANNULE
    }

    type Query {
        # Projet queries
        projets: [Projet!]!
        projet(id: ID!): Projet
        getProjetProgress(id: ID!): Float!
        getPredictedPerformance(id: ID!): Float!
        analyserRisquesProjet(projetId: ID!): RiskAnalysis!

        # Livrable queries
        livrables(
            page: Int
            limit: Int
            projetId: ID
            statut: LivrableStatus
            recherche: String
            dateLimiteMin: Date
            dateLimiteMax: Date
        ): PaginatedLivrables!
        livrable(id: ID!): Livrable
        livrablesByProjet(projetId: ID!): [Livrable!]!

        # Evaluation queries
        evaluations(projetId: ID!): [Evaluation!]!
        evaluation(id: ID!): Evaluation
        getEvaluationStats(projetId: ID!): EvaluationStats!

        # Utilisateur queries
        utilisateurs: [Utilisateur!]!
        utilisateur(id: ID!): Utilisateur

        # AI queries
        aiRecommendations(projetId: ID!): AiRecommendationResult!

        # Health check queries
        health: Health!
        healthCheck: String!
    }

    type Health {
        status: String!
        timestamp: String!
        version: String!
        environment: String!
    }

    type Mutation {
        # Projet mutations
        createProjet(input: CreateProjetInput!): Projet!
        updateProjet(id: ID!, input: UpdateProjetInput!): Projet!
        deleteProjet(id: ID!): Projet!

        # Livrable mutations
        addLivrable(projetId: ID!, input: CreateLivrableInput!): Livrable!
        updateLivrable(id: ID!, input: UpdateLivrableInput!): Livrable!
        deleteLivrable(id: ID!): Livrable!

        # Evaluation mutations
        createEvaluation(input: CreateEvaluationInput!): Evaluation!
        updateEvaluation(id: ID!, input: UpdateEvaluationInput!): Evaluation!
        deleteEvaluation(id: ID!): Evaluation!

        # AI-powered mutations
        predictPerformance(projetId: ID!): Float!
        generateLearningRecommendations(projetId: ID!): String!
    }

    input CreateProjetInput {
        titre: String!
        description: String!
        statut: ProjetStatus!
        equipe: [ID!]!
        tuteur: ID
        competences: [String!]!
        dateDebut: Date!
        dateFin: Date!
    }

    input UpdateProjetInput {
        titre: String
        description: String
        statut: ProjetStatus
        equipe: [ID!]
        tuteur: ID
        competences: [String!]
        dateDebut: Date
        dateFin: Date
    }

    input CreateLivrableInput {
        name: String!
        description: String!
        deadline: Date!
        repositoryUrl: String!
        status: LivrableStatus
    }

    input UpdateLivrableInput {
        name: String
        description: String
        deadline: Date
        repositoryUrl: String
        status: LivrableStatus
    }

    input CreateEvaluationInput {
        projetId: ID!
        evaluateurId: ID!
        score: Float!
        commentaires: String
        criteres: [EvaluationCritereInput!]!
    }

    input UpdateEvaluationInput {
        score: Float
        commentaires: String
        criteres: [EvaluationCritereInput!]
    }

    input EvaluationCritereInput {
        nom: String!
        score: Float!
        poids: Float!
    }
`;

module.exports = { typeDefs };
