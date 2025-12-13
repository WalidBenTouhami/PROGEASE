const { gql } = require('apollo-server-express');
const { Enums } = require('../../../config/constants');

const typeDefs = gql`
    type FormationRequise {
        formation: Formation!
        noteMinimale: Float!
    }

    type ConditionsCertification {
        formationsRequises: [FormationRequise!]
        quizFinal: Quiz
        noteMinimaleQuizFinal: Float
        projetFinal: Projet
    }

    type Prix {
        montant: Float!
        devise: String!
    }

    type Certification {
        id: ID!
        titre: String!
        description: String!
        niveau: String!
        image: String
        conditions: ConditionsCertification!
        competencesValidees: [String!]!
        dureeValidite: Int!
        prix: Prix!
        estActif: Boolean!
        creeLe: DateTime!
        majLe: DateTime!
    }

    type FormationTerminee {
        formation: Formation!
        dateCompletion: DateTime!
        note: Float!
    }

    type CertificationObtenu {
        id: ID!
        certification: Certification!
        utilisateur: Utilisateur!
        statut: String!
        dateObtention: DateTime
        dateExpiration: DateTime
        numeroUnique: String!
        formationsTerminees: [FormationTerminee!]
        quizFinalResultat: ResultatQuiz
        projetFinalResultat: Projet
        creeLe: DateTime!
        majLe: DateTime!
    }

    enum NiveauCertification {
        ${Object.values(Enums.NiveauFormation).join('\n        ')}
    }

    enum StatutCertification {
        ${Object.values(Enums.StatutCertification).join('\n        ')}
    }

    enum Devise {
        EUR
        USD
        GBP
    }

    input FormationRequiseInput {
        formation: ID!
        noteMinimale: Float!
    }

    input ConditionsCertificationInput {
        formationsRequises: [FormationRequiseInput!]
        quizFinal: ID
        noteMinimaleQuizFinal: Float
        projetFinal: ID
    }

    input PrixInput {
        montant: Float!
        devise: Devise!
    }

    input CertificationInput {
        titre: String!
        description: String!
        niveau: NiveauCertification!
        image: String
        conditions: ConditionsCertificationInput!
        competencesValidees: [String!]!
        dureeValidite: Int!
        prix: PrixInput!
        estActif: Boolean
    }

    input CertificationUpdateInput {
        titre: String
        description: String
        niveau: NiveauCertification
        image: String
        conditions: ConditionsCertificationInput
        competencesValidees: [String!]
        dureeValidite: Int
        prix: PrixInput
        estActif: Boolean
    }

    input FiltreCertificationInput {
        page: Int
        limit: Int
        niveau: NiveauCertification
        recherche: String
        estActif: Boolean
    }

    type PaginationCertification {
        certifications: [Certification!]!
        total: Int!
        page: Int!
        pages: Int!
    }

    type PaginationCertificationObtenu {
        certificationsObtenues: [CertificationObtenu!]!
        total: Int!
        page: Int!
        pages: Int!
    }

    extend type Query {
        certifications(input: FiltreCertificationInput): PaginationCertification!
        certification(id: ID!): Certification!
        mesCertifications: [CertificationObtenu!]!
        certificationObtenu(id: ID!): CertificationObtenu!
    }

    extend type Mutation {
        creerCertification(input: CertificationInput!): Certification!
        mettreAJourCertification(id: ID!, input: CertificationUpdateInput!): Certification!
        supprimerCertification(id: ID!): Boolean!
        commencerCertification(id: ID!): CertificationObtenu!
        terminerFormationCertification(id: ID!, formationId: ID!, note: Float!): CertificationObtenu!
        terminerQuizFinalCertification(id: ID!, resultatId: ID!): CertificationObtenu!
        terminerProjetFinalCertification(id: ID!, projetId: ID!): CertificationObtenu!
        validerCertification(id: ID!): CertificationObtenu!
    }
`;

module.exports = typeDefs;
