const fs = require('fs');
const path = require('path');

/**
 * Fonction récursive pour récupérer tous les fichiers `.js` d'un répertoire donné.
 * @param {string} dirPath - Chemin du répertoire à parcourir.
 * @param {Array<string>} arrayOfFiles - Tableau pour stocker les fichiers trouvés.
 * @returns {Array<string>} - Liste des chemins des fichiers `.js`.
 */
function getAllJsFiles(dirPath, arrayOfFiles = []) {
    try {
        const files = fs.readdirSync(dirPath);

        files.forEach(file => {
            const fullPath = path.join(dirPath, file);

            // Ignorer uniquement le répertoire node_modules
            if (file === 'node_modules') {
                return; // Passer au fichier suivant
            }

            // Vérifier si c'est un répertoire ou un fichier
            if (fs.statSync(fullPath).isDirectory()) {
                getAllJsFiles(fullPath, arrayOfFiles); // Appel récursif pour parcourir les sous-dossiers
            } else if (file.endsWith('.js')) {
                arrayOfFiles.push(fullPath); // Ajouter les fichiers `.js` trouvés
            }
        });
    } catch (error) {
        console.error(`❌ Erreur lors de la lecture du répertoire ${dirPath}:`, error.message);
    }

    return arrayOfFiles;
}

// Utilisation principale
const directoryPath = path.resolve('.'); // Chemin du répertoire à parcourir
if (fs.existsSync(directoryPath) && fs.statSync(directoryPath).isDirectory()) {
    const jsFiles = getAllJsFiles(directoryPath);

    // Formater la liste en tableau avec chaque fichier sur une nouvelle ligne
    const formattedList = `[\n${jsFiles.map(file => `  '${file}'`).join(',\n')}\n]`;

    // Écrire dans le fichier filesList.txt
    const outputFilePath = path.resolve('filesList.txt'); // Assurer un chemin absolu pour le fichier de sortie
    try {
        fs.writeFileSync(outputFilePath, formattedList, 'utf8');
        console.log(`✅ Liste des fichiers .js écrite dans ${outputFilePath}`);
    } catch (writeError) {
        console.error(`❌ Erreur lors de l'écriture dans ${outputFilePath}:`, writeError.message);
    }
} else {
    console.error(`❌ Le chemin spécifié (${directoryPath}) n'est pas un répertoire valide.`);
}