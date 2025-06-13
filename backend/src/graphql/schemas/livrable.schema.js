const { gql } = require('apollo-server-express');
const { Enums } = require('../../config/constants');

const typeDefs = gql`
    type Fichier {
        nom: String!
        url: String!
        type: String!
        taille: Int!
        dateUpload: DateTime!
    }

    type Commentaire {
        id: ID!
        auteur: Utilisateur!
        contenu: String!
        dateCreation: DateTime!
    }

    type Livrable {
        id: ID!
        intitule: String!
        description: String!
        type: TypeLivrable!
        projet: Projet!
        dateLimite: DateTime!
        statut: StatutLivrable!
        urlDepot: String
        fichiers: [Fichier!]!
        commentaires: [Commentaire!]!
        estEnRetard: Boolean!
        nombreCommentaires: Int!
        nombreFichiers: Int!
        creeLe: DateTime!
        majLe: DateTime!
    }

    enum TypeLivrable {
        ${Object.values(Enums.TypeLivrable).join('\n        ')}
    }

    enum StatutLivrable {
        ${Object.values(Enums.StatutLivrable).join('\n        ')}
    }

    input FichierInput {
        nom: String!
        url: String!
        type: String!
        taille: Int!
    }

    input CommentaireInput {
        contenu: String!
    }

    input LivrableInput {
        intitule: String!
        description: String!
        type: TypeLivrable!
        projetId: ID!
        dateLimite: DateTime!
        urlDepot: String
    }

    input LivrableUpdateInput {
        intitule: String
        description: String
        type: TypeLivrable
        dateLimite: DateTime
        statut: StatutLivrable
        urlDepot: String
    }

    input FiltreLivrableInput {
        projetId: ID
        type: TypeLivrable
        statut: StatutLivrable
        estEnRetard: Boolean
        page: Int
        limit: Int
    }

    type PaginationLivrable {
        livrables: [Livrable!]!
        total: Int!
        page: Int!
        pages: Int!
    }

    extend type Query {
        livrables(input: FiltreLivrableInput): PaginationLivrable!
        livrable(id: ID!): Livrable
        livrablesProjet(projetId: ID!): [Livrable!]!
        livrablesByProjet(projetId: ID!): [Livrable!]!
    }

    extend type Mutation {
        creerLivrable(input: LivrableInput!): Livrable!
        mettreAJourLivrable(id: ID!, input: LivrableUpdateInput!): Livrable!
        supprimerLivrable(id: ID!): Boolean!
        ajouterFichier(id: ID!, fichier: FichierInput!): Livrable!
        supprimerFichier(id: ID!, nomFichier: String!): Livrable!
        ajouterCommentaire(id: ID!, commentaire: CommentaireInput!): Livrable!
        supprimerCommentaire(id: ID!, commentaireId: ID!): Livrable!
        changerStatutLivrable(id: ID!, statut: StatutLivrable!): Livrable!
    }
`;

module.exports = typeDefs; 