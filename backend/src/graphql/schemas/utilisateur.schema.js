/**
 * Schéma GraphQL pour les utilisateurs
 *
 * @module graphql/schemas/utilisateur
 * @created 2025-06-01 par WalidBenTouhami
 */

'use strict';

const { gql } = require('apollo-server-express');

const typeDefs = gql`
    """
    Statut d'un utilisateur
    """
    enum StatutUtilisateur {
        ACTIF
        INACTIF
        SUSPENDU
        SUPPRIME
    }

    """
    Rôle d'un utilisateur
    """
    enum RoleUtilisateur {
        ETUDIANT
        ENSEIGNANT
        ADMIN
        MODERATEUR
    }

    """
    Options de tri pour les utilisateurs
    """
    enum TriUtilisateur {
        recent
        alphabetique
        activite
    }

    """
    Type Utilisateur
    """
    type Utilisateur {
        id: ID!
        nom: String!
        prenom: String!
        email: String!
        telephone: String
        dateNaissance: String!
        avatar: String
        bio: String
        roles: [RoleUtilisateur!]!
        statut: StatutUtilisateur!
        dernierConnexion: String
        creeLe: String!
        majLe: String!
        role: UtilisateurRole!
        estActif: Boolean!
        emailVerifie: Boolean!
        dateEmailVerifie: DateTime
        projets: [Projet]
        formations: [Formation]
        certifications: [Certification]
        derniereConnexion: DateTime
    }

    """
    Pagination des utilisateurs
    """
    type PaginationUtilisateur {
        utilisateurs: [Utilisateur!]!
        page: Int!
        totalPages: Int!
        total: Int!
    }

    """
    Input pour la création d'un utilisateur
    """
    input CreerUtilisateurInput {
        nom: String!
        prenom: String!
        email: String!
        motDePasse: String!
        telephone: String
        dateNaissance: String!
        avatar: String
        bio: String
        roles: [RoleUtilisateur!]!
    }

    """
    Input pour la mise à jour d'un utilisateur
    """
    input MettreAJourUtilisateurInput {
        nom: String
        prenom: String
        email: String
        telephone: String
        dateNaissance: String
        avatar: String
        bio: String
        roles: [RoleUtilisateur!]
        statut: StatutUtilisateur
    }

    """
    Input pour la pagination et le filtrage des utilisateurs
    """
    input FiltreUtilisateurInput {
        page: Int
        limite: Int
        recherche: String
        role: RoleUtilisateur
        statut: StatutUtilisateur
        tri: TriUtilisateur
    }

    enum UtilisateurRole {
        ADMIN
        TUTEUR
        ETUDIANT
        MODERATEUR
    }

    input UtilisateurInput {
        nom: String!
        prenom: String!
        email: String!
        motDePasse: String!
        role: UtilisateurRole
        avatar: String
    }

    input UtilisateurUpdateInput {
        nom: String
        prenom: String
        email: String
        avatar: String
        estActif: Boolean
    }

    type AuthPayload {
        token: String!
        utilisateur: Utilisateur!
    }

    extend type Query {
        """
        Récupère un utilisateur par son ID
        """
        utilisateur(id: ID!): Utilisateur!

        """
        Récupère tous les utilisateurs avec pagination et filtres
        """
        utilisateurs(input: FiltreUtilisateurInput): PaginationUtilisateur!

        monProfil: Utilisateur
    }

    extend type Mutation {
        """
        Crée un nouvel utilisateur
        """
        creerUtilisateur(input: CreerUtilisateurInput!): Utilisateur!

        """
        Met à jour un utilisateur
        """
        mettreAJourUtilisateur(id: ID!, input: MettreAJourUtilisateurInput!): Utilisateur!

        """
        Supprime un utilisateur
        """
        supprimerUtilisateur(id: ID!): Boolean!

        """
        Change le mot de passe d'un utilisateur
        """
        changerMotDePasse(id: ID!, ancienMotDePasse: String!, nouveauMotDePasse: String!): Boolean!

        inscription(input: UtilisateurInput!): AuthPayload!
        connexion(email: String!, motDePasse: String!): AuthPayload!
        mettreAJourMonProfil(input: UtilisateurUpdateInput!): Utilisateur!
        verifierEmail(token: String!): Boolean!
    }
`;

module.exports = typeDefs;
