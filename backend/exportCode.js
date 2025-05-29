const fs = require('fs');
const path = require('path');

// Liste des fichiers à exporter
const filesToExport = [
    'config/constants.js',
    'config/db.js',
    'config/env.js',
    'exportCode.js',
    'filesList.js',
    'server.js',
    'src/controllers/deliverable.controller.js',
    'src/controllers/project.controller.js',
    'src/graphql/resolvers.js',
    'src/graphql/typeDefs.js',
    'src/middlewares/project.middleware.js',
    'src/middlewares/validate.Request.js',
    'src/models/deliverable.model.js',
    'src/models/project.model.js',
    'src/routers/ai.router.js',
    'src/routers/deliverable.router.js',
    'src/routers/project.router.js',
    'src/schema.js',
    'src/services/ai.service.js',
    'src/services/github.service.js',
    'src/services/project.service.js',
    'src/utils/date.util.js',
    'src/utils/github.util.js',
    'src/utils/project.class.js',
    'src/utils/project.utils.js',
    'src/validations/project.validation.js',
    'test-env.js',
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