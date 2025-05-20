const { gql } = require('apollo-server-express');

const typeDefs = gql`
    # 📌 Enumération StatutLivrable
    enum StatutLivrable {
        EN_RETARD
        EN_ATTENTE
        TERMINE
    }

    # 📌 Type livrable
    type Deliverable {
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

    # 📌 Type d'entrée pour livrable (corrige l'erreur !)
    input DeliverableInput {
        nom: String!
        description: String!
        dateLimite: String!
        urlDepot: String!
        statut: StatutLivrable
    }

    # 📌 Type projet
    type Projet {
        _id: ID!
        titre: String!
        description: String!
        equipe: [ID!]!
        tuteur: ID
        competences: [String!]!
        dateDebut: String!
        dateFin: String!
        livrables: [Deliverable!]!
        statut: String!
        progression: Int
        creeLe: String
        majLe: String
    }

    # 📌 Type Query
    type Query {
        projets: [Projet!]!
        projet(id: ID!): Projet
        livrables(projetId: ID!): [Deliverable!]!
        livrable(id: ID!): Deliverable
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

        ajouterLivrable(projetId: ID!, input: DeliverableInput!): Deliverable

        mettreAJourLivrable(livrableId: ID!, input: DeliverableInput!): Deliverable

        supprimerLivrable(livrableId: ID!): Deliverable
    }
`;

module.exports = { typeDefs };