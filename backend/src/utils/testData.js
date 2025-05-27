// src/utils/testData.js
const mongoose = require('mongoose');
const Projet = require('../models/projet.model');
const Livrable = require('../models/livrable.model');
const logger = require('./logger');

// Créer l'ID de test qui sera utilisé par Newman
const TEST_PROJECT_ID = new mongoose.Types.ObjectId('6064f5ca7623a9b8e7c1a123');
const TEST_LIVRABLE_ID = new mongoose.Types.ObjectId('6064f5ca7623a9b8e7c1a124');

async function createTestData() {
    try {
        // Vérifier si les données de test existent déjà
        const existingProject = await Projet.findById(TEST_PROJECT_ID);
        if (existingProject) {
            logger.info("Données de test déjà présentes");
            return { TEST_PROJECT_ID, TEST_LIVRABLE_ID };
        }

        // Créer un projet de test
        const projet = new Projet({
            _id: TEST_PROJECT_ID,
            titre: "Projet Test Newman",
            description: "Projet créé pour les tests automatisés",
            competences: ["Test", "Newman", "API"],
            dateDebut: new Date(),
            dateFin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            statut: "En cours"
        });

        await projet.save();

        // Créer un livrable de test
        const livrable = new Livrable({
            _id: TEST_LIVRABLE_ID,
            intitule: "Livrable Test Newman",
            description: "Livrable créé pour les tests automatisés",
            dateLimite: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            projetId: TEST_PROJECT_ID,
            statut: "en_attente"
        });

        await livrable.save();

        // Ajouter le livrable au projet
        projet.livrables.push(TEST_LIVRABLE_ID);
        await projet.save();

        logger.info("Données de test créées avec succès");
        return { TEST_PROJECT_ID, TEST_LIVRABLE_ID };
    } catch (error) {
        logger.error("Erreur lors de la création des données de test:", error);
        throw error;
    }
}

module.exports = {
    TEST_PROJECT_ID,
    TEST_LIVRABLE_ID,
    createTestData
};
