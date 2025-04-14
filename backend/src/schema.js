const { gql } = require('apollo-server-express');
const Project = require('./modules/project-management/models/project.model');
const User = require('./modules/user-management/models/User.js');
const Evaluation = require('./modules/evaluation-system/models/Evaluation.js');
const IaService = require('./services/ia.service');
const { graphqlCreateProjectSchema } = require('./modules/project-management/schema');

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

    getProjectProgress(id: ID!): Float
    getPredictedPerformance(id: ID!): Float
    getSmartTutor(id: ID!): User
  }

  type Mutation {
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

    predictPerformance(projectId: ID!): Float
    assignSmartTutor(projectId: ID!): Project
    setupReminders(projectId: ID!): String
  }

  input DeliverableInput {
    name: String!
    deadline: String!
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
    projects: async () => {
      try {
        return await Project.find().populate(['equipe', 'tuteur']).lean();
      } catch (error) {
        throw new Error(`Erreur lors de la récupération des projets : ${error.message}`);
      }
    },
    project: async (_, { id }) => {
      try {
        return await Project.findById(id).populate(['equipe', 'tuteur', 'evaluations']).lean();
      } catch (error) {
        throw new Error(`Erreur lors de la récupération du projet : ${error.message}`);
      }
    },
    users: async () => {
      try {
        return await User.find().lean();
      } catch (error) {
        throw new Error(`Erreur lors de la récupération des utilisateurs : ${error.message}`);
      }
    },
    user: async (_, { id }) => {
      try {
        return await User.findById(id).lean();
      } catch (error) {
        throw new Error(`Erreur lors de la récupération de l'utilisateur : ${error.message}`);
      }
    },
    getProjectProgress: async (_, { id }) => {
      try {
        return await IaService.trackProgress(id);
      } catch (error) {
        throw new Error(`Erreur lors du suivi de la progression : ${error.message}`);
      }
    },
    getPredictedPerformance: async (_, { id }) => {
      try {
        return await IaService.predictPerformance(id);
      } catch (error) {
        throw new Error(`Erreur lors de la prédiction des performances : ${error.message}`);
      }
    },
    getSmartTutor: async (_, { id }) => {
      try {
        return await IaService.matchTutor(id);
      } catch (error) {
        throw new Error(`Erreur lors de la recherche du tuteur intelligent : ${error.message}`);
      }
    }
  },

  Mutation: {
    createProject: async (_, args) => {
      try {
        const { error } = graphqlCreateProjectSchema.validate(args, { abortEarly: false });
        if (error) {
          throw new Error('Erreur de validation : ' + error.details.map(e => e.message).join(', '));
        }

        const newProject = new Project(args);
        await newProject.save();

        await IaService.trackProgress(newProject._id);
        await IaService.predictPerformance(newProject._id);
        await IaService.setupReminders(newProject._id);

        return newProject;
      } catch (error) {
        throw new Error(`Erreur lors de la création du projet : ${error.message}`);
      }
    },
    addEvaluation: async (_, { projectId, evaluation }) => {
      try {
        const project = await Project.findById(projectId);
        if (!project) throw new Error('Projet non trouvé');

        const newEvaluation = await Evaluation.create(evaluation);
        project.evaluations.push(newEvaluation._id);
        await project.save();

        return project;
      } catch (error) {
        throw new Error(`Erreur lors de l'ajout de l'évaluation : ${error.message}`);
      }
    },
    predictPerformance: async (_, { projectId }) => {
      try {
        return await IaService.predictPerformance(projectId);
      } catch (error) {
        throw new Error(`Erreur lors de la prédiction des performances : ${error.message}`);
      }
    },
    assignSmartTutor: async (_, { projectId }) => {
      try {
        const tutor = await IaService.matchTutor(projectId);
        await Project.findByIdAndUpdate(projectId, { tuteur: tutor._id }, { new: true });
        return await Project.findById(projectId).lean();
      } catch (error) {
        throw new Error(`Erreur lors de l'attribution du tuteur : ${error.message}`);
      }
    },
    setupReminders: async (_, { projectId }) => {
      try {
        await IaService.setupReminders(projectId);
        return 'Rappels programmés avec succès';
      } catch (error) {
        throw new Error(`Erreur lors de la configuration des rappels : ${error.message}`);
      }
    }
  },

  Project: {
    tuteur: async (project) => await User.findById(project.tuteur).lean(),
    equipe: async (project) => await User.find({ _id: { $in: project.equipe } }).lean(),
    evaluations: async (project) => await Evaluation.find({ _id: { $in: project.evaluations } }).lean()
  },

  Evaluation: {
    projet_id: async (evaluation) => await Project.findById(evaluation.projet_id).lean(),
    evaluateur_id: async (evaluation) => await User.findById(evaluation.evaluateur_id).lean()
  }
};

module.exports = { typeDefs, resolvers };