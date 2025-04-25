const fs = require('fs');
const path = require('path');

// Liste des fichiers à exporter
const filesToExport =  [
    'config/constants.js',
    'config/db.js',
    'server.js',
    'src/controllers/evaluation.controller.js',
    'src/controllers/formation_certification.controller.js',
    'src/controllers/forum.controller.js',
    'src/controllers/project.controller.js',
    'src/controllers/user.controller.js',
    'src/middlewares/evaluation.middleware.js',
    'src/middlewares/formation_certification.middleware.js',
    'src/middlewares/forum.middleware.js',
    'src/middlewares/project.middleware.js',
    'src/middlewares/user.middleware.js',
    'src/models/evaluation.model.js',
    'src/models/formation_certification.model.js',
    'src/models/forum.model.js',
    'src/models/project.model.js',
    'src/models/user.model.js',
    'src/routers/ai.router.js',
    'src/routers/evaluation.router.js',
    'src/routers/formation_certification.router.js',
    'src/routers/forum.router.js',
    'src/routers/project.router.js',
    'src/routers/user.router.js',
    'src/schema.js',
    'src/services/ai.service.js',
    'src/services/evaluation.service.js',
    'src/services/formation_certification.service.js',
    'src/services/forum.service.js',
    'src/services/github.service.js',
    'src/services/project.service.js',
    'src/services/user.service.js',
    'src/utils/date.util.js',
    'src/utils/github.util.js',
    'src/utils/project.class.js',
    'src/utils/project.utils.js'
];

// Chemin du fichier de sortie
const outputFile = './exported_code.txt';

async function exportCode() {
    try {
        let outputContent = '';

        for (const file of filesToExport) {
            const filePath = path.resolve(file);
            const fileContent = fs.readFileSync(filePath, 'utf-8');

            outputContent += `\n// ======= Contenu de ${file} =======\n\n`;
            outputContent += fileContent + '\n';
        }

        fs.writeFileSync(outputFile, outputContent, 'utf-8');
        console.log(`✅ Code exporté avec succès dans ${outputFile}`);
    } catch (error) {
        console.error('❌ Erreur lors de l\'exportation :', error.message);
    }
}

exportCode();