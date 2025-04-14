import fs from 'fs';
import path from 'path';

function getAllJsFiles(dirPath, arrayOfFiles = []) {
    const files = fs.readdirSync(dirPath);

    files.forEach(file => {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            getAllJsFiles(fullPath, arrayOfFiles);
        } else if (file.endsWith('.js')) {
            arrayOfFiles.push(fullPath);
        }
    });

    return arrayOfFiles;
}

// Utilisation
const directoryPath = 'backend/src'; // Remplacez par le chemin de votre répertoire
const jsFiles = getAllJsFiles(directoryPath);

console.log('Liste des fichiers .js :', jsFiles);