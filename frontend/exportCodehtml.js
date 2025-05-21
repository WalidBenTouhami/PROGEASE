const fs = require('fs');
const path = require('path');

// Liste des fichiers à exporter
const filesToExport = [
  'src/app/app.component.css',
  'src/app/app.component.html',
  'src/app/back-office/dashboard/dashboard.component.css',
  'src/app/back-office/dashboard/dashboard.component.html',
  'src/app/back-office/deliverable-management/deliverable-management.component.css',
  'src/app/back-office/deliverable-management/deliverable-management.component.html',
  'src/app/back-office/project-management/project-management.component.css',
  'src/app/back-office/project-management/project-management.component.html',
  'src/app/core/api-test/api-test.component.html',
  'src/app/deliverable/deliverable-detail/deliverable-detail.component.css',
  'src/app/deliverable/deliverable-detail/deliverable-detail.component.html',
  'src/app/deliverable/deliverable-form/deliverable-form.component.css',
  'src/app/deliverable/deliverable-form/deliverable-form.component.html',
  'src/app/deliverable/deliverable-list/deliverable-list.component.css',
  'src/app/deliverable/deliverable-list/deliverable-list.component.html',
  'src/app/front-office/dashboard/dashboard.component.css',
  'src/app/front-office/dashboard/dashboard.component.html',
  'src/app/front-office/deliverable-list/deliverable-list.component.css',
  'src/app/front-office/deliverable-list/deliverable-list.component.html',
  'src/app/front-office/project-list/project-list.component.css',
  'src/app/front-office/project-list/project-list.component.html',
  'src/app/project/project-detail/project-detail.component.css',
  'src/app/project/project-detail/project-detail.component.html',
  'src/app/project/project-form/project-form.component.css',
  'src/app/project/project-form/project-form.component.html',
  'src/app/project/project-list/project-list.component.css',
  'src/app/project/project-list/project-list.component.html',
  'src/index.html',
  'src/styles.css'
];

// Chemin du fichier de sortie
const outputFile = './exported_code_html.txt';

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
