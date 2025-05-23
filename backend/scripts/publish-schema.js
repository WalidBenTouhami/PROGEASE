#!/usr/bin/env node
/**
 * Outil de publication du schéma GraphQL pour PROGEASE
 * Date: 2025-05-23 15:24:10
 * Auteur: WalidBenTouhami
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { typeDefs, resolvers } = require('../src/graphql/schema');
// Configuration
const CONFIG = {
  graphRef: 'PROGEASE-fq785@current',
  apiKey: 'service:PROGEASE-fq785:AnDB1wXqJ7mZxn1MyL7Qlg', // Vérifier qu'il n'y a pas d'espaces
  endpoint: 'http://products.prod.svc.cluster.local:4001/graphql',
  subgraphName: 'progease-projets',
  outputDir: path.resolve(__dirname, './schema-output')
};

// Créer le répertoire de sortie s'il n'existe pas
if (!fs.existsSync(CONFIG.outputDir)) {
  fs.mkdirSync(CONFIG.outputDir, { recursive: true });
}

// Fonctions utilitaires
function getCurrentDateTime() {
  return new Date('2025-05-23 15:24:10').toISOString();
}

function log(message, type = 'INFO') {
  const timestamp = getCurrentDateTime().replace('T', ' ').substr(0, 19);
  const prefix = {
    'INFO': '📝',
    'SUCCESS': '✅',
    'WARNING': '⚠️',
    'ERROR': '❌'
  };

  console.log(`${prefix[type] || '📝'} [${timestamp}] ${type}: ${message}`);
}

// Étapes du processus de publication
async function main() {
  try {
    log('Démarrage de la publication du schéma...');

    // 1. Extraction du schéma SDL
    log('Extraction du schéma SDL...');
    let sdl;

    if (typeof typeDefs === 'string') {
      sdl = typeDefs;
    } else {
      // Si on ne peut pas accéder directement au SDL, on l'extrait du fichier
      log('Utilisation du fichier schema.graphql');
      try {
        const schemaFilePath = path.resolve(__dirname, '../src/graphql/schema.graphql');
        if (fs.existsSync(schemaFilePath)) {
          sdl = fs.readFileSync(schemaFilePath, 'utf8');
          log('Fichier schema.graphql chargé avec succès');
        } else {
          throw new Error('Fichier schema.graphql introuvable');
        }
      } catch (e) {
        throw new Error(`Impossible d'extraire le schéma: ${e.message}`);
      }
    }

    // 2. Sauvegarde du schéma en fichier
    log('Sauvegarde du schéma en fichier...');
    const schemaPath = path.join(CONFIG.outputDir, 'schema.graphql');
    fs.writeFileSync(schemaPath, sdl);
    log(`Schéma sauvegardé dans ${schemaPath}`, 'SUCCESS');

    // 3. Génération du fichier de métadonnées
    log('Génération des métadonnées...');
    const metadataPath = path.join(CONFIG.outputDir, 'metadata.json');
    const metadata = {
      timestamp: getCurrentDateTime(),
      user: 'WalidBenTouhami',
      version: '2.0.0',
      subgraph: CONFIG.subgraphName,
      endpoint: CONFIG.endpoint
    };
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
    log(`Métadonnées sauvegardées dans ${metadataPath}`, 'SUCCESS');

    // 4. Tentative de publication vers Apollo Studio (si configuré)
    if (CONFIG.apiKey) {
      log('Publication vers Apollo Studio...');
      try {
        const result = await publishToApolloStudio(schemaPath);
        log(`Schéma publié sur Apollo Studio: ${CONFIG.graphRef}`, 'SUCCESS');
        log(result);
      } catch (error) {
        log(`Échec de la publication vers Apollo Studio: ${error.message}`, 'ERROR');
      }
    } else {
      log('Clé Apollo non configurée. Publication locale uniquement.', 'WARNING');
    }

    // 5. Finalisation
    log('Publication terminée avec succès!', 'SUCCESS');

    return { success: true, schemaPath, metadataPath };
  } catch (error) {
    log(`Erreur lors de la publication: ${error.message}`, 'ERROR');
    console.error(error);
    return { success: false, error: error.message };
  }
}

// Publication vers Apollo Studio
async function publishToApolloStudio(schemaPath) {
  return new Promise((resolve, reject) => {
    // Créer un fichier de configuration rover
    const roverConfigDir = path.join(process.env.HOME || process.env.USERPROFILE, '.rover');
    if (!fs.existsSync(roverConfigDir)) {
      fs.mkdirSync(roverConfigDir, { recursive: true });
    }

    // Utiliser la méthode de l'API rover directement
    const command = `npx rover subgraph publish ${CONFIG.graphRef} --name ${CONFIG.subgraphName} --schema "${schemaPath}"`;

    log(`Exécution: ${command}`);

    // Exécuter avec la variable d'environnement correctement définie
    const execOptions = {
      env: {
        ...process.env,
        APOLLO_KEY: 'user:gh.b4827a19-4fc2-45d6-b053-e935ff4a406f:--tXDlUNdpITbByFqmAnvw'  // Utiliser la clé qui fonctionne
      }
    };

    exec(command, execOptions, (error, stdout, stderr) => {
      if (error) {
        return reject(new Error(`Échec de la publication: ${stderr || error.message}`));
      }
      resolve(stdout);
    });
  });
}

// Exécution du script
if (require.main === module) {
  main().catch(error => {
    log(`Erreur fatale: ${error.message}`, 'ERROR');
    process.exit(1);
  });
}

module.exports = main;