const Quiz = require('../../models/quiz.model');
const { AuthenticationError, UserInputError } = require('apollo-server-express');

module.exports = {
    Query: {
        quiz: async (_, { id }) => {
            const quiz = await Quiz.findById(id).populate('auteur', 'nom prenom email');
            if (!quiz) {
                throw new UserInputError('Quiz non trouvé');
            }
            return quiz;
        },

        quizzes: async (_, { input = {} }) => {
            const {
                page = 1,
                limite = 10,
                recherche = '',
                categorie,
                niveau,
                auteur,
                tri = 'recent',
            } = input;

            const query = {};
            if (recherche) {
                query.$or = [
                    { titre: { $regex: recherche, $options: 'i' } },
                    { description: { $regex: recherche, $options: 'i' } },
                ];
            }
            if (categorie) query.categorie = categorie;
            if (niveau) query.niveau = niveau;
            if (auteur) query.auteur = auteur;

            const total = await Quiz.countDocuments(query);
            const totalPages = Math.ceil(total / limite);

            let sort = {};
            switch (tri) {
                case 'populaire':
                    sort = { nombreParticipations: -1 };
                    break;
                case 'difficulte':
                    sort = { niveau: 1 };
                    break;
                default:
                    sort = { creeLe: -1 };
            }

            const quiz = await Quiz.find(query)
                .sort(sort)
                .skip((page - 1) * limite)
                .limit(limite)
                .populate('auteur', 'nom prenom email');

            return {
                quiz,
                page,
                totalPages,
                total,
            };
        },
    },

    Mutation: {
        creerQuiz: async (_, { input }, { utilisateur }) => {
            if (!utilisateur) {
                throw new AuthenticationError('Vous devez être connecté pour créer un quiz');
            }

            const quiz = new Quiz({
                ...input,
                auteur: utilisateur.id,
            });

            await quiz.save();
            return quiz.populate('auteur', 'nom prenom email');
        },

        mettreAJourQuiz: async (_, { id, input }, { utilisateur }) => {
            if (!utilisateur) {
                throw new AuthenticationError('Vous devez être connecté pour modifier un quiz');
            }

            const quiz = await Quiz.findById(id);
            if (!quiz) {
                throw new UserInputError('Quiz non trouvé');
            }

            if (quiz.auteur.toString() !== utilisateur.id && utilisateur.role !== 'ADMIN') {
                throw new AuthenticationError("Vous n'êtes pas autorisé à modifier ce quiz");
            }

            Object.assign(quiz, input);
            await quiz.save();
            return quiz.populate('auteur', 'nom prenom email');
        },

        supprimerQuiz: async (_, { id }, { utilisateur }) => {
            if (!utilisateur) {
                throw new AuthenticationError('Vous devez être connecté pour supprimer un quiz');
            }

            const quiz = await Quiz.findById(id);
            if (!quiz) {
                throw new UserInputError('Quiz non trouvé');
            }

            if (quiz.auteur.toString() !== utilisateur.id && utilisateur.role !== 'ADMIN') {
                throw new AuthenticationError("Vous n'êtes pas autorisé à supprimer ce quiz");
            }

            await quiz.remove();
            return true;
        },

        soumettreReponses: async (_, { quizId, reponses }, { utilisateur }) => {
            if (!utilisateur) {
                throw new AuthenticationError(
                    'Vous devez être connecté pour soumettre des réponses'
                );
            }

            const quiz = await Quiz.findById(quizId);
            if (!quiz) {
                throw new UserInputError('Quiz non trouvé');
            }

            if (reponses.length !== quiz.questions.length) {
                throw new UserInputError('Nombre de réponses incorrect');
            }

            let score = 0;
            const resultatsDetailles = quiz.questions.map((question, index) => {
                const reponseUtilisateur = reponses[index];
                const estCorrecte = reponseUtilisateur === question.reponseCorrecte;
                if (estCorrecte) {
                    score += question.points;
                }

                return {
                    question: question.texte,
                    reponseUtilisateur,
                    reponseCorrecte: question.reponseCorrecte,
                    estCorrecte,
                    points: estCorrecte ? question.points : 0,
                };
            });

            const scoreMaximum = quiz.questions.reduce((total, q) => total + q.points, 0);
            const pourcentage = (score / scoreMaximum) * 100;

            // Mettre à jour les statistiques du quiz
            quiz.nombreParticipations += 1;
            quiz.scoreMoyen =
                (quiz.scoreMoyen * (quiz.nombreParticipations - 1) + pourcentage) /
                quiz.nombreParticipations;
            await quiz.save();

            return {
                score,
                scoreMaximum,
                pourcentage,
                resultatsDetailles,
            };
        },
    },
};
