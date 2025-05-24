#!/usr/bin/env node
/**
 * Outil de publication du schéma GraphQL pour PROGEASE
 * Date: 2025-05-23 15:24:10
 * Auteur: WalidBenTouhami
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { typeDefs } = require('../src/graphql/schema');
// Importer et configurer dotenv en tout premier
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// La fonction getCurrentDateTime doit utiliser la date actuelle
function getCurrentDateTime() {
  return new Date().toISOString(); // Utilise la date et l'heure actuelles
}

// Configuration avec les variables d'environnement correctement chargées
const CONFIG = {
  graphRef: process.env.APOLLO_GRAPH_REF || 'PROGEASE-3h73pc@current',
  apiKey: process.env.APOLLO_KEY,
  subgraphName: process.env.APOLLO_SUBGRAPH_NAME || 'progease-projets',
  routingUrl: process.env.APOLLO_ROUTING_URL || 'http://localhost:5000/graphql',
  schemaPath: path.resolve(__dirname, process.env.APOLLO_SCHEMA_PATH || '../src/graphql/schema.graphql'),
  outputDir: path.resolve(__dirname, process.env.APOLLO_SCHEMA_OUTPUT_DIR || './schema-output')
};

// Vérification de la présence de la clé Apollo
if (!CONFIG.apiKey) {
  log('APOLLO_KEY non définie dans les variables d\'environnement', 'WARNING');
}

// Créer le répertoire de sortie s'il n'existe pas
if (!fs.existsSync(CONFIG.outputDir)) {
  fs.mkdirSync(CONFIG.outputDir, { recursive: true });
}

function log(message, type = 'INFO') {
  // noinspection JSDeprecatedSymbols
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

    if (typeof typeDefs !== 'string') {
      // Si on ne peut pas accéder directement au SDL, on l'extrait du fichier
      log('Utilisation du fichier schema.graphql');
      try {
        const schemaFilePath = path.resolve(__dirname, '../src/graphql/schema.graphql');
        if (fs.existsSync(schemaFilePath)) {
          sdl = fs.readFileSync(schemaFilePath, 'utf8');
          log('Fichier schema.graphql chargé avec succès');
        } else {
          // noinspection ExceptionCaughtLocallyJS
          throw new Error('Fichier schema.graphql introuvable');
        }
      } catch (e) {
        // noinspection ExceptionCaughtLocallyJS
        throw new Error(`Impossible d'extraire le schéma: ${e.message}`);
      }
    } else {
      sdl = typeDefs;
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
      timestamp: getCurrentDateTime(), // Utiliser la fonction mise à jour
      user: process.env.USER || 'defaultUser',
      version: '2.0.0',
      subgraph: CONFIG.subgraphName,
      routingUrl: CONFIG.routingUrl
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
    const command = `npx rover subgraph publish ${CONFIG.graphRef} --name ${CONFIG.subgraphName} --schema "${schemaPath}" --routing-url ${CONFIG.routingUrl}`;

    log(`Exécution: ${command}`);

    const execOptions = {
      env: {
        ...process.env,
        APOLLO_KEY: CONFIG.apiKey
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