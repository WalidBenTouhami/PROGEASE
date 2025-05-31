const Projet = require('../models/projet.model');
const Livrable = require('../models/livrable.model');
const Evaluation = require('../models/evaluation.model');
const User = require('../models/user.model');
const { generateAIAnalysis, predictPerformance, generateLearningRecommendations } = require('../services/ai.service');
const scalarResolvers = require('./resolvers/scalar.resolver');
const { Query: aiQuery, Mutation: aiMutation } = require('./resolvers/ai.resolver');
const { Query: projetQuery, Mutation: projetMutation, Projet: ProjetResolver } = require('./resolvers/projet.resolver');
const { Query: livrableQuery, Mutation: livrableMutation, Livrable: LivrableResolver } = require('./resolvers/livrable.resolver');
const { Query: evaluationQuery, Mutation: evaluationMutation, Evaluation: EvaluationResolver } = require('./resolvers/evaluation.resolver');
const { GraphQLScalarType } = require('graphql');
const { Kind } = require('graphql/language');

const transformId = (obj) => {
    if (!obj) return null;
    const transformed = obj.toObject ? obj.toObject() : { ...obj };
    return {
        ...transformed,
        id: transformed._id.toString()
    };
};

// Custom scalar for Date
const dateScalar = new GraphQLScalarType({
    name: 'Date',
    description: 'Date custom scalar type',
    serialize(value) {
        return value.getTime();
    },
    parseValue(value) {
        return new Date(value);
    },
    parseLiteral(ast) {
        if (ast.kind === Kind.INT) {
            return new Date(parseInt(ast.value, 10));
        }
        return null;
    },
});

const resolvers = {
    ...scalarResolvers,
    Date: dateScalar,
    Query: {
        health: () => ({
            status: 'ok',
            timestamp: new Date().toISOString(),
            version: '2.0.0',
            environment: process.env.NODE_ENV
        }),
        healthCheck: () => 'OK',
        ...aiQuery,
        ...projetQuery,
        ...livrableQuery,
        ...evaluationQuery
    },
    Mutation: {
        ...aiMutation,
        ...projetMutation,
        ...livrableMutation,
        ...evaluationMutation
    },
    Projet: ProjetResolver,
    Livrable: LivrableResolver,
    Evaluation: EvaluationResolver
};

module.exports = { resolvers };