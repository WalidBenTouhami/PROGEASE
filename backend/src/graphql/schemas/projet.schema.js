const { gql } = require('apollo-server-express');
const { Enums } = require('../../config/constants');

const typeDefs = gql`
    type RiskAnalysis {
        retard: Boolean!
        progression: Int!
        livrables: [String!]!
        equipe: [String!]!
        niveauRisque: String!
        recommandations: [String!]!
    }

    type Projet {
        id: ID!
        titre: String!
        description: String!
        equipe: [Utilisateur!]!
        tuteur: Utilisateur
        competences: [String!]!
        dateDebut: DateTime!
        dateFin: DateTime!
        livrables: [Livrable!]!
        statut: StatutProjet!
        urlDepot: String
        progression: Int!
        duree: Int!
        estEnRetard: Boolean!
        creeLe: DateTime!
        majLe: DateTime!
        evaluations: [Evaluation!]!
    }

    enum StatutProjet {
        ${Object.values(Enums.StatutProjet).join('\n        ')}
    }

    input ProjetInput {
        titre: String!
        description: String!
        equipe: [ID!]!
        tuteur: ID
        competences: [String!]!
        dateDebut: DateTime!
        dateFin: DateTime!
        urlDepot: String
    }

    input ProjetUpdateInput {
        titre: String
        description: String
        equipe: [ID!]
        tuteur: ID
        competences: [String!]
        dateDebut: DateTime
        dateFin: DateTime
        statut: StatutProjet
        urlDepot: String
    }

    input FiltreProjetInput {
        titre: String
        statut: StatutProjet
        competences: [String!]
        dateDebut: DateTime
        dateFin: DateTime
        page: Int
        limit: Int
    }

    type PaginationProjet {
        projets: [Projet!]!
        total: Int!
        page: Int!
        pages: Int!
    }

    extend type Query {
        projets(input: FiltreProjetInput): PaginationProjet!
        projet(id: ID!): Projet
        mesProjets: [Projet!]!
        projetsTuteur: [Projet!]!
        analyserRisquesProjet(projetId: ID!): RiskAnalysis!
        getProjetProgress(id: ID!): Int!
        getPredictedPerformance(id: ID!): Float!
    }

    extend type Mutation {
        creerProjet(input: ProjetInput!): Projet!
        mettreAJourProjet(id: ID!, input: ProjetUpdateInput!): Projet!
        supprimerProjet(id: ID!): Boolean!
        deleteProjet(id: ID!): Boolean! @deprecated(reason: "Utilisez supprimerProjet à la place")
        ajouterMembreProjet(projetId: ID!, utilisateurId: ID!): Projet!
        retirerMembreProjet(projetId: ID!, utilisateurId: ID!): Projet!
        changerStatutProjet(id: ID!, statut: StatutProjet!): Projet!
    }
`;

module.exports = typeDefs; 