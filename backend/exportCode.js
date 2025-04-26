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
            'src/controllers/project.controller.js',
            'src/middlewares/project.middleware.js',
            'src/models/project.model.js',
            'src/models/user.model.js',
            'src/routers/ai.router.js',
            'src/routers/project.router.js',
            'src/schema.js',
            'src/services/ai.service.js',
            'src/services/github.service.js',
            'src/services/project.service.js',
            'src/utils/date.util.js',
            'src/utils/github.util.js',
            'src/utils/project.class.js',
            'src/utils/project.utils.js',
            'src/validations/project.validation.js'
        ];

        // Chemin du fichier de sortie
        const outputFile = './exported_code.txt';

        async function exportCode() {
            try {
                let outputContent = '';

                for (const file of filesToExport) {
                    const filePath = path.resolve(file);

                    if (fs.existsSync(filePath)) {
                        const fileContent = fs.readFileSync(filePath, 'utf-8');
                        outputContent += `\n// ======= Contenu de ${file} =======\n\n`;
                        outputContent += fileContent + '\n';
                    } else {
                        console.warn(`⚠️ Fichier introuvable : ${file}`);
                    }
                }

                fs.writeFileSync(outputFile, outputContent, 'utf-8');
                console.log(`✅ Code exporté avec succès dans ${outputFile}`);
            } catch (error) {
                console.error('❌ Erreur lors de l\'exportation :', error.message);
            }
        }

        exportCode();