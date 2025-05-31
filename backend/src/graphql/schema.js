// src/graphql/schema.js
const { gql } = require('graphql-tag');
const { resolvers } = require('./index');

// Definition du schema GraphQL aligné avec les constantes et modèles
const typeDefs = gql`
  scalar Date

  type Query {
    health: Health!
    projets: [Projet!]!
    projet(id: ID!): Projet
    deliverables(page: Int, limit: Int, projetId: ID, statut: StatutLivrable, recherche: String, dateLimiteMin: String, dateLimiteMax: String): LivrableConnection!
    deliverable(id: ID!): Livrable
    aiRecommendations(projetId: ID!): AIRecommendations!
    analyserRisquesProjet(projetId: ID!): AnalyseRisques!
    getProjectProgress(id: ID!): Float!
    getPredictedPerformance(id: ID!): Float!
    livrablesByProjet(projetId: ID!): [Livrable!]!
    evaluations(projetId: ID): [Evaluation!]!
    evaluation(id: ID!): Evaluation
    getEvaluationStats(projectId: ID!): EvaluationStats!
  }

  type Mutation {
    createProject(input: ProjetInput!): Projet!
    updateProject(id: ID!, input: ProjetInput!): Projet!
    deleteProject(id: ID!): Boolean!
    
    addDeliverable(projectId: ID!, input: DeliverableInput!): Livrable!
    updateDeliverable(id: ID!, input: DeliverableInput!): Livrable!
    deleteDeliverable(id: ID!): Boolean!

    predictPerformance(projectId: ID!): Float!
    generateLearningRecommendations(projectId: ID!): String!

    createEvaluation(input: CreateEvaluationInput!): Evaluation!
    updateEvaluation(id: ID!, input: UpdateEvaluationInput!): Evaluation!
    deleteEvaluation(id: ID!): Boolean!
  }

  type Health {
    status: String!
    timestamp: String!
    version: String!
    environment: String!
  }

  type Projet {
    id: ID!
    titre: String!
    description: String!
    statut: StatutProjet!
    equipe: [User!]!
    tuteur: User
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
    urlDepot: String
    statut: StatutLivrable!
    projetId: ID!
    projet: Projet!
    estEnRetard: Boolean!
    creeLe: Date!
    majLe: Date!
  }

  input ProjetInput {
    titre: String!
    description: String!
    equipe: [ID!]
    tuteur: ID
    competences: [String!]!
    dateDebut: Date!
    dateFin: Date!
    statut: StatutProjet
  }

  input DeliverableInput {
    name: String!
    description: String!
    deadline: Date!
    repositoryUrl: String
    status: StatutLivrable
  }

  enum StatutProjet {
    BROUILLON
    EN_COURS
    TERMINE
    ANNULE
  }

  enum StatutLivrable {
    EN_ATTENTE
    EN_COURS
    TERMINE
    RETARD
  }

  type AIRecommendations {
    recommendations: String!
    score: Float!
    confidence: Float!
    metadata: AIMetadata!
  }

  type AIMetadata {
    modelUsed: String!
    timestamp: Date!
    processingTime: Float!
  }

  type AnalyseRisques {
    retard: Boolean!
    progression: Boolean!
    livrables: Boolean!
    equipe: Boolean!
    niveauRisque: Int!
    recommandations: [String!]!
  }

  type LivrableConnection {
    items: [Livrable!]!
    pagination: Pagination!
  }

  type Pagination {
    page: Int!
    limit: Int!
    total: Int!
    pages: Int!
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
  }

  type Evaluation {
    id: ID!
    note: Float!
    commentaire: String
    criteres: [EvaluationCritere!]!
    projet: Projet!
    evaluateur: User!
    dateEvaluation: Date!
    creeLe: Date!
    majLe: Date!
  }

  type EvaluationCritere {
    nom: String!
    note: Float!
    poids: Float!
  }

  type EvaluationStats {
    moyenneScore: Float!
    scoreMax: Float!
    scoreMin: Float!
    totalEvaluations: Int!
  }

  input CreateEvaluationInput {
    projetId: ID!
    note: Float!
    commentaire: String
    criteres: [EvaluationCritereInput!]!
  }

  input UpdateEvaluationInput {
    note: Float
    commentaire: String
    criteres: [EvaluationCritereInput!]
  }

  input EvaluationCritereInput {
    nom: String!
    note: Float!
    poids: Float!
  }

  type User {
    id: ID!
    nom: String!
    prenom: String!
    email: String!
  }
`;

module.exports = { typeDefs, resolvers };