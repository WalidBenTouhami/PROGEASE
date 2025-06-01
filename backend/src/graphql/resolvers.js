const Projet = require('../models/projet.model');
const Livrable = require('../models/livrable.model');
const Evaluation = require('../models/evaluation.model');
const Utilisateur = require('../models/utilisateur.model');
const { generateAIAnalysis, predictPerformance, generateLearningRecommendations } = require('../services/ai.service');
const { GraphQLScalarType, Kind } = require('graphql');
const aiResolver = require('./resolvers/ai.resolver');
const projetResolver = require('./resolvers/projet.resolver');
const livrableResolver = require('./resolvers/livrable.resolver');
const evaluationResolver = require('./resolvers/evaluation.resolver');

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
        return value instanceof Date ? value.toISOString() : null;
    },
    parseValue(value) {
        return value ? new Date(value) : null;
    },
    parseLiteral(ast) {
        if (ast.kind === Kind.STRING || ast.kind === Kind.INT) {
            return new Date(ast.value);
        }
        return null;
    },
});

// Combine all resolvers
const resolvers = {
    Date: dateScalar,
    Query: {
        health: () => ({
            status: 'ok',
            timestamp: new Date().toISOString(),
            version: '2.0.0',
            environment: process.env.NODE_ENV
        }),
        ...aiResolver.Query,
        ...projetResolver.Query,
        ...livrableResolver.Query,
        ...evaluationResolver.Query
    },
    Mutation: {
        ...aiResolver.Mutation,
        ...projetResolver.Mutation,
        ...livrableResolver.Mutation,
        ...evaluationResolver.Mutation
    },
    // Type resolvers
    Projet: {
        ...projetResolver.Projet
    },
    Livrable: {
        ...livrableResolver.LivrableResolver
    },
    Evaluation: {
        ...evaluationResolver.EvaluationResolver
    }
};

module.exports = { resolvers };