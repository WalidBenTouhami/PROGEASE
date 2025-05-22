const { gql } = require('apollo-server-express');

    const typeDefs = gql`
        # 📌 Enumération StatutLivrable
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
    
        # 📌 Type d'entrée pour Livrable
        input LivrableInput {
            nom: String!
            description: String!
            dateLimite: String!
            urlDepot: String!
            statut: StatutLivrable
        }
    
        # 📌 Type Projet
        type Projet {
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

    module.exports = { typeDefs };