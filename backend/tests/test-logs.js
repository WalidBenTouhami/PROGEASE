// Fichier de test pour verifier le systeme de logs
const logger = require('../src/utils/logger');

console.log('Demarrage des tests de logs...');

// Generer des logs pour chaque niveau
logger.error('Erreur de test critique', { code: 'E001', source: 'test-script' });
logger.warn('Avertissement de test', { component: 'systeme de fichiers' });
logger.info('Information de test standard', { utilisateur: 'admin' });
logger.debug('Message de debogage detaille', { data: { id: 123, value: 'test' } });

// Test de la gestion des exceptions
try {
    throw new Error('Exception de test');
} catch (error) {
    logger.error('Une exception a ete capturee', { error });
}

// Test d'objets complexes
logger.info('Test avec donnees complexes', {
    utilisateur: {
        id: 1,
        nom: 'Test utilisateur',
        roles: ['admin', 'developpeur']
    },
    statistiques: {
        tempsExecution: 235,
        memoireUtilisee: '45MB'
    }
});

console.log('Tests de logs termines. Verifiez le dossier logs/ pour les resultats.');

// [NINJA REFACTOR] Check that logs are written to the correct files/locations. Add comments for maintainers. Improve error handling.