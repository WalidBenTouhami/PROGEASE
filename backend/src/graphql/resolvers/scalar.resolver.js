/**
 * Resolvers GraphQL pour les scalaires personnalises
 *
 * @module graphql/resolvers/scalar
 * @created 2025-05-27 par WalidBenTouhami
 */

'use strict';

const { GraphQLScalarType, Kind } = require('graphql');

// Scalar Date personnalise
const DateScalar = new GraphQLScalarType({
    name: 'Date',
    description: 'Type Date personnalise',

    // Serialization du serveur vers le client
    serialize(value) {
        if (value instanceof Date) {
            return value.toISOString();
        }
        return null;
    },

    // Parsing du client vers le serveur (variables)
    parseValue(value) {
        if (typeof value === 'string') {
            const date = new Date(value);
            if (!isNaN(date.getTime())) {
                return date;
            }
        }
        return null;
    },

    // Parsing du client vers le serveur (literals)
    parseLiteral(ast) {
        if (ast.kind === Kind.STRING) {
            const date = new Date(ast.value);
            if (!isNaN(date.getTime())) {
                return date;
            }
        }
        return null;
    }
});

module.exports = {
    Date: DateScalar,
    // Vous pouvez ajouter d'autres scalaires ici
};