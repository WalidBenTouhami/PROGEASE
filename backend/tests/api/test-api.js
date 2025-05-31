const axios = require('axios');

const testAPI = async () => {
    try {
        // Test de création d'utilisateur
        console.log('Test de création d\'utilisateur...');
        const userData = {
            nom: 'John Doe',
            email: 'john.doe@example.com',
            role: 'TUTEUR'
        };

        console.log('Envoi des données:', userData);
        const createResponse = await axios.post('http://localhost:5003/api/utilisateurs', userData);
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