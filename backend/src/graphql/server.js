const { ApolloServer } = require('apollo-server-express');
const { typeDefs } = require('./typeDefs');
const { resolvers } = require('./resolvers');

const createApolloServer = () => {
    return new ApolloServer({
        typeDefs,
        resolvers,
        context: ({ req }) => {
            // Add authentication context here if needed
            return {
                // Add any context properties here
            };
        },
        formatError: (error) => {
            // Remove internal server error details from production
            if (process.env.NODE_ENV === 'production') {
                return {
                    message: 'Internal server error',
                    path: error.path
                };
            }
            return error;
        }
    });
};

module.exports = { createApolloServer }; 