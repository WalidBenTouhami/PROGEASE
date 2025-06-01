/**
 * Fonctions de mappage pour les quiz
 * @module utils/mappers/quiz
 */

'use strict';

const Quiz = require('../quiz.class');

/**
 * Mappe un document MongoDB vers un objet Quiz
 * @param {Object} doc - Document MongoDB
 * @returns {Quiz} - Instance de la classe Quiz
 */
function mapperMongoVersQuiz(doc) {
    if (!doc) return null;

    const quiz = new Quiz(
        doc._id,
        doc.titre,
        doc.description,
        doc.categorie,
        doc.niveau,
        doc.duree,
        doc.questions,
        doc.auteur
    );

    quiz.estPublic = doc.estPublic;
    quiz.tags = doc.tags;
    quiz.participations = doc.participations;
    quiz.nombreParticipations = doc.nombreParticipations;
    quiz.scoreTotal = doc.scoreTotal;
    quiz.scoreMoyen = doc.scoreMoyen;
    quiz.creeLe = doc.creeLe;
    quiz.majLe = doc.majLe;

    return quiz;
}

/**
 * Mappe un objet Quiz vers un document MongoDB
 * @param {Quiz} quiz - Instance de la classe Quiz
 * @returns {Object} - Document pour MongoDB
 */
function mapperQuizVersMongo(quiz) {
    return {
        titre: quiz.titre,
        description: quiz.description,
        categorie: quiz.categorie,
        niveau: quiz.niveau,
        duree: quiz.duree,
        questions: quiz.questions.map(q => ({
            texte: q.texte,
            type: q.type,
            options: q.options,
            reponseCorrecte: q.reponseCorrecte,
            points: q.points || 1,
            explication: q.explication
        })),
        auteur: quiz.auteur,
        estPublic: quiz.estPublic,
        tags: quiz.tags,
        participations: quiz.participations,
        nombreParticipations: quiz.nombreParticipations,
        scoreTotal: quiz.scoreTotal,
        scoreMoyen: quiz.scoreMoyen,
        creeLe: quiz.creeLe,
        majLe: quiz.majLe
    };
}

/**
 * Mappe un document MongoDB vers une réponse API
 * @param {Object} doc - Document MongoDB
 * @returns {Object} - Réponse API
 */
function mapperMongoVersAPI(doc) {
    if (!doc) return null;

    return {
        id: doc._id.toString(),
        titre: doc.titre,
        description: doc.description,
        categorie: doc.categorie,
        niveau: doc.niveau,
        duree: doc.duree,
        questions: doc.questions.map(q => ({
            id: q._id.toString(),
            texte: q.texte,
            type: q.type,
            options: q.options,
            points: q.points || 1,
            explication: q.explication
        })),
        auteur: doc.auteur,
        estPublic: doc.estPublic,
        tags: doc.tags,
        stats: {
            nombreParticipations: doc.nombreParticipations || 0,
            scoreMoyen: doc.scoreMoyen || 0,
            tauxReussite: doc.nombreParticipations > 0 ?
                (doc.participations.filter(p => p.score >= doc.scoreMaximum * 0.7).length / doc.nombreParticipations) * 100 : 0
        },
        creeLe: doc.creeLe.toISOString(),
        majLe: doc.majLe.toISOString()
    };
}

/**
 * Mappe un document MongoDB vers une réponse GraphQL
 * @param {Object} doc - Document MongoDB
 * @returns {Object} - Réponse GraphQL
 */
function mapperMongoVersGraphQL(doc) {
    if (!doc) return null;

    return {
        id: doc._id.toString(),
        titre: doc.titre || '',
        description: doc.description || '',
        categorie: doc.categorie || 'AUTRE',
        niveau: doc.niveau || 'DEBUTANT',
        duree: doc.duree || 0,
        questions: (doc.questions || []).map(q => ({
            id: q._id.toString(),
            texte: q.texte,
            type: q.type,
            options: q.options || [],
            points: q.points || 1,
            explication: q.explication || ''
        })),
        auteur: doc.auteur,
        estPublic: doc.estPublic || false,
        tags: doc.tags || [],
        nombreParticipations: doc.nombreParticipations || 0,
        scoreMoyen: doc.scoreMoyen || 0,
        creeLe: doc.creeLe ? doc.creeLe.toISOString() : null,
        majLe: doc.majLe ? doc.majLe.toISOString() : null
    };
}

module.exports = {
    mapperMongoVersQuiz,
    mapperQuizVersMongo,
    mapperMongoVersAPI,
    mapperMongoVersGraphQL
}; 