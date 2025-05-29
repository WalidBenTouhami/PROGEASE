const fs = require('fs');
const path = require('path');

// Liste des fichiers à exporter
const filesToExport = [
  'src/app/app.component.html',
  'src/app/back-office/dashboard/dashboard.component.html',
  'src/app/back-office/livrable-management/livrable-management.component.html',
  'src/app/back-office/projet-management/projet-management.component.html',
  'src/app/core/api-test/api-test.component.html',
  'src/app/livrable/livrable-detail/livrable-detail.component.html',
  'src/app/livrable/livrable-form/livrable-form.component.html',
  'src/app/livrable/livrable-list/livrable-list.component.html',
  'src/app/front-office/dashboard/dashboard.component.html',
  'src/app/front-office/livrable-list/livrable-list.component.html',
  'src/app/front-office/projet-list/projet-list.component.html',
  'src/app/projet/projet-detail/projet-detail.component.html',
  'src/app/projet/projet-form/projet-form.component.html',
  'src/app/projet/projet-list/projet-list.component.html',
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
