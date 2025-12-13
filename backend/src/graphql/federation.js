// src/graphql/schema.js
// Compatible avec Apollo Server 4+ et Apollo Federation
const { resolvers } = require('./index');

// Definition du schema GraphQL
const typeDefs = `#graphql
# Directive pour la federation Apollo v2
extend schema
@link(url: "https://specs.apollo.dev/federation/v2.3", import: ["@key"])

# 📌 Enumeration StatutLivrable
enum StatutLivrable {
    EN_RETARD
    EN_ATTENTE
    TERMINE
}

# 📌 Type Livrable
type Livrable {
    _id: ID!
    nom: String!
    description: String!
    dateLimite: String!
    urlDepot: String!
    statut: StatutLivrable!
    projetId: ID!
    creeLe: String
    majLe: String
}

# 📌 Type d'entree pour Livrable
input LivrableInput {
    nom: String!
    description: String!
    dateLimite: String!
    urlDepot: String!
    statut: StatutLivrable
}

# 📌 Type Projet avec directive de federation
type Projet @key(fields: "_id") {
    _id: ID!
    titre: String!
    description: String!
    equipe: [ID!]!
    tuteur: ID
    competences: [String!]!
    dateDebut: String!
    dateFin: String!
    livrables: [Livrable!]!
    statut: String!
    progression: Int
    creeLe: String
    majLe: String
}

# 📌 Type Query
type Query {
    projets: [Projet!]!
    projet(id: ID!): Projet
    livrables(projetId: ID!): [Livrable!]!
    livrable(id: ID!): Livrable
    health: HealthStatus
}

# 📌 Type HealthStatus pour les tests
type HealthStatus {
    status: String!
    timestamp: String!
    utilisateur: String!
}

# 📌 Type Mutation
type Mutation {
    creerProjet(
        titre: String!
        description: String!
        equipe: [ID!]!
        tuteur: ID
        competences: [String!]!
        dateDebut: String!
        dateFin: String!
        statut: String
    ): Projet

    mettreAJourProjet(
        id: ID!
        titre: String
        description: String
        equipe: [ID!]
        tuteur: ID
        competences: [String!]
        dateDebut: String
        dateFin: String
        statut: String
    ): Projet

    supprimerProjet(id: ID!): Projet

    ajouterLivrable(projetId: ID!, input: LivrableInput!): Livrable
    mettreAJourLivrable(livrableId: ID!, input: LivrableInput!): Livrable
    supprimerLivrable(livrableId: ID!): Livrable
}
`;

module.exports = { typeDefs, resolvers };
