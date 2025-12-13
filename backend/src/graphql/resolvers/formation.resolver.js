const { AuthenticationError, UserInputError } = require('apollo-server-express');
const { Formation } = require('../../models/formation.model');
const { catchAsync } = require('../../utils/catchAsync');
const { validerFormation } = require('../../validations/formation.validation');

const resolvers = {
    Query: {
        formations: catchAsync(async (_, { input = {} }) => {
            const { page = 1, limit = 10, type, niveau, categorie, recherche } = input;
            const query = { estPublie: true };

            if (type) query.type = type;
            if (niveau) query.niveau = niveau;
            if (categorie) query.categorie = categorie;
            if (recherche) {
                query.$or = [
                    { titre: { $regex: recherche, $options: 'i' } },
                    { description: { $regex: recherche, $options: 'i' } },
                ];
            }

            const formations = await Formation.find(query)
                .skip((page - 1) * limit)
                .limit(limit)
                .sort({ creeLe: -1 })
                .populate('formateur')
                .populate('participants.utilisateur')
                .populate('evaluations.utilisateur');

            const total = await Formation.countDocuments(query);

            return {
                formations,
                total,
                page,
                pages: Math.ceil(total / limit),
            };
        }),

        formation: catchAsync(async (_, { id }) => {
            const formation = await Formation.findById(id)
                .populate('formateur')
                .populate('participants.utilisateur')
                .populate('evaluations.utilisateur');

            if (!formation) {
                throw new UserInputError('Formation non trouvée');
            }

            return formation;
        }),

        mesFormations: catchAsync(async (_, __, { utilisateur }) => {
            if (!utilisateur) {
                throw new AuthenticationError('Non authentifié');
            }

            return Formation.find({
                'participants.utilisateur': utilisateur.id,
            })
                .populate('formateur')
                .populate('participants.utilisateur')
                .populate('evaluations.utilisateur')
                .sort({ creeLe: -1 });
        }),

        formationsFormateur: catchAsync(async (_, __, { utilisateur }) => {
            if (!utilisateur) {
                throw new AuthenticationError('Non authentifié');
            }

            return Formation.find({ formateur: utilisateur.id })
                .populate('formateur')
                .populate('participants.utilisateur')
                .populate('evaluations.utilisateur')
                .sort({ creeLe: -1 });
        }),
    },

    Mutation: {
        creerFormation: catchAsync(async (_, { input }, { utilisateur }) => {
            if (!utilisateur || utilisateur.role !== 'TUTEUR') {
                throw new AuthenticationError('Non autorisé');
            }

            const { error } = validerFormation.creer(input);
            if (error) {
                throw new UserInputError(error.details[0].message);
            }

            const formation = await Formation.create({
                ...input,
                formateur: utilisateur.id,
            });

            return formation.populate('formateur');
        }),

        mettreAJourFormation: catchAsync(async (_, { id, input }, { utilisateur }) => {
            if (!utilisateur) {
                throw new AuthenticationError('Non authentifié');
            }

            const formation = await Formation.findById(id);
            if (!formation) {
                throw new UserInputError('Formation non trouvée');
            }

            if (formation.formateur.toString() !== utilisateur.id && utilisateur.role !== 'ADMIN') {
                throw new AuthenticationError('Non autorisé à modifier cette formation');
            }

            const { error } = validerFormation.mettreAJour(input);
            if (error) {
                throw new UserInputError(error.details[0].message);
            }

            Object.assign(formation, input);
            if (input.estPublie && !formation.datePublication) {
                formation.datePublication = new Date();
            }

            await formation.save();

            return formation
                .populate('formateur')
                .populate('participants.utilisateur')
                .populate('evaluations.utilisateur');
        }),

        supprimerFormation: catchAsync(async (_, { id }, { utilisateur }) => {
            if (!utilisateur) {
                throw new AuthenticationError('Non authentifié');
            }

            const formation = await Formation.findById(id);
            if (!formation) {
                throw new UserInputError('Formation non trouvée');
            }

            if (formation.formateur.toString() !== utilisateur.id && utilisateur.role !== 'ADMIN') {
                throw new AuthenticationError('Non autorisé à supprimer cette formation');
            }

            await formation.remove();
            return true;
        }),

        sInscrireFormation: catchAsync(async (_, { id }, { utilisateur }) => {
            if (!utilisateur) {
                throw new AuthenticationError('Non authentifié');
            }

            const formation = await Formation.findById(id);
            if (!formation) {
                throw new UserInputError('Formation non trouvée');
            }

            if (!formation.estPublie) {
                throw new UserInputError("Cette formation n'est pas encore publiée");
            }

            const dejaInscrit = formation.participants.some(
                p => p.utilisateur.toString() === utilisateur.id
            );

            if (dejaInscrit) {
                throw new UserInputError('Vous êtes déjà inscrit à cette formation');
            }

            formation.participants.push({
                utilisateur: utilisateur.id,
                dateInscription: new Date(),
                progression: 0,
                modulesTermines: [],
            });

            await formation.save();

            return formation
                .populate('formateur')
                .populate('participants.utilisateur')
                .populate('evaluations.utilisateur');
        }),

        seDesinscrireFormation: catchAsync(async (_, { id }, { utilisateur }) => {
            if (!utilisateur) {
                throw new AuthenticationError('Non authentifié');
            }

            const formation = await Formation.findById(id);
            if (!formation) {
                throw new UserInputError('Formation non trouvée');
            }

            const participantIndex = formation.participants.findIndex(
                p => p.utilisateur.toString() === utilisateur.id
            );

            if (participantIndex === -1) {
                throw new UserInputError("Vous n'êtes pas inscrit à cette formation");
            }

            formation.participants.splice(participantIndex, 1);
            await formation.save();

            return true;
        }),

        evaluerFormation: catchAsync(async (_, { id, note, commentaire }, { utilisateur }) => {
            if (!utilisateur) {
                throw new AuthenticationError('Non authentifié');
            }

            const formation = await Formation.findById(id);
            if (!formation) {
                throw new UserInputError('Formation non trouvée');
            }

            const estInscrit = formation.participants.some(
                p => p.utilisateur.toString() === utilisateur.id
            );

            if (!estInscrit) {
                throw new UserInputError('Vous devez être inscrit pour évaluer cette formation');
            }

            const evaluationIndex = formation.evaluations.findIndex(
                e => e.utilisateur.toString() === utilisateur.id
            );

            const evaluation = {
                utilisateur: utilisateur.id,
                note,
                commentaire,
                date: new Date(),
            };

            if (evaluationIndex === -1) {
                formation.evaluations.push(evaluation);
            } else {
                formation.evaluations[evaluationIndex] = evaluation;
            }

            await formation.save();

            return formation
                .populate('formateur')
                .populate('participants.utilisateur')
                .populate('evaluations.utilisateur');
        }),

        terminerModule: catchAsync(async (_, { id, moduleId }, { utilisateur }) => {
            if (!utilisateur) {
                throw new AuthenticationError('Non authentifié');
            }

            const formation = await Formation.findById(id);
            if (!formation) {
                throw new UserInputError('Formation non trouvée');
            }

            const participant = formation.participants.find(
                p => p.utilisateur.toString() === utilisateur.id
            );

            if (!participant) {
                throw new UserInputError("Vous n'êtes pas inscrit à cette formation");
            }

            const module = formation.modules.id(moduleId);
            if (!module) {
                throw new UserInputError('Module non trouvé');
            }

            if (!participant.modulesTermines.includes(moduleId)) {
                participant.modulesTermines.push(moduleId);
                participant.progression = Math.round(
                    (participant.modulesTermines.length / formation.modules.length) * 100
                );
                participant.dernierAcces = new Date();
                await formation.save();
            }

            return formation
                .populate('formateur')
                .populate('participants.utilisateur')
                .populate('evaluations.utilisateur');
        }),
    },

    Formation: {
        formateur: async parent => {
            return parent.populate('formateur').then(f => f.formateur);
        },
        participants: async parent => {
            return parent.populate('participants.utilisateur').then(f => f.participants);
        },
        evaluations: async parent => {
            return parent.populate('evaluations.utilisateur').then(f => f.evaluations);
        },
    },
};

module.exports = resolvers;
