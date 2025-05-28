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
    ...aiResolvers.Query,
    ...projetResolvers.Query,
    ...livrableResolvers.Query
  },
  Mutation: {
    ...aiResolvers.Mutation,
    ...projetResolvers.Mutation,
    ...livrableResolvers.Mutation
  },
  // Types spécifiques si nécessaire
};