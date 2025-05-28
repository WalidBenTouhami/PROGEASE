const fs = require('fs');
const path = require('path');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const { loadFilesSync } = require('@graphql-tools/load-files');
const { mergeTypeDefs } = require('@graphql-tools/merge');

// Résolveurs pour le schéma
const resolvers = {
    Query: {
        health: (_, __, context) => ({
            status: "ok",
            timestamp: context.timestamp || new Date().toISOString(),
            user: context.currentUser || "WalidBenTouhami",
            version: "2.0.0",
            uptime: Math.floor(process.uptime())
        }),
        projets: async (_, __, { models }) => {
            try {
                // Implémentation simulée
                return [
                    {
                        _id: "1",
                        titre: "Projet de test",
                        description: "Description du projet",
                        statut: "En cours",
                        dateDebut: new Date().toISOString(),
                        dateFin: null
                    }
                ];
            } catch (error) {
                console.error("Erreur dans la requête projets:", error);
                return [];
            }
        },
        projet: async (_, { id }, { models }) => {
            try {
                // Implémentation simulée
                return {
                    _id: id,
                    titre: "Projet " + id,
                    description: "Description du projet " + id,
                    statut: "En cours",
                    dateDebut: new Date().toISOString(),
                    dateFin: null
                };
            } catch (error) {
                console.error(`Erreur dans la requête projet(${id}):`, error);
                return null;
            }
        },
        livrables: async () => {
            // Implémentation simulée
            return [
                {
                    _id: "1",
                    titre: "Livrable de test",
                    description: "Description du livrable",
                    statut: "À faire",
                    dateEcheance: new Date().toISOString(),
                    projetId: "1"
                }
            ];
        },
        livrable: async (_, { id }) => {
            // Implémentation simulée
            return {
                _id: id,
                titre: "Livrable " + id,
                description: "Description du livrable " + id,
                statut: "À faire",
                dateEcheance: new Date().toISOString(),
                projetId: "1"
            };
        }
    },
    Projet: {
        livrables: async (parent) => {
            // Implémentation simulée - retourne les livrables du projet
            return [
                {
                    _id: "L1",
                    titre: `Livrable pour ${parent.titre}`,
                    description: "Description du livrable",
                    statut: "À faire",
                    dateEcheance: new Date().toISOString(),
                    projetId: parent._id
                }
            ];
        }
    },
    Livrable: {
        projet: async (parent) => {
            // Implémentation simulée - retourne le projet associé au livrable
            return {
                _id: parent.projetId,
                titre: "Projet associé",
                description: "Description du projet associé",
                statut: "En cours",
                dateDebut: new Date().toISOString(),
                dateFin: null
            };
        }
    },
    Mutation: {
        createProjet: async (_, { input }) => {
            // Simuler la création
            return {
                _id: "new-" + Date.now(),
                ...input,
                dateDebut: input.dateDebut || new Date().toISOString(),
                dateFin: input.dateFin
            };
        },
        updateProjet: async (_, { id, input }) => {
            // Simuler la mise à jour
            return {
                _id: id,
                ...input,
                dateDebut: input.dateDebut || new Date().toISOString(),
                dateFin: input.dateFin
            };
        },
        deleteProjet: async (_, { id }) => {
            // Simuler la suppression
            return {
                success: true,
                message: `Projet ${id} supprimé avec succès`
            };
        },
        createLivrable: async (_, { input }) => {
            // Simuler la création
            return {
                _id: "new-" + Date.now(),
                ...input,
                dateEcheance: input.dateEcheance || new Date().toISOString()
            };
        },
        updateLivrable: async (_, { id, input }) => {
            // Simuler la mise à jour
            return {
                _id: id,
                ...input,
                dateEcheance: input.dateEcheance || new Date().toISOString()
            };
        },
        deleteLivrable: async (_, { id }) => {
            // Simuler la suppression
            return {
                success: true,
                message: `Livrable ${id} supprimé avec succès`
            };
        }
    }
};

// Chargement du schéma de manière plus robuste
let typeDefs;

try {
    console.log("[GraphQL] Tentative de chargement des fichiers schéma...");

    // Vérifions d'abord si le fichier template existe, sinon créons-le
    const templatePath = path.join(__dirname, 'src/graphql/schema-template.graphql');
    if (!fs.existsSync(templatePath)) {
        console.log("[GraphQL] Création du fichier schema-template.graphql...");

        // S'assurer que le répertoire existe
        const dir = path.dirname(templatePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        // Schéma GraphQL unifié - tous les types de dates comme String
        const schemaContent = `"""
Schéma GraphQL pour PROGEASE
Date: 2025-05-28 09:35:23
Utilisateur: WalidBenTouhami
"""

type Query {
  """
  Informations sur l'état du système
  """
  health: Health!

  """
  Liste de tous les projets
  """
  projets: [Projet!]!

  """
  Obtenir un projet par son ID
  """
  projet(id: ID!): Projet

  """
  Liste de tous les livrables
  """
  livrables: [Livrable!]!

  """
  Obtenir un livrable par son ID
  """
  livrable(id: ID!): Livrable
}

type Mutation {
  """
  Créer un nouveau projet
  """
  createProjet(input: ProjetInput!): Projet!

  """
  Mettre à jour un projet existant
  """
  updateProjet(id: ID!, input: ProjetInput!): Projet!

  """
  Supprimer un projet
  """
  deleteProjet(id: ID!): DeleteResponse!

  """
  Créer un nouveau livrable
  """
  createLivrable(input: LivrableInput!): Livrable!

  """
  Mettre à jour un livrable existant
  """
  updateLivrable(id: ID!, input: LivrableInput!): Livrable!

  """
  Supprimer un livrable
  """
  deleteLivrable(id: ID!): DeleteResponse!
}

type Health {
  status: String!
  timestamp: String!
  user: String!
  version: String!
  uptime: Float!
}

"""
Modèle de projet avec toutes les dates au format String (ISO)
"""
type Projet {
  _id: ID!
  titre: String!
  description: String
  statut: String
  dateDebut: String
  dateFin: String
  livrables: [Livrable]
}

input ProjetInput {
  titre: String!
  description: String
  statut: String
  dateDebut: String
  dateFin: String
}

"""
Modèle de livrable avec toutes les dates au format String (ISO)
"""
type Livrable {
  _id: ID!
  titre: String!
  description: String
  statut: String
  dateEcheance: String
  projetId: ID
  projet: Projet
}

input LivrableInput {
  titre: String!
  description: String
  statut: String
  dateEcheance: String
  projetId: ID
}

type PaginationInfo {
  totalItems: Int!
  totalPages: Int!
  currentPage: Int!
  pageSize: Int!
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
}

type DeleteResponse {
  success: Boolean!
  message: String
}`;

        fs.writeFileSync(templatePath, schemaContent);
        console.log("[GraphQL] Fichier schema-template.graphql créé avec succès");
    }

    // Supprimez les autres fichiers de schéma qui peuvent causer des conflits
    const schemaDirectory = path.join(__dirname, 'src', 'graphql');
    if (fs.existsSync(schemaDirectory)) {
        const files = fs.readdirSync(schemaDirectory);
        for (const file of files) {
            if (file.endsWith('.graphql') && file !== 'schema-template.graphql') {
                console.log(`[GraphQL] Renommage du fichier de schéma potentiellement conflictuel: ${file} -> ${file}.bak`);
                try {
                    fs.renameSync(
                        path.join(schemaDirectory, file),
                        path.join(schemaDirectory, `${file}.bak`)
                    );
                } catch (error) {
                    console.warn(`[GraphQL] Impossible de renommer ${file}: ${error.message}`);
                }
            }
        }
    }

    // Maintenant chargeons uniquement le fichier template
    console.log("[GraphQL] Chargement du schéma depuis schema-template.graphql...");
    typeDefs = fs.readFileSync(path.join(__dirname, 'src/graphql/schema-template.graphql'), 'utf8');

    console.log("[GraphQL] Schéma chargé avec succès");
} catch (error) {
    console.error("[GraphQL] Erreur lors du chargement du schéma:", error);
    throw new Error("Impossible de charger le schéma GraphQL: " + error.message);
}

// Création du schéma exécutable
const schema = makeExecutableSchema({
    typeDefs,
    resolvers
});

console.log("[GraphQL] Schéma exécutable créé avec succès");
module.exports = { schema };