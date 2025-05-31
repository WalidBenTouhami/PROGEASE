const axios = require('axios');

const testAPI = async () => {
    try {
        // Test d'analyse de projet avec l'IA
        console.log('Test d\'analyse de projet avec l\'IA...');
        const analyseData = {
            text: 'Le projet consiste à développer une application web pour gérer les projets étudiants. Les fonctionnalités principales incluent la gestion des utilisateurs (étudiants et tuteurs), la gestion des projets avec leurs livrables, et un système de suivi et d\'évaluation.',
            document: {
                titre: 'Application de gestion de projets étudiants',
                description: 'Développement d\'une application web pour gérer les projets étudiants, incluant le suivi des livrables et la communication entre tuteurs et étudiants.',
                competences: ['JavaScript', 'Node.js', 'React', 'MongoDB']
            }
        };

        console.log('Envoi des données pour analyse:', analyseData);
        const analyseResponse = await axios.post('http://localhost:5003/api/ai/analyze', analyseData);
        console.log('Analyse générée:', analyseResponse.data);

        // Test de génération de texte (français)
        console.log('\nTest de génération de texte (français)...');
        const promptFr = {
            prompt: 'Générer une description détaillée des fonctionnalités clés pour une application de gestion de projets étudiants.'
        };

        console.log('Envoi du prompt (FR):', promptFr);
        const texteFrResponse = await axios.post('http://localhost:5003/api/ai/generer-texte', promptFr);
        console.log('Texte généré (FR):', texteFrResponse.data);

        // Test de génération de texte (anglais)
        console.log('\nTest de génération de texte (anglais)...');
        const promptEn = {
            prompt: 'Generate a detailed description of key features for a student project management application.'
        };

        console.log('Envoi du prompt (EN):', promptEn);
        const texteEnResponse = await axios.post('http://localhost:5003/api/ai/generate-text', promptEn);
        console.log('Texte généré (EN):', texteEnResponse.data);

    } catch (error) {
        console.error('Erreur détaillée:');
        if (error.response) {
            // La requête a été faite et le serveur a répondu avec un code d'état
            console.error('Status:', error.response.status);
            console.error('Headers:', error.response.headers);
            console.error('Data:', error.response.data);
        } else if (error.request) {
            // La requête a été faite mais aucune réponse n'a été reçue
            console.error('Pas de réponse du serveur');
            console.error('Request:', error.request);
        } else {
            // Une erreur s'est produite lors de la configuration de la requête
            console.error('Erreur:', error.message);
        }
    }
};

testAPI();