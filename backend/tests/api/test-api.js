const axios = require('axios');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const testAPI = async () => {
    try {
        // Attendre que le serveur soit prêt
        console.log('Attente du démarrage du serveur...');
        await sleep(5000);

        // Test de création d'utilisateur
        console.log('Test de création d\'utilisateur...');
        const timestamp = new Date().getTime();
        const utilisateurData = {
            nom: 'John Doe',
            email: `john.doe.${timestamp}@example.com`,
            role: 'TUTEUR'
        };

        console.log('Envoi des données:', utilisateurData);
        const createResponse = await axios.post('http://localhost:5003/api/utilisateurs', utilisateurData);
        console.log('Utilisateur créé:', createResponse.data);

        // Test de récupération des utilisateurs
        console.log('\nTest de récupération des utilisateurs...');
        const getResponse = await axios.get('http://localhost:5003/api/utilisateurs');
        console.log('Liste des utilisateurs:', getResponse.data);

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