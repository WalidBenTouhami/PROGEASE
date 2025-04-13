// src/schema.js

const { gql } = require('apollo-server-express');
const Joi = require('joi');
const Project = require('./modules/project-management/models/project.model');
const User = require('./modules/user-management/models/User.js');
const Evaluation = require('./modules/evaluation-system/models/Evaluation.js');
const IaService = require('./services/ia.service');
const { graphqlCreateProjectSchema } = require('./modules/project-management/schema'); // Joi schema

// 📚 Définition des types GraphQL
const typeDefs = gql`
  type User {
    _id: ID!
    email: String!
    role: String!
    experience: Int
    skills: [String]
  }

  type Project {
    _id: ID!
    titre: String!
    description: String
    equipe: [User!]!
    tuteur: User!
    status: String!
    deliverables: [Deliverable!]!
    evaluations: [Evaluation!]!
    progression: Float
    predictedPerformance: Float
  }

  type Deliverable {
    name: String!
    deadline: String!
    status: String!
    repositoryUrl: String!
  }

  type Evaluation {
    _id: ID!
    projet_id: Project!
    evaluateur_id: User!
    score: Int!
    comments: String
  }

  type Query {
    projects: [Project!]!
    project(id: ID!): Project
    users: [User!]!
    user(id: ID!): User

    # 🤖 Requêtes IA
    getProjectProgress(id: ID!): Float
    getPredictedPerformance(id: ID!): Float
    getSmartTutor(id: ID!): User
  }

  type Mutation {
    # 🛠️ Projets
    createProject(
      titre: String!
      description: String
      equipe: [ID!]!
      tuteur: ID!
      deliverables: [DeliverableInput!]!
      skills: [String!]!
    ): Project

    addEvaluation(
      projectId: ID!
      evaluation: EvaluationInput!
    ): Project

    # 🤖 Mutations IA
    predictPerformance(projectId: ID!): Float
    assignSmartTutor(projectId: ID!): Project
    setupReminders(projectId: ID!): String
  }

  input DeliverableInput {
    name: String!
    deadline: String! # ISO date string
    status: String
    repositoryUrl: String!
  }

  input EvaluationInput {
    projet_id: ID!
    evaluateur_id: ID!
    score: Int!
    comments: String
  }
`;

const resolvers = {
    Query: {
        projects: async () => await Project.find().populate(['equipe', 'tuteur']),
        project: async (_, { id }) => await Project.findById(id).populate(['equipe', 'tuteur', 'evaluations']),
        users: async () => await User.find(),
        user: async (_, { id }) => await User.findById(id),

        // 🔍 Requêtes IA
        getProjectProgress: async (_, { id }) => await IaService.trackProgress(id),
        getPredictedPerformance: async (_, { id }) => await IaService.predictPerformance(id),
        getSmartTutor: async (_, { id }) => await IaService.matchTutor(id)
    },

    Mutation: {
        createProject: async (_, args) => {
            // ✅ Validation centralisée avec Joi
            const { error } = graphqlCreateProjectSchema.validate(args, { abortEarly: false });
            if (error) {
                throw new Error('Erreur de validation :\n' + error.details.map(e => e.message).join('\n'));
            }

            const newProject = new Project(args);
            await newProject.save();

            // 🤖 Appels IA post-création
            await IaService.trackProgress(newProject._id);
            await IaService.predictPerformance(newProject._id);
            await IaService.setupReminders(newProject._id);

            return newProject;
        },

        addEvaluation: async (_, { projectId, evaluation }) => {
            const project = await Project.findById(projectId);
            if (!project) throw new Error('Projet non trouvé');

            const newEvaluation = await Evaluation.create(evaluation);
            project.evaluations.push(newEvaluation._id);
            await project.save();

            return project;
        },

        predictPerformance: async (_, { projectId }) => {
            return await IaService.predictPerformance(projectId);
        },

        assignSmartTutor: async (_, { projectId }) => {
            const tutor = await IaService.matchTutor(projectId);
            await Project.findByIdAndUpdate(projectId, { tuteur: tutor._id }, { new: true });
            return await Project.findById(projectId);
        },

        setupReminders: async (_, { projectId }) => {
            await IaService.setupReminders(projectId);
            return 'Rappels programmés avec succès';
        }
    },

    Project: {
        tuteur: async (project) => await User.findById(project.tuteur),
        equipe: async (project) => await User.find({ _id: { $in: project.equipe } }),
        evaluations: async (project) => await Evaluation.find({ _id: { $in: project.evaluations } })
    },

    Evaluation: {
        projet_id: async (evaluation) => await Project.findById(evaluation.projet_id),
        evaluateur_id: async (evaluation) => await User.findById(evaluation.evaluateur_id)
    }
};

module.exports = { typeDefs, resolvers };
