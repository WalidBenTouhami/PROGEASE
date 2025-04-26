const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); // Charge les variables d'environnement depuis le fichier .env
const projectRouter = require('./src/routers/project.router');

const app = express();

// Récupération des variables d'environnement
const MONGO_URI = process.env.MONGO_URI;
const PORT = process.env.PORT || 3000; // Fallback sur 3000 si PORT est manquant

// Vérification des variables critiques
if (!MONGO_URI) {
    console.error('Erreur : La variable MONGO_URI est manquante dans le fichier .env');
    process.exit(1);
}

// Middleware
app.use(cors());
app.use(express.json());

// Connexion à MongoDB avec mongoose
mongoose
    .connect(MONGO_URI)
    .then(() => console.log('✅ Connecté à MongoDB'))
    .catch((err) => {
        console.error('❌ Erreur de connexion à MongoDB :', err);
        process.exit(1); // Arrête le serveur si la connexion échoue
    });

// Routes
app.get('/', (req, res) => {
    res.send('API PROGEASE fonctionne correctement');
});

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date() });
});

app.use('/api/projects', projectRouter);
app.use('/api/v1/ai', require('./src/routers/ai.router'));

// Gestion des routes non définies
app.use((req, res) => {
    res.status(404).json({ error: 'Route non trouvée' });
});

// Gestion des erreurs globales
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Erreur interne du serveur' });
});

// Démarrage du serveur
app.listen(PORT, () => {
    console.log(`✅ Serveur démarré sur le port ${PORT}`);
});