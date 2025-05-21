const fs = require('fs').promises;
       const path = require('path');

       /**
        * Fonction récursive pour récupérer tous les fichiers avec des extensions spécifiques.
        * @param {string} dirPath - Chemin du répertoire à parcourir.
        * @param {string[]} extensions - Extensions de fichiers à inclure (ex: ['.ts', '.css']).
        * @param {string[]} filesList - Tableau pour stocker les fichiers trouvés.
        * @returns {Promise<string[]>} - Promesse contenant un tableau des chemins relatifs des fichiers.
        */
       async function getAllFiles(dirPath, extensions = ['.ts', '.css'], filesList = []) {
         try {
           const files = await fs.readdir(dirPath, { withFileTypes: true });

           for (const file of files) {
             const fullPath = path.join(dirPath, file.name);

             // Exclure les répertoires ou fichiers indésirables
             if (
               file.name === 'node_modules' || // Ignorer `node_modules`
               file.name.startsWith('.') || // Ignorer les fichiers/dossiers cachés
               fullPath.includes('.angular/cache') // Ignorer `.angular/cache`
             ) {
               continue;
             }

             if (file.isDirectory()) {
               await getAllFiles(fullPath, extensions, filesList);
             } else if (extensions.some(ext => file.name.endsWith(ext))) {
               filesList.push(path.relative('.', fullPath).replace(/\\/g, '/'));
             }
           }
         } catch (error) {
           console.error(`❌ Erreur lors de la lecture du répertoire ${dirPath}: ${error.message}`);
         }

         return filesList;
       }

       /**
        * Fonction principale pour récupérer les fichiers `.ts` et `.css` et écrire la liste dans un fichier.
        */
       async function main() {
         const directoryPath = path.resolve('.'); // Répertoire actuel
         const outputFilePath = path.resolve('filesList_ts_css.txt'); // Fichier de sortie

         try {
           // Vérifier si le répertoire existe
           const stat = await fs.stat(directoryPath);
           if (!stat.isDirectory()) {
             throw new Error(`Le chemin spécifié (${directoryPath}) n'est pas un répertoire valide.`);
           }

           const filesList = await getAllFiles(directoryPath, ['.ts', '.css']);

           const formattedList = `[\n${filesList.map(file => `    '${file}'`).join(',\n')}\n];`;
           await fs.writeFile(outputFilePath, formattedList, 'utf8');

           console.log(`✅ Liste des fichiers '.ts' et '.css' écrite dans ${outputFilePath}`);
         } catch (error) {
           console.error(`❌ Erreur: ${error.message}`);
         }
       }

       main();
