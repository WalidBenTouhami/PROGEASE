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
                            arrayOfFiles.push(fullPath);
                        }
                    });
                } catch (error) {
                    console.error(`Erreur lors de la lecture du répertoire ${dirPath}:`, error.message);
                }

                return arrayOfFiles;
            }

            // Utilisation
            const directoryPath = '.'; // Remplacez par le chemin de votre répertoire
            if (fs.existsSync(directoryPath) && fs.statSync(directoryPath).isDirectory()) {
                const jsFiles = getAllJsFiles(directoryPath);

                // Formater la liste en tableau avec chaque fichier sur une ligne
                const formattedList = `[\n${jsFiles.map(file => `  '${file}'`).join(',\n')}\n]`;

                // Écrire dans le fichier filesList.txt
                fs.writeFileSync('filesList.txt', formattedList, 'utf8');
                console.log('Liste des fichiers .js écrite dans filesList.txt');
            } else {
                console.error(`Le chemin spécifié (${directoryPath}) n'est pas un répertoire valide.`);
            }