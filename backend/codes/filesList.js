const fs = require('fs').promises;
const path = require('path');

/**
 * Fonction récursive pour récupérer tous les fichiers `.js` d'un répertoire donné.
 * Exclut certains répertoires et fichiers indésirables.
 * @param {string} dirPath - Chemin du répertoire à parcourir.
 * @param {string[]} jsFiles - Tableau pour stocker les fichiers trouvés.
 * @returns {Promise<string[]>} - Promesse contenant un tableau des chemins relatifs des fichiers `.js`.
 */
async function getAllJsFiles(dirPath, jsFiles = []) {
    try {
        const files = await fs.readdir(dirPath, { withFileTypes: true });

        for (const file of files) {
            const fullPath = path.join(dirPath, file.name);

            // Exclure les répertoires ou fichiers indésirables
            if (
                file.name === 'node_modules' || // Ignorer `node_modules`
                file.name.startsWith('.') || // Ignorer les fichiers/dossiers cachés comme `.angular`
                fullPath.includes('.angular/cache') // Ignorer tout dans `.angular/cache`
            ) {
                continue;
            }

            if (file.isDirectory()) {
                await getAllJsFiles(fullPath, jsFiles);
            } else if (file.name.endsWith('.js')) {
                jsFiles.push(path.relative('.', fullPath).replace(/\\/g, '/'));
            }
        }
    } catch (error) {
        console.error(`❌ Erreur lors de la lecture du répertoire ${dirPath}: ${error.message}`);
    }

    return jsFiles;
}

/**
 * Fonction principale pour récupérer les fichiers `.js` et écrire la liste dans un fichier.
 */
async function main() {
    const directoryPath = path.resolve('.'); // Répertoire actuel
    const outputFilePath = path.resolve('filesList.txt'); // Fichier de sortie

    try {
        // Vérifier si le répertoire existe
        const stat = await fs.stat(directoryPath);

        // Utilisation du early return pattern au lieu de throw dans un bloc try
        if (!stat.isDirectory()) {
            console.error(`❌ Erreur: Le chemin spécifié (${directoryPath}) n'est pas un répertoire valide.`);
            return;
        }

        const jsFiles = await getAllJsFiles(directoryPath);

        const formattedList = `[\n${jsFiles.map(file => `    '${file}'`).join(',\n')}\n];`;
        await fs.writeFile(outputFilePath, formattedList, 'utf8');

        console.log(`✅ Liste des fichiers .js écrite dans ${outputFilePath}`);
    } catch (error) {
        console.error(`❌ Erreur: ${error.message}`);
    }
}

// Gestion de la Promise retournée par main()
main().catch(error => {
    console.error(`❌ Erreur non gérée: ${error.message}`);
    process.exit(1);
});