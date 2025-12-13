const { gql } = require('apollo-server-express');
const { Enums } = require('../../config/constants');

const typeDefs = gql`
    type Video {
        titre: String!
        url: String!
        duree: Int!
    }

    type Document {
        titre: String!
        url: String!
        type: String!
    }

    type Module {
        id: ID!
        titre: String!
        description: String!
        ordre: Int!
        duree: Int!
        contenu: ContenuModule!
        estObligatoire: Boolean!
    }

    type ContenuModule {
        videos: [Video!]!
        documents: [Document!]!
        quiz: [Quiz!]!
    }

    type Participant {
        utilisateur: Utilisateur!
        dateInscription: DateTime!
        progression: Int!
        modulesTermines: [ID!]!
        dernierAcces: DateTime
    }

    type AvisFormation {
        utilisateur: Utilisateur!
        note: Int!
        commentaire: String
        date: DateTime!
    }

    type Formation {
        id: ID!
        titre: String!
        description: String!
        type: TypeFormation!
        niveau: NiveauFormation!
        categorie: CategorieFormation!
        image: String!
        dureeEstimee: Int!
        prerequis: [String!]!
        objectifs: [String!]!
        modules: [Module!]!
        formateur: Utilisateur!
        participants: [Participant!]!
        evaluations: [AvisFormation!]!
        noteMoyenne: Float!
        nombreParticipants: Int!
        estPublie: Boolean!
        datePublication: DateTime
        creeLe: DateTime!
        majLe: DateTime!
    }

    enum TypeFormation {
        ${Object.values(Enums.TypeFormation).join('\n        ')}
    }

    enum NiveauFormation {
        ${Object.values(Enums.NiveauFormation).join('\n        ')}
    }

    enum CategorieFormation {
        DEVELOPPEMENT_WEB
        DEVELOPPEMENT_MOBILE
        DEVOPS
        INTELLIGENCE_ARTIFICIELLE
        SCIENCE_DONNEES
        GESTION_PROJET
        SECURITE
        CLOUD
        BASE_DONNEES
        AUTRE
    }

    input VideoInput {
        titre: String!
        url: String!
        duree: Int!
    }

    input DocumentInput {
        titre: String!
        url: String!
        type: String!
    }

    input ModuleInput {
        titre: String!
        description: String!
        ordre: Int!
        duree: Int!
        contenu: ContenuModuleInput!
        estObligatoire: Boolean
    }

    input ContenuModuleInput {
        videos: [VideoInput!]!
        documents: [DocumentInput!]!
        quiz: [ID!]
    }

    input FormationInput {
        titre: String!
        description: String!
        type: TypeFormation!
        niveau: NiveauFormation!
        categorie: CategorieFormation!
        image: String
        prerequis: [String!]!
        objectifs: [String!]!
        modules: [ModuleInput!]!
        formateur: ID!
    }

    input FormationUpdateInput {
        titre: String
        description: String
        type: TypeFormation
        niveau: NiveauFormation
        categorie: CategorieFormation
        image: String
        prerequis: [String!]
        objectifs: [String!]
        modules: [ModuleInput!]
        estPublie: Boolean
    }

    input FiltreFormationInput {
        type: TypeFormation
        niveau: NiveauFormation
        categorie: CategorieFormation
        recherche: String
        page: Int
        limit: Int
    }

    type PaginationFormation {
        formations: [Formation!]!
        total: Int!
        page: Int!
        pages: Int!
    }

    extend type Query {
        formations(input: FiltreFormationInput): PaginationFormation!
        formation(id: ID!): Formation
        mesFormations: [Formation!]!
        formationsFormateur: [Formation!]!
    }

    extend type Mutation {
        creerFormation(input: FormationInput!): Formation!
        mettreAJourFormation(id: ID!, input: FormationUpdateInput!): Formation!
        supprimerFormation(id: ID!): Boolean!
        sInscrireFormation(id: ID!): Formation!
        seDesinscrireFormation(id: ID!): Boolean!
        evaluerFormation(id: ID!, note: Int!, commentaire: String): Formation!
        terminerModule(id: ID!, moduleId: ID!): Formation!
    }
`;

module.exports = typeDefs;
