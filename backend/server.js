// backend/server.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

// Initialisation de l'application Express
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Connexion à MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Connexion à MongoDB réussie'))
  .catch((err) => console.error('Erreur de connexion à MongoDB :', err));

// Importation des routes
const projectRouter = require('./src/routers/project.router');
const userRouter = require('./src/routers/user.router');
const forumRouter = require('./src/routers/forum.router');
const evaluationRouter = require('./src/routers/evaluation.router');
const formation&certificationRouter = require('./src/routers/formation_certification.router');

// Définition des routes
app.use('/api/v1/projects', projectRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/forums', forumRouter);
app.use('/api/v1/evaluations', evaluationRouter);
app.use('/api/v1/formations', formation&certificationRouter);

// Démarrage du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});