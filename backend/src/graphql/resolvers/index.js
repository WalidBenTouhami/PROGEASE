// backend/src/graphql/resolvers/index.js
'use strict';

const scalarResolvers = require('./scalar.resolver');
const aiResolvers = require('./ai.resolver');
const projetResolvers = require('./projet.resolver');
const livrableResolvers = require('./livrable.resolver');

// Fusion des resolvers
module.exports = {
    ...scalarResolvers,
    Query: {
        health: () => ({
            status: 'ok',
            timestamp: new Date().toISOString(),
            version: '2.0.0',
            environment: process.env.NODE_ENV,
        }),
        ...aiResolvers.Query,
        ...projetResolvers.Query,
        ...livrableResolvers.Query,
    },
    Mutation: {
        ...aiResolvers.Mutation,
        ...projetResolvers.Mutation,
        ...livrableResolvers.Mutation,
    },
    Projet: projetResolvers.Types || {},
    Livrable: livrableResolvers.Types || {},
};
