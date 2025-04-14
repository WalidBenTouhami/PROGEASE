// src/modules/formation-certification/tests/app.js

require("dotenv").config();
const express = require("express");
const connectDB = require("../../config/db");
const formationRoutes = require("backend/src/modules/formation-certification/routes/formation.routes.js");
const certificatRoutes = require("backend/src/modules/formation-certification/routes/certification.routes.js");

// Initialiser Express
const app = express();
app.use(express.json());

// Connexion à MongoDB
connectDB();

// Routes
app.use("/api/formations", formationRoutes);
app.use("/api/certificats", certificatRoutes);

module.exports = app;