// src/utils/testData.js
const mongoose = require('mongoose');
const Projet = require('../models/projet.model');
const Livrable = require('../models/livrable.model');
const logger = require('./logger');
const { Enum } = require('../../config/constants');

// Creer l'ID de test qui sera utilise par Newman
const TEST_PROJET_ID = new mongoose.Types.ObjectId('6064f5ca7623a9b8e7c1a123');
const TEST_LIVRABLE_ID = new mongoose.Types.ObjectId('6064f5ca7623a9b8e7c1a124');

async function createTestData() {
    try {
        // Verifier si les donnees de test existent dejà
        const existingProjet = await Projet.findById(TEST_PROJET_ID);
        if (existingProjet) {
            logger.info('Donnees de test dejà presentes');
            return { TEST_PROJET_ID, TEST_LIVRABLE_ID };
        }

        // Creer un projet de test
        const projet = new Projet({
            _id: TEST_PROJET_ID,
            titre: 'Projet Test Newman',
            description: 'Projet cree pour les tests automatises',
            competences: ['Test', 'Newman', 'API'],
            dateDebut: new Date(),
            dateFin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            statut: Enum.StatutProjet.EN_COURS
        });

        await projet.save();

        // Creer un livrable de test
        const livrable = new Livrable({
            _id: TEST_LIVRABLE_ID,
            intitule: 'Livrable Test Newman',
            description: 'Livrable cree pour les tests automatises',
            dateLimite: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            projetId: TEST_PROJET_ID,
            statut: Enum.StatutLivrable.EN_ATTENTE
        });

        await livrable.save();

        // Ajouter le livrable au projet
        projet.livrables.push(TEST_LIVRABLE_ID);
        await projet.save();

        logger.info('Donnees de test creees avec succes');
        return { TEST_PROJET_ID, TEST_LIVRABLE_ID };
    } catch (error) {
        logger.error('Erreur lors de la creation des donnees de test:', error);
        throw error;
    }
}

module.exports = {
    TEST_PROJET_ID,
    TEST_LIVRABLE_ID,
    createTestData
};
