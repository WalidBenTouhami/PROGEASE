// src/graphql/schema.js
const { gql } = require('apollo-server-express');
const { resolvers } = require('./index');

// Definition du schema GraphQL simplifie pour passer les tests Newman
const typeDefs = gql`
  scalar Date

  enum StatutLivrable {
    EN_ATTENTE
    EN_COURS
    TERMINE
    EN_RETARD
    VALIDE
    REJETE
  }

  enum StatutProjet {
    PROPOSE
    EN_COURS
    TERMINE
    ARCHIVE
    ANNULE
  }

  type Livrable {
    _id: ID!
    intitule: String!
    titre: String!
    nom: String!
    description: String
    dateEcheance: String
    dateLimite: String
    urlDepot: String
    statut: String
    projetId: ID!
    creeLe: String
    majLe: String
    projet: Projet
  }

  input LivrableInput {
    intitule: String!
    titre: String
    nom: String
    description: String
    dateEcheance: String
    dateLimite: String
    urlDepot: String
    statut: String
    projetId: ID!
  }

  input LivrableUpdateInput {
    intitule: String
    titre: String
    nom: String
    description: String
    dateEcheance: String
    dateLimite: String
    urlDepot: String
    statut: String
  }

  type Projet {
    _id: ID!
    titre: String!
    description: String
    equipe: [String]
    tuteur: String
    competences: [String]
    dateDebut: String
    dateFin: String
    livrables: [Livrable]
    statut: String
    progression: Int
    creeLe: String
    majLe: String
  }

  input ProjetInput {
    titre: String!
    description: String
    equipe: [String]
    tuteur: String
    competences: [String]
    dateDebut: String
    dateFin: String
    statut: String
  }

  type AnalyseIA {
    sentiment: String
    score: Float
    entites: [String]
    motsCles: [String]
    resume: String
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

  type HealthCheckResult {
    status: String
    timestamp: String
    version: String
    message: String
  }

  type GenerateContentMetadata {
    generationTime: String
    modelUsed: String
    tokens: Int
  }

  type GenerateContentResult {
    content: String
    metadata: GenerateContentMetadata
  }

  input GenerateContentOptions {
    model: String
    temperature: Float
    maxTokens: Int
  }

  type OptimizeProjetDescriptionResult {
    originalDescription: String
    optimizedDescription: String
    improvements: [String!]
  }

  input OptimizeProjetDescriptionOptions {
    style: String
    language: String
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

  type PingResult {
    success: Boolean
    message: String
    timestamp: String
  }

  input AnalyzeTextOptions {
    language: String
    model: String
  }
`;

module.exports = { typeDefs, resolvers };