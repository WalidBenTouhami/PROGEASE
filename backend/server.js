// ./backend/server.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { ApolloServer } = require('apollo-server-express');
const { typeDefs } = require('./src/graphql/typeDefs');
const { resolvers } = require('./src/graphql/resolvers');
const { MONGO_URI, PORT } = require('./config/constants');
const projectRouter = require('./src/routers/project.router');
const deliverableRouter = require('./src/routers/deliverable.router');
const aiRouter = require('./src/routers/ai.router'); // ✅ Import AI Router
const evaluationRouter = require('./src/routers/evaluation.router');

const app = express();

// CORS configuration
app.use(cors({
  origin: ['http://localhost:4200', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Connect to MongoDB
mongoose.connect(MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Create Apollo Server
const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {
        // Add authentication context here if needed
        return {
            // Add any context properties here
        };
    },
    formatError: (error) => {
        console.error('GraphQL Error:', error); // Add this for debugging
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

// Start Apollo Server
async function startServer() {
    await apolloServer.start();
    apolloServer.applyMiddleware({ 
        app, 
        path: '/graphql',
        cors: false // Disable Apollo Server's CORS as we're handling it with Express
    });

    // Basic route for health check
    app.get('/health', (req, res) => {
        res.json({ status: 'ok' });
    });

    // ✅ Define Routes
    app.get('/', (req, res) => {
        res.send('API PROGEASE is working correctly.');
    });
    app.use('/api/projects', projectRouter);
    app.use('/api/deliverables', deliverableRouter);
    app.use('/api/ai', aiRouter); // ✅ Register AI routes
    app.use('/api/evaluations', evaluationRouter);

    // ✅ Global Error Handling
    app.use((req, res) => res.status(404).json({ error: 'Route not found' }));
    app.use((err, req, res, next) => {
        console.error('Unhandled Error:', err.stack);
        res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
    });

    // Start Express server
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`GraphQL endpoint: http://localhost:${PORT}${apolloServer.graphqlPath}`);
    });
}

startServer().catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
});