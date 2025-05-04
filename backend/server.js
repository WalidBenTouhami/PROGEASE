// ./backend/server.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const { ApolloServer } = require('apollo-server-express');
const { typeDefs } = require('./src/graphql/typeDefs');
const { resolvers } = require('./src/graphql/resolvers');
const projectRouter = require('./src/routers/project.router');
const deliverableRouter = require('./src/routers/deliverable.router');
const aiRouter = require('./src/routers/ai.router'); // ✅ Import AI Router

const app = express();
const PORT = process.env.PORT || 3000; // ✅ Fallback for missing PORT
const MONGO_URI = process.env.MONGO_URI;

// ✅ Check for critical environment variables
if (!MONGO_URI) {
    console.error('❌ Error: MONGO_URI is missing in environment variables.');
    process.exit(1);
}

// ✅ Middleware
app.use(morgan('dev')); // Logging
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Parse JSON requests

// ✅ Apollo Server Initialization
const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    formatError: (err) => {
        console.error('GraphQL Error:', err.message);
        return {
            message: err.message,
            code: err.extensions?.code || 'INTERNAL_SERVER_ERROR',
        };
    },
});

// ✅ Function to start Apollo Server
async function startApolloServer() {
    await apolloServer.start();
    apolloServer.applyMiddleware({ app });
}

// ✅ Connect to MongoDB
mongoose
    .connect(MONGO_URI) // ✅ Removed deprecated options
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch((err) => {
        console.error('❌ MongoDB connection error:', err.message);
        process.exit(1);
    });

// ✅ Define Routes
app.get('/', (req, res) => {
    res.send('API PROGEASE is working correctly.');
});
app.use('/api/projects', projectRouter);
app.use('/api/deliverables', deliverableRouter);
app.use('/api/ai', aiRouter); // ✅ Register AI routes

// ✅ Global Error Handling
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));
app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err.stack);
    res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

// ✅ Start the Application
(async () => {
    try {
        await startApolloServer();
        app.listen(PORT, () => {
            console.log(`🚀 Apollo Server running at http://localhost:${PORT}${apolloServer.graphqlPath}`);
            console.log(`✅ Express server started on port ${PORT}`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        process.exit(1);
    }
})();