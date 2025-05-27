const fs = require('fs');
const path = require('path');

// Liste des fichiers à exporter
const filesToExport = [
    'codegen.js',
    'config/constants.js',
    'config/db.js',
    'config/env.js',
    'exportCode.js',
    'filesList.js',
    'newman-tests.js',
    'scripts/diagnostic.js',
    'scripts/generate-schema.js',
    'scripts/publish-schema.js',
    'scripts/validate-enums.js',
    'server.js',
    'src/controllers/livrable.controller.js',
    'src/controllers/projet.controller.js',
    'src/graphql/apollo.js',
    'src/graphql/federation.js',
    'src/graphql/resolvers/index.js',
    'src/graphql/resolvers/livrable.resolver.js',
    'src/graphql/resolvers/projet.resolver.js',
    'src/graphql/resolvers/scalar.resolver.js',
    'src/graphql/schema-enum-generator.js',
    'src/graphql/schema.js',
    'src/graphql/standalone-server.js',
    'src/middleware/errorHandlers.js',
    'src/middlewares/livrable.middleware.js',
    'src/middlewares/projet.middleware.js',
    'src/models/livrable.model.js',
    'src/models/projet.model.js',
    'src/plugins/rateLimiter.js',
    'src/routes/ai.routes.js',
    'src/routes/livrable.routes.js',
    'src/routes/projet.routes.js',
    'src/services/ai.service.js',
    'src/services/github.service.js',
    'src/services/projet.service.js',
    'src/utils/date.util.js',
    'src/utils/errorUtils.js',
    'src/utils/formatters.js',
    'src/utils/github.util.js',
    'src/utils/logger.js',
    'src/utils/projet.class.js',
    'src/utils/projet.utils.js',
    'src/utils/validators.js',
    'src/validations/livrable.validation.js',
    'src/validations/projet.validation.js',
    'test-env.js',
    'test-logs.js',
    'testGithubService.js'
];

// Chemin du fichier de sortie
const outputFile = './exported_code.txt';

/**
 * Fonction pour exporter le contenu des fichiers.
 */
async function exportCode() {
    try {
        let outputContent = '';

        console.log('🚀 Début de l\'export des fichiers...\n');

        for (const file of filesToExport) {
            const filePath = path.resolve(file);

            if (fs.existsSync(filePath)) {
                console.log(`✅ Lecture du fichier : ${file}`);
                const fileContent = fs.readFileSync(filePath, 'utf-8');
                outputContent += `\n// ======= Contenu de ${file} =======\n\n`;
                outputContent += fileContent + '\n';
            } else {
                console.warn(`⚠️ Fichier introuvable : ${file}`);
            }
        }

        fs.writeFileSync(outputFile, outputContent, 'utf-8');
        console.log(`\n✅ Code exporté avec succès dans : ${outputFile}`);
    } catch (error) {
        console.error('❌ Erreur lors de l\'exportation :', error.message);
    }
}

// Appel de la fonction d'exportation
exportCode();