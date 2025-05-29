const { gql } = require('apollo-server-express');

const typeDefs = gql`
    type Project {
        id: ID!
        name: String!
        description: String
        startDate: String
        endDate: String
        status: String
        deliverables: [Deliverable!]! # Array of deliverables associated with the project
    }

    input ProjectInput {
        name: String!
        description: String
        startDate: String
        endDate: String
        status: String
    }

    type Deliverable {
        id: ID!
        title: String!
        description: String
        deadline: String
        status: String
    }

    input DeliverableInput {
        title: String!
        description: String
        deadline: String
        status: String
    }

    type Query {
        projects: [Project!]!
        project(id: ID!): Project
        deliverables(projectId: ID!): [Deliverable!]!
    }

    type Mutation {
        createProject(input: ProjectInput!): Project!
        updateProject(id: ID!, input: ProjectInput!): Project!
        deleteProject(id: ID!): Project!

        addDeliverable(projectId: ID!, input: DeliverableInput!): Project!
        updateDeliverable(projectId: ID!, deliverableId: ID!, input: DeliverableInput!): Deliverable!
        removeDeliverable(projectId: ID!, deliverableId: ID!): Deliverable!
    }
`;

module.exports = { typeDefs };