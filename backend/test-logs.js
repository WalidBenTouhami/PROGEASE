// Fichier de test pour vérifier le système de logs
const logger = require('./src/utils/logger');

console.log('Démarrage des tests de logs...');

// Générer des logs pour chaque niveau
logger.error('Erreur de test critique', { code: 'E001', source: 'test-script' });
logger.warn('Avertissement de test', { component: 'système de fichiers' });
logger.info('Information de test standard', { user: 'admin' });
logger.debug('Message de débogage détaillé', { data: { id: 123, value: 'test' } });

// Test de la gestion des exceptions
try {
    throw new Error('Exception de test');
} catch (error) {
    logger.error('Une exception a été capturée', { error });
}

// Test d'objets complexes
logger.info('Test avec données complexes', {
    utilisateur: {
        id: 1,
        nom: 'Test User',
        roles: ['admin', 'développeur']
    },
    statistiques: {
        tempsExecution: 235,
        memoireUtilisee: '45MB'
    }
});

console.log('Tests de logs terminés. Vérifiez le dossier logs/ pour les résultats.');

// [NINJA REFACTOR] Check that logs are written to the correct files/locations. Add comments for maintainers. Improve error handling.