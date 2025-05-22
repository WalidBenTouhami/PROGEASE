const fs = require('fs');
const path = require('path');

// Liste des fichiers à exporter
const filesToExport = [
  'src/app/app.component.html',
  'src/app/back-office/dashboard/dashboard.component.html',
  'src/app/back-office/deliverable-management/livrable-management.component.html',
  'src/app/back-office/project-management/projet-management.component.html',
  'src/app/core/api-test/api-test.component.html',
  'src/app/deliverable/deliverable-detail/livrable-detail.component.html',
  'src/app/deliverable/deliverable-form/livrable-form.component.html',
  'src/app/deliverable/deliverable-list/livrable-list.component.html',
  'src/app/front-office/dashboard/dashboard.component.html',
  'src/app/front-office/deliverable-list/livrable-list.component.html',
  'src/app/front-office/project-list/projet-list.component.html',
  'src/app/project/project-detail/projet-detail.component.html',
  'src/app/project/project-form/projet-form.component.html',
  'src/app/project/project-list/projet-list.component.html',
  'src/index.html'
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
