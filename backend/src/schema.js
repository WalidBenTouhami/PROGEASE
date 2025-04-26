const { gql } = require('apollo-server-express');
const { Enums } = require('../config/constants'); // Importation des énumérations depuis constants.js

const typeDefs = gql`
    # 📌 Enumérations
    enum ProjectStatus {
    ${Object.keys(Enums.ProjectStatus).join("\n")}
    }

    enum UserRole {
    ${Object.keys(Enums.UserRole).join("\n")}
    }

    enum DeliverableStatus {
    ${Object.keys(Enums.DeliverableStatus).join("\n")}
    }

    # 📌 Type utilisateur
    type User {
        _id: ID!
        name: String!
        email: String!
        role: UserRole! # Utilise l'énumération UserRole
        createdAt: String
        updatedAt: String
    }

    # 📌 Type livrable
    type Deliverable {
        name: String!
        deadline: String!
        status: DeliverableStatus! # Utilise l'énumération DeliverableStatus
        repositoryUrl: String!
    }

    # 📌 Type projet
    type Project {
        _id: ID!
        titre: String!
        description: String
        equipe: [User!]!
        tuteur: User!
        skills: [String!]!
        startDate: String!
        endDate: String!
        deliverables: [Deliverable!]! # Liste des livrables
        evaluations: [Evaluation!]! # Liste des évaluations
        progression: Float
        predictedPerformance: Float
        status: ProjectStatus! # Utilise l'énumération ProjectStatus
        createdAt: String
        updatedAt: String
    }

    # 📌 Type évaluation
    type Evaluation {
        _id: ID!
        projectId: Project! # Référence au projet
        evaluatorId: User! # Référence à l'évaluateur
        score: Int!
        comments: String
        createdAt: String
        updatedAt: String
    }

    # 📌 Requêtes disponibles
    type Query {
        projects: [Project!]!
        project(id: ID!): Project
        users: [User!]!
        user(id: ID!): User
        getProjectProgress(id: ID!): Float
        getPredictedPerformance(id: ID!): Float
        getSmartTutor(id: ID!): User
    }

    # 📌 Mutations disponibles
    type Mutation {
        createProject(
            titre: String!
            description: String
            equipe: [ID!]!
            tuteur: ID!
            skills: [String!]!
            startDate: String!
            endDate: String!
            deliverables: [DeliverableInput!]! # Entrée pour les livrables
            status: ProjectStatus! # Utilise l'énumération ProjectStatus
        ): Project

        addEvaluation(
            projectId: ID! # Référence au projet
            evaluation: EvaluationInput! # Entrée pour l'évaluation
        ): Project

        predictPerformance(projectId: ID!): Float
        assignSmartTutor(projectId: ID!): Project
        setupReminders(projectId: ID!): String
    }

    # 📌 Entrée pour les livrables
    input DeliverableInput {
        name: String!
        deadline: String!
        status: DeliverableStatus! # Utilise l'énumération DeliverableStatus
        repositoryUrl: String!
    }

    # 📌 Entrée pour les évaluations
    input EvaluationInput {
        projectId: ID! # Référence au projet
        evaluatorId: ID! # Référence à l'évaluateur
        score: Int!
        comments: String
    }
`;

module.exports = { typeDefs };