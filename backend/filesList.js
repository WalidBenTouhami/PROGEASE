const fs = require('fs');
const path = require('path');

function getAllJsFiles(dirPath, arrayOfFiles = []) {
    try {
        const files = fs.readdirSync(dirPath);

        files.forEach(file => {
            const fullPath = path.join(dirPath, file);

            // Ignorer le répertoire node_modules
            if (file === 'node_modules') {
                return;
            }

            if (fs.statSync(fullPath).isDirectory()) {
                getAllJsFiles(fullPath, arrayOfFiles);
            } else if (file.endsWith('.js')) {
                arrayOfFiles.push(fullPath.replace(/\\/g, '/')); // Normaliser les chemins
            }
        });
    } catch (error) {
        console.error(`Erreur lors de la lecture du répertoire ${dirPath}:`, error.message);
    }

    return arrayOfFiles;
}

// Chemin du répertoire à analyser
const directoryPath = '.'; // Remplacez par le chemin de votre répertoire
const outputFile = 'files_List.txt';

function exportFilesList() {
    try {
        // Récupérer tous les fichiers .js
        const filesToExport = getAllJsFiles(directoryPath);

        // Formater la liste comme une liste JavaScript
        const formattedList = `[\n  '${filesToExport.join("',\n  '")}'\n];`;

        // Écrire la liste formatée dans le fichier txt
        fs.writeFileSync(outputFile, formattedList, 'utf-8');
        console.log(`✅ Liste des fichiers exportée avec succès dans ${outputFile}`);
    } catch (error) {
        console.error('❌ Erreur lors de l\'exportation :', error.message);
    }
}

// Exécuter la fonction
exportFilesList();