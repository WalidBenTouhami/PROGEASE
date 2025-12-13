const fs = require('fs').promises;
const path = require('path');

/**
 * Fonction recursive pour recuperer tous les fichiers `.js` d'un repertoire donne.
 * Exclut certains repertoires et fichiers indesirables.
 * @param {string} dirPath - Chemin du repertoire à parcourir.
 * @param {string[]} jsFiles - Tableau pour stocker les fichiers trouves.
 * @returns {Promise<string[]>} - Promesse contenant un tableau des chemins relatifs des fichiers `.js`.
 */
async function getAllJsFiles(dirPath, jsFiles = []) {
    try {
        const files = await fs.readdir(dirPath, { withFileTypes: true });

        for (const file of files) {
            const fullPath = path.join(dirPath, file.name);

            // Exclure les repertoires ou fichiers indesirables
            if (
                file.name === 'node_modules' || // Ignorer `node_modules`
                file.name.startsWith('.') || // Ignorer les fichiers/dossiers caches comme `.angular`
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
        console.error(`❌ Erreur lors de la lecture du repertoire ${dirPath}: ${error.message}`);
    }

    return jsFiles;
}

/**
 * Fonction principale pour recuperer les fichiers `.js` et ecrire la liste dans un fichier.
 */
async function main() {
    const directoryPath = path.resolve('.'); // Repertoire actuel
    const outputFilePath = path.resolve('filesList.txt'); // Fichier de sortie

    try {
        // Verifier si le repertoire existe
        const stat = await fs.stat(directoryPath);

        // Utilisation du early return pattern au lieu de throw dans un bloc try
        if (!stat.isDirectory()) {
            console.error(
                `❌ Erreur: Le chemin specifie (${directoryPath}) n'est pas un repertoire valide.`
            );
            return;
        }

        const jsFiles = await getAllJsFiles(directoryPath);

        const formattedList = `[\n${jsFiles.map(file => `    '${file}'`).join(',\n')}\n];`;
        await fs.writeFile(outputFilePath, formattedList, 'utf8');

        console.log(`✅ Liste des fichiers .js ecrite dans ${outputFilePath}`);
    } catch (error) {
        console.error(`❌ Erreur: ${error.message}`);
    }
}

// Gestion de la Promise retournee par main()
main().catch(error => {
    console.error(`❌ Erreur non geree: ${error.message}`);
    process.exit(1);
});
