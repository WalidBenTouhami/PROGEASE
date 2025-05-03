const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan'); // Importing morgan for logging
require('dotenv').config(); // Load environment variables from .env
const { ApolloServer } = require('apollo-server-express');
const { typeDefs } = require('./src/graphql/typeDefs'); // Your GraphQL schema
const { resolvers } = require('./src/graphql/resolvers'); // Your resolvers
const projectRouter = require('./src/routers/project.router');
const aiRouter = require('./src/routers/ai.router');

// Initialize Express application
const app = express();

// Retrieve environment variables
const MONGO_URI = process.env.MONGO_URI;
const PORT = process.env.PORT || 3000; // Default to 3000 if PORT is not defined

// Check for critical environment variables
if (!MONGO_URI) {
    console.error('Error: MONGO_URI is missing in environment variables.');
    process.exit(1); // Terminate process if MONGO_URI is missing
}

// Middleware
app.use(morgan('dev')); // Logging middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Middleware to parse incoming JSON requests

// Initialize Apollo Server
const server = new ApolloServer({
    typeDefs,
    resolvers,
});

// Start Apollo Server and apply middleware to Express app
async function startServer() {
    await server.start();
    server.applyMiddleware({ app }); // Apply Apollo middleware
}

// Connect to MongoDB using mongoose
mongoose
    .connect(MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch((err) => {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1); // Terminate process if MongoDB connection fails
    });

// Define routes
app.get('/', (req, res) => {
    res.send('API PROGEASE is working correctly');
});

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date() });
});

app.use('/api/projects', projectRouter); // Project-related routes
app.use('/api/v1/ai', aiRouter); // AI-related routes

// Handle undefined routes
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Global error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal server error' });
});

// Start both Apollo Server and Express
startServer().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Apollo Server is ready at http://localhost:${PORT}${server.graphqlPath}`);
        console.log(`✅ Server started on port ${PORT}`);
    });
});