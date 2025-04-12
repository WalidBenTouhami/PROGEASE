require("dotenv").config();
const express = require("express");
const connectDB = require("./src/config/db");
const formationRoutes = require("./src/routes/formationRoutes");
const certificatRoutes = require("./src/routes/certificatRoutes");

// Initialiser Express
const app = express();
app.use(express.json());

// Connexion à MongoDB
connectDB();

// Routes
app.use("/api/formations", formationRoutes);
app.use("/api/certificats", certificatRoutes);

// Démarrer le serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur en écoute sur http://localhost:${PORT}`);
});