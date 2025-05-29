const fs = require('fs').promises;
        const path = require('path');

        /**
         * Fonction recursive pour recuperer tous les fichiers d'un repertoire donne avec une extension specifique.
         * @param {string} dirPath - Chemin du repertoire à parcourir.
         * @param {string[]} extensions - Extensions de fichiers à inclure (ex: ['.html']).
         * @param {string[]} filesList - Tableau pour stocker les fichiers trouves.
         * @returns {Promise<string[]>} - Promesse contenant un tableau des chemins relatifs des fichiers.
         */
        async function getAllFiles(dirPath, extensions = ['.html'], filesList = []) {
          try {
            const files = await fs.readdir(dirPath, { withFileTypes: true });

            for (const file of files) {
              const fullPath = path.join(dirPath, file.name);

              // Exclure les repertoires ou fichiers indesirables
              if (
                file.name === 'node_modules' || // Ignorer `node_modules`
                file.name.startsWith('.') || // Ignorer les fichiers/dossiers caches
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
            console.error(`❌ Erreur lors de la lecture du repertoire ${dirPath}: ${error.message}`);
          }

          return filesList;
        }

        /**
         * Fonction principale pour recuperer les fichiers et ecrire la liste dans un fichier.
         */
        async function main() {
          const directoryPath = process.argv[2] || path.resolve('.'); // Repertoire actuel ou argument
          const outputFilePath = process.argv[3] || path.resolve('filesList_html'); // Fichier de sortie ou argument

          try {
            // Verifier si le repertoire existe
            const stat = await fs.stat(directoryPath);
            if (!stat.isDirectory()) {
              throw new Error(`Le chemin specifie (${directoryPath}) n'est pas un repertoire valide.`);
            }

            const filesList = await getAllFiles(directoryPath);

            const formattedList = `[\n${filesList.map(file => `    '${file}'`).join(',\n')}\n];`;
            await fs.writeFile(outputFilePath, formattedList, 'utf8');

            console.log(`✅ Liste des fichiers ecrite dans ${outputFilePath}`);
          } catch (error) {
            console.error(`❌ Erreur: ${error.message}`);
          }
        }

        main();
