// src/graphql/schema.js
const { gql } = require('apollo-server-express');
const { resolvers } = require('./index');
const { Enum } = require('../../config/constants');

// Definition du schema GraphQL aligné avec les constantes et modèles
const typeDefs = gql`
scalar Date

enum StatutLivrable {
  En_attente
  En_cours
  En_retard
  Termine
  Valide
  Rejete
}

enum StatutProjet {
  Brouillon
  En_cours
  Termine
  Archive
  En_retard
  A_venir
}

type Livrable {
  _id: ID!
  intitule: String!
  description: String!
  dateLimite: Date!
  projetId: ID!
  statut: StatutLivrable!
  creeLe: Date
  majLe: Date
  projet: Projet
}

input LivrableInput {
  intitule: String!
  titre: String
  description: String!
  dateLimite: Date!
  statut: StatutLivrable
  projetId: ID!
}

input LivrableUpdateInput {
  intitule: String
  titre: String
  description: String
  dateLimite: Date
  statut: StatutLivrable
}

type Projet {
  _id: ID!
  titre: String!
  description: String!
  equipe: [ID]
  tuteur: ID
  competences: [String]!
  dateDebut: Date!
  dateFin: Date!
  livrables: [Livrable]
  statut: StatutProjet!
  progression: Int
  creeLe: Date
  majLe: Date
}

input ProjetInput {
  titre: String!
  description: String!
  equipe: [ID]
  tuteur: ID
  competences: [String]!
  dateDebut: Date!
  dateFin: Date!
  statut: StatutProjet
}

type HealthCheckResult {
  status: String!
  timestamp: String!
  version: String
  message: String
}

type AIRecommendationResult {
  recommendations: [String!]
}

type AnalyzeTextResult {
  sentiment: String
  keywords: [String!]
  summary: String
  language: String
  confidence: Float
}

input AnalyzeTextOptions {
  language: String
  model: String
}

type PingResult {
  success: Boolean!
  message: String
  timestamp: String!
}

type GenerateContentMetadata {
  generationTime: String
  modelUsed: String
  tokens: Int
}

type GenerateContentResult {
  content: String!
  metadata: GenerateContentMetadata
}

input GenerateContentOptions {
  model: String
  temperature: Float
  maxTokens: Int
}

type OptimizeProjetDescriptionResult {
  originalDescription: String!
  optimizedDescription: String!
  improvements: [String!]
}

input OptimizeProjetDescriptionOptions {
  style: String
  language: String
}

type Query {
  projets: [Projet]
  projet(id: ID!): Projet
  livrables: [Livrable]
  livrable(id: ID!): Livrable
  livrablesByProjet(projetId: ID!): [Livrable]
  healthCheck: HealthCheckResult
  aiRecommendations(projetId: ID!): AIRecommendationResult
  analyzeText(text: String!, options: AnalyzeTextOptions): AnalyzeTextResult
}

type Mutation {
  creerProjet(input: ProjetInput!): Projet
  mettreAJourProjet(id: ID!, input: ProjetInput!): Projet
  supprimerProjet(id: ID!): Projet
  
  creerLivrable(input: LivrableInput!): Livrable
  ajouterLivrable(projetId: ID!, input: LivrableInput!): Livrable
  mettreAJourLivrable(livrableId: ID!, input: LivrableUpdateInput!): Livrable
  supprimerLivrable(livrableId: ID!): Livrable
  ping(message: String): PingResult
  generateContent(prompt: String!, contentType: String!, options: GenerateContentOptions): GenerateContentResult
  optimizeProjetDescription(projetId: ID!, options: OptimizeProjetDescriptionOptions): OptimizeProjetDescriptionResult
}
`;

module.exports = { typeDefs, resolvers };