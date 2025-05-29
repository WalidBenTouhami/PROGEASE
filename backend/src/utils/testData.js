// src/utils/testData.js
const mongoose = require('mongoose');
const Projet = require('../models/projet.model');
const Livrable = require('../models/livrable.model');
const logger = require('./logger');

// Créer l'ID de test qui sera utilisé par Newman
const TEST_PROJET_ID = new mongoose.Types.ObjectId('6064f5ca7623a9b8e7c1a123');
const TEST_LIVRABLE_ID = new mongoose.Types.ObjectId('6064f5ca7623a9b8e7c1a124');

async function createTestData() {
    try {
        // Vérifier si les données de test existent déjà
        const existingProjet = await Projet.findById(TEST_PROJET_ID);
        if (existingProjet) {
            logger.info("Données de test déjà présentes");
            return { TEST_PROJET_ID, TEST_LIVRABLE_ID };
        }

        // Créer un projet de test
        const projet = new Projet({
            _id: TEST_PROJET_ID,
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
            projetId: TEST_PROJET_ID,
            statut: "en_attente"
        });

        await livrable.save();

        // Ajouter le livrable au projet
        projet.livrables.push(TEST_LIVRABLE_ID);
        await projet.save();

        logger.info("Données de test créées avec succès");
        return { TEST_PROJET_ID, TEST_LIVRABLE_ID };
    } catch (error) {
        logger.error("Erreur lors de la création des données de test:", error);
        throw error;
    }
}

module.exports = {
    TEST_PROJET_ID,
    TEST_LIVRABLE_ID,
    createTestData
};
