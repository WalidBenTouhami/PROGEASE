// src/app.js
const express = require('express');  
require('dotenv').config();
const mongoose = require('mongoose');  

const app = express();
const PORT = process.env.PORT || 3000;

const cors = require('cors');


app.use(cors({
  origin: 'http://localhost:4200', 
  credentials: true               
}));
// Middleware
app.use(express.json());

const certificatRoutes = require('./routes/certificationRoutes'); // Routes pour les certificats
const formationRoutes = require('./routes/formationRoutes'); // Routes pour les formations
const utilisateurRoutes = require('./routes/utilisateurRoutes.js');  
const quizRoute = require('./routes/quizRoutes'); // Routes pour les quiz


// Routes
app.use('/api', utilisateurRoutes);
app.use('/api/certificats', certificatRoutes);  // Route pour les certificats
app.use('/api/formations', formationRoutes); 
app.use('/api/quiz', quizRoute); 


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
