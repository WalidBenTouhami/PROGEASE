const { gql } = require('apollo-server-express');

const typeDefs = gql`
    type User {
        id: ID!
        nom: String!
        prenom: String!
        email: String!
        role: UserRole!
        createdAt: String!
        updatedAt: String!
    }

    type Project {
        id: ID!
        title: String!
        description: String!
        status: ProjectStatus!
        team: [User!]!
        tutor: User
        skills: [String!]!
        startDate: String!
        endDate: String!
        deliverables: [Deliverable!]!
        evaluations: [Evaluation!]!
        progression: Float!
        averageScore: Float!
        predictedPerformance: Float!
        createdAt: String!
        updatedAt: String!
    }

    type Deliverable {
        id: ID!
        name: String!
        description: String!
        deadline: String!
        repositoryUrl: String!
        status: DeliverableStatus!
        projectId: ID!
        project: Project!
        createdAt: String!
        updatedAt: String!
    }

    type Evaluation {
        id: ID!
        projectId: ID!
        project: Project!
        evaluatorId: ID!
        evaluator: User!
        score: Float!
        comments: String
        criteria: [EvaluationCriteria!]!
        aiRecommendations: String
        createdAt: String!
        updatedAt: String!
    }

    type EvaluationCriteria {
        name: String!
        score: Float!
        weight: Float!
    }

    type EvaluationStats {
        averageScore: Float!
        highestScore: Float!
        lowestScore: Float!
        totalEvaluations: Int!
    }

    enum UserRole {
        ETUDIANT
        TUTEUR
        ADMIN
    }

    enum ProjectStatus {
        DRAFT
        IN_PROGRESS
        COMPLETED
        ARCHIVED
    }

    enum DeliverableStatus {
        PENDING
        IN_PROGRESS
        COMPLETED
        LATE
    }

    type Query {
        # Project queries
        projects: [Project!]!
        project(id: ID!): Project
        getProjectProgress(id: ID!): Float!
        getPredictedPerformance(id: ID!): Float!

        # Deliverable queries
        deliverables(projectId: ID!): [Deliverable!]!
        deliverable(id: ID!): Deliverable

        # Evaluation queries
        evaluations(projectId: ID!): [Evaluation!]!
        evaluation(id: ID!): Evaluation
        getEvaluationStats(projectId: ID!): EvaluationStats!

        # User queries
        users: [User!]!
        user(id: ID!): User
    }

    type Mutation {
        # Project mutations
        createProject(input: CreateProjectInput!): Project!
        updateProject(id: ID!, input: UpdateProjectInput!): Project!
        deleteProject(id: ID!): Project!

        # Deliverable mutations
        addDeliverable(projectId: ID!, input: CreateDeliverableInput!): Project!
        updateDeliverable(id: ID!, input: UpdateDeliverableInput!): Deliverable!
        deleteDeliverable(id: ID!): Deliverable!

        # Evaluation mutations
        createEvaluation(input: CreateEvaluationInput!): Evaluation!
        updateEvaluation(id: ID!, input: UpdateEvaluationInput!): Evaluation!
        deleteEvaluation(id: ID!): Evaluation!

        # AI-powered mutations
        predictPerformance(projectId: ID!): Float!
        generateLearningRecommendations(projectId: ID!): String!
    }

    input CreateProjectInput {
        title: String!
        description: String!
        status: ProjectStatus!
        team: [ID!]!
        tutor: ID
        skills: [String!]!
        startDate: String!
        endDate: String!
    }

    input UpdateProjectInput {
        title: String
        description: String
        status: ProjectStatus
        team: [ID!]
        tutor: ID
        skills: [String!]
        startDate: String
        endDate: String
    }

    input CreateDeliverableInput {
        name: String!
        description: String!
        deadline: String!
        repositoryUrl: String!
        status: DeliverableStatus!
    }

    input UpdateDeliverableInput {
        name: String
        description: String
        deadline: String
        repositoryUrl: String
        status: DeliverableStatus
    }

    input CreateEvaluationInput {
        projectId: ID!
        evaluatorId: ID!
        score: Float!
        comments: String
        criteria: [EvaluationCriteriaInput!]!
    }

    input UpdateEvaluationInput {
        score: Float
        comments: String
        criteria: [EvaluationCriteriaInput!]
    }

    input EvaluationCriteriaInput {
        name: String!
        score: Float!
        weight: Float!
    }
`;

module.exports = { typeDefs };