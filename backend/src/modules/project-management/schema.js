// src/schema.js

import Joi from 'joi';
import { User } from './models/user.model.js'; // Assurez-vous que le chemin est correct

// Schéma de validation Joi
export const graphqlCreateProjectSchema = Joi.object({
    titre: Joi.string().trim().min(3).required(),
    description: Joi.string().min(50).required(),
    equipe: Joi.array().items(Joi.string().hex().length(24)).min(1).required(),
    tuteur: Joi.string().hex().length(24).required(),
    skills: Joi.array().items(Joi.string()).min(1).required(),
    deliverables: Joi.array().items(
        Joi.object({
            name: Joi.string().required(),
            deadline: Joi.date().iso().required(),
            status: Joi.string().valid('en attente', 'terminé', 'en retard').optional(),
            repositoryUrl: Joi.string()
                .uri()
                .pattern(/^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/)
                .required()
        })
    ).optional()
});

// Résolveurs GraphQL
export const resolvers = {
    Query: {
        projects: async (_, __, { dataSources }) => {
            return await dataSources.projectAPI.getAllProjects();
        },
        project: async (_, { id }, { dataSources }) => {
            return await dataSources.projectAPI.getProjectById(id);
        }
    },
    Mutation: {
        createProject: async (_, { input }, { dataSources }) => {
            const { error } = graphqlCreateProjectSchema.validate(input);
            if (error) throw new Error(`Validation Error: ${error.details.map(d => d.message).join(', ')}`);

            try {
                return await dataSources.projectAPI.createProject(input);
            } catch (error) {
                throw new Error(`Erreur de création: ${error.message}`);
            }
        }
    },
    Project: {
        equipe: async (parent) => {
            return await User.find({ _id: { $in: parent.equipe } });
        },
        tuteur: async (parent) => {
            return await User.findById(parent.tuteur);
        }
    }
};

// Définitions de types GraphQL
export const typeDefs = `#graphql
  type Project {
    id: ID!
    titre: String!
    description: String!
    equipe: [User!]!
    tuteur: User!
    skills: [String!]!
    deliverables: [Deliverable!]
    createdAt: String!
    updatedAt: String!
  }

  type Deliverable {
    name: String!
    deadline: String!
    status: String
    repositoryUrl: String!
  }

  type User {
    id: ID!
    name: String!
    email: String!
  }

  input CreateProjectInput {
    titre: String!
    description: String!
    equipe: [ID!]!
    tuteur: ID!
    skills: [String!]!
    deliverables: [DeliverableInput!]
  }

  input DeliverableInput {
    name: String!
    deadline: String!
    status: String
    repositoryUrl: String!
  }

  type Query {
    projects: [Project!]!
    project(id: ID!): Project
  }

  type Mutation {
    createProject(input: CreateProjectInput!): Project!
  }
`;