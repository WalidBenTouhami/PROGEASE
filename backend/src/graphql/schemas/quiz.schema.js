/**
 * Schéma GraphQL pour les quiz
 *
 * @module graphql/schemas/quiz
 * @created 2025-06-01 par WalidBenTouhami
 */

'use strict';

const { gql } = require('apollo-server-express');

module.exports = gql`
    """
    Type de question
    """
    enum TypeQuestion {
        QCM
        VRAI_FAUX
        TEXTE_LIBRE
    }

    """
    Catégorie de quiz
    """
    enum CategorieQuiz {
        PROGRAMMATION
        BASE_DE_DONNEES
        RESEAUX
        SECURITE
        DEVOPS
        AUTRE
    }

    """
    Niveau de difficulté
    """
    enum NiveauDifficulte {
        DEBUTANT
        INTERMEDIAIRE
        AVANCE
        EXPERT
    }

    """
    Options de tri pour les quiz
    """
    enum TriQuiz {
        recent
        populaire
        difficulte
    }

    """
    Question du quiz
    """
    type Question {
        id: ID!
        texte: String!
        type: TypeQuestion!
        options: [String!]
        points: Int!
        explication: String
    }

    """
    Résultat détaillé d'une question
    """
    type ResultatQuestion {
        question: String!
        reponseUtilisateur: String!
        reponseCorrecte: String!
        estCorrecte: Boolean!
        points: Int!
    }

    """
    Résultat d'un quiz
    """
    type ResultatQuiz {
        score: Int!
        scoreMaximum: Int!
        pourcentage: Float!
        resultatsDetailles: [ResultatQuestion!]!
    }

    """
    Type Quiz
    """
    type Quiz {
        id: ID!
        titre: String!
        description: String!
        categorie: CategorieQuiz!
        niveau: NiveauDifficulte!
        duree: Int!
        questions: [Question!]!
        auteur: Utilisateur!
        estPublic: Boolean!
        tags: [String!]!
        nombreParticipations: Int!
        scoreMoyen: Float!
        creeLe: String!
        majLe: String!
    }

    """
    Pagination des quiz
    """
    type PaginationQuiz {
        quiz: [Quiz!]!
        page: Int!
        totalPages: Int!
        total: Int!
    }

    """
    Input pour la création d'une question
    """
    input QuestionInput {
        texte: String!
        type: TypeQuestion!
        options: [String!]
        reponseCorrecte: String!
        points: Int
        explication: String
    }

    """
    Input pour la création d'un quiz
    """
    input CreerQuizInput {
        titre: String!
        description: String!
        categorie: CategorieQuiz!
        niveau: NiveauDifficulte!
        duree: Int!
        questions: [QuestionInput!]!
        estPublic: Boolean
        tags: [String!]
    }

    """
    Input pour la mise à jour d'un quiz
    """
    input MettreAJourQuizInput {
        titre: String
        description: String
        categorie: CategorieQuiz
        niveau: NiveauDifficulte
        duree: Int
        questions: [QuestionInput!]
        estPublic: Boolean
        tags: [String!]
    }

    """
    Input pour la pagination et le filtrage des quiz
    """
    input FiltreQuizInput {
        page: Int
        limite: Int
        recherche: String
        categorie: CategorieQuiz
        niveau: NiveauDifficulte
        auteur: ID
        tri: TriQuiz
    }

    extend type Query {
        """
        Récupère un quiz par son ID
        """
        quiz(id: ID!): Quiz!

        """
        Récupère tous les quiz avec pagination et filtres
        """
        quizzes(input: FiltreQuizInput): PaginationQuiz!
    }

    extend type Mutation {
        """
        Crée un nouveau quiz
        """
        creerQuiz(input: CreerQuizInput!): Quiz!

        """
        Met à jour un quiz
        """
        mettreAJourQuiz(id: ID!, input: MettreAJourQuizInput!): Quiz!

        """
        Supprime un quiz
        """
        supprimerQuiz(id: ID!): Boolean!

        """
        Soumet des réponses à un quiz
        """
        soumettreReponses(quizId: ID!, reponses: [String!]!): ResultatQuiz!
    }
`;
