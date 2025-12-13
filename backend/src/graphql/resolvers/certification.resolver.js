const { AuthenticationError, UserInputError } = require('apollo-server-express');
const { Certification, CertificationObtenu } = require('../../models/certification.model');
const { catchAsync } = require('../../utils/catchAsync');
const { validerCertification } = require('../../validations/certification.validation');
const { Enums } = require('../../../config/constants');

const resolvers = {
    Query: {
        certifications: catchAsync(async (_, { input = {} }) => {
            const { page = 1, limit = 10, niveau, recherche, estActif } = input;
            const query = {};

            if (niveau) query.niveau = niveau;
            if (estActif !== undefined) query.estActif = estActif;
            if (recherche) {
                query.$or = [
                    { titre: { $regex: recherche, $options: 'i' } },
                    { description: { $regex: recherche, $options: 'i' } },
                ];
            }

            const certifications = await Certification.find(query)
                .skip((page - 1) * limit)
                .limit(limit)
                .sort({ creeLe: -1 });

            const total = await Certification.countDocuments(query);

            return {
                certifications,
                total,
                page,
                pages: Math.ceil(total / limit),
            };
        }),

        certification: catchAsync(async (_, { id }) => {
            const certification = await Certification.findById(id);
            if (!certification) {
                throw new UserInputError('Certification non trouvée');
            }
            return certification;
        }),

        mesCertifications: catchAsync(async (_, __, { utilisateur }) => {
            if (!utilisateur) {
                throw new AuthenticationError('Non authentifié');
            }

            return CertificationObtenu.find({ utilisateur: utilisateur.id })
                .populate('certification')
                .populate('formationsTerminees.formation')
                .populate('quizFinalResultat')
                .populate('projetFinalResultat')
                .sort({ creeLe: -1 });
        }),

        certificationObtenu: catchAsync(async (_, { id }, { utilisateur }) => {
            if (!utilisateur) {
                throw new AuthenticationError('Non authentifié');
            }

            const certificationObtenu = await CertificationObtenu.findById(id)
                .populate('certification')
                .populate('formationsTerminees.formation')
                .populate('quizFinalResultat')
                .populate('projetFinalResultat');

            if (!certificationObtenu) {
                throw new UserInputError('Certification obtenue non trouvée');
            }

            if (
                certificationObtenu.utilisateur.toString() !== utilisateur.id &&
                utilisateur.role !== 'ADMIN'
            ) {
                throw new AuthenticationError('Non autorisé à voir cette certification');
            }

            return certificationObtenu;
        }),
    },

    Mutation: {
        creerCertification: catchAsync(async (_, { input }, { utilisateur }) => {
            if (!utilisateur || utilisateur.role !== 'ADMIN') {
                throw new AuthenticationError('Non autorisé');
            }

            const { error } = validerCertification.creer(input);
            if (error) {
                throw new UserInputError(error.details[0].message);
            }

            const certification = await Certification.create(input);
            return certification;
        }),

        mettreAJourCertification: catchAsync(async (_, { id, input }, { utilisateur }) => {
            if (!utilisateur || utilisateur.role !== 'ADMIN') {
                throw new AuthenticationError('Non autorisé');
            }

            const certification = await Certification.findById(id);
            if (!certification) {
                throw new UserInputError('Certification non trouvée');
            }

            const { error } = validerCertification.mettreAJour(input);
            if (error) {
                throw new UserInputError(error.details[0].message);
            }

            Object.assign(certification, input);
            await certification.save();

            return certification;
        }),

        supprimerCertification: catchAsync(async (_, { id }, { utilisateur }) => {
            if (!utilisateur || utilisateur.role !== 'ADMIN') {
                throw new AuthenticationError('Non autorisé');
            }

            const certification = await Certification.findById(id);
            if (!certification) {
                throw new UserInputError('Certification non trouvée');
            }

            await certification.remove();
            return true;
        }),

        commencerCertification: catchAsync(async (_, { id }, { utilisateur }) => {
            if (!utilisateur) {
                throw new AuthenticationError('Non authentifié');
            }

            const certification = await Certification.findById(id);
            if (!certification) {
                throw new UserInputError('Certification non trouvée');
            }

            if (!certification.estActif) {
                throw new UserInputError("Cette certification n'est plus active");
            }

            const certificationExistante = await CertificationObtenu.findOne({
                certification: id,
                utilisateur: utilisateur.id,
            });

            if (certificationExistante) {
                throw new UserInputError('Vous avez déjà commencé cette certification');
            }

            const certificationObtenu = await CertificationObtenu.create({
                certification: id,
                utilisateur: utilisateur.id,
                statut: Enums.StatutCertification.EN_COURS,
            });

            return certificationObtenu.populate('certification');
        }),

        terminerFormationCertification: catchAsync(
            async (_, { id, formationId, note }, { utilisateur }) => {
                if (!utilisateur) {
                    throw new AuthenticationError('Non authentifié');
                }

                const certificationObtenu = await CertificationObtenu.findById(id);
                if (!certificationObtenu) {
                    throw new UserInputError('Certification obtenue non trouvée');
                }

                if (certificationObtenu.utilisateur.toString() !== utilisateur.id) {
                    throw new AuthenticationError('Non autorisé');
                }

                const certification = await Certification.findById(
                    certificationObtenu.certification
                );
                const formationRequise = certification.conditions.formationsRequises.find(
                    f => f.formation.toString() === formationId
                );

                if (!formationRequise) {
                    throw new UserInputError(
                        "Cette formation n'est pas requise pour cette certification"
                    );
                }

                if (note < formationRequise.noteMinimale) {
                    throw new UserInputError(
                        `Note insuffisante. Note minimale requise: ${formationRequise.noteMinimale}`
                    );
                }

                const formationTerminee = {
                    formation: formationId,
                    dateCompletion: new Date(),
                    note,
                };

                certificationObtenu.formationsTerminees.push(formationTerminee);
                await certificationObtenu.save();

                return certificationObtenu
                    .populate('certification')
                    .populate('formationsTerminees.formation');
            }
        ),

        terminerQuizFinalCertification: catchAsync(
            async (_, { id, resultatId }, { utilisateur }) => {
                if (!utilisateur) {
                    throw new AuthenticationError('Non authentifié');
                }

                const certificationObtenu = await CertificationObtenu.findById(id);
                if (!certificationObtenu) {
                    throw new UserInputError('Certification obtenue non trouvée');
                }

                if (certificationObtenu.utilisateur.toString() !== utilisateur.id) {
                    throw new AuthenticationError('Non autorisé');
                }

                const certification = await Certification.findById(
                    certificationObtenu.certification
                );
                if (!certification.conditions.quizFinal) {
                    throw new UserInputError('Cette certification ne nécessite pas de quiz final');
                }

                certificationObtenu.quizFinalResultat = resultatId;
                await certificationObtenu.save();

                return certificationObtenu.populate('certification').populate('quizFinalResultat');
            }
        ),

        terminerProjetFinalCertification: catchAsync(
            async (_, { id, projetId }, { utilisateur }) => {
                if (!utilisateur) {
                    throw new AuthenticationError('Non authentifié');
                }

                const certificationObtenu = await CertificationObtenu.findById(id);
                if (!certificationObtenu) {
                    throw new UserInputError('Certification obtenue non trouvée');
                }

                if (certificationObtenu.utilisateur.toString() !== utilisateur.id) {
                    throw new AuthenticationError('Non autorisé');
                }

                const certification = await Certification.findById(
                    certificationObtenu.certification
                );
                if (!certification.conditions.projetFinal) {
                    throw new UserInputError(
                        'Cette certification ne nécessite pas de projet final'
                    );
                }

                certificationObtenu.projetFinalResultat = projetId;
                await certificationObtenu.save();

                return certificationObtenu
                    .populate('certification')
                    .populate('projetFinalResultat');
            }
        ),

        validerCertification: catchAsync(async (_, { id }, { utilisateur }) => {
            if (!utilisateur || utilisateur.role !== 'ADMIN') {
                throw new AuthenticationError('Non autorisé');
            }

            const certificationObtenu =
                await CertificationObtenu.findById(id).populate('certification');
            if (!certificationObtenu) {
                throw new UserInputError('Certification obtenue non trouvée');
            }

            const certification = certificationObtenu.certification;
            const conditions = certification.conditions;

            // Vérifier les formations requises
            const formationsRequises = conditions.formationsRequises || [];
            const formationsTerminees = certificationObtenu.formationsTerminees || [];

            if (formationsRequises.length > 0) {
                const toutesFormationsTerminees = formationsRequises.every(req =>
                    formationsTerminees.some(
                        term =>
                            term.formation.toString() === req.formation.toString() &&
                            term.note >= req.noteMinimale
                    )
                );

                if (!toutesFormationsTerminees) {
                    throw new UserInputError(
                        "Toutes les formations requises n'ont pas été terminées avec succès"
                    );
                }
            }

            // Vérifier le quiz final si requis
            if (conditions.quizFinal && !certificationObtenu.quizFinalResultat) {
                throw new UserInputError("Le quiz final n'a pas été complété");
            }

            // Vérifier le projet final si requis
            if (conditions.projetFinal && !certificationObtenu.projetFinalResultat) {
                throw new UserInputError("Le projet final n'a pas été complété");
            }

            // Valider la certification
            certificationObtenu.statut = Enums.StatutCertification.VALIDE;
            certificationObtenu.dateObtention = new Date();
            certificationObtenu.dateExpiration = new Date(
                Date.now() + certification.dureeValidite * 24 * 60 * 60 * 1000
            );

            await certificationObtenu.save();

            return certificationObtenu
                .populate('certification')
                .populate('formationsTerminees.formation')
                .populate('quizFinalResultat')
                .populate('projetFinalResultat');
        }),
    },

    Certification: {
        conditions: async parent => {
            return parent
                .populate('conditions.formationsRequises.formation')
                .populate('conditions.quizFinal')
                .populate('conditions.projetFinal')
                .then(c => c.conditions);
        },
    },

    CertificationObtenu: {
        certification: async parent => {
            return parent.populate('certification').then(co => co.certification);
        },
        utilisateur: async parent => {
            return parent.populate('utilisateur').then(co => co.utilisateur);
        },
        formationsTerminees: async parent => {
            return parent
                .populate('formationsTerminees.formation')
                .then(co => co.formationsTerminees);
        },
        quizFinalResultat: async parent => {
            return parent.populate('quizFinalResultat').then(co => co.quizFinalResultat);
        },
        projetFinalResultat: async parent => {
            return parent.populate('projetFinalResultat').then(co => co.projetFinalResultat);
        },
    },
};

module.exports = resolvers;
