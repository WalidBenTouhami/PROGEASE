const fs = require('fs').promises;
const path = require('path');

/**
 * Fonction récursive pour récupérer tous les fichiers `.ts` d'un répertoire donné.
 * Exclut certains répertoires et fichiers indésirables.
 * @param {string} dirPath - Chemin du répertoire à parcourir.
 * @param {string[]} tsFiles - Tableau pour stocker les fichiers trouvés.
 * @returns {Promise<string[]>} - Promesse contenant un tableau des chemins relatifs des fichiers `.ts`.
 */
async function getAllTsFiles(dirPath, tsFiles = []) {
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
        await getAllTsFiles(fullPath, tsFiles);
      } else if (file.name.endsWith('.ts')) {
        tsFiles.push(path.relative('.', fullPath).replace(/\\/g, '/'));
      }
    }
  } catch (error) {
    console.error(`❌ Erreur lors de la lecture du répertoire ${dirPath}: ${error.message}`);
  }

  return tsFiles;
}

/**
 * Fonction principale pour récupérer les fichiers `.ts` et écrire la liste dans un fichier.
 */
async function main() {
  const directoryPath = path.resolve('.'); // Répertoire actuel
  const outputFilePath = path.resolve('filesList.txt'); // Fichier de sortie

  try {
    // Vérifier si le répertoire existe
    const stat = await fs.stat(directoryPath);
    if (!stat.isDirectory()) {
      throw new Error(`Le chemin spécifié (${directoryPath}) n'est pas un répertoire valide.`);
    }

    const tsFiles = await getAllTsFiles(directoryPath);

    const formattedList = `[\n${tsFiles.map(file => `    '${file}'`).join(',\n')}\n];`;
    await fs.writeFile(outputFilePath, formattedList, 'utf8');

    console.log(`✅ Liste des fichiers .ts écrite dans ${outputFilePath}`);
  } catch (error) {
    console.error(`❌ Erreur: ${error.message}`);
  }
}

main();
