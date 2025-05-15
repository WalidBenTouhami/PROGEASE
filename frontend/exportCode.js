const fs = require('fs');
const path = require('path');

// Liste des fichiers à exporter
const filesToExport = [
  'server.ts',
  'src/app/app-routing.module.ts',
  'src/app/app.component.spec.ts',
  'src/app/app.component.ts',
  'src/app/app.config.server.ts',
  'src/app/app.config.ts',
  'src/app/app.module.ts',
  'src/app/app.routes.ts',
  'src/app/back-office/back-office-routing.module.ts',
  'src/app/back-office/back-office.module.ts',
  'src/app/core/services/deliverable.service.spec.ts',
  'src/app/core/services/deliverable.service.ts',
  'src/app/core/services/project.service.spec.ts',
  'src/app/core/services/project.service.ts',
  'src/app/deliverable/deliverable-detail/deliverable-detail.component.spec.ts',
  'src/app/deliverable/deliverable-detail/deliverable-detail.component.ts',
  'src/app/deliverable/deliverable-form/deliverable-form.component.spec.ts',
  'src/app/deliverable/deliverable-form/deliverable-form.component.ts',
  'src/app/deliverable/deliverable-list/deliverable-list.component.spec.ts',
  'src/app/deliverable/deliverable-list/deliverable-list.component.ts',
  'src/app/deliverable/deliverable-routing.module.ts',
  'src/app/deliverable/deliverable.module.ts',
  'src/app/front-office/front-office-routing.module.ts',
  'src/app/front-office/front-office.module.ts',
  'src/app/project/project-detail/project-detail.component.spec.ts',
  'src/app/project/project-detail/project-detail.component.ts',
  'src/app/project/project-form/project-form.component.spec.ts',
  'src/app/project/project-form/project-form.component.ts',
  'src/app/project/project-list/project-list.component.spec.ts',
  'src/app/project/project-list/project-list.component.ts',
  'src/app/project/project-routing.module.ts',
  'src/app/project/project.module.ts',
  'src/environments/environment.prod.ts',
  'src/environments/environment.ts',
  'src/main.server.ts',
  'src/main.ts'
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
