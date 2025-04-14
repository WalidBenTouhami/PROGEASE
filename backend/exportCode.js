import fs from 'fs';
    import path from 'path';

    // Liste des fichiers à exporter
const filesToExport = [
    './src/app.js',
    './src/config/constants.js',
    './src/config/db.js',
    './src/config/logging.js',
    './src/core/db.js',
    './src/core/performance.js',
    './src/datasources/projectAPI.js',
    './src/modules/evaluation-system/controllers/evaluation.controller.js',
    './src/modules/evaluation-system/index.js',
    './src/modules/evaluation-system/middlewares/evaluation.middleware.js',
    './src/modules/evaluation-system/models/evaluation.model.js',
    './src/modules/evaluation-system/routes/evaluation.routes.js',
    './src/modules/evaluation-system/services/evaluation.service.js',
    './src/modules/evaluation-system/tests/evaluation.test.js',
    './src/modules/formation-certification/app.js',
    './src/modules/formation-certification/controllers/certification.controller.js',
    './src/modules/formation-certification/controllers/formation.controller.js',
    './src/modules/formation-certification/middlewares/formation.middleware.js',
    './src/modules/formation-certification/models/certification.model.js',
    './src/modules/formation-certification/models/formation.model.js',
    './src/modules/formation-certification/routes/certification.routes.js',
    './src/modules/formation-certification/routes/formationRoutes.js',
    './src/modules/formation-certification/services/formation.service.js',
    './src/modules/formation-certification/tests/formation.test.js',
    './src/modules/forum-management/controllers/forum.controller.js',
    './src/modules/forum-management/index.js',
    './src/modules/forum-management/middlewares/forum.middleware.js',
    './src/modules/forum-management/models/forum.model.js',
    './src/modules/forum-management/routes/forum.routes.js',
    './src/modules/forum-management/services/forum.service.js',
    './src/modules/forum-management/tests/forum.test.js',
    './src/modules/project-management/controllers/project.controller.js',
    './src/modules/project-management/index.js',
    './src/modules/project-management/middlewares/project.middleware.js',
    './src/modules/project-management/models/project.model.js',
    './src/modules/project-management/routes/project.routes.js',
    './src/modules/project-management/schema.js',
    './src/modules/project-management/services/project.service.js',
    './src/modules/project-management/tests/project.test.js',
    './src/modules/user-management/app.js',
    './src/modules/user-management/controllers/user.controller.js',
    './src/modules/user-management/middlewares/user.middleware.js',
    './src/modules/user-management/models/user.model.js',
    './src/modules/user-management/routes/user.routes.js',
    './src/modules/user-management/services/user.service.js',
    './src/modules/user-management/tests/user.test.js',
    './src/schema.js',
    './src/services/email.service.js',
    './src/services/ia.service.js',
    './src/services/iaCron.js',
    './src/tests/db.test.js',
    './src/tests/integration.test.js',
    './src/utils/date.util.js',
    './src/utils/github.util.js',
    './src/utils/logger.js',
    './src/utils/queue.js',
    './src/utils/validation.util.js',
    './.env'
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