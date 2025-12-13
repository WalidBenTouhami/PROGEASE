// src/graphql/schema.js
const { gql } = require('apollo-server-express');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const { merge } = require('lodash');

// Types de base
const baseTypeDefs = gql`
    scalar DateTime

    type Query {
        _empty: String
    }

    type Mutation {
        _empty: String
    }
`;

// Importer tous les schemas
const utilisateurTypeDefs = require('./schemas/utilisateur.schema');
const projetTypeDefs = require('./schemas/projet.schema');
const livrableTypeDefs = require('./schemas/livrable.schema');
const formationTypeDefs = require('./schemas/formation.schema');
const certificationTypeDefs = require('./schemas/certification.schema');
const quizTypeDefs = require('./schemas/quiz.schema');

// Importer tous les resolvers
const utilisateurResolvers = require('./resolvers/utilisateur.resolver');
const projetResolvers = require('./resolvers/projet.resolver');
const livrableResolvers = require('./resolvers/livrable.resolver');
const formationResolvers = require('./resolvers/formation.resolver');
const certificationResolvers = require('./resolvers/certification.resolver');
const quizResolvers = require('./resolvers/quiz.resolver');

// Fusionner tous les types
const typeDefs = [
    baseTypeDefs,
    utilisateurTypeDefs,
    projetTypeDefs,
    livrableTypeDefs,
    formationTypeDefs,
    certificationTypeDefs,
    quizTypeDefs,
];

// Fusionner tous les resolvers
const resolvers = merge(
    {},
    utilisateurResolvers,
    projetResolvers,
    livrableResolvers,
    formationResolvers,
    certificationResolvers,
    quizResolvers
);

// Créer le schema exécutable
const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
});

module.exports = schema;
