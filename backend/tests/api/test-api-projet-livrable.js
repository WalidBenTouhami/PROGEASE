const axios = require('axios');

const testAPI = async () => {
    try {
        // Test de création d'un tuteur
        console.log('Test de création d\'un tuteur...');
        const tuteurData = {
            nom: 'Tuteur Test',
            email: `tuteur.test.${Date.now()}@example.com`,
            role: 'TUTEUR'
        };

        console.log('Envoi des données tuteur:', tuteurData);
        const createTuteurResponse = await axios.post('http://localhost:5003/api/utilisateurs', tuteurData);
        console.log('Tuteur créé:', createTuteurResponse.data);

        const tuteurId = createTuteurResponse.data.data._id;

        // Test de création d'un projet
        console.log('\nTest de création d\'un projet...');
        const projetData = {
            titre: 'Projet Test',
            description: 'Description du projet test',
            dateDebut: new Date(),
            dateFin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 jours
            statut: 'BROUILLON',
            tuteur: tuteurId,
            competences: ['JavaScript', 'Node.js', 'MongoDB']
        };

        console.log('Envoi des données projet:', projetData);
        const createProjetResponse = await axios.post('http://localhost:5003/api/projets', projetData);
        console.log('Projet créé:', createProjetResponse.data);

        const projetId = createProjetResponse.data.data._id;

        // Test de création d'un livrable
        console.log('\nTest de création d\'un livrable...');
        const livrableData = {
            intitule: 'Livrable Test',
            description: 'Description du livrable test',
            dateLimite: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // +15 jours
            statut: 'EN_COURS',
            projetId: projetId,
            type: 'DOCUMENTATION'
        };

        console.log('Envoi des données livrable:', livrableData);
        const createLivrableResponse = await axios.post('http://localhost:5003/api/livrables', livrableData);
        console.log('Livrable créé:', createLivrableResponse.data);

        // Test de récupération des projets
        console.log('\nTest de récupération des projets...');
        const getProjetResponse = await axios.get('http://localhost:5003/api/projets');
        console.log('Liste des projets:', getProjetResponse.data);

        // Test de récupération des livrables
        console.log('\nTest de récupération des livrables...');
        const getLivrableResponse = await axios.get('http://localhost:5003/api/livrables');
        console.log('Liste des livrables:', getLivrableResponse.data);

        // Test de récupération des livrables d'un projet
        console.log('\nTest de récupération des livrables d\'un projet...');
        const getLivrablesByProjetResponse = await axios.get(`http://localhost:5003/api/projets/${projetId}/livrables`);
        console.log('Liste des livrables du projet:', getLivrablesByProjetResponse.data);

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