// src/modules/user-management/app.js

const express = require('express');
const mongoose = require('mongoose');
const userRoutes = require('./routes/user.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Routes
app.use('/api', userRoutes);

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/project-management-app', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((error) => {
    console.error('Error connecting to MongoDB:', error);
});

// Route pour la page d'accueil
app.get('/', (req, res) => {
    res.send('<h1>Welcome to PROGEASE !</h1>');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
