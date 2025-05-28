/**
 * PROGEASE - Correction des fichiers de test GraphQL
 * Date: 2025-05-28 09:42:02
 * Utilisateur: WalidBenTouhami
 */

const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');

// Couleurs ANSI pour le terminal
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    bold: '\x1b[1m'
};

// Fonction d'aide pour les textes colorés
function colorize(text, color) {
    return `${colors[color]}${text}${colors.reset}`;
}

// Configuration
const testsDir = path.join(__dirname, 'tests', 'graphql');

// Bannière d'information
function showBanner() {
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║             PROGEASE - Correction Tests GraphQL              ║');
    console.log('╟──────────────────────────────────────────────────────────────╢');
    console.log(`║ Utilisateur: WalidBenTouhami                                ║`);
    console.log(`║ Date: 2025-05-28 09:42:02                                   ║`);
    console.log('╚══════════════════════════════════════════════════════════════╝');
}

// Modèles de requêtes GraphQL correctes pour chaque type
const correctQueries = {
    projet: {
        all: `query GetAllProjets {
  projets {
    _id
    titre
    description
    statut
    dateDebut
    dateFin
  }
}`,
        byId: `query GetProjetById($id: ID!) {
  projet(id: $id) {
    _id
    titre
    description
    statut
    dateDebut
    dateFin
    livrables {
      _id
      titre
      statut
    }
  }
}

# Variables:
# {
#   "id": "5f8f8f8f8f8f8f8f8f8f8f8f"
# }
`
    },
    livrable: {
        all: `query GetAllLivrables {
  livrables {
    _id
    titre
    description
    statut
    dateEcheance
    projetId
  }
}`,
        byId: `query GetLivrableById($id: ID!) {
  livrable(id: $id) {
    _id
    titre
    description
    statut
    dateEcheance
    projetId
    projet {
      _id
      titre
    }
  }
}

# Variables:
# {
#   "id": "5f8f8f8f8f8f8f8f8f8f8f8f"
# }
`
    },
    health: {
        all: `query GetHealth {
  health {
    status
    timestamp
    user
    version
    uptime
  }
}`
    },
    paginationinfo: {
        example: `# Ce type est généralement utilisé comme partie d'autres types plutôt que directement requêté
# Exemple d'utilisation dans une requête paginée:
query GetPaginatedResults {
  paginatedResults {
    items {
      _id
      # autres champs...
    }
    pagination {
      totalItems
      totalPages
      currentPage
      pageSize
      hasNextPage
      hasPreviousPage
    }
  }
}`
    }
};

// Fonction principale
async function main() {
    showBanner();

    try {
        // Vérifier l'existence du dossier de tests
        try {
            await fs.access(testsDir);
        } catch (err) {
            console.error(colorize(`Le dossier des tests GraphQL n'existe pas: ${testsDir}`, 'red'));
            console.log(colorize('Création du dossier...', 'yellow'));

            try {
                await fs.mkdir(testsDir, { recursive: true });
                console.log(colorize('Dossier créé avec succès.', 'green'));
            } catch (mkdirErr) {
                console.error(colorize('Échec de la création du dossier.', 'red'));
                return;
            }
        }

        // Créer ou corriger les fichiers de test
        console.log(colorize('\n🔧 Correction des fichiers de test GraphQL...', 'blue'));

        // [NINJA REFACTOR] Use schema introspection to generate and update test files for all queries/mutations in the current schema.
        // 1. Use axios to query the running server's introspection endpoint.
        // 2. Generate test queries/mutations for all types/fields, including required arguments.
        // 3. Remove or update outdated tests.
        // 4. Add robust error handling and clear comments.

        // Projet
        await createOrUpdateTestFile('projet.graphql', `# Tests GraphQL pour Projet
# Générés automatiquement le 2025-05-28 09:42:02
# Auteur: WalidBenTouhami

${correctQueries.projet.all}

${correctQueries.projet.byId}
`);

        // Livrable
        await createOrUpdateTestFile('livrable.graphql', `# Tests GraphQL pour Livrable
# Générés automatiquement le 2025-05-28 09:42:02
# Auteur: WalidBenTouhami

${correctQueries.livrable.all}

${correctQueries.livrable.byId}
`);

        // Health
        await createOrUpdateTestFile('health.graphql', `# Tests GraphQL pour Health
# Générés automatiquement le 2025-05-28 09:42:02
# Auteur: WalidBenTouhami

${correctQueries.health.all}
`);

        // PaginationInfo
        await createOrUpdateTestFile('paginationinfo.graphql', `# Tests GraphQL pour PaginationInfo
# Générés automatiquement le 2025-05-28 09:42:02
# Auteur: WalidBenTouhami

${correctQueries.paginationinfo.example}
`);

        console.log(colorize('\n✅ Correction des fichiers de test terminée!', 'green'));
        console.log(colorize('\n🧪 Vous pouvez maintenant exécuter: node graphql-tests.js', 'cyan'));

    } catch (err) {
        console.error(colorize('Erreur lors de la correction des tests:', 'red'), err);
    }
}

// Créer ou mettre à jour un fichier de test
async function createOrUpdateTestFile(filename, content) {
    const filePath = path.join(testsDir, filename);
    try {
        await fs.writeFile(filePath, content);
        console.log(colorize(`  ✓ ${filename} créé/mis à jour avec succès`, 'green'));
    } catch (err) {
        console.error(colorize(`  ✗ Échec de la mise à jour de ${filename}: ${err.message}`, 'red'));
    }
}

// Exécuter le script
main().catch(err => {
    console.error(colorize('Erreur non gérée:', 'red'), err);
});